const nodemailer = require("nodemailer");
const db = require("../db");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.ALERT_EMAIL,
        pass: process.env.ALERT_PASS
    }
});

async function sendAlertEmail({ userId, chatLog, algorithm, ai, riskId }) {
    const [[user]] = await db.query(
        "SELECT username, email FROM users WHERE id = ?",
        [userId]
    );

    const message = `
AUTOMATIC SAFETY ALERT

User: ${user.username}
Email: ${user.email}

Algorithm Score: ${algorithm.score}
AI Score: ${ai.score}
AI Level: ${ai.level}

AI Reason:
${ai.reason}

--- CHAT LOG ---
${chatLog}
`;

    await transporter.sendMail({
        from: process.env.ALERT_EMAIL,
        to: process.env.SOCIAL_WORKER_EMAIL,
        subject: "⚠ HIGH-RISK DV ALERT",
        text: message
    });

    await db.query(
        "INSERT INTO alerts_sent (user_id, risk_assessment_id, sent_to) VALUES (?,?,?)",
        [userId, riskId, process.env.SOCIAL_WORKER_EMAIL]
    );
}

module.exports = { sendAlertEmail };
