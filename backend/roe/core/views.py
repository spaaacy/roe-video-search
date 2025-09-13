from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

@csrf_exempt
def upload_video(request):
    if request.method == "POST" and request.FILES.get('video'):
        video_file = request.FILES['video']

        OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

        video_bytes = video_file.read()
        client = OpenAI(api_key=OPENAI_API_KEY)
        transcription = client.audio.transcriptions.create(
            model="whisper-1", 
            file=("video.mp4", video_bytes),
            response_format="verbose_json",
            timestamp_granularities=["segment"]
        )

        return JsonResponse({"transcription": transcription.to_dict(), "status": "success"})
    
    return JsonResponse({"message": "Invalid request", "status": "error"}, status=400)