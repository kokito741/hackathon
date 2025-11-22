require('dotenv').config();
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');
const axios = require("axios");
const Pushover = require("pushover-notifications");

// ----------------------------------------------------------
// QUICK TEST ENDPOINT FOR FRONTEND (authenticated)
// ----------------------------------------------------------
router.post("/send", auth, (req, res) => {
  console.log("HIT /chat/send by user:", req.user);
  res.json({ 
    user: req.user.name,
    assistant: "Test OK",
    risk: { level: "low" }
  });
});


// -----------------------------
// Pushover Alert Sender
// -----------------------------
console.log("DEBUG PUSHOVER:", {
  user: process.env.PUSHOVER_USER_KEY,
  token: process.env.PUSHOVER_APP_TOKEN
});
async function sendPushoverAlert({
  username,
  email,
  algoRisk,
  aiRisk,
  aiReason,
  chatLog
}) {
const push = new Pushover({
  user: process.env.PUSHOVER_USER_KEY,
  token: process.env.PUSHOVER_APP_TOKEN
});


  const msg = {
    title: "🚨 HIGH-RISK ABUSE ALERT",
    message:
      `User: ${username}\nEmail: ${email}\n\n` +
      `Algorithm Risk: ${algoRisk}\nAI Risk: ${aiRisk}\n\n` +
      `Reason:\n${aiReason}\n\n` +
      `Chat Log:\n${chatLog}`,
    priority: 1,
    sound: "siren"
  };

  return new Promise((resolve, reject) => {
    push.send(msg, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}


// -----------------------------
// Simple algorithmic risk
// -----------------------------
function computeAlgorithmRisk(chatLog) {
  const danger = ["hit", "kill", "hurt", "threat", "violence", "scared"];
  let score = danger.filter(w => chatLog.toLowerCase().includes(w)).length;
  if (score >= 3) return "high";
  if (score === 2) return "medium";
  return "low";
}
// -----------------------------
// Single OpenAI Call (reply + risk)
// -----------------------------
async function getAiChatAndRisk(chatLog, userMessage) {
  const apiKey = process.env.OPENAI_API_KEY;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an AI assistant inside a safety monitoring platform.
For EVERY message, output a JSON object ONLY:

{
  "assistant": "...the assistant's reply...",
  "risk": "low | medium | high",
  "reason": "short explanation why this risk level was chosen"
}

Rules:
- "assistant" is a normal helpful reply to the last user message.
- "risk" evaluates the ENTIRE chatLog for potential domestic abuse.
- Always output VALID JSON ONLY. No extra text.
`
        },
        { role: "user", content: "FULL CHAT LOG:\n" + chatLog },
        { role: "user", content: "LATEST MESSAGE:\n" + userMessage }
      ]
    },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  let raw = response.data.choices[0].message.content.trim();

  // Ensure parsed JSON
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("AI JSON PARSE FAILED:", raw);
    parsed = {
      assistant: "Sorry, I had trouble responding.",
      risk: "low",
      reason: "AI returned non-JSON output"
    };
  }

  return parsed;
}

// POST /chat (Single AI call)
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.name;

    const { message } = req.body;

    if (!userEmail) {
      console.error("ERROR: req.user.email is undefined");
    }

    // 1) Log user message
    await db.query(
      "INSERT INTO chat_logs (user_id, role, message, timestamp) VALUES (?, 'user', ?, NOW())",
      [userId, message]
    );

    // 2) Load chat history
    const [rows] = await db.query(
      "SELECT role, message FROM chat_logs WHERE user_id=? ORDER BY timestamp ASC",
      [userId]
    );

    const chatLog = rows.map(r => `${r.role}: ${r.message}`).join("\n");

    // 3) Numeric risk mapping
    const RISK = { low: 1, medium: 2, high: 3 };

    const algoStr = computeAlgorithmRisk(chatLog);     // "low" | "medium" | "high"
    const algorithm_score = RISK[algoStr];

    // 4) AI call
    const ai = await getAiChatAndRisk(chatLog, message);
    const ai_score = RISK[ai.risk];

    const final_risk = Math.max(algorithm_score, ai_score);

    // 5) Store risk
    const [riskResult] = await db.query(
      `INSERT INTO risk_assessments 
       (user_id, algorithm_score, ai_score, ai_reason, final_risk, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, algorithm_score, ai_score, ai.reason, final_risk]
    );

    const riskAssessmentId = riskResult.insertId;

    // 6) Log assistant reply
    await db.query(
      "INSERT INTO chat_logs (user_id, role, message, timestamp) VALUES (?, 'assistant', ?, NOW())",
      [userId, ai.assistant]
    );

    // 7) High risk alert
    if (final_risk === 3) {
      await sendPushoverAlert({
        username: userName,
        email: userEmail,
        algoRisk: algoStr,
        aiRisk: ai.risk,
        aiReason: ai.reason,
        chatLog
      });

      await db.query(
        `INSERT INTO alerts_sent 
         (user_id, risk_assessment_id, sent_to, sent_at)
         VALUES (?, ?, ?, NOW())`,
        [userId, riskAssessmentId, userEmail]
      );
    }

    // 8) Response
    res.json({
      assistant: ai.assistant,
      risk: ai.risk,
      reason: ai.reason,
      algoRisk: algoStr
    });

  } catch (err) {
    console.error("CHAT ERROR:", err);
    res.status(500).json({ error: "Internal chat error" });
  }
});


module.exports = router;
