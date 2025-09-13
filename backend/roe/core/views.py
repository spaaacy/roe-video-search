from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def upload_video(request):
    if request.method == "POST" and request.FILES.get('video'):
        video_file = request.FILES['video']
        print(f"Uploaded file name: {video_file.name}")
        print(f"Uploaded file size: {video_file.size} bytes")
        return JsonResponse({"message": "Video uploaded successfully", "status": "success"})
    return JsonResponse({"message": "Invalid request", "status": "error"}, status=400)