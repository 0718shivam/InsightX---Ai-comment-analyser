from typing import List, Dict, Any
try:
    from gensim import corpora, models
except Exception:
    corpora = None
    models = None

def extract_topics(tokenized_comments: List[List[str]], num_topics: int = 5) -> List[Dict[str, Any]]:
    valid_docs = [doc for doc in tokenized_comments if doc]
    if not valid_docs:
        return []
        
    if corpora is None or models is None:
        freq: Dict[str, int] = {}
        for doc in valid_docs:
            for w in doc:
                freq[w] = freq.get(w, 0) + 1
        top_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:5]
        return [{"topic_id": 1, "keywords": [w for w, _ in top_words]}]
    
    try:
        dictionary = corpora.Dictionary(valid_docs)
        dictionary.filter_extremes(no_below=2, no_above=0.8)
        if not dictionary:
            return []
        corpus = [dictionary.doc2bow(doc) for doc in valid_docs]
        lda_model = models.LdaModel(
            corpus=corpus,
            id2word=dictionary,
            num_topics=num_topics,
            random_state=42,
            passes=10
        )
        topics = []
        for i in range(num_topics):
            topic_words = lda_model.show_topic(i, topn=5)
            keywords = [word for word, prob in topic_words]
            topics.append({"topic_id": i + 1, "keywords": keywords})
        return topics
    except Exception:
        return []
