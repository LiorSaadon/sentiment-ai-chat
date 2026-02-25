import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  stepCountIs,
} from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

export default defineEventHandler(async (event: any) => {
  const apiKey = useRuntimeConfig().openrouterApiKey;
  if (!apiKey) throw new Error("Missing OpenRouter API key");

  const openrouter = createOpenRouter({
    apiKey: apiKey,
    extraBody: {
      reasoning: {
        max_tokens: 10,
      },
    },
  });
  const model = openrouter("anthropic/claude-3.7-sonnet:thinking");

  const { messages }: { messages: UIMessage[] } = await readBody(event);

  const systemMessage: UIMessage = {
    id: "feelings-emoji-system-message",
    role: "system",
    parts: [
      {
        type: "text",
        text: [
          "You are a helpful AI assistant in a chat application.",
          "Whenever the user talks about their feelings or emotions (for example using phrases like \"I feel\", \"I'm feeling\", \"I am happy\", \"I am sad\", \"I'm anxious\", etc.), you MUST do three things in your reply:",
          "1) Clearly respond to what they said in natural language.",
          "2) Add exactly one emoji that best represents their main feeling (for example 🙂, 😢, 😡, 😱, 😴, 😍, 😐, 😬). Place this emoji near the end of your reply so it is easy to see.",
          "3) On a new line, include a short label and a direct HTTPS link to an appropriate, safe image on the public web that visually represents that same feeling. The link must be a valid, directly openable image URL (for example to an image on a stock-photo or image-hosting site), not a search results page.",
          "Additionally, when it is helpful, summarize the user's overall mood by calling the `sentimentWordCloud` tool with exactly 10 emotion-related words and their relative weights from 1 to 10.",
          "If the user expresses multiple feelings, focus on the primary one you infer from context.",
          "If the user is not talking about feelings or emotions at all, respond normally without adding an emoji, image link, or word cloud.",
        ].join(" "),
      },
    ],
  };

  const result = streamText({
    model,
    messages: await convertToModelMessages([systemMessage, ...messages]),
    stopWhen: stepCountIs(5),
    tools: {
      sentimentWordCloud: tool({
        description:
          "Create a 10-word sentiment word cloud summarizing the user's current feelings.",
        inputSchema: z.object({
          words: z
            .array(
              z.object({
                text: z
                  .string()
                  .describe("The word or short phrase to show."),
                weight: z
                  .number()
                  .min(1)
                  .max(10)
                  .describe(
                    "Relative importance of this word from 1 (least) to 10 (most).",
                  ),
              }),
            )
            .length(10)
            .describe(
              "Exactly 10 words that together summarize the user's overall sentiment.",
            ),
        }),
        execute: async ({ words }) => {
          return {
            words,
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
});