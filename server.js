import express from "express";
import cors from "cors";
import fetch from "node-fetch";
// import dotenv from "dotenv";

// dotenv.config();

const app = express();

app.use(express.json({ limit: "20mb" }));
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `
You are a cute, gentle English Teacher AI specialized in restaurant and food topics.
Your tone is soft, friendly, and supportive.

You ALWAYS reply in two languages:  
English first (teacher tone)  
Then Vietnamese translation.

Format:
EN: ...
VI: ...

Teach English related to restaurant topics.
Correct grammar softly.
Encourage the user to practice.
`;

//
// ➤ MAIN CHAT + AUTO VOICE
//
app.post("/api/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        // ====== 1) Get ChatGPT text ======
        const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userMessage }
                ]
            }),
        });

        const chatData = await chatRes.json();
        const botReply = chatData.choices[0].message.content;


        // ====== 2) Convert TEXT → VOICE (mp3 base64) ======
        const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini-tts",
                voice: "alloy",
                input: botReply,
                format: "mp3"
            }),
        });

        const arrayBuffer = await ttsRes.arrayBuffer();
        const audioBase64 = Buffer.from(arrayBuffer).toString("base64");

        // ====== 3) Send back to frontend ======
        res.json({
            reply: botReply,
            audio: audioBase64
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: "Server error", audio: null });
    }
});


app.get("/", (req, res) => {
    res.send("Chatbot API with voice is running!");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
