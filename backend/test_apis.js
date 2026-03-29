const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function run() {
    const form = new FormData();
    form.append('file', fs.createReadStream('dummy.pdf'));
    
    try {
        console.log("Sending PDF to /api/upload...");
        const res = await axios.post('http://localhost:5000/api/upload', form, {
            headers: form.getHeaders(),
            timeout: 30000 // 30 seconds
        });
        console.log("Success status:", res.status);
        console.log("AI Response (Topic):", res.data.topic);
        console.log("AI Response (Content Sample):", res.data.content);
    } catch (e) {
        if (e.response) {
            console.log("Error status:", e.response.status);
            console.log("Error details:", e.response.data);
        } else {
            console.log("Error message:", e.message);
        }
    }
}

run();
