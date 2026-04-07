from typing import List, Dict, Any
try:
    from transformers import pipeline
    import torch
    device = 0 if torch.cuda.is_available() else -1
    sentiment_pipeline = pipeline(
        "sentiment-analysis",
        model="distilbert-base-uncased-finetuned-sst-2-english",
        device=device
    )
except Exception:
    sentiment_pipeline = None

def analyze_sentiment_batch(comments: List[str]) -> Dict[str, Any]:
    if not comments:
        return {
            "positive_percent": 0.0,
            "neutral_percent": 0.0,
            "negative_percent": 0.0,
            "positive_count": 0,
            "neutral_count": 0,
            "negative_count": 0,
            "results": []
        }
        
    positive_count = 0
    neutral_count = 0
    negative_count = 0
    
    batch_size = 32
    detailed_results = []
    
    for i in range(0, len(comments), batch_size):
        batch = comments[i:i + batch_size]
        valid_batch = [c if c.strip() else "empty comment" for c in batch]
        
        if sentiment_pipeline is None:
            pos_words = {"amazing", "great", "love", "best", "excellent", "fantastic", "awesome", "helpful", "perfect", "wonderful", "nice", "good"}
            neg_words = {"bad", "terrible", "hate", "worst", "problem", "issue", "broken", "disappointed", "poor", "useless", "bug", "slow"}
            chunk_results = []
            for text in valid_batch:
                t = str(text).lower()
                pos_hits = sum(1 for w in pos_words if w in t)
                neg_hits = sum(1 for w in neg_words if w in t)
                if pos_hits > neg_hits and pos_hits > 0:
                    chunk_results.append({"label": "POSITIVE", "score": 0.9})
                elif neg_hits > pos_hits and neg_hits > 0:
                    chunk_results.append({"label": "NEGATIVE", "score": 0.9})
                else:
                    chunk_results.append({"label": "NEUTRAL", "score": 0.5})
        else:
            chunk_results = sentiment_pipeline(valid_batch)
        
        for res in chunk_results:
            label = res['label']
            score = res['score']
            
            final_sentiment = "NEUTRAL"
            if label == "POSITIVE" and score > 0.8:
                final_sentiment = "POSITIVE"
                positive_count += 1
            elif label == "NEGATIVE" and score > 0.8:
                final_sentiment = "NEGATIVE"
                negative_count += 1
            else:
                neutral_count += 1
                
            detailed_results.append({
                "label": final_sentiment,
                "confidence": score,
                "original_label": label
            })
            
    total = len(comments)
    return {
        "positive_percent": round((positive_count / total) * 100, 2),
        "neutral_percent": round((neutral_count / total) * 100, 2),
        "negative_percent": round((negative_count / total) * 100, 2),
        "positive_count": positive_count,
        "neutral_count": neutral_count,
        "negative_count": negative_count,
        "results": detailed_results
    }
