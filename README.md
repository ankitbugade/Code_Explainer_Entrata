# AI Code Explainer

AI Code Explainer is a full-stack web application that allows users to paste **Python** or **JavaScript** code and receive an AI-generated explanation in plain English. The application focuses on producing accurate, easy-to-understand explanations while reducing hallucinations through prompt engineering and an LLM-as-a-Judge validation pipeline.

---

# Features

* Explain Python and JavaScript code snippets
* Generate concise summaries and detailed explanations
* Detect estimated time and space complexity
* Suggest an optimized version of the code
* Support multiple code snippets with history
* JWT authentication using HttpOnly cookies
* User-specific snippet storage in Neon PostgreSQL
* Modern split-screen interface with Monaco Editor
* Responsive dark-themed UI

---

# Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Frontend       | React, Vite, TypeScript, Zustand, Axios |
| Backend        | Node.js, Express, TypeScript            |
| Database       | PostgreSQL (Neon)                       |
| Authentication | JWT, HttpOnly Cookies, bcrypt           |
| AI             | Groq API (Llama 3.3 70B)                |
| Code Editor    | Monaco Editor                           |
| Styling        | CSS (Inter Font, Dark Theme)            |

---

# System Architecture

The application follows a client-server architecture.

```
                User
                  │
                  ▼
        React + Vite Frontend
                  │
                  ▼
          Express Backend
                  │
      Input Validation
                  │
      Optional AST Parsing
                  │
      Prompt Construction
                  │
                  ▼
          Groq LLM (Explainer)
                  │
                  ▼
         Groq LLM (Judge)
                  │
      Validate Explanation
                  │
                  ▼
      JSON Response Returned
                  │
                  ▼
         Frontend UI Updates
                  │
                  ▼
      Save Snippet to PostgreSQL
```

---

# Technical Decisions

## React + Vite

React with Vite was selected for its fast development experience, excellent performance, and lightweight build process. Vite provides near-instant hot module replacement, making rapid iteration easier during development.

---

## Express Backend

The backend is responsible for:

* Authentication
* Secure API communication
* Prompt construction
* AI requests
* Response validation
* Database operations

Separating AI logic from the frontend keeps API keys secure and simplifies future enhancements.

---

## Neon PostgreSQL

Neon PostgreSQL was selected because it provides a managed PostgreSQL database with generous free-tier limits. Each snippet is associated with an authenticated user, allowing users to revisit previous explanations.

---

## JWT Authentication

Authentication is implemented using JWT stored inside HttpOnly cookies.

This approach:

* Protects tokens from JavaScript access
* Reduces XSS attack risks
* Simplifies authenticated API requests

---

# AI Tools Selected and Reasoning

## Primary Model

**Groq API using Llama 3.3 70B**

Reasons for selection:

* Very low latency
* High-quality reasoning for code understanding
* Free developer tier
* Simple REST API integration
* Suitable for real-time code explanation

The model is used to generate:

* Code summaries
* Detailed explanations
* Complexity estimates
* Optimized code suggestions

---

## LLM-as-a-Judge

Instead of trusting the first AI response directly, the project uses a second LLM call to validate the generated explanation.

The Judge model receives:

* Original source code
* Generated explanation

It verifies:

* Whether every statement is supported by the code
* Whether any functionality has been hallucinated
* Whether the complexity estimate is reasonable
* Whether important logic has been omitted

If the explanation passes validation, it is returned to the user. Otherwise, the Judge generates a corrected explanation.

This two-stage pipeline improves the reliability of AI-generated responses.

---

# Hallucination Reduction Strategy

Several techniques are used to improve response accuracy.

### Prompt Guardrails

The model is instructed to:

* Explain only what exists in the provided code.
* Avoid assumptions about external files, APIs, or hidden logic.
* Explicitly state when information cannot be inferred.

---

### Low Temperature

The model is configured with a low temperature to produce deterministic and consistent explanations.

---

### Structured JSON Output

The AI is instructed to return structured JSON rather than free-form text.

This simplifies parsing and reduces formatting errors.

---

### Optional AST Parsing

For JavaScript snippets, AST parsing can extract verified code structures such as:

* Functions
* Loops
* Variables
* Imports
* Conditions

This metadata can be included in the prompt to further ground the AI's explanation.

---

# Running the Project

## Backend

```bash
cd backend
npm install
npm run dev
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on **http://localhost:3000** and communicates with the Express backend through the configured API.

---

# Project Structure

```
ai-code-explainer/

backend/
├── src/
├── routes/
├── services/
├── middleware/
├── database/
└── package.json

frontend/
├── src/
├── components/
├── pages/
├── store/
├── hooks/
└── package.json

README.md
```

---

# Future Improvements

* Support additional programming languages
* Python AST parsing
* Side-by-side diff viewer for optimized code
* Streaming AI responses
* Export explanations as Markdown or PDF
* Cloud synchronization across devices
* RAG using official language documentation

---

# License

This project is licensed under the MIT License.
