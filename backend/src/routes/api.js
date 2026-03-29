const express = require('express');
const router = express.Router();
const axios = require('axios');
const aiService = require('../services/aiService');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const upload = multer({ storage: multer.memoryStorage() });

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
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        const data = await pdfParse(req.file.buffer);
        let text = data.text;
        
        // Summarize if large (mock logic: truncating for basic safety, passing to explanation)
        if (text.length > 5000) {
            text = text.substring(0, 5000) + "...";
        }

        // Just sending the text directly to the explainer logic makes it dynamic
        const topicName = req.file.originalname.replace(/\.[^/.]+$/, "");
        const content = await aiService.generateExplanation(`the following text from ${topicName}: \n${text}`);
        
        res.json({ success: true, topic: topicName, content, mode: 'text' });
    } catch (e) {
        console.error("PDF Parse error", e);
        res.status(500).json({ error: 'Failed to process document' });
    }
});

// Groq Generation Route
router.post('/ai/explain', async (req, res) => {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    try {
        const content = await aiService.generateExplanation(topic);
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

module.exports = router;
