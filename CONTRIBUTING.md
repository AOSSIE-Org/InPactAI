# Contributing to InPactAI

Thank you for your interest in contributing to *InPactAI* — a collaborative platform aiming to bridge the gap between creators and users through scalable, interactive features.

We welcome contributions of all kinds — bug fixes, feature enhancements, documentation updates, and UI improvements.

---

## 🚀 Getting Started

### 🔍  Check Existing Issues  
Browse the [Issues tab](https://github.com/AOSSIE-Org/InPactAI/issues) to pick something to work on.  
Look for labels like `good first issue` to get started!

### ✅ 1. Fork the Repository  
Click the *Fork* button at the top right of the [main repository](https://github.com/AOSSIE-Org/InPactAI) page to create your own copy.

### ✅ 2. Clone Your Fork & Create a Branch

```bash
git clone https://github.com/<your-username>/InPactAI.git
cd InPactAI
git checkout -b feature/your-feature-name
```

---

## 🛠 Project Setup Instructions

### 🔷 Frontend (frontend/)

```bash
cd frontend
npm install
npm run dev
```


Stack: Vite + React + TypeScript

---

### 🔷 Landing Page (landing-page/)

```bash
cd landing-page
npm install
npm run dev
```


Stack: Vite + HTML/CSS + minimal JS

---

### 🔷 Backend (backend/)

#### Option 1: Using Python Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Option 2: Using Docker

```bash
cd backend
docker-compose up --build
```

Stack: FastAPI + PostgreSQL

---
> ℹ️ Default ports: Frontend & Landing Page → http://localhost:5173, Backend → http://localhost:8000


## 🧪 Testing

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm run test
```

---

## 🧾 Contribution Guidelines

- Use meaningful branch names like:
  - feature/add-authentication
  - fix/navbar-overlap
  - docs/readme-fix
- Commit messages should follow conventions like:
  - feat: added reset password functionality
  - fix: resolved form crash on submit
- Always open a pull request with:
  - A clear title
  - Description of changes
  - Linked issue (e.g., Fixes #12)
- Don’t commit `.env` or API credentials
- Add screenshots if UI is changed

---

## 📦 Tech Stack Overview

- **Frontend**: Vite + React + TypeScript
- **Landing Page**: Vite + HTML/CSS
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Auth**: (custom or third-party integration)
- **Deployment**: Docker / Vercel

---

## 📁 Repo Structure

```txt
InPactAI/
├── frontend/         → Main web app
├── landing-page/     → Landing page
├── backend/          → FastAPI backend
├── .github/          → PR templates, workflows, actions
```

---

## 💬 Need Help?

Check open [issues](https://github.com/AOSSIE-Org/InPactAI/issues)  
or raise one with your query — we’ll assist you ASAP.

---

Thanks for contributing! 🌟  
— Team InPactAI
