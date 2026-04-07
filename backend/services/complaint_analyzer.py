import re
from typing import List, Dict, Any

def analyze_complaints_details(classified_comments: List[Dict[str, Any]]) -> Dict[str, Any]:
    issues = {
        "missing_timestamps": {
            "keywords": ["timestamp", "chapter", "skip", "find", "navigate", "section"],
            "solution": "Add YouTube chapters",
            "estimated_impact": "+15% watch time"
        },
        "no_deployment_guide": {
            "keywords": ["deploy", "production", "host", "aws", "heroku", "server"],
            "solution": "Create follow-up video on deployment",
            "estimated_impact": "Next video opportunity"
        },
        "audio_quality": {
            "keywords": ["audio", "sound", "hear", "volume", "quality", "microphone", "noise"],
            "solution": "Check audio at mentioned timestamps",
            "estimated_impact": "Better viewer experience"
        },
        "missing_resources": {
            "keywords": ["link", "github", "code", "repository", "download", "resource"],
            "solution": "Pin comment with resources or update description",
            "estimated_impact": "Immediate satisfaction"
        },
        "code_errors": {
            "keywords": ["error", "bug", "doesn't work", "broken", "fail", "crash"],
            "solution": "Pin solution or create troubleshooting section",
            "estimated_impact": "Help struggling viewers"
        }
    }
    
    results = {}
    for k, v in issues.items():
        results[k] = {
            "count": 0,
            "severity": "low",
            "examples": [],
            "solution": v["solution"],
            "estimated_impact": v["estimated_impact"]
        }
        
    complaint_comments = [c for c in classified_comments if c.get("category") == "complaints" or c.get("sentiment") == "NEGATIVE"]
    
    for comment in complaint_comments:
        text = str(comment.get("text", "")).lower()
        words = set(re.findall(r'\b\w+\b', text))
        
        for k, v in issues.items():
            if bool(words.intersection(set(v["keywords"]))):
                results[k]["count"] += 1
                if len(results[k]["examples"]) < 3:
                    results[k]["examples"].append({
                        "text": comment.get("text", ""),
                        "likes": comment.get("likes", 0)
                    })
                    
    # Calculate severity ranges (approximate for demo purposes)
    for k, v in list(results.items()):
        count = v["count"]
        if count == 0:
            # We can optionally remove empty ones so they don't clutter the response
            del results[k]
        else:
            if count >= 10:
                v["severity"] = "high"
            elif count >= 3:
                v["severity"] = "medium"
                
    return results
