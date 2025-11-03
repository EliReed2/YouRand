from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import requests
import random
import os
from dotenv import load_dotenv
from .models import ExtensionUser
from .utils import weighted_tag_selector_smooth
from .utils import format_views_short
from django.utils import timezone

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
    
    #Save UID from payloafd
    uid = payload.get('uid')
    if (not uid):
            return JsonResponse({"status": "error", "message": "No uid provided"}, status=400)

    #Logging Statement
    print(f"Video id: {video_id} requested by user: {uid}")
    #Check API key
    if not YOUTUBE_API_KEY:
        return JsonResponse({"status": "error", "message": "YouTube API key not configured"}, status=500)
    
    #Base Youtube API URL
    YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/videos"
    YOUTUBE_API_CHANNEL_URL = "https://www.googleapis.com/youtube/v3/channels"
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

    #Create new ExtensionUser if one is not linked to this uid
    user, created = ExtensionUser.objects.get_or_create(uid=uid)

    if created:
        print(f"Created new ExtensionUser for uid: {uid}")
    else:
        print(f"Found existing ExtensionUser for uid: {uid}")

    if not created:
        #Increment usage count for existing user
        user.usage_count += 1
    
    #Update last active timestamp
    user.last_active = timezone.now()
    
    #Parse out and save needed video info
    video_info = video_data.get("items", [{}])[0].get("snippet", {})
    channel_title = video_info.get("channelTitle", "Unknown Channel")
    video_title = video_info.get("title", "Untitled Video")
    published_at = video_info.get("publishedAt", "Unknown Date")
    all_tags = video_info.get("tags", [])
    tags = random.sample(all_tags, min(len(all_tags), 3))
    likes = video_data['items'][0]['statistics'].get('likeCount', '0')
    views = video_data['items'][0]['statistics'].get('viewCount', '0')
    thumbnail = video_info.get("thumbnails", {}).get("medium", {}).get("url", "")
    channel_id = video_info.get("channelId", "")


    #Append Channel name to saved_channels list if not already present
    if channel_title not in user.saved_channels:
        user.saved_channels.append(channel_title)
    
    #Either add entry to category_likes or increment existing entry
    for tag in tags:
        if tag in user.category_likes:
            user.category_likes[tag] += 1
        else:
            user.category_likes[tag] = 1

    #Make final call to youtube API for channel request to get channel image
    channel_params = {
        "part": "snippet",
        "id": channel_id,
        "key": YOUTUBE_API_KEY
    }
    try:
        #Try to call youtube data API
        response = requests.get(YOUTUBE_API_CHANNEL_URL, params=channel_params, timeout=10)
        response.raise_for_status()
        channel_data = response.json()
    except requests.HTTPError as e:
        return JsonResponse({"status": "error", "message": "YouTube API error", "detail": str(e), "response": getattr(e.response, 'text', None)}, status=502)
    except Exception as e:
        return JsonResponse({"status": "error", "message": "Request failed", "detail": str(e)}, status=502)

    #Parse out channel small thumbnail image
    channel_info = channel_data.get("items", [{}])[0].get("snippet", {})
    channel_thumbnail = channel_info.get("thumbnails", {}).get("default", {}).get("url", "")

    #Dict to add to saved to savedVideos list in ExtensionUser model
    video_details = {
        "video_id": video_id,
        "video_title": video_title,
        "channel_title": channel_title,
        "published_at": published_at,
        "tags": tags,
        "likes": likes,
        "views": views,
        "thumbnail": thumbnail,
        "channel_thumbnail": channel_thumbnail,
    }

    #Append video details to saved_videos list
    user.saved_videos.append(video_details)

    #Save changes to user model
    user.save()

    print("End reached")
    return JsonResponse({"status": "ok"})


