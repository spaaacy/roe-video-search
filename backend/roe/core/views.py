from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import StreamingHttpResponse
from openai import OpenAI
from pydub import AudioSegment
from io import BytesIO
from dotenv import load_dotenv
import os
import numpy as np
import faiss
import json

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)
DIMENSION = 1536 
video_indexes = {}
video_chunks = {}

def embed_text(text):
    response = client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    
    return response.data[0].embedding

@csrf_exempt
def upload_video(request):
    if request.method == "POST" and request.FILES.get('video'):
        def transcript_and_embed_video():    
            video_file = request.FILES['video']
            video_id = video_file.name

            # Upload video to OpenAI Whisper for transcription
            yield json.dumps({"status": "processing", "message": f"Transcribing {video_id}"}) + "\n"

            try:
                video_bytes = video_file.read()

                # Extract audio
                video_stream = BytesIO(video_bytes)
                audio = AudioSegment.from_file(video_stream, format="mp4")
                audio_stream = BytesIO()
                audio.export(audio_stream, format="mp3")
                audio_stream.seek(0)

                # Transcribe the audio
                transcription = client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=("audio.mp3", audio_stream.read()),
                    response_format="verbose_json",
                    timestamp_granularities=["segment"]
                )
                
            except Exception as e:
                yield json.dumps({"status": "error", "message": "Transcription failed"}) + "\n"
                return

            # Create embeddings for transcription segments
            yield json.dumps({"status": "processing", "message": "Creating embeddings"}) + "\n"

            try:
                chunks = []
                for seg in transcription.segments:
                    embedding = embed_text(seg.text)
                    chunks.append({
                        "start": seg.start,
                        "end": seg.end,
                        "text": seg.text,
                        "embedding": embedding
                    })
            except Exception as e:
                yield json.dumps({"status": "error", "message": "Embedding creation failed"}) + "\n"
                return

            # Store embeddings in vector database (FAISS)
            yield json.dumps({"status": "processing", "message": "Indexing embeddings"}) + "\n"

            try:
                embeddings = np.array([c["embedding"] for c in chunks])
                index = faiss.IndexFlatL2(DIMENSION)
                index.add(embeddings)

                video_indexes[video_id] = index
                video_chunks[video_id] = chunks
            except Exception as e:
                yield json.dumps({"status": "error", "message": "Indexing failed"}) + "\n"
                return
            
            yield json.dumps({"status": "success", "message": "Video processing complete"}) + "\n"

        return StreamingHttpResponse(transcript_and_embed_video(), content_type="application/json")

    return JsonResponse({"message": "Invalid request", "status": "error"}, status=400)

@csrf_exempt
def query_video(request):
    if request.method == "POST":
        body = json.loads(request.body)
        query = body.get('query')
        video_id = body.get("videoName")
        
        if not query or not video_id:
            return JsonResponse({"message": "query and video_id required", "status": "error"}, status=400)

        if video_id not in video_indexes:
            return JsonResponse({"message": "Video not found", "status": "error"}, status=404)

        index = video_indexes[video_id]
        chunks = video_chunks[video_id]
        
        # Fetch relevent embedding with timestamp
        query_embedding = embed_text(query)
        _, I = index.search(np.array([query_embedding]), k=1)
    
        best_chunk = chunks[I[0][0]]

        return JsonResponse({"chunk": best_chunk, "status": "success"})

@csrf_exempt
def chat_with_video(request):
    if request.method == "POST":
        body = json.loads(request.body)
        query = body.get('query')
        video_id = body.get("videoName")
        
        if not query or not video_id:
            return JsonResponse({"message": "query and video_id required", "status": "error"}, status=400)

        if video_id not in video_indexes:
            return JsonResponse({"message": "Video not found", "status": "error"}, status=404)

        index = video_indexes[video_id]
        chunks = video_chunks[video_id]
        
        # Fetch relevent embedding
        query_embedding = embed_text(query)
        I, I = index.search(np.array([query_embedding]), k=1)
    
        best_chunk = chunks[I[0][0]]

        # Pass query and context to GPT
        response = client.responses.create(
            model="gpt-4.1",
            input=f"Using this context: {best_chunk["text"]}\nAnswer this query: {query}\n"
            "Please respond with plain text only, without any formatting or decorations."
        )

        message = response.output[0].content[0].text
        
        return JsonResponse({"message": message, "status": "success"})
    
    return JsonResponse({"message": "Invalid request", "status": "error"}, status=400)