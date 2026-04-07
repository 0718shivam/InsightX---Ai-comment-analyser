import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any

def analyze_questions_deep(classified_comments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    # Filter question comments
    question_comments = [c for c in classified_comments if c.get("category") == "questions"]
    if not question_comments:
        return []
        
    texts = [c.get("text", "") for c in question_comments]
    
    # Clean texts slightly for better TF-IDF
    clean_texts = []
    for t in texts:
        t_clean = re.sub(r'[^a-zA-Z\s\?]', '', str(t).lower())
        clean_texts.append(t_clean)
        
    if not any(clean_texts):
        return []
        
    try:
        vectorizer = TfidfVectorizer(max_features=500, ngram_range=(1, 3))
        tfidf_matrix = vectorizer.fit_transform(clean_texts)
        cos_sim_matrix = cosine_similarity(tfidf_matrix)
    except Exception as e:
        print(f"Error in question TFIDF vectorization: {e}")
        return []

    visited = set()
    clusters = []
    
    for i in range(len(clean_texts)):
        if i in visited:
            continue
            
        cluster_indices = [i]
        visited.add(i)
        
        for j in range(i + 1, len(clean_texts)):
            if j not in visited and cos_sim_matrix[i, j] > 0.60:
                cluster_indices.append(j)
                visited.add(j)
                
        # We form a cluster
        if cluster_indices:
            # Find representative question (shortest one usually makes sense or the centroid, we'll just sort by length)
            cluster_texts = [texts[idx] for idx in cluster_indices]
            representative = sorted(cluster_texts, key=len)[0]
            
            # Variations
            variations = list(set(cluster_texts))
            if representative in variations:
                variations.remove(representative)
                
            freq = len(cluster_indices)
            
            # Categorize the cluster
            rep_lower = representative.lower()
            category = "general"
            opportunity = "Consider answering in comments"
            
            if "deploy" in rep_lower or "host" in rep_lower or "production" in rep_lower:
                category = "deployment"
                opportunity = "Follow-up video opportunity"
            elif "error" in rep_lower or "bug" in rep_lower or "fail" in rep_lower:
                category = "troubleshooting"
                opportunity = "Pin solution in comments"
                
            if freq >= 10:
                opportunity = "High-priority FAQ item"
                
            clusters.append({
                "question": representative,
                "frequency": freq,
                "examples": variations[:3],
                "category": category,
                "opportunity": opportunity
            })
            
    # Rank by frequency
    clusters = sorted(clusters, key=lambda x: x["frequency"], reverse=True)
    return clusters
