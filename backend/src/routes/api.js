const express = require('express');
const router = express.Router();
const axios = require('axios');
const aiService = require('../services/aiService');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

// Auth Routes
router.post('/auth/signup', (req, res) => {
    const { email, name, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    res.json({ token: 'mock-jwt-token-12345', user: { id: Date.now().toString(), email, name: name || 'Student' } });
});

router.post('/auth/login', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    res.json({ token: 'mock-jwt-token-12345', user: { id: Date.now().toString(), email, name: 'Student' } });
});

// File Parsing Route
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);

        let text = pdfData.text;

        // 🧠 CLEAN TEXT (VERY IMPORTANT)
        text = text.replace(/\s+/g, " ").trim();

        if (!text || text.length < 50) {
            return res.status(400).json({ error: "PDF content too short" });
        }

        // 🚀 LIMIT TEXT (Groq input safe)
        const trimmedText = text.substring(0, 3000);

        const topicName = req.file.originalname.replace(/\.[^/.]+$/, "");
        const content = await aiService.generateExplanation(`the following content from ${topicName}:\n\n${trimmedText}`);

        fs.unlinkSync(req.file.path); // cleanup

        res.json({ success: true, topic: topicName, content, mode: 'text' });
    } catch (e) {
        console.error("PDF Parse error", e.stack || e);
        console.error("File details:", req.file);
        res.status(500).json({ error: 'Failed to process document', details: e.message });
    }
});

// Groq Generation Route
router.post('/ai/explain', async (req, res) => {
    const { topic, style } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    try {
        const content = await aiService.generateExplanation(topic, style);
        res.json({ topic, content, mode: 'text' });
    } catch (error) {
        console.error('Groq Error:', error);
        res.status(500).json({ error: 'Failed to generate lesson' });
    }
});

// Groq Quiz Route
router.post('/ai/quiz', async (req, res) => {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    try {
        const quizItems = await aiService.generateQuiz(topic);
        res.json(quizItems);
    } catch (error) {
        console.error('Groq Error:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

// Groq Summary Route
router.post('/ai/summary', async (req, res) => {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    try {
        const summaryPoints = await aiService.generateSummary(topic);
        res.json({ summary: summaryPoints });
    } catch (error) {
        console.error('Groq Error:', error);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
});

// Adaptive Routing Logic Endpoint
router.post('/ai/adapt', (req, res) => {
    const { score, topic } = req.body;
    if (score === undefined) return res.status(400).json({ error: 'Score is required' });

    const result = aiService.generateAdaptiveResponse(score, topic);
    res.json(result);
});

// Groq Visual Generation Route
router.post('/ai/visual', async (req, res) => {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    try {
        const content = await aiService.generateVisualExplanation(topic);
        res.json({ topic, content });
    } catch (error) {
        console.error('Groq Error:', error);
        res.status(500).json({ error: 'Failed to generate visual explanation' });
    }
});

// YouTube Video Search Route (GET)
router.get('/youtube/search', async (req, res) => {
    const { topic } = req.query;
    if (!topic) return res.status(400).json({ error: 'Topic is required as a query parameter' });

    try {
        const query = encodeURIComponent(`${topic} educational tutorial explanation`);
        const apiKey = process.env.YOUTUBE_API_KEY;
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${apiKey}&maxResults=1`;

        const response = await axios.get(url);

        if (response.data.items && response.data.items.length > 0) {
            res.json({ videoId: response.data.items[0].id.videoId });
        } else {
            res.status(404).json({ error: 'No videos found' });
        }
    } catch (error) {
        console.error('YouTube API Error:', error?.message);
        res.status(500).json({ error: 'Failed to fetch video' });
    }
});

// Groq Chat Assistant Route
router.post('/ai/chat', async (req, res) => {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    try {
        const prompt = `You are an AI learning assistant for FocusFlow. 
The student is currently learning about: ${context || 'General Topics'}.
Answer their question clearly, concisely, and encouragingly.
Question: ${message}`;

        const response = await aiService.generateExplanation(prompt); // Reusing general explanation logic for chat
        res.json({ reply: response });
    } catch (error) {
        console.error('Groq Chat Error:', error);
        res.status(500).json({ reply: "I'm sorry, I'm having trouble processing that right now." });
    }
});

module.exports = router;
