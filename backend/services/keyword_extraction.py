from typing import List, Dict, Any
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
except Exception:
    TfidfVectorizer = None

def extract_keywords(comments: List[str], top_n: int = 10) -> List[Dict[str, Any]]:
    valid_comments = [c for c in comments if c and str(c).strip()]
    if not valid_comments:
        return []
        
    try:
        if TfidfVectorizer is None:
            freq: Dict[str, int] = {}
            for doc in valid_comments:
                for w in str(doc).split():
                    freq[w] = freq.get(w, 0) + 1
            words_freq = sorted(freq.items(), key=lambda x: x[1], reverse=True)
            max_score = words_freq[0][1] if words_freq else 0
            return [{"keyword": w, "score": round((c / max_score) * 100, 1) if max_score > 0 else 0} for w, c in words_freq[:top_n]]
        else:
            vectorizer = TfidfVectorizer(max_features=100, ngram_range=(1, 2))
            tfidf_matrix = vectorizer.fit_transform(valid_comments)
            sum_words = tfidf_matrix.sum(axis=0)
            words_freq = [(word, sum_words[0, idx]) for word, idx in vectorizer.vocabulary_.items()]
            words_freq = sorted(words_freq, key=lambda x: x[1], reverse=True)
            if not words_freq:
                return []
            max_score = words_freq[0][1]
            results = []
            for word, score in words_freq[:top_n]:
                normalized_score = round((score / max_score) * 100, 1) if max_score > 0 else 0
                results.append({"keyword": word, "score": normalized_score})
            return results
    except Exception as e:
        print(f"Error extracting keywords: {e}")
        return []
