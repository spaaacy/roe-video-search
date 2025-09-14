# ROE AI Video Search

A full-stack project with a **Next.js frontend** and a **Django backend**.The app enables uploading videos, querying video content, and chatting with video insights.

## Project Structure

```
├── frontend/ # Next.js app
└── backend/ # Django app
```

## Frontend (Next.js)

### Setup
```bash
cd frontend
npm install
```

### Environment Variables

Create a .env.local file in the frontend/ directory:

```
NEXT_PUBLIC_BACKEND_URL="http://127.0.0.1:8000"
```

### Libraries Used
- react-hot-toast — notifications
- react-icons — icons
- react-spinners — loading indicators

## Backend (Django)

### Setup

```
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Environment Variables

Create a .env file in the backend/ directory:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### Libraries Used

- openai — LLM integration
- pydub — audio processing
- dotenv — environment variable management
- numpy — numerical computing
- faiss — vector similarity search
- django-cors-headers — handling Cross-Origin Resource Sharing (CORS)

### Run Dev Server
```
cd roe
python manage.py runserver
```

Backend will start at http://127.0.0.1:8000