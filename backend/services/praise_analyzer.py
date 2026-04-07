import re
from typing import List, Dict, Any

def analyze_praise_details(classified_comments: List[Dict[str, Any]]) -> Dict[str, Any]:
    categories = {
        "teaching_quality": ["explain", "clear", "understand", "learn", "teach", "instructor", "presentation"],
        "code_quality": ["code", "works", "practical", "real", "example", "implementation", "functional"],
        "beginner_friendly": ["beginner", "easy", "simple", "start", "first", "newbie", "basics"],
        "pacing": ["pace", "speed", "follow", "slow", "fast", "timing"],
        "content_structure": ["organized", "structured", "flow", "chapters", "sections"]
    }
    
    results = {
        k: {"count": 0, "examples": []} for k in categories.keys()
    }
    
    praise_comments = [c for c in classified_comments if c.get("category") == "praise" or c.get("sentiment") == "POSITIVE"]
    
    for comment in praise_comments:
        text = str(comment.get("text", "")).lower()
        words = set(re.findall(r'\b\w+\b', text))
        
        for cat, keywords in categories.items():
            if bool(words.intersection(set(keywords))):
                results[cat]["count"] += 1
                # Save top 3 examples max
                if len(results[cat]["examples"]) < 3:
                    results[cat]["examples"].append(comment.get("text", ""))
                    
    return results
