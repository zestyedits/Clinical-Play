import Stripe from "stripe";
import type { Express, Request, Response } from "express";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "./replit_integrations/auth";
import { log } from "./index";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  monthly: "price_1Sxk8iI1ffXOAwSjayNfqtUs",
  annual: "price_1Sxk9qI1ffXOAwSjmwQCfQW6",
  founding: "price_1SxkAaI1ffXOAwSjwTuc988k",
} as const;

type PlanType = "monthly" | "annual" | "founding";

async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, userId));
  return customer.id;
}

export function registerStripeRoutes(app: Express) {
  app.get("/api/billing/status", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({
        isPro: user.isPro,
        subscriptionType: user.subscriptionType || "free",
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/billing/founding-slots", async (_req: Request, res: Response) => {
    const total = parseInt(process.env.FOUNDING_MEMBER_TOTAL_SLOTS || "100", 10);
    const remaining = parseInt(process.env.FOUNDING_MEMBER_REMAINING_SLOTS || "100", 10);
    res.json({ total, remaining });
  });

  app.post("/api/billing/create-checkout", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const email = req.user.claims.email || "";
      const { plan } = req.body as { plan: string };

      const validPlans: PlanType[] = ["monthly", "annual", "founding"];
      if (!plan || !validPlans.includes(plan as PlanType)) {
        return res.status(400).json({ message: "Invalid plan. Use 'monthly', 'annual', or 'founding'." });
      }

      const typedPlan = plan as PlanType;
      const customerId = await getOrCreateStripeCustomer(userId, email);

      const host = req.headers.host || "localhost:5000";
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const baseUrl = `${protocol}://${host}`;

      if (typedPlan === "monthly" || typedPlan === "annual") {
        const subscriptionType = typedPlan === "monthly" ? "community" : "annual";
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          mode: "subscription",
          line_items: [
            {
              price: PRICE_IDS[typedPlan],
              quantity: 1,
            },
          ],
          metadata: { userId, plan: subscriptionType },
          success_url: `${baseUrl}/dashboard?session=success&plan=${subscriptionType}`,
          cancel_url: `${baseUrl}/#pricing`,
        });

        return res.json({ url: session.url });
      }

      if (typedPlan === "founding") {
        const remaining = parseInt(process.env.FOUNDING_MEMBER_REMAINING_SLOTS || "0", 10);
        if (remaining <= 0) {
          return res.status(400).json({ message: "Founding Member slots are sold out." });
        }

        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          mode: "payment",
          line_items: [
            {
              price: PRICE_IDS.founding,
              quantity: 1,
            },
          ],
          metadata: { userId, plan: "founding" },
          success_url: `${baseUrl}/dashboard?session=success&plan=founding`,
          cancel_url: `${baseUrl}/#pricing`,
        });

        return res.json({ url: session.url });
      }
    } catch (e: any) {
      log(`Stripe checkout error: ${e.message}`);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post("/api/billing/webhook", async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(
          req.rawBody as Buffer,
          sig,
          webhookSecret
        );
      } else {
        event = req.body as Stripe.Event;
      }
    } catch (e: any) {
      log(`Webhook signature verification failed: ${e.message}`);
      return res.status(400).json({ message: "Webhook verification failed" });
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          const plan = session.metadata?.plan;

          if (!userId) break;

          if ((plan === "community" || plan === "annual") && session.subscription) {
            await db.update(users).set({
              isPro: true,
              subscriptionType: plan,
              stripeSubscriptionId: session.subscription as string,
              updatedAt: new Date(),
            }).where(eq(users.id, userId));
            log(`User ${userId} subscribed to ${plan} plan`);
          }

          if (plan === "founding") {
            await db.update(users).set({
              isPro: true,
              subscriptionType: "founding",
              updatedAt: new Date(),
            }).where(eq(users.id, userId));
            log(`User ${userId} became a Founding Member`);
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;

          const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
          if (user && (user.subscriptionType === "community" || user.subscriptionType === "annual")) {
            await db.update(users).set({
              isPro: false,
              subscriptionType: "free",
              stripeSubscriptionId: null,
              updatedAt: new Date(),
            }).where(eq(users.id, user.id));
            log(`User ${user.id} subscription cancelled`);
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (e: any) {
      log(`Webhook processing error: ${e.message}`);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  app.post("/api/billing/portal", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No billing account found" });
      }

      const host = req.headers.host || "localhost:5000";
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const baseUrl = `${protocol}://${host}`;

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${baseUrl}/dashboard`,
      });

      res.json({ url: portalSession.url });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });
}
