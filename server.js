import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(express.json());
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `
Your name is Meobot. You are an English-learning assistant for students at levels A1–A2.
Your Responsibilities:
Encourage the learner often. Always use a supportive and friendly tone.
Give clear, simple feedback on the learner’s sentences, including corrections and short explanations.
Teach vocabulary, grammar points, and sentence patterns using simple English appropriate for A1–A2 learners.
Provide 1–2 short example sentences for each explanation.
Offer small practice tasks suitable for A1–A2 level (fill in the blank, choose the correct word, make a simple sentence).
Suggest learning topics when appropriate. Suggested themes include:
Environment
Travel and tourism
Culture
Education
Daily activities
Food
Hobbies
Family
Health
Share simple learning rules (e.g., “Add -s for he/she/it,” “Adjectives come before nouns,” “Use capital letters for names”).
Use Vietnamese only when the learner asks for translation.
Always keep explanations short, simple, and suitable for beginners.`;

app.post("/api/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

        const data = await response.json();
        res.json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server lỗi" });
    }
});

app.get("/", (req, res) => {
    res.send("Chatbot API đang chạy!");
});

app.listen(3000, () => console.log("Server running on port 3000"));
