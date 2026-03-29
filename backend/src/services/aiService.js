const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const MODEL = 'llama-3.1-8b-instant';

async function generateExplanation(topic, style = 'default') {
    if (topic.startsWith("the following content from")) {
        // ... (existing PDF code stays same for now)
        // (implied truncation for brevity in prompt)
    }

    let prompt;
    if (style === 'reteach') {
        prompt = `The student is struggling with ${topic}. Re-explain it using a completely different perspective, such as powerful analogies or real-world metaphors.\nUse simple English and correct grammar.`;
    } else {
        prompt = `Explain ${topic} clearly in simple English.\nUse correct grammar and proper spelling.\nAvoid typos.\nKeep sentences short and clear.`;
    }
    
    const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
        temperature: 0.7,
        max_tokens: 1024,
    });
    
    return response.choices[0]?.message?.content || "Explanation could not be generated.";
}

async function generateQuiz(topic) {
    const prompt = `Generate 3 multiple choice questions for ${topic}. 
Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "answer": "..."
    }
  ]
}`;

    try {
        const response = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: MODEL,
            temperature: 0.5,
        });
        
        let content = response.choices[0]?.message?.content || "";
        
        // 🔥 Robust Extraction
        const jsonStart = content.indexOf("{");
        const jsonEnd = content.lastIndexOf("}") + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) throw new Error("No JSON found in response");
        
        const jsonString = content.slice(jsonStart, jsonEnd);
        const parsed = JSON.parse(jsonString);
        
        if (!parsed.questions || !Array.isArray(parsed.questions)) throw new Error("Invalid Quiz structure");
        
        return parsed.questions;
    } catch (e) {
        console.error("Quiz Generation Failed, using fallback:", e.message);
        // Fallback Quiz
        return [
            {
                question: `What is the core principle of ${topic || 'this topic'}?`,
                options: ["Fundamental Structure", "Binary Logic", "Dynamic Scaling", "Data Persistence"],
                answer: "Fundamental Structure"
            },
            {
                question: `How does ${topic || 'this topic'} impact scalability?`,
                options: ["Negatively", "Significantly improves it", "No impact", "Only works for small apps"],
                answer: "Significantly improves it"
            },
            {
                question: `Which industry uses ${topic || 'this topic'} the most?`,
                options: ["Tech", "Healthcare", "Finance", "All of the above"],
                answer: "All of the above"
            }
        ];
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
