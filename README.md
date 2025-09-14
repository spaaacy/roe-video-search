# ROE AI Video Search

A full-stack project with a **Next.js frontend** and a **Django backend**.The app enables uploading videos, querying video content, and chatting with video insights.

## Explanation

The backend uses three different endpoints: `upload_video, query_video, chat_with_video` to handle tasks. `upload_video` extracts the audio (for faster processing), generates a transcript with timestamps (using OpenAI Whisper), and creates embeddings for each segment, storing it in a FAISS vector database. `query_video` takes in the user's query and returns the best relevant timestamp using the embeddings. `chat_with_video` functions similarly, passing the user's query with the context from the relevant transcript segment to GPT and returns a message.

## Demo

[Watch the demo](https://youtu.be/4ibkfAuTb1A)

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

### Run Dev Server
```
npm run dev
```

Frontend will start at http://localhost:3000

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