import {
    streamText,
    UIMessage,
    convertToModelMessages,    
  } from "ai";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
  
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
    const model = openrouter('anthropic/claude-3.7-sonnet:thinking');
  
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
            "If the user expresses multiple feelings, focus on the primary one you infer from context.",
            "If the user is not talking about feelings or emotions at all, respond normally without adding an emoji or image link."
          ].join(" "),
        },
      ],
    };
  
    const result = streamText({
        model,
        messages: await convertToModelMessages([systemMessage, ...messages]),
    });
  
    return result.toUIMessageStreamResponse();
  });