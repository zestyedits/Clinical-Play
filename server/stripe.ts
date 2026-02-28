import Stripe from "stripe";
import type { Express, Request, Response } from "express";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "./auth";
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
  const paymentStatusCache = new Map<string, { paymentFailed: boolean; checkedAt: number }>();
  const PAYMENT_CACHE_TTL = 5 * 60 * 1000;

  app.get("/api/billing/status", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.authUser.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return res.status(404).json({ message: "User not found" });

      let paymentFailed = false;
      if (user.stripeSubscriptionId && user.subscriptionType !== "founding") {
        const cached = paymentStatusCache.get(userId);
        if (cached && Date.now() - cached.checkedAt < PAYMENT_CACHE_TTL) {
          paymentFailed = cached.paymentFailed;
        } else {
          try {
            const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
            paymentFailed = sub.status === "past_due" || sub.status === "unpaid";
            paymentStatusCache.set(userId, { paymentFailed, checkedAt: Date.now() });
          } catch (e: any) {
            log(`Failed to check subscription status for user ${userId}: ${e.message}`);
            if (cached) paymentFailed = cached.paymentFailed;
          }
        }
      }

      const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt).getTime() : null;
      const trialActive = trialEndsAt ? Date.now() < trialEndsAt : false;
      const trialExpired = trialEndsAt ? Date.now() >= trialEndsAt : false;

      res.json({
        isPro: user.isPro,
        subscriptionType: user.subscriptionType || "free",
        paymentFailed,
        trialEndsAt,
        trialActive,
        trialExpired: trialExpired && !user.isPro,
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
      const userId = req.authUser.id;
      const email = req.authUser.email || "";
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

  app.post("/api/webhooks/stripe", async (req: Request, res: Response) => {
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
      } else if (!webhookSecret) {
        log("WARNING: STRIPE_WEBHOOK_SECRET not set — accepting unverified webhook for development");
        event = req.body as Stripe.Event;
      } else {
        return res.status(400).json({ message: "Missing stripe-signature header" });
      }
    } catch (e: any) {
      log(`Webhook signature verification failed: ${e.message}`);
      return res.status(400).json({ message: "Webhook signature verification failed" });
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId || session.client_reference_id;
          const plan = session.metadata?.plan;

          if (!userId) {
            log("Webhook: checkout.session.completed missing userId in metadata");
            break;
          }

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

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;

          if (!customerId) {
            log("Webhook: invoice.payment_failed missing customer ID");
            break;
          }

          const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
          if (user && user.isPro && user.subscriptionType !== "founding") {
            paymentStatusCache.set(user.id, { paymentFailed: true, checkedAt: Date.now() });
            log(`Payment failed for user ${user.id} (${user.email}) — subscription at risk`);
          }
          break;
        }

        default:
          log(`Webhook: unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (e: any) {
      log(`Webhook processing error: ${e.message}`);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  app.post("/api/create-portal-session", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.authUser.id;
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

  // --- In-App Billing Management ---

  // Get payment methods
  app.get("/api/billing/payment-methods", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.authUser.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user?.stripeCustomerId) return res.json([]);

      const methods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
      });

      const defaultMethodId = (await stripe.customers.retrieve(user.stripeCustomerId) as Stripe.Customer)
        .invoice_settings?.default_payment_method;

      res.json(methods.data.map(m => ({
        id: m.id,
        brand: m.card?.brand || "unknown",
        last4: m.card?.last4 || "****",
        expMonth: m.card?.exp_month,
        expYear: m.card?.exp_year,
        isDefault: m.id === defaultMethodId,
      })));
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Create setup intent for adding a new payment method in-app
  app.post("/api/billing/setup-intent", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.authUser.id;
      const email = req.authUser.email || "";
      const customerId = await getOrCreateStripeCustomer(userId, email);

      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ["card"],
      });

      res.json({ clientSecret: setupIntent.client_secret });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Set default payment method
  app.post("/api/billing/set-default-payment-method", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.authUser.id;
      const { paymentMethodId } = req.body;
      if (!paymentMethodId) return res.status(400).json({ message: "paymentMethodId required" });

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user?.stripeCustomerId) return res.status(400).json({ message: "No billing account" });

      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      // Also update active subscription if one exists
      if (user.stripeSubscriptionId) {
        await stripe.subscriptions.update(user.stripeSubscriptionId, {
          default_payment_method: paymentMethodId,
        });
      }

      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Remove a payment method
  app.delete("/api/billing/payment-methods/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      await stripe.paymentMethods.detach(req.params.id);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Get invoices
  app.get("/api/billing/invoices", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.authUser.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user?.stripeCustomerId) return res.json([]);

      const invoices = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 24,
      });

      res.json(invoices.data.map(inv => ({
        id: inv.id,
        number: inv.number,
        amount: inv.amount_paid / 100,
        currency: inv.currency,
        status: inv.status,
        date: inv.created * 1000,
        description: inv.lines.data[0]?.description || "ClinicalPlay Subscription",
        pdfUrl: inv.invoice_pdf,
      })));
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Get subscription details
  app.get("/api/billing/subscription", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.authUser.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.stripeSubscriptionId) {
        return res.json({
          plan: user.subscriptionType || "free",
          isPro: user.isPro,
          cancelAtPeriodEnd: false,
          currentPeriodEnd: null,
        });
      }

      try {
        const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        const periodEnd = sub.items.data[0]?.current_period_end;
        return res.json({
          plan: user.subscriptionType || "free",
          isPro: user.isPro,
          status: sub.status,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          currentPeriodEnd: periodEnd ? periodEnd * 1000 : null,
          cancelAt: sub.cancel_at ? sub.cancel_at * 1000 : null,
        });
      } catch {
        return res.json({
          plan: user.subscriptionType || "free",
          isPro: user.isPro,
          cancelAtPeriodEnd: false,
          currentPeriodEnd: null,
        });
      }
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Cancel subscription (at period end)
  app.post("/api/billing/cancel-subscription", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.authUser.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (!user?.stripeSubscriptionId) {
        return res.status(400).json({ message: "No active subscription to cancel" });
      }

      if (user.subscriptionType === "founding") {
        return res.status(400).json({ message: "Founding Member access is lifetime and cannot be cancelled" });
      }

      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      res.json({ message: "Subscription will be cancelled at the end of the current billing period" });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Resume (undo cancellation)
  app.post("/api/billing/resume-subscription", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.authUser.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (!user?.stripeSubscriptionId) {
        return res.status(400).json({ message: "No subscription found" });
      }

      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      res.json({ message: "Subscription resumed" });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Change subscription plan
  app.post("/api/billing/change-plan", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.authUser.id;
      const { plan } = req.body as { plan: string };

      if (!plan || !["monthly", "annual"].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan" });
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user?.stripeSubscriptionId) {
        return res.status(400).json({ message: "No active subscription to change" });
      }

      if (user.subscriptionType === "founding") {
        return res.status(400).json({ message: "Founding Members already have lifetime access" });
      }

      const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      const currentItemId = sub.items.data[0]?.id;
      if (!currentItemId) return res.status(400).json({ message: "Subscription item not found" });

      const newPriceId = PRICE_IDS[plan as "monthly" | "annual"];
      const subscriptionType = plan === "monthly" ? "community" : "annual";

      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        items: [{ id: currentItemId, price: newPriceId }],
        proration_behavior: "create_prorations",
        cancel_at_period_end: false,
      });

      await db.update(users).set({
        subscriptionType,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));

      res.json({ message: `Switched to ${subscriptionType} plan` });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });
}