#Request that selects a random video using algorithm for user using UID and sends back video info
@csrf_exempt
def get_video_recommendation(request):
    if request.method != 'POST':
        return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)

    #Parse JSON body of post request
    try:
        # Parse JSON body
        body_unicode = request.body.decode('utf-8')
        body_data = json.loads(body_unicode)

        # Extract uid & search method & tags if any exist
        uid = body_data.get('uid')
        tags = body_data.get('tags', [])
        isSingleTagSearch = body_data.get('isSingleTagSearch')
        print(f"Received tags: {tags}")

    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
    if not uid:
        return JsonResponse({"status": "error", "message": "No uid provided"}, status=400)

    #Logging Statement
    print(f"Video recommendation requested by user: {uid} with tags: {tags}")

    # Get or fallback user
    try:
        user = ExtensionUser.objects.get(uid=uid)
    except ExtensionUser.DoesNotExist:
        user = None

    if not user or not user.category_likes:
        #If no user exists default to trending
        search_tags = ["trending"]
    elif tags:
        #If users specified tags, use given tags to parse out matching tag names from category likes tag keys
        tags = {tag: user.category_likes[tag] for tag in tags if tag in user.category_likes}
        print(f"Filtered tags: {tags}")
        #Use search method to determine which tags should be used to search
        if (not isSingleTagSearch):
            #If user wants multipleTagSearch, seperate tags by a space and set search tags
            search_tags = tags.keys()
        else:
            #Otherwise user wants single tag search so run filtered tags through weighted random selector
            found_tag = weighted_tag_selector_smooth(tags)
            search_tags = [found_tag]

    else:
        #No tags specified, use weighted random selection based on user category likes
        category_likes = user.category_likes
        found_tag = weighted_tag_selector_smooth(category_likes)
        search_tags = [found_tag]

    #Log search tags
    print(f"Search Tags: {search_tags}")
    #Youtube API search parameters to find videos matching selected tag

    #Randomly choose a medium or long duration video to filter out youtube shorts
    video_duration = random.choice(["medium", "long"])
    search_params = {
        "part": "snippet",
        "q": search_tags,
        "type": "video",
        "videoDuration": video_duration,
        "maxResults": 50,
        "order": "relevance",
        "key": YOUTUBE_API_KEY,
    }

    YOUTUBE_API_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
    YOUTUBE_API_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"
    YOUTUBE_API_CHANNEL_URL = "https://www.googleapis.com/youtube/v3/channels"
    try:
        response = requests.get(YOUTUBE_API_SEARCH_URL, params=search_params, timeout=10)
        response.raise_for_status()
        videos = response.json()
    except Exception as e:
        return JsonResponse({"status": "error", "message": "YouTube API search failed", "detail": str(e)}, status=502)

    items = videos.get("items", [])
    if not items:
        return JsonResponse({"status": "error", "message": "No videos found"}, status=404)

    random_video = random.choice(items)
    snippet = random_video.get("snippet", {})
    video_id = random_video["id"]["videoId"]

    #Youtube API params to pull extra video details from API for frontend use
    video_params = {
        "part": "statistics,snippet",
        "id": video_id,
        "key": YOUTUBE_API_KEY,
    }
    try:
        v_response = requests.get(YOUTUBE_API_VIDEOS_URL, params=video_params, timeout=10)
        v_response.raise_for_status()
        video_data = v_response.json()
        video_item = video_data.get("items", [{}])[0]
    except Exception as e:
        return JsonResponse({"status": "error", "message": "YouTube API video details failed", "detail": str(e)}, status=502)

    statistics = video_item.get("statistics", {})
    snippet = video_item.get("snippet", {})

    video_title = snippet.get("title", "Untitled")
    channel_title = snippet.get("channelTitle", "Unknown Channel")
    published_at = snippet.get("publishedAt", "Unknown Date")
    thumbnail = snippet.get("thumbnails", {}).get("medium", {}).get("url", "")
    tags = snippet.get("tags", [])
    likes = statistics.get("likeCount", "0")
    views_raw = statistics.get("viewCount", "0")
    ##Use util function to covert to youtube view format
    views = format_views_short(views_raw)
    channel_id = snippet.get("channelId", "")

    # Youtube API params to pull channel thumbnail from API for frontend use
    channel_params = {
        "part": "snippet, statistics",
        "id": channel_id,
        "key": YOUTUBE_API_KEY,
    }
    try:
        c_response = requests.get(YOUTUBE_API_CHANNEL_URL, params=channel_params, timeout=10)
        c_response.raise_for_status()
        channel_data = c_response.json()
        channel_item = channel_data.get("items", [{}])[0]
        channel_info = channel_item.get("snippet", {})
        channel_thumbnail = channel_info.get("thumbnails", {}).get("default", {}).get("url", "")
        channel_subs_raw = channel_item.get("statistics", {}).get("subscriberCount", "0")
        channel_subs = f"{int(channel_subs_raw):,}"
    except Exception:
        channel_thumbnail = ""

    #Structure data to send back to frontend
    #Structure search tags as an array of strings
    video_details = {
        #Selected tag used for search
        "response_tags": search_tags,
        "video_link": f"https://www.youtube.com/watch?v={video_id}",
        "video_id": video_id,
        "video_title": video_title,
        "channel_title": channel_title,
        "published_at": published_at,
        "tags": tags,
        "likes": likes,
        "views": views,
        "thumbnail": thumbnail,
        "channel_thumbnail": channel_thumbnail,
        "channel_subs": channel_subs,
    }

    return JsonResponse({"status": "ok", "video_details": video_details})

#Request that uses a UID from header to send back the user tags map
@csrf_exempt
def get_user_tags(request):
    if request.method == "GET":
        uid = request.GET.get("uid")
        if not uid:
            return JsonResponse({"status": "error", "message": "No uid provided"}, status=400)

        # Get or fallback user
        try:
            user = ExtensionUser.objects.get(uid=uid)
        except ExtensionUser.DoesNotExist:
            user = None

        if not user:
            return JsonResponse({"status": "error", "message": "User not found"}, status=404)

        #Get user tags map
        tags_data = user.category_likes

        # Sort category_likes by values in descending order before sending to frontend
        tags_data = dict(sorted(tags_data.items(), key=lambda item: item[1], reverse=True))

        #Convert tag map to an array of just the keys for frontend display
        tags_data = list(tags_data.keys())

        return JsonResponse({"status": "ok", "user_tags": tags_data})


#Request that uses a UID and video id from header to check if a video is already saved or not
@csrf_exempt
def check_video_status(request):
    if request.method == "POST":
        #Pull info from post request
        try:
            # Parse JSON body
            body_unicode = request.body.decode('utf-8')
            body_data = json.loads(body_unicode)
            
            uid = body_data.get("uid")
            video_id = body_data.get("video_id")
            
            print(f'Received video id {video_id} from user {uid}')
            
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
        if not uid:
            return JsonResponse({"status": "error", "message": "No uid provided"}, status=400)

        if not video_id:
            return JsonResponse({"status": "error", "message": "No video id provided"}, status=400)

        # Get user
        try:
            user = ExtensionUser.objects.get(uid=uid)
        except ExtensionUser.DoesNotExist:
            user = None

        if not user:
            #If no user, video could not have been saved
            return JsonResponse({"status": "ok", "video_saved": False}, status=200)
        
        #Pull saved videos from database
        saved_videos = user.saved_videos

        #Check if video_id exists in any of the saved video dictionaries
        video_saved = any(
            video.get('video_id') == video_id 
            for video in saved_videos
        ) if saved_videos else False

        #Return result
        return JsonResponse({"status": "ok", "video_saved": video_saved}, status=200)


#Request deletes a saved video using given uid and video id, clears traces from saved_videos and category_likes
@csrf_exempt
def delete_saved_video(request):
    if request.method == "DELETE":
        #Pull info from delete request
        try:
            # Parse JSON body
            body_unicode = request.body.decode('utf-8')
            body_data = json.loads(body_unicode)
            
            uid = body_data.get("uid")
            video_id = body_data.get("video_id")
            
            print(f'Received video delete request for video {video_id} from user {uid}')

        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
        #Ensure data arrived correctly
        if not uid:
            return JsonResponse({"status": "error", "message": "No uid provided"}, status=400)

        if not video_id:
            return JsonResponse({"status": "error", "message": "No video id provided"}, status=400)

        #Find user with given uid
        try:
            user = ExtensionUser.objects.get(uid=uid)
        except ExtensionUser.DoesNotExist:
            user = None

        if not user:
            #If no user, video something is wrong with uid
            return JsonResponse({"status": "error", "message": "No user with this uid"}, status=404)

        #Find video to delete in saved videos
        video_to_delete = None
        for video in user.saved_videos:
            if video.get('video_id') == video_id:
                video_to_delete = video
                break
        
        #Return an error if no video was found
        if not video_to_delete:
            return JsonResponse({"status": "error", "message": "Video not found in saved videos"}, status=404)

        #Find the videos tags
        tags = video_to_delete.get('tags', [])

        #Decrement these tags from category likes
        for tag in tags:
            if tag in user.category_likes:
                user.category_likes[tag] -= 1
                #Remove tag if count has reached 0
                if user.category_likes[tag] <= 0:
                    del user.category_likes[tag]
        
        #Remove video from saved_videos
        user.saved_videos.remove(video_to_delete)

        #Save changes 
        user.save()

        #Report success in json
        return JsonResponse({"status": "ok", "message": "Video deleted"}, status=200)
