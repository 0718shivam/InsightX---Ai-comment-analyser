import re
from typing import List, Dict, Any

def analyze_content_requests(comments: List[Dict[str, Any]]) -> Dict[str, Any]:
    topics = {
        "deployment": ["deploy", "production", "aws", "heroku", "docker", "cloud"],
        "scaling": ["scale", "performance", "optimize", "speed", "load", "efficient"],
        "database": ["database", "sql", "postgres", "mongodb", "orm", "queries"],
        "testing": ["test", "pytest", "unit test", "tdd", "testing", "qa"],
        "authentication": ["auth", "login", "jwt", "oauth", "security", "session"],
        "frontend": ["react", "vue", "frontend", "ui", "interface", "design"],
        "deployment_tools": ["docker", "kubernetes", "ci/cd", "github actions"],
        "advanced_features": ["websocket", "realtime", "async", "caching", "redis"]
    }
    
    request_phrases = ["can you", "please", "would love", "next", "part 2", "tutorial on"]
    
    # Typed topic counts
    topic_counts: Dict[str, Dict[str, Any]] = {k: {"count": 0, "texts": []} for k in topics.keys()}
    
    for comment in comments:
        text = str(comment.get("text", "")).lower()
        
        # Check if it looks like a request
        is_request = any(phrase in text for phrase in request_phrases)
        if not is_request:
            continue
            
        words = set(re.findall(r'\b\w+\b', text))
        
        for topic_name, keywords in topics.items():
            if bool(words.intersection(set(keywords))):
                topic_counts[topic_name]["count"] = int(topic_counts[topic_name]["count"]) + 1
                topic_counts[topic_name]["texts"].append(str(comment.get("text", "")))
                
    result: Dict[str, Any] = {
        "high_demand": {},
        "medium_demand": {},
        "niche_demand": {}
    }
    
    for topic_name, data in topic_counts.items():
        count: int = int(data["count"])
        if count == 0:
            continue
            
        estimated_views = count * 2000
        
        # Determine demand level
        if count >= 20:
            level = "high"
            views_str = f"{estimated_views}-{estimated_views + 15000}"
            target_dict = result["high_demand"]
        elif count >= 10:
            level = "medium"
            views_str = f"{estimated_views}-{estimated_views + 10000}"
            target_dict = result["medium_demand"]
        else:
            level = "niche"
            views_str = f"{estimated_views}-{estimated_views + 5000}"
            target_dict = result["niche_demand"]
            
        # Extract small expectations from texts
        texts: List[str] = data["texts"]
        expectations = [t[:100] + "..." if len(t) > 100 else t for t in texts[:3]]
            
        target_dict[topic_name] = {
            "request_count": count,
            "demand_level": level,
            "estimated_views": views_str,
            "viewer_expectations": expectations
        }
        
    return result
