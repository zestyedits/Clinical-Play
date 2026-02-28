import Anthropic from "@anthropic-ai/sdk";

const key = process.env.ANTHROPIC_API_KEY;

if (!key) {
  console.error("Missing ANTHROPIC_API_KEY. Add it in Replit Secrets.");
  process.exit(1);
}

const client = new Anthropic({ apiKey: key });

const prompt = process.argv.slice(2).join(" ");

if (!prompt) {
  console.error('Usage: node claude.mjs "your prompt"');
  process.exit(1);
}

const response = await client.messages.create({
  model: "claude-3-5-sonnet-latest",
  max_tokens: 500,
  messages: [
    { role: "user", content: prompt }
  ]
});

console.log(
  response.content
    .filter(block => block.type === "text")
    .map(block => block.text)
    .join("\n")
);