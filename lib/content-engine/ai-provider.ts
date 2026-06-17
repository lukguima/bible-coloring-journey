/**
 * AI Provider placeholder for Content Engine.
 *
 * In the MVP, all assets are generated from local templates in generators.ts.
 * To enable AI generation, implement this function using any provider:
 *   - Anthropic Claude (recommended): @anthropic-ai/sdk
 *   - OpenAI: openai
 *   - Google Gemini: @google/generative-ai
 *
 * Example with Claude:
 *   import Anthropic from "@anthropic-ai/sdk";
 *   const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
 *   const message = await client.messages.create({ model: "claude-opus-4-8", ... });
 */
export async function generateWithAI(prompt: string): Promise<string> {
  throw new Error(
    "AI provider not configured yet. Set up an API key and connect a provider in ai-provider.ts."
  );
}
