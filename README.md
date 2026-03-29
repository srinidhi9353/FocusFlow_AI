<div align="center">
  <h1>🚀 FocusFlow AI</h1>
  <p><em>Adaptive AI Learning System with Deep Focus Mode</em></p>
</div>

---

## 📖 Overview

**FocusFlow AI** is a Generative AI-powered adaptive learning platform designed to help students study efficiently in a distraction-free environment. It provides highly personalized AI-generated explanations, integrated voice-assisted learning, dynamic quizzes, and adaptive teaching strategies. Whether utilizing AI-generated content or user-uploaded study materials, FocusFlow automatically adapts its teaching methods based on the user's performance, ensuring maximum retention and understanding.

---

## ✨ Key Features

- **🧠 AI-Powered Explanations:** Receive customized text and voice-assisted explanations for any topic.
- **🎙️ Voice-Assisted Learning:** Enjoy dynamic typing animations synced perfectly with automatic voice playback to improve engagement and accessibility.
- **📈 Adaptive Learning Engine:** A smart, score-based system that monitors your performance and dynamically shifts the difficulty and teaching style.
- **📝 Automated Quiz Generation:** Automatically generate contextual quizzes right after learning a topic to test comprehension.
- **👀 Visual Learning Mode:** Transition into visual, step-by-step explanations when text isn't enough.
- **📄 Document & PDF Support:** Upload your own study materials to extract content and learn interactively.
- **🔎 Intelligent AI Search:** Quickly locate topics, summaries, and complex concepts on the fly.
- **📹 Distraction-Free Video Learning:** Embedded YouTube video learning tailored to keep you entirely focused.
- **🔐 User Authentication:** Secure, quick access using local storage based authentication.
- **🤖 Integrated AI Chat Assistant:** A floating chatbot accessible on every page for real-time Q&A and study support.
- **💾 Smart Session Persistence:** Automatic saving and resuming of progress using `localStorage` hydration.
- **🎞️ Modal Video Explanations:** On-demand, distraction-free YouTube tutorials in a modal overlay.
- **📊 Interactive Dashboard:** Resume learning seamlessly with a "Continue" button that restores your exact state.

---

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express.js
- **AI Engine:** Groq API (LLaMA 3.1)
- **Voice Integration:** Web Speech API
- **Video Integration:** YouTube Data API
- **File Parsing & Extraction:** `pdf-parse`

---

## 🏗️ Architecture Overview

The system is designed with a seamless, modular flow ensuring low latency and high accuracy:

1. **Client Request:** The user inputs a query or uploads a PDF on the React Frontend.
2. **Backend Processing:** Node/Express Backend processes the request, parsing files if necessary.
3. **AI Generation:** The backend queries the **Groq API** to generate the educational content, quizzes, or adaptive steps.
4. **Adaptive Engine Logic:** Based on quiz performance, the engine determines if the student needs a simpler explanation or a visual learning mode.
5. **[NEW] Reteach & Adapt:** For mid-range scores, the AI reteaches using analogies; for low scores, it pivots to Visual Mode.
6. **[NEW] Session Hydration:** App state is persisted across refreshes, allowing the user to resume instantly.
7. **Client Response:** The frontend receives the payload, triggering typed animations and Web Speech voices concurrently.

---

## ⚙️ Installation & Setup

Follow these steps to run FocusFlow AI locally:

### 1. Clone the repository
```bash
git clone https://github.com/srinidhi9353/FocusFlow_AI.git
cd FocusFlow_AI
```

### 2. Install dependencies
Install dependencies for both the frontend and backend.
```bash
# In the root directory (or navigate to backend)
cd backend
npm install

# Navigate to frontend
cd ../frontend
npm install
```

### 3. Environment Variables
Create a `.env` file in your **backend** directory and configure the following keys:
```env
GROQ_API_KEY=your_groq_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
PORT=5000
```

### 4. Run the Application
Start both the frontend and backend development servers.
```bash
# Start Backend
cd backend
npm start

# Start Frontend
cd frontend
npm run dev
```

---

## 🚀 Usage Guide

1. **Login / Signup:** Create an account to track your progress.
2. **Choose your Path:** Opt to use the **AI Search** for a new topic or **Upload a File** (PDF/Notes).
3. **Enter Focus Mode:** Immerse yourself in the distraction-free learning UI.
4. **Learn & Test:** Read/Listen to the content → Take a Quiz → Enter the Adaptive Flow based on your score.
5. **Dashboard:** Track your metrics and click **Resume Learning** to jump back into your most recent session.

---

## 📸 Screenshots

*(Replace the `#` in the `src` with actual image paths once available)*

| Home Page | Focus Mode |
| :---: | :---: |
| <img src="#" alt="Home Page" width="400"/> | <img src="#" alt="Focus Mode" width="400"/> |

| Quiz Interface | Visual Mode / Dashboard |
| :---: | :---: |
| <img src="#" alt="Quiz Interface" width="400"/> | <img src="#" alt="Dashboard" width="400"/> |

---

## 🔮 Future Enhancements

- [ ] **Attention Tracking:** Use webcam data to track user focus and pause playback when distracted.
- [ ] **Multi-Language Support:** Localize AI explanations and voice capabilities into various global languages.
- [ ] **Mobile App Integration:** Port the React application to React Native for iOS/Android accessibility.
- [ ] **Advanced Analytics:** Comprehensive performance charting and heatmaps on the dashboard.

---

## 🤝 Contribution Guidelines

We welcome contributions! To help improve FocusFlow AI:

1. **Fork** the repository.
2. **Create a new branch** (`git checkout -b feature/AmazingFeature`).
3. Make your changes and commit them (`git commit -m 'Add some AmazingFeature'`).
4. **Push** to the branch (`git push origin feature/AmazingFeature`).
5. Open a **Pull Request**.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

Designed & Developed by **Srinidhi N** and Team.
