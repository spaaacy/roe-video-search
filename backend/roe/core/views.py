from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from openai import OpenAI
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
        video_file = request.FILES['video']
        video_id = video_file.name
        print(video_id)
        video_bytes = video_file.read()
        transcription = client.audio.transcriptions.create(
            model="whisper-1", 
            file=("video.mp4", video_bytes),
            response_format="verbose_json",
            timestamp_granularities=["segment"]
        )

        chunks = []
        for seg in transcription.segments:
            embedding = embed_text(seg.text)
            chunks.append({
                "start": seg.start,
                "end": seg.end,
                "text": seg.text,
                "embedding": embedding
            })
            
        embeddings = np.array([c["embedding"] for c in chunks])
        index = faiss.IndexFlatL2(DIMENSION)
        index.add(embeddings)
        
        video_indexes[video_id] = index
        video_chunks[video_id] = chunks

        return JsonResponse({"transcription": transcription.to_dict(), "status": "success"})
    
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
        
        query_embedding = embed_text(query)
        _, I = index.search(np.array([query_embedding]), k=1)
    
        best_chunk = chunks[I[0][0]]

        return JsonResponse({"chunk": best_chunk, "status": "success"})
    
    return JsonResponse({"message": "Invalid request", "status": "error"}, status=400)