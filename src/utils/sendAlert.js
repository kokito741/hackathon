import axios from "axios";

export async function sendRiskAlert({
  webhookUrl,
  username,
  email,
  chatLog,
  algoRisk,
  aiRisk,
  aiReason
}) {
  try {
    const payload = {
      type: "HIGH_RISK_ALERT",
      timestamp: new Date().toISOString(),
      user: { username, email },
      risk: {
        algorithm: algoRisk,
        ai: aiRisk,
        aiReason
      },
      chatLog
    };

    const res = await axios.post(webhookUrl, payload, {
      headers: { "Content-Type": "application/json" }
    });

    console.log("Alert sent:", res.status);
    return true;
  } catch (err) {
    console.error("ALERT ERROR:", err.message);
    return false;
  }
}
