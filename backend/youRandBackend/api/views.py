from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Save Youtube Api key as global variuable
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# Simple request that receives video ID of a youtube video from frontend
@csrf_exempt
def recieveVideoId(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            video_id = data.get('video_id', 'No video_id received')
            print (f"Received video_id: {video_id}")

            ##Inform frontend that message has been receieved
            return JsonResponse({"status": "success", "echo": video_id})
        except json.JSONDecodeError:
            ##Catch Exception if JSON is invalid
            return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
    else:
        return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)


#Request that receives video ID and fetches the corresponding video from the Youtube API
@csrf_exempt
def fetch_video_info(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)
    # Get payload from request body
    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)

    #Save video ID from payload
    video_id = payload.get('video_id')
    if (not video_id):
            return JsonResponse({"status": "error", "message": "No video_id provided"}, status=400)
    
    #Check API key
    if not YOUTUBE_API_KEY:
        return JsonResponse({"status": "error", "message": "YouTube API key not configured"}, status=500)
    
    #Bse Youtube API URL
    YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/videos"
    #additional parameters for API request
    params = {
        "part": "snippet,contentDetails,statistics",
        "id": video_id,
        "key": YOUTUBE_API_KEY
    }

    try:
        #Try to call youtube data API
        response = requests.get(YOUTUBE_API_URL, params=params, timeout=10)
        response.raise_for_status()
        video_data = response.json()
    except requests.HTTPError as e:
        return JsonResponse({"status": "error", "message": "YouTube API error", "detail": str(e), "response": getattr(e.response, 'text', None)}, status=502)
    except Exception as e:
        return JsonResponse({"status": "error", "message": "Request failed", "detail": str(e)}, status=502)

    return JsonResponse({"status": "ok", "youtube": video_data})