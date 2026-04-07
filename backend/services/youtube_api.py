import httpx
from typing import Dict, Any, List

from config import YOUTUBE_API_KEY

YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"


def _fmt_number(n: int) -> str:
    """Format large numbers: 1200000 → '1.2M', 45000 → '45K'"""
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n / 1_000:.1f}K"
    return str(n)


async def fetch_video_metadata(video_id: str) -> Dict[str, Any]:
    url = f"{YOUTUBE_API_BASE}/videos"
    params = {
        "part": "snippet,statistics",
        "id": video_id,
        "key": YOUTUBE_API_KEY,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, params=params)

    if response.status_code != 200:
        raise Exception(f"YouTube API Error: {response.text}")

    data = response.json()
    if not data.get("items"):
        raise Exception("Video not found")

    item = data["items"][0]
    snippet = item["snippet"]
    stats = item.get("statistics", {})

    view_count = int(stats.get("viewCount", 0))
    like_count = int(stats.get("likeCount", 0))
    comment_count = int(stats.get("commentCount", 0))
    channel_id = snippet.get("channelId", "")

    # Fetch subscriber count
    subscriber_count: Any = None
    subscriber_display: str = ""
    if channel_id:
        try:
            ch_url = f"{YOUTUBE_API_BASE}/channels"
            ch_params = {"part": "statistics", "id": channel_id, "key": YOUTUBE_API_KEY}
            async with httpx.AsyncClient(timeout=10.0) as client:
                ch_resp = await client.get(ch_url, params=ch_params)
            if ch_resp.status_code == 200:
                ch_data = ch_resp.json()
                if ch_data.get("items"):
                    raw_subs = int(ch_data["items"][0]["statistics"].get("subscriberCount", 0))
                    subscriber_count = raw_subs
                    subscriber_display = _fmt_number(raw_subs) + " subscribers"
        except Exception:
            pass

    # Description, tags, language (used by the video summarizer)
    description = snippet.get("description", "") or ""
    tags = snippet.get("tags", []) or []
    default_language = snippet.get("defaultLanguage", "") or ""
    default_audio_language = snippet.get("defaultAudioLanguage", "") or ""
    category_id = snippet.get("categoryId", "") or ""

    return {
        "title": snippet["title"],
        "channelTitle": snippet["channelTitle"],
        "channelId": channel_id,
        "description": description,
        "tags": tags,
        "categoryId": category_id,
        "defaultLanguage": default_language,
        "defaultAudioLanguage": default_audio_language,
        "viewCount": view_count,
        "viewCountDisplay": _fmt_number(view_count),
        "likeCount": like_count,
        "commentCount": comment_count,
        "commentCountDisplay": _fmt_number(comment_count),
        "subscriberCount": subscriber_count,
        "subscriberDisplay": subscriber_display,
        "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url", ""),
    }


async def fetch_comments(video_id: str, max_results: int = 500) -> List[Dict[str, Any]]:
    url = f"{YOUTUBE_API_BASE}/commentThreads"
    comments = []
    next_page_token = None

    async with httpx.AsyncClient(timeout=20.0) as client:
        while len(comments) < max_results:
            params = {
                "part": "snippet",
                "videoId": video_id,
                "maxResults": min(100, max_results - len(comments)),
                "textFormat": "plainText",
                "order": "relevance",
                "key": YOUTUBE_API_KEY,
            }
            if next_page_token:
                params["pageToken"] = next_page_token

            response = await client.get(url, params=params)
            if response.status_code != 200:
                break

            data = response.json()
            for item in data.get("items", []):
                cs = item["snippet"]["topLevelComment"]["snippet"]
                thread_snippet = item.get("snippet", {})
                text = cs.get("textDisplay", "").strip()
                if text:
                    comments.append({
                        "text": text,
                        "author": cs.get("authorDisplayName", ""),
                        "likes": int(cs.get("likeCount", 0)),
                        "replies": int(thread_snippet.get("totalReplyCount", 0)),
                        "published_at": cs.get("publishedAt", ""),
                    })
                if len(comments) >= max_results:
                    break

            next_page_token = data.get("nextPageToken")
            if not next_page_token:
                break

    return comments
