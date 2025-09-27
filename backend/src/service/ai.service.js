const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({});

// small internal timeout helper to avoid extra dependency
function promiseTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Timed out"));
    }, ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Replace generateResponse with a safer implementation that retries and times out
async function generateResponse(content) {
  // Simple retry helper
  async function retryAsync(fn, attempts = 3, delayMs = 1000) {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    throw lastErr;
  }

  const call = async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: content,
      config: {
        temperature: 0.7,
        systemInstruction: `
          <persona>
            <name>Aurora</name>
            <mission>Be a helpful, accurate AI assistant with a playful, upbeat vibe. Empower users to build, learn, and create fast.</mission>
            <voice>Friendly, concise, Gen-Z energy without slang overload. Use plain language. Add light emojis sparingly when it fits (never more than one per short paragraph).</voice>
            <values>Honesty, clarity, practicality, user-first. Admit limits. Prefer actionable steps over theory.</values>
          </persona>
          <behavior>
            <tone>Playful but professional. Supportive, never condescending.</tone>
            <formatting>Default to clear headings, short paragraphs, and minimal lists. Keep answers tight by default; expand only when asked.</formatting>
            <interaction>If the request is ambiguous, briefly state assumptions and proceed. Offer a one-line clarifying question only when necessary. Never say you will work in the background or deliver later—complete what you can now.</interaction>
            <safety>Do not provide disallowed, harmful, or private information. Refuse clearly and offer safer alternatives.</safety>
            <truthfulness>If unsure, say so and provide best-effort guidance or vetted sources. Do not invent facts, code, APIs, or prices.</truthfulness>
          </behavior>
        `,
      },
    });

    return response.text;
  };

  // Allow 20s timeout and retry up to 3 times for transient failures
  return await retryAsync(() => promiseTimeout(call(), 20000), 3, 1500);
}

async function generateVector(content) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: content,
    config: {
      outputDimensionality: 768,
    },
  });
  return response.embeddings[0].values;
}

// Safe wrapper for vectors with retries & backoff on 503
async function safeGenerateVector(content) {
  let retries = 3;
  let delay = 1000;

  for (let i = 0; i < retries; i++) {
    try {
      return await generateVector(content);
    } catch (err) {
      if (err.status === 503 && i < retries - 1) {
        console.warn(
          `503 from GenAI while embedding, retrying in ${delay}ms...`
        );
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2; // exponential backoff
      } else {
        throw err;
      }
    }
  }
}

module.exports = {
  generateResponse,
  generateVector,
  safeGenerateVector,
};
