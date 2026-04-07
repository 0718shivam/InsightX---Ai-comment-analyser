from typing import Dict, Any, List

from services.youtube_api import fetch_video_metadata, fetch_comments
from services.pure_nlp import (
    analyze_sentiment_basic,
    extract_keywords_basic,
    extract_common_phrases,
    classify_and_extract_breakdown,
    detect_discussion_themes,
    detect_emotion_mix,
    detect_audience_intent,
    detect_content_gaps,
    generate_creator_actions,
    generate_ai_headline,
    build_executive_summary,
    build_audience_reaction,
    get_most_liked_comments,
)
from services.content_demand import analyze_content_requests


async def analyze_video_for_creator(video_id: str, comment_limit: int = 500) -> Dict[str, Any]:
    # 1. Fetch Metadata
    metadata = await fetch_video_metadata(video_id)

    # 2. Fetch Comments (raw, with likes)
    raw_comments = await fetch_comments(video_id, max_results=comment_limit)
    if not raw_comments:
        raise Exception("No comments found or API quota exceeded")

    comments_text: List[str] = [str(c.get("text", "")) for c in raw_comments]

    # ── SENTIMENT ──────────────────────────────────────────────────────────────
    sentiment_labels: List[str] = []
    pos_count = neu_count = neg_count = 0
    for txt in comments_text:
        s = analyze_sentiment_basic(txt)
        sentiment_labels.append(s)
        if s == "positive":
            pos_count += 1
        elif s == "negative":
            neg_count += 1
        else:
            neu_count += 1

    total = len(comments_text)
    pos_pct = int(round(pos_count / total * 100)) if total else 0
    neu_pct = int(round(neu_count / total * 100)) if total else 0
    neg_pct = int(round(neg_count / total * 100)) if total else 0

    sentiment_result = {
        "positive_percent": pos_pct,
        "neutral_percent": neu_pct,
        "negative_percent": neg_pct,
        "positive_count": pos_count,
        "neutral_count": neu_count,
        "negative_count": neg_count,
        "results": [],
    }

    # Attach sentiment label back to each raw comment for downstream ranking
    for i, comment in enumerate(raw_comments):
        comment["sentiment"] = sentiment_labels[i] if i < len(sentiment_labels) else "neutral"

    # Sentiment variation across sequential comment batches (not time-series)
    sentiment_batches: List[Dict[str, Any]] = []
    batch_count = 7 if total >= 7 else max(1, total)
    batch_size = max(1, (total + batch_count - 1) // batch_count)
    for i in range(batch_count):
        start = i * batch_size
        end = min(total, start + batch_size)
        labels = sentiment_labels[start:end]
        if not labels:
            continue
        b_total = len(labels)
        b_pos = sum(1 for s in labels if s == "positive")
        b_neu = sum(1 for s in labels if s == "neutral")
        b_neg = sum(1 for s in labels if s == "negative")
        sentiment_batches.append({
            "batch": f"B{i + 1}",
            "positive": int(round((b_pos / b_total) * 100)),
            "neutral": int(round((b_neu / b_total) * 100)),
            "negative": int(round((b_neg / b_total) * 100)),
        })

    # ── KEYWORDS ───────────────────────────────────────────────────────────────
    keywords = extract_keywords_basic(comments_text, top_n=15)

    # ── COMMON PHRASES ─────────────────────────────────────────────────────────
    common_phrases = extract_common_phrases(comments_text, top_n=8)

    # ── CATEGORIZATION (with real comment lists) ───────────────────────────────
    class_data = classify_and_extract_breakdown(comments_text)
    categories_counts: Dict[str, int] = class_data["counts"]
    praise_breakdown = class_data["praise_breakdown"]
    complaints_breakdown = class_data["complaints_breakdown"]
    top_questions = class_data["top_questions"]

    praise_comments: List[str] = class_data.get("praise_comments", [])
    concern_comments: List[str] = class_data.get("concern_comments", [])
    question_comments: List[str] = class_data.get("question_comments", [])

    # ── ADVANCED NLP LAYERS ────────────────────────────────────────────────────
    discussion_themes = detect_discussion_themes(comments_text, keywords)
    emotion_mix = detect_emotion_mix(comments_text)
    audience_intent = detect_audience_intent(categories_counts)
    content_gaps = detect_content_gaps(question_comments, concern_comments)

    creator_actions = generate_creator_actions(
        categories_counts, content_gaps, question_comments, concern_comments, keywords
    )

    ai_headline = generate_ai_headline(
        pos_pct, neg_pct, categories_counts, keywords,
        question_comments, concern_comments, praise_comments,
    )

    # ── EXECUTIVE SUMMARY (3 paras) ───────────────────────────────────────────
    executive_summary_paras = build_executive_summary(
        total, pos_pct, neg_pct, categories_counts, keywords,
        question_comments, concern_comments, praise_comments,
    )

    # ── AUDIENCE REACTION (1-2 sentences, no keywords listed) ─────────────────
    audience_reaction = build_audience_reaction(
        pos_pct, neg_pct, categories_counts, keywords,
        question_comments, concern_comments,
    )

    # ── MOST LIKED COMMENTS ────────────────────────────────────────────────────
    praise_set = set(praise_comments)
    question_set = set(question_comments)
    concern_set = set(concern_comments)
    most_liked_comments = get_most_liked_comments(
        raw_comments, praise_set, question_set, concern_set, top_n=5
    )

    # ── TOP COMMENTS BY REPLIES / SENTIMENT ───────────────────────────────────
    top_replied_comments = sorted(
        raw_comments, key=lambda c: int(c.get("replies", 0)), reverse=True
    )[:5]

    top_positive_comments = [
        c for c in sorted(raw_comments, key=lambda x: int(x.get("likes", 0)), reverse=True)
        if c.get("sentiment") == "positive"
    ][:5]

    top_negative_comments = [
        c for c in sorted(raw_comments, key=lambda x: int(x.get("likes", 0)), reverse=True)
        if c.get("sentiment") == "negative"
    ][:5]

    # ── ENGAGEMENT DISTRIBUTIONS (real comment-level buckets) ─────────────────
    like_ranges = [
        ("0-10", 0, 10),
        ("10-50", 11, 50),
        ("50-100", 51, 100),
        ("100+", 101, None),
    ]
    reply_ranges = [
        ("0", 0, 0),
        ("1-2", 1, 2),
        ("3-5", 3, 5),
        ("6+", 6, None),
    ]

    likes_distribution: List[Dict[str, Any]] = []
    replies_distribution: List[Dict[str, Any]] = []

    for label, low, high in like_ranges:
        if high is None:
            count = sum(1 for c in raw_comments if int(c.get("likes", 0)) >= low)
        else:
            count = sum(1 for c in raw_comments if low <= int(c.get("likes", 0)) <= high)
        likes_distribution.append({"range": label, "count": count})

    for label, low, high in reply_ranges:
        if high is None:
            count = sum(1 for c in raw_comments if int(c.get("replies", 0)) >= low)
        else:
            count = sum(1 for c in raw_comments if low <= int(c.get("replies", 0)) <= high)
        replies_distribution.append({"range": label, "count": count})

    # ── THEME SENTIMENT (positive % per theme from matching comments) ─────────
    themed_discussion: List[Dict[str, Any]] = []
    for theme in discussion_themes:
        kws = [k.lower() for k in theme.get("keywords", []) if isinstance(k, str)]
        matching_labels: List[str] = []
        for idx, txt in enumerate(comments_text):
            lower_txt = txt.lower()
            if any(kw in lower_txt for kw in kws):
                if idx < len(sentiment_labels):
                    matching_labels.append(sentiment_labels[idx])

        match_total = len(matching_labels)
        positive_matches = sum(1 for s in matching_labels if s == "positive")
        positive_percent = int(round((positive_matches / match_total) * 100)) if match_total else 0

        themed_discussion.append({
            "theme": theme.get("theme"),
            "count": int(theme.get("count", 0)),
            "keywords": theme.get("keywords", []),
            "positive_percent": positive_percent,
        })

    # ── CONTENT DEMAND ─────────────────────────────────────────────────────────
    content_demand = analyze_content_requests([{"text": t} for t in comments_text])

    # ── TOPICS ─────────────────────────────────────────────────────────────────
    topics = [
        {"topic": 0, "top_words": [k["keyword"] for k in keywords[:3] if "keyword" in k]},
        {"topic": 1, "top_words": [k["keyword"] for k in keywords[3:6] if "keyword" in k]},
    ]

    # Scale keyword scores to 0-100
    for kw in keywords:
        kw["score"] = int(kw.get("score", 0) * 100)

    # ── RECOMMENDED ACTIONS ────────────────────────────────────────────────────
    actions: Dict[str, List[Any]] = {"urgent": [], "next_video_ideas": []}
    if int(categories_counts.get("concerns", 0)) > 0:
        actions["urgent"].append({
            "action": "Address viewer concerns in comments or a follow-up video",
            "impact": "High", "effort": "Low",
        })
    if content_demand.get("high_demand"):
        for topic_name, demand_data in content_demand["high_demand"].items():
            actions["next_video_ideas"].append({
                "topic": f"Deep Dive: {topic_name.title()}",
                "demand": "High",
                "estimated_views": int(demand_data.get("request_count", 0)) * 50,
            })
    if not actions["next_video_ideas"]:
        top_kw = keywords[0]["keyword"] if keywords else "Content"
        actions["next_video_ideas"].append({
            "topic": f"{top_kw.title()} — Explained",
            "demand": "Moderate",
            "estimated_views": 1000,
        })

    # ── SUMMARY (used by DB + legacy) ─────────────────────────────────────────
    summary = " ".join(executive_summary_paras[:1])  # First para for DB storage

    v_title = str(metadata.get("title", "Video"))

    return {
        "video_title": v_title,
        "channel_name": str(metadata.get("channelTitle", "")),
        "subscriber_count": metadata.get("subscriberCount", None),
        "subscriber_display": metadata.get("subscriberDisplay", ""),
        "view_count": metadata.get("viewCount", 0),
        "view_count_display": metadata.get("viewCountDisplay", ""),
        "comment_count": metadata.get("commentCount", 0),
        "comment_count_display": metadata.get("commentCountDisplay", ""),
        "analyzed_comment_count": total,
        "thumbnail": metadata.get("thumbnail", ""),
        # Summary fields
        "summary": summary,
        "executive_summary_paras": executive_summary_paras,
        "audience_reaction": audience_reaction,
        # AI Insights
        "ai_headline": ai_headline,
        "discussion_themes": themed_discussion,
        "emotion_mix": emotion_mix,
        "audience_intent": audience_intent,
        "content_gaps": content_gaps,
        "creator_actions": creator_actions,
        # Sentiment
        "sentiment": sentiment_result,
        "sentiment_batches": sentiment_batches,
        # Categories
        "categories": categories_counts,
        # Details tab data
        "keywords": keywords,
        "common_phrases": common_phrases,
        "topics": topics,
        "praise_breakdown": praise_breakdown,
        "complaints_breakdown": complaints_breakdown,
        "top_questions": top_questions,
        "content_demand": content_demand,
        "recommended_actions": actions,
        "most_liked_comments": most_liked_comments,
        "top_replied_comments": top_replied_comments,
        "top_positive_comments": top_positive_comments,
        "top_negative_comments": top_negative_comments,
        "likes_distribution": likes_distribution,
        "replies_distribution": replies_distribution,
        # Flat comment lists for popup cards
        "praise_comments": praise_comments[:50],
        "concern_comments": concern_comments[:50],
        "question_comments": question_comments[:50],
        # All sample comments for Details tab (5 each)
        "sample_praise": praise_comments[:5],
        "sample_questions": question_comments[:5],
        "sample_concerns": concern_comments[:5],
    }
