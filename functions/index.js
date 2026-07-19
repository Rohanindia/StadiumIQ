const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Callable function to proxy Groq API calls securely
exports.groqProxy = onRequest({ cors: true, secrets: ["GROQ_API_KEY"] }, async (req, res) => {
  // Set CORS headers manually if CORS option fails
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const { messages, jsonOutput } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).send({ error: "Invalid request payload: messages array is required" });
      return;
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      logger.error("GROQ_API_KEY is not configured in Firebase secrets");
      res.status(500).send({ error: "Server AI configuration error" });
      return;
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: jsonOutput ? 0.2 : 0.7,
        max_tokens: jsonOutput ? 512 : 1024,
        ...(jsonOutput ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      logger.error("Groq API error", errorText);
      res.status(groqResponse.status).send({ error: `Groq error: ${errorText}` });
      return;
    }

    const data = await groqResponse.json();
    res.status(200).send(data);
  } catch (error) {
    logger.error("Internal Server Error in groqProxy", error);
    res.status(500).send({ error: "Internal server error" });
  }
});
