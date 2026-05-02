# SentinelProxy

SentinelProxy is a secure, role-based proxy for Large Language Models (LLMs). It intercepts user prompts, scans for and masks Personally Identifiable Information (PII) before sending them to the LLM, and restores the sensitive information in the response. It also features a comprehensive audit logging system and an analytics dashboard.

## Features

- **PII Masking & Restoration**: Utilizes Microsoft Presidio to detect and mask sensitive information (like emails, phone numbers, and names) before it reaches the LLM, securely restoring it upon response.
- **Authentication & Authorization**: Secure JWT-based authentication with Role-Based Access Control (RBAC). 
- **Audit Logging**: Logs every interaction, recording the user, role, model used, PII detection status, and response time.
- **Analytics Dashboard**: A React frontend featuring real-time charts (using Recharts) to monitor LLM usage, role distribution, and system performance.
- **Data Export**: Admins can export audit logs in both JSON and CSV formats.

## Tech Stack

- **Frontend**: React 19, Vite, Recharts
- **Backend**: Python, FastAPI, Uvicorn, SQLite
- **Security & Privacy**: Microsoft Presidio (Analyzer & Anonymizer), Passlib (bcrypt)
- **AI Integration**: Google Generative AI (Gemini API)

## Project Structure

```text
sentinalproxy/
├── backend/
│   ├── main.py          # FastAPI application entry point
│   ├── auth.py          # JWT authentication logic
│   ├── database.py      # SQLite database initialization and connection
│   ├── llm.py           # Integration with Google Gemini
│   ├── scanner.py       # PII scanning, masking, and restoration (Presidio)
│   ├── audit.py         # Audit logging and data export
│   ├── rbac.py          # Role-Based Access Control configurations
│   ├── users.py         # Hardcoded user credentials & password hashing
│   └── requirements.txt # Python dependencies
└── frontend/
    ├── package.json     # Node.js dependencies and scripts
    ├── vite.config.js   # Vite configuration
    └── src/
        ├── App.jsx      # React router/main app component
        ├── api.js       # API client for backend communication
        └── components/
            ├── Login.jsx       # Login boundary
            └── Dashboard.jsx   # Analytics dashboard and live feed
```

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Google Gemini API Key

### 1. Backend Setup

Navigate to the backend directory, set up a virtual environment, and install dependencies:

```bash
cd backend
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download the spaCy model required by Presidio:
python -m spacy download en_core_web_lg
```

**Environment Variables:**
Create a `.env` file in the `backend/` directory with the following keys:
```env
GEMINI_API_KEY=your_google_gemini_api_key
JWT_SECRET_KEY=your_secure_random_secret_key
```

**Run the Backend:**
```bash
uvicorn main:app --reload
```
*The backend will run on http://localhost:8000.*

### 2. Frontend Setup

Navigate to the checkout directory and install npm packages:

```bash
cd frontend
npm install

# Run the development server
npm run dev
```
*The frontend will run on http://localhost:5173 (or 5174 depending on availability).*

## Default Test Users

Use the following credentials to test the dashboard and roles:

| Username | Password   | Role     |
|----------|------------|----------|
| `carol`  | `carol123` | admin    |
| `bob`    | `bob123`   | engineer |
| `alice`  | `alice123` | analyst  |

*(Note: In a production environment, these should be securely managed in a database.)*

## Usage

1. Log in via the React frontend using one of the test users.
2. Only the `admin` account is authorized to view the comprehensive dashboard metrics and run CSV log exports securely.
3. Access the `/chat` endpoint (via Postman or a chat UI interface if implemented) to query the LLM. Watch as PII traces disappear into phantom tokens (`[REDACTED]`) before hitting Gemini's servers.
