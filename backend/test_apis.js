const axios = require('axios');

async function testApi() {
    console.log("Starting Backend API Verification...\n");
    const BASE_URL = 'http://localhost:5000/api';
    let failCount = 0;

    const runTest = async (name, method, endpoint, body = null) => {
        try {
            process.stdout.write(`Testing [${method}] ${endpoint}... `);
            const options = {
                method,
                url: `${BASE_URL}${endpoint}`,
                headers: { 'Content-Type': 'application/json' },
            };
            if (body && method === 'POST') options.data = body;

            const res = await axios(options);
            const data = res.data;

            console.log('✅ PASSED');
            return data;
        } catch (error) {
            if (error.response) {
                console.log(`❌ FAILED (${error.response.status}) - ${JSON.stringify(error.response.data)}`);
            } else {
                console.log(`❌ FAILED (Network Error: ${error.message})`);
            }
            failCount++;
            return null;
        }
    };

    // STEP 2 & 3: Route Verification & External API Testing
    await runTest('Signup', 'POST', '/auth/signup', { email: 'test@test.com', name: 'Tester', password: 'password123' });
    await runTest('Login', 'POST', '/auth/login', { email: 'test@test.com' });
    await runTest('Upload', 'POST', '/upload', { fileData: 'mock' });

    console.log("\nTesting External OpenAI APIs...");
    const explainData = await runTest('AI Explain', 'POST', '/ai/explain', { topic: 'recursion in simple terms' });
    if (explainData) {
        console.log(`\n  Response Snippet -> "${explainData.content.substring(0, 100)}..."\n`);
    }

    const quizData = await runTest('AI Quiz', 'POST', '/ai/quiz', { topic: 'recursion in simple terms' });
    if (quizData && quizData.length > 0) {
        console.log(`  Quiz Generated: ${quizData.length} questions.`);
        console.log(`  Q1 -> ${quizData[0].question}\n`);
    }

    console.log("Testing Mock Test Flow (Adaptive Logic)...");
    const adapt80 = await runTest('AI Adapt (80)', 'POST', '/ai/adapt', { score: 80 });
    if (adapt80) console.log(`  Score 80 -> Route Mode: ${adapt80.mode}`);

    const adapt60 = await runTest('AI Adapt (60)', 'POST', '/ai/adapt', { score: 60 });
    if (adapt60) console.log(`  Score 60 -> Route Mode: ${adapt60.mode}`);

    const adapt40 = await runTest('AI Adapt (40)', 'POST', '/ai/adapt', { score: 40 });
    if (adapt40) console.log(`  Score 40 -> Route Mode: ${adapt40.mode}`);

    const adapt20 = await runTest('AI Adapt (20)', 'POST', '/ai/adapt', { score: 20 });
    if (adapt20) console.log(`  Score 20 -> Route Mode: ${adapt20.mode}\n`);

    console.log("Testing YouTube API Integration...");
    const ytData = await runTest('YouTube Search', 'GET', '/youtube/search?topic=recursion%20tutorial%20beginner');
    if (ytData) {
        console.log(`  YouTube Video ID Retrieved: ${ytData.videoId}\n`);
    }

    console.log("==========================================");
    if (failCount === 0) {
        console.log("🎉 ALL ROUTES PASSED VERIFICATION!");
    } else {
        console.log(`⚠️ ${failCount} ROUTES FAILED VERIFICATION.`);
    }
}

testApi();
