const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const MODEL = 'llama-3.1-8b-instant';

async function generateExplanation(topic) {
    const prompt = `Explain ${topic} in simple terms for a beginner. Keep it clear and concise.`;
    const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
        temperature: 0.7,
        max_tokens: 1024,
    });
    return response.choices[0]?.message?.content || "Explanation could not be generated.";
}

async function generateQuiz(topic) {
    const prompt = `Generate 3 MCQs for ${topic}. Return ONLY valid JSON:
{
"questions": [
{
"question": "...",
"options": ["...", "...", "...", "..."],
"answer": "..."
}
]
}
Do NOT include any markdown formatting like \`\`\`json or \`\`\`. Just raw JSON.`;

    const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
        temperature: 0.5,
    });
    
    let content = response.choices[0]?.message?.content || '{"questions": []}';
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
        const parsed = JSON.parse(content);
        return parsed.questions || [];
    } catch (e) {
        console.error("Failed to parse Quiz JSON:", e);
        return [];
    }
}

async function generateVisualExplanation(topic) {
    const prompt = `Explain ${topic} step-by-step in structured format suitable for diagrams. Break it down logically. Feel free to include Mermaid.js blocks if applicable.`;
    const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
        temperature: 0.7,
        max_tokens: 1024,
    });
    return response.choices[0]?.message?.content || "Visual explanation could not be generated.";
}

async function generateSummary(topic) {
    const prompt = `Give a short revision summary of ${topic} in bullet points.`;
    const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
        temperature: 0.6,
        max_tokens: 500,
    });
    
    const content = response.choices[0]?.message?.content || "";
    // split by new lines and clean up bullet points
    const lines = content.split('\n')
                         .map(line => line.replace(/^[-*•]\s*/, '').trim())
                         .filter(line => line.length > 0 && !line.includes("Here is a short revision") && !line.includes("Here are the"));
    return lines;
}

function generateAdaptiveResponse(score, topic) {
    let mode = 'visual';
    if (score >= 75) {
        mode = 'revision';
    } else if (score >= 50) {
        mode = 'reteach';
    } else if (score >= 35) {
        mode = 'chunks';
    } else {
        mode = 'visual';
    }
    return { score, mode };
}

module.exports = {
    generateExplanation,
    generateQuiz,
    generateVisualExplanation,
    generateSummary,
    generateAdaptiveResponse
};
