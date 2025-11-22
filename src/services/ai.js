const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

async function askAI(chatLog) {
    const prompt = `
You are a trauma-informed safety assistant.
Respond empathetically and safely.
Chat log:
${chatLog}

Your response:
    `;

    const res = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }]
    });

    return res.choices[0].message.content;
}

async function aiRisk(chatLog) {
    const prompt = `
You are an expert in domestic violence risk assessment.
Assess the risk using the chat log:

${chatLog}

Return JSON ONLY:
{
  "score": 0-100,
  "level": "low|medium|high|critical",
  "reason": "short reason"
}
    `;

    const res = await client.chat.completions.create({
        model: "gpt-4.1",
        messages: [{ role: "user", content: prompt }]
    });

    return JSON.parse(res.choices[0].message.content);
}

module.exports = { askAI, aiRisk };
