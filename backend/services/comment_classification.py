import re
from typing import List, Dict, Any

def classify_comments(comments: List[Dict[str, Any]], sentiment_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    question_words = {"how", "what", "why", "when", "where", "who"}
    suggestion_words = {"should", "could", "try", "add", "improve", "suggest"}
    praise_words = {"amazing", "great", "love", "best", "excellent", "fantastic", "awesome", "helpful", "perfect", "wonderful"}
    complaint_words = {"bad", "terrible", "hate", "worst", "problem", "issue", "broken", "disappointed", "poor", "useless"}
    
    counts = {
        "praise": 0,
        "questions": 0,
        "complaints": 0,
        "suggestions": 0,
        "general": 0
    }
    
    classified_comments = []
    
    for i, comment_obj in enumerate(comments):
        text = str(comment_obj.get("text", "")).lower()
        # Fallback to NEUTRAL if sentiment results are shorter than comments for some reason
        sentiment = sentiment_results[i]["label"] if i < len(sentiment_results) else "NEUTRAL"
        
        words = set(re.findall(r'\b\w+\b', text))
        has_question_mark = "?" in text
        
        category = "general"
        
        if has_question_mark or bool(words.intersection(question_words)):
            category = "questions"
        elif bool(words.intersection(suggestion_words)):
            category = "suggestions"
        elif sentiment == "POSITIVE" or bool(words.intersection(praise_words)):
            category = "praise"
        elif sentiment == "NEGATIVE" or bool(words.intersection(complaint_words)):
            category = "complaints"
            
        counts[category] += 1
        
        comment_copy = comment_obj.copy()
        comment_copy["category"] = category
        comment_copy["sentiment"] = sentiment
        classified_comments.append(comment_copy)
        
    return {
        "counts": counts,
        "classified_comments": classified_comments
    }
