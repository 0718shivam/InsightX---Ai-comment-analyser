from typing import Dict, Any, List

def generate_action_items(complaints_data: Dict[str, Any], content_demand_data: Dict[str, Any]) -> Dict[str, Any]:
    urgent = []
    next_video_ideas = []
    content_improvements = []
    
    # Urgent and Improvements from complaints
    for issue, details in complaints_data.items():
        count = details.get("count", 0)
        if count >= 15:
            urgent.append({
                "action": details.get("solution", ""),
                "impact": f"Solves {count} complaints",
                "effort": "5-15 minutes",
                "priority": "high",
                "expected_result": details.get("estimated_impact", "")
            })
        elif count >= 3:
            content_improvements.append({
                "suggestion": details.get("solution", ""),
                "context": f"Mentioned by {count} viewers"
            })
            
    # Next Video Ideas from High Demand
    if "high_demand" in content_demand_data:
        for topic, details in content_demand_data["high_demand"].items():
            topic_formatted = topic.replace("_", " ").title()
            next_video_ideas.append({
                "topic": topic_formatted,
                "demand": f"{details.get('request_count', 0)} explicit requests",
                "estimated_views": details.get("estimated_views", "Unknown"),
                "audience_profile": "70% intermediate+",
                "suggested_structure": details.get("viewer_expectations", [])
            })
            
    # Add a fallback sorting to urgent
    urgent = sorted(urgent, key=lambda x: int(x["impact"].split()[1]), reverse=True)
            
    return {
        "urgent": urgent,
        "next_video_ideas": next_video_ideas,
        "content_improvements": content_improvements
    }
