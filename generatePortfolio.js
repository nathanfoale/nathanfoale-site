// File: generatePortfolio.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(bodyParser.json());

// Serve frontend assets
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// POST /generate
app.post('/generate', async (req, res) => {
  const {
    name, title, bio, education, experience,
    projects, skills, contact, style, include = {}, customPrompt
  } = req.body;

  // 🧱 Build fallback content from toggles
  const sections = [];
  if (include.bio && bio) sections.push(`**About**: ${bio}`);
  if (include.education && education) sections.push(`**Education**: ${education}`);
  if (include.experience && experience) sections.push(`**Experience**: ${experience}`);
  if (include.projects && projects) sections.push(`**Projects**: ${projects}`);
  if (include.skills && skills) sections.push(`**Skills**: ${skills}`);
  if (include.contact && contact) sections.push(`**Contact**: ${contact}`);

  // 🪄 Default AI prompt
  const fallbackPrompt = `
You are a world-class creative frontend developer.

Generate a fully responsive modern personal portfolio website using **HTML** + **Tailwind CSS (via CDN)**.

📌 Requirements:
- Hero section with name, title, and call-to-action
- Sticky dark-themed navbar
- Gradient or neon backgrounds, soft glassmorphism effects if appropriate
- Use Tailwind utility classes only (no external CSS)
- Smooth fade/slide transitions on elements
- Use a Google font like Orbitron, Exo 2, or Inter
- Style to match this vibe: "${style}"

📥 Injected Content:
Name: ${name}
Title: ${title}
${sections.join('\n')}
`;

  const finalPrompt = customPrompt?.trim() || fallbackPrompt;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Only output HTML. No backticks, no markdown, no explanations." },
        { role: "user", content: finalPrompt }
      ],
      temperature: 0.7,
    });

    const html = response.choices[0].message.content;
    res.send({ html });
  } catch (err) {
    console.error("❌ OpenAI error:", err.message);
    res.status(500).send({ error: "Failed to generate portfolio." });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});