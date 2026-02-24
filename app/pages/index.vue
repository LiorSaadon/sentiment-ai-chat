<script setup lang="ts">
import { Chat } from "@ai-sdk/vue";
import { ref } from "vue";

const input = ref("");
const chat = new Chat({});

const extractImageUrl = (text: string): string | null => {
  const urlMatch = text.match(/https?:\/\/\S+/);
  return urlMatch ? urlMatch[0] : null;
};

const getLineSegments = (text: string): { line: string; imageUrl: string | null }[] => {
  return text.split("\n").map((line) => {
    const imageUrl = extractImageUrl(line);
    return { line, imageUrl };
  });
};

const handleSubmit = (e: Event) => {
  e.preventDefault();
  chat.sendMessage({ text: input.value });
  input.value = "";
};
</script>

<template>
  <div class="app-root">
    <div class="chat-card">
      <header class="chat-header">
        <div class="chat-header-main">
          <h1 class="chat-title">Sentiment Chat</h1>
          <p class="chat-subtitle">
            Talk about how you feel and get a matching emoji and image.
          </p>
        </div>
      </header>

      <div class="chat-messages">
        <div
          v-for="(m, index) in chat.messages"
          :key="m.id ? m.id : index"
          :class="[
            'message-row',
            m.role === 'user' ? 'message-row-user' : 'message-row-ai',
          ]"
        >
          <div class="avatar" :class="m.role === 'user' ? 'avatar-user' : 'avatar-ai'">
            {{ m.role === "user" ? "You" : "AI" }}
          </div>

          <div class="message-bubble">
            <div
              v-for="(part, i) in m.parts"
              :key="`${m.id}-${part.type}-${i}`"
            >
              <div v-if="part.type === 'text'">
                <template
                  v-for="(segment, j) in getLineSegments(part.text)"
                  :key="`${i}-${j}`"
                >
                  <div v-if="!segment.imageUrl" class="message-text-line">
                    {{ segment.line }}
                  </div>
                  <div v-else class="message-image-wrapper">
                    <img
                      :src="segment.imageUrl as string"
                      alt="Feeling image"
                      class="message-image"
                    />
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div v-if="chat.messages.length === 0" class="empty-state">
          Start by telling me how you feel today.
        </div>
      </div>

      <form class="chat-input-bar" @submit="handleSubmit">
        <input
          v-model="input"
          class="chat-input"
          placeholder="Type a message about how you feel..."
        />
        <button class="chat-send-button" type="submit">
          Send
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #1e293b 0, #020617 45%, #000 100%);
  padding: 24px;
  box-sizing: border-box;
  color: #e5e7eb;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.chat-card {
  width: 100%;
  max-width: 720px;
  background: rgba(15, 23, 42, 0.95);
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  background: linear-gradient(
    135deg,
    rgba(56, 189, 248, 0.15),
    rgba(147, 51, 234, 0.15)
  );
  backdrop-filter: blur(18px);
}

.chat-header-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.chat-subtitle {
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
}

.chat-messages {
  padding: 16px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 60vh;
  overflow-y: auto;
}

.message-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.message-row-user {
  flex-direction: row-reverse;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.avatar-user {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #ecfdf5;
}

.avatar-ai {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: #eef2ff;
}

.message-bubble {
  max-width: 80%;
  border-radius: 16px;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.5;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.message-row-user .message-bubble {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-color: transparent;
  color: #ecfdf5;
}

.message-row-ai .message-bubble {
  background: rgba(15, 23, 42, 0.98);
}

.message-text-line + .message-text-line {
  margin-top: 4px;
}

.message-image-wrapper {
  margin-top: 8px;
}

.message-image {
  display: block;
  max-width: 220px;
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.5);
}

.empty-state {
  margin-top: 8px;
  font-size: 13px;
  color: #6b7280;
  text-align: center;
}

.chat-input-bar {
  display: flex;
  gap: 8px;
  padding: 10px 12px 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.98);
}

.chat-input {
  flex: 1;
  border-radius: 999px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
  padding: 8px 14px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.chat-input::placeholder {
  color: #6b7280;
}

.chat-input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.5);
  background: rgba(15, 23, 42, 1);
}

.chat-send-button {
  border-radius: 999px;
  border: none;
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: linear-gradient(135deg, #38bdf8, #6366f1);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.45);
  transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.15s ease;
}

.chat-send-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.6);
}

.chat-send-button:active {
  transform: translateY(0);
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.45);
}

@media (max-width: 640px) {
  .chat-card {
    max-width: 100%;
  }

  .message-bubble {
    max-width: 100%;
  }
}
</style>