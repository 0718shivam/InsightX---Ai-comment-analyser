"""
pure_nlp.py
─────────────────────────────────────────────────────────────────────────────
Comment-only NLP engine for InsightX.

Responsibilities:
  1. Sentiment scoring (English + Hinglish-aware)
  2. Keyword extraction  (Hinglish stopwords removed)
  3. Comment classification (praise / question / concern / suggestion)
  4. Semantic theme detection (co-occurrence clusters, not raw frequency)
  5. Emotion mix detection (Hinglish signals included)
  6. Audience intent breakdown
  7. Content gap detection
  8. Human-like audience reaction prose (analyst-style, not robotic counts)
  9. Creator action recommendations
 10. AI headline generation
─────────────────────────────────────────────────────────────────────────────
"""
import re
from collections import Counter
from typing import Dict, Any, List, Optional

# ═══════════════════════════════════════════════════════════════════════════
#  LEXICONS & STOPWORDS
# ═══════════════════════════════════════════════════════════════════════════

POSITIVE_WORDS = {
    # English
    "love", "loved", "loving", "good", "great", "awesome", "excellent", "amazing",
    "fantastic", "brilliant", "wonderful", "incredible", "outstanding", "perfect",
    "nice", "wow", "best", "superb", "helpful", "insightful", "informative",
    "valuable", "interesting", "useful", "thanks", "thank", "appreciate",
    "appreciated", "impressed", "impressive", "beautiful", "genius", "clear",
    "well", "explained", "enjoyed", "enjoy", "happy", "proud", "glad", "excited",
    "favourite", "favorite", "top", "quality", "recommend", "mindblowing",
    "terrific", "solid", "powerful", "smart", "clever", "accurate", "learned",
    "eye", "opening", "knowledgeable", "expert", "outstanding", "magnificent",
    "phenomenal", "exceptional",
    # Hinglish appreciation
    "acha", "accha", "achha", "sahi", "badhiya", "zabardast", "mast", "shandar",
    "jabardast", "ekdum", "shukriya", "dhanyavaad", "wah", "wow", "waah",
    "kya", "baat", "maja", "maza", "aayi", "aaya",
}

NEGATIVE_WORDS = {
    # English
    "bad", "terrible", "worst", "awful", "hate", "hated", "boring", "fake",
    "sucks", "suck", "disappointing", "disappointed", "horrible", "trash",
    "poor", "rubbish", "useless", "pathetic", "stupid", "wrong", "misleading",
    "biased", "ridiculous", "garbage", "waste", "wasted", "painful", "lies",
    "lying", "lied", "clickbait", "overrated", "irrelevant", "dumb", "nonsense",
    "failed", "failure", "false", "propaganda", "angry", "frustrated",
    "frustrating", "annoying", "annoyed",
    # Hinglish negative
    "bakwas", "faltu", "bekar", "ghatiya", "form", "galat", "jhoot", "jhootha",
    "propaganda", "pagal", "bewakoof",
}

NEGATORS = {
    "not", "never", "no", "nobody", "nothing", "neither", "isn't", "wasn't",
    "aren't", "weren't", "don't", "doesn't", "didn't", "won't", "can't",
    "couldn't", "nahi", "nahin", "nah", "mat", "mत",
}

# Comprehensive English + Hinglish stopwords
STOP_WORDS = {
    # English function words
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "with", "about", "this", "that", "it", "is", "was", "are", "were", "be",
    "been", "being", "i", "you", "we", "they", "he", "she", "my", "your",
    "our", "their", "of", "as", "like", "just", "so", "very", "much", "too",
    "how", "what", "from", "when", "if", "have", "has", "had", "do", "did",
    "will", "would", "can", "could", "should", "one", "all", "its", "than",
    "then", "up", "out", "by", "really", "also", "even", "same", "new",
    "more", "most", "other", "some", "such", "now", "into", "only", "own",
    "those", "these", "which", "while", "because", "before", "after", "where",
    "here", "there", "their", "them", "him", "her", "his", "off", "over",
    "under", "again", "further", "then", "once", "any", "both", "each",
    "few", "between", "through", "during", "itself",
    # YouTube/social noise
    "video", "videos", "channel", "youtube", "watch", "please", "subscribe",
    "like", "share", "comment", "notification", "bell", "hit", "click", "see",
    "link", "check", "follow", "post", "page", "show", "episode",
    # Common English fillers in comments
    "time", "sir", "bro", "guys", "people", "get", "know", "make", "made",
    "need", "want", "say", "said", "think", "thought", "go", "going", "come",
    "came", "back", "look", "looks", "feel", "felt", "way", "use", "take",
    "give", "put", "new", "good", "great", "man", "really", "still", "well",
    "right", "left", "big", "small", "let", "keep", "every", "got", "give",
    # ── HINGLISH PRONOUNS ─────────────────────────────────────────────────
    "yeh", "ye", "woh", "wo", "hum", "tum", "aap", "main", "mein", "mai",
    "iska", "uska", "unka", "hamara", "tumhara", "inka", "unki", "uski",
    # ── HINGLISH VERBS (filler) ───────────────────────────────────────────
    "hai", "hain", "tha", "thi", "the", "ho", "hota", "hoti", "hote",
    "hoga", "hogi", "honge", "hua", "hui", "hue", "kar", "karo", "karna",
    "karte", "karti", "karke", "kiya", "kiye", "raha", "rahi", "rahe",
    "rhe", "keh", "kehte", "kehna", "bolta", "bolte", "bole", "bolte",
    "diya", "dete", "deta", "deti", "lena", "lete", "leta", "leti",
    # ── HINGLISH CONJUNCTIONS & PREPOSITIONS ──────────────────────────────
    "aur", "bhi", "par", "nahi", "nahin", "nah", "haan", "han", "ke", "ki",
    "ka", "ko", "se", "me", "mein", "per", "toh", "to", "kuch", "koi",
    "kisi", "kiska", "sab", "sabhi", "lekin", "magar", "agar", "kyunki",
    "isliye", "tab", "phir", "jab", "jabki", "jabse", "jaise", "jaisa",
    # ── HINGLISH QUESTION WORDS ───────────────────────────────────────────
    "kya", "kyun", "kab", "kaise", "kitna", "kitne", "kidhar", "kaun",
    "kaisa", "kyunki",
    # ── HINGLISH FILLER / INTERJECTIONS ──────────────────────────────────
    "bas", "hi", "acha", "accha", "achha", "theek",  "bilkul", "zyada",
    "bahut", "bohot", "bahot", "boht", "sahi", "wala", "waali", "wale",
    "arre", "arrey", "oye", "yaar", "matlab", "abhi", "abhi", "kal",
    "aaj", "haha", "lol", "omg", "bhai", "dost", "ji", "sahab",
    # ── HINGLISH NUMBERS ─────────────────────────────────────────────────
    "ek", "do", "teen", "char", "paanch", "chhe", "saat", "aath",
    "nau", "das", "sau", "hazaar",
}

CONCERN_PHRASES = [
    "worried about", "concerned about", "fear that", "scared that", "this is bad",
    "this is wrong", "problem with", "issue with", "wrong information", "misleading",
    "fake news", "not accurate", "biased", "one sided", "not fair", "propaganda",
    "please stop", "need to", "must stop", "wake up", "government should",
    "politicians", "corrupt", "corruption", "disaster", "dangerous",
    # Hinglish concern patterns
    "galat hai", "sahi nahi", "ye wrong", "jhoot hai", "bakwas hai",
    "nahi mante", "agree nahi",
]

SUGGESTION_WORDS = {
    "should", "could", "maybe", "suggest", "suggestion", "consider",
    "try", "recommend", "idea", "why not", "how about", "please make",
    "next video", "cover", "do a", "would love", "please do", "request",
    "chahiye", "karo", "banao", "topic",
}

QUESTION_STARTERS = (
    "how", "what", "why", "where", "when", "who", "which", "is", "are",
    "can", "will", "would", "should", "could", "did", "do", "does",
    # Hinglish
    "kya", "kyun", "kab", "kaise", "kaun",
)

GAP_PHRASES = [
    "please make", "make a video", "more about", "follow up", "part 2",
    "next video", "can you explain", "didn't explain", "missed", "what about",
    "didn't cover", "please cover", "more on", "tutorial on", "explain more",
    "deeper", "more detail", "also cover", "would love to see", "need more",
    "where is", "when will you", "expecting", "aur video", "aur banao",
    "part dono", "sequel", "episode 2",
]

# ── Hinglish-aware appreciation patterns ──────────────────────────────────
APPRECIATION_PATTERNS = [
    "great explanation", "well explained", "best video", "love this", "so helpful",
    "thank you so much", "amazing content", "very informative", "eye opener",
    "bahut acha", "bahut achha", "bahut helpful", "bahut informative",
    "maza aaya", "maja aaya", "zabardast video", "shandar video",
    "shukriya", "dhanyavaad", "wah kya video", "ekdum sahi",
    "perfect explanation", "nicely explained", "keep it up",
]

# ── Confusion signals ─────────────────────────────────────────────────────
CONFUSION_SIGNALS = [
    "don't understand", "confused", "not clear", "unclear", "what does",
    "what is", "can you explain", "didn't get", "didn't understand",
    "samajh nahi", "samajh mein nahi", "kuch nahi samajha", "kya matlab",
    "meaning", "explain this", "what do you mean",
]

# ── Curiosity / follow-up request signals ─────────────────────────────────
CURIOSITY_SIGNALS = [
    "more about", "next video", "follow up", "part 2", "sequel", "cover",
    "deep dive", "detailed video", "in depth", "elaborate", "what about",
    "also cover", "aur banao", "aur video", "agle video", "episode 2",
    "aur bhi", "iske baare mein",
]

# ── Disagreement / skepticism signals ────────────────────────────────────
DISAGREEMENT_SIGNALS = [
    "wrong", "incorrect", "disagree", "not true", "misleading", "false",
    "propaganda", "biased", "galat", "jhoot", "agree nahi", "sahi nahi",
    "this is wrong", "that's not right", "I disagree",
]


# ═══════════════════════════════════════════════════════════════════════════
#  CORE SENTIMENT
# ═══════════════════════════════════════════════════════════════════════════

def _score_sentiment(text: str) -> str:
    text_lower = text.lower()
    words = re.findall(r"\b\w+\b", text_lower)
    pos = neg = 0.0
    for i, w in enumerate(words):
        window_start = max(0, i - 3)
        negated = any(words[j] in NEGATORS for j in range(window_start, i))
        if w in POSITIVE_WORDS:
            pos += 0 if negated else 1
            neg += 1 if negated else 0
        elif w in NEGATIVE_WORDS:
            pos += 0.5 if negated else 0
            neg += 0 if negated else 1
    if pos > neg:
        return "positive"
    if neg > pos:
        return "negative"
    return "neutral"


def analyze_sentiment_basic(text: str) -> str:
    return _score_sentiment(text)


# ═══════════════════════════════════════════════════════════════════════════
#  KEYWORD EXTRACTION  (Hinglish-stopword-filtered)
# ═══════════════════════════════════════════════════════════════════════════

def extract_keywords_basic(comments: List[str], top_n: int = 15) -> List[Dict[str, Any]]:
    """
    Extract meaningful topical keywords from comments.
    All Hinglish filler words and English function words are excluded.
    Only words with 4+ characters that aren't in STOP_WORDS are considered.
    """
    all_words: List[str] = []
    for text in comments:
        words = re.findall(r"\b[a-zA-Z]{4,}\b", text.lower())
        all_words.extend([w for w in words if w not in STOP_WORDS])

    counts = Counter(all_words)
    # Minimum frequency of 2 to avoid noise
    top_words = [(w, c) for w, c in counts.most_common(top_n + 15) if c >= 2][:top_n]
    max_count = top_words[0][1] if top_words else 1
    return [
        {"keyword": w, "score": round(c / max_count, 2), "count": c}
        for w, c in top_words
    ]


def extract_common_phrases(comments: List[str], top_n: int = 8) -> List[Dict[str, Any]]:
    """Extract most repeated meaningful 2-word phrases, Hinglish-filtered."""
    all_bigrams: List[str] = []
    for text in comments:
        words = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
        clean = [w for w in words if w not in STOP_WORDS and len(w) >= 3]
        for i in range(len(clean) - 1):
            all_bigrams.append(f"{clean[i]} {clean[i+1]}")

    counts = Counter(all_bigrams)
    return [
        {"phrase": p, "count": c}
        for p, c in counts.most_common(top_n + 10)
        if c >= 3
    ][:top_n]


# ═══════════════════════════════════════════════════════════════════════════
#  COMMENT CLASSIFICATION
# ═══════════════════════════════════════════════════════════════════════════

def _is_question(text: str) -> bool:
    if "?" in text:
        return True
    lower = text.lower().strip()
    for starter in QUESTION_STARTERS:
        if lower.startswith(starter + " "):
            return True
    return False


def _is_concern(text: str) -> bool:
    lower = text.lower()
    for phrase in CONCERN_PHRASES:
        if phrase in lower:
            return True
    return _score_sentiment(text) == "negative"


def _clean_comment(text: str, max_len: int = 160) -> str:
    t = text.strip()
    return t[:max_len - 3] + "..." if len(t) > max_len else t


def classify_and_extract_breakdown(comments: List[str]) -> Dict[str, Any]:
    counts = {"praise": 0, "questions": 0, "concerns": 0, "suggestions": 0, "general": 0}
    praise_comments: List[str] = []
    question_comments: List[str] = []
    concern_comments: List[str] = []

    for text in comments:
        if not text.strip():
            continue
        lower = text.lower()

        if _is_question(text):
            counts["questions"] += 1
            question_comments.append(_clean_comment(text))
            continue

        if _is_concern(text):
            counts["concerns"] += 1
            concern_comments.append(_clean_comment(text))
            continue

        if any(w in lower for w in SUGGESTION_WORDS):
            counts["suggestions"] += 1
            continue

        if _score_sentiment(text) == "positive":
            counts["praise"] += 1
            praise_comments.append(_clean_comment(text))
        else:
            counts["general"] += 1

    # Deduplicate questions
    seen_q: set = set()
    unique_questions: List[str] = []
    for q in question_comments:
        key = q[:40].lower()
        if key not in seen_q:
            seen_q.add(key)
            unique_questions.append(q)

    praise_bd: Dict = {}
    if praise_comments:
        praise_bd["positive_feedback"] = {
            "count": counts["praise"],
            "examples": praise_comments[:3],
            "all_comments": praise_comments,
        }

    concerns_bd: Dict = {}
    if concern_comments:
        concerns_bd["general_issues"] = {
            "count": counts["concerns"],
            "examples": [concern_comments[0]] if concern_comments else [],
            "all_comments": concern_comments,
            "solution": "Address recurring negative feedback in a follow-up.",
        }

    top_q_list: List = []
    if unique_questions:
        top_q_list.append({
            "question": unique_questions[0],
            "frequency": counts["questions"],
            "opportunity": f"{counts['questions']} viewers asked questions.",
            "all_comments": unique_questions,
        })

    return {
        "counts": counts,
        "praise_breakdown": praise_bd,
        "complaints_breakdown": concerns_bd,
        "top_questions": top_q_list,
        "praise_comments": praise_comments,
        "concern_comments": concern_comments,
        "question_comments": unique_questions,
    }


# ═══════════════════════════════════════════════════════════════════════════
#  SEMANTIC THEME DETECTION  (co-occurrence clustering)
# ═══════════════════════════════════════════════════════════════════════════

def detect_discussion_themes(
    comments: List[str], keywords: List[Dict], top_n: int = 5
) -> List[Dict[str, Any]]:
    """
    Cluster top keywords by co-occurrence to form semantic themes.
    Instead of showing raw keywords, this groups related concepts and names
    the theme after the dominant concept.
    """
    top_kws = [k["keyword"] for k in keywords[:15] if k.get("keyword")]
    if not top_kws:
        return []

    # Build co-occurrence map
    cooc: Dict[str, List[str]] = {kw: [] for kw in top_kws}
    kw_counts: Dict[str, int] = {kw: 0 for kw in top_kws}

    for comment in comments:
        lower = comment.lower()
        present = [kw for kw in top_kws if re.search(r"\b" + re.escape(kw) + r"\b", lower)]
        for kw in present:
            kw_counts[kw] += 1
            cooc[kw].extend([k for k in present if k != kw])

    # Build themes greedily
    themes: List[Dict[str, Any]] = []
    used: set = set()

    for kw in sorted(kw_counts, key=lambda k: kw_counts[k], reverse=True):
        if kw in used or kw_counts[kw] < 3:
            continue

        # Find top co-occurring keyword (forms the theme name)
        related_counter = Counter(cooc[kw])
        top_related = [r for r, _ in related_counter.most_common(2) if r not in used]

        theme_name = kw.capitalize()
        if top_related:
            theme_name += f" & {top_related[0].capitalize()}"

        # Count how many comments discuss this theme
        theme_kws = [kw] + top_related[:1]
        theme_count = sum(
            1 for c in comments
            if any(re.search(r"\b" + re.escape(k) + r"\b", c.lower()) for k in theme_kws)
        )

        themes.append({
            "theme": theme_name,
            "count": theme_count,
            "keywords": theme_kws,
        })
        used.add(kw)
        used.update(top_related[:1])

        if len(themes) >= top_n:
            break

    return sorted(themes, key=lambda x: x["count"], reverse=True)[:top_n]


# ═══════════════════════════════════════════════════════════════════════════
#  EMOTION MIX  (Hinglish-aware)
# ═══════════════════════════════════════════════════════════════════════════

CURIOUS_W = {"why", "how", "what", "explain", "understand", "wonder", "curious", "question", "kyun", "kaise", "kya"}
SATISFIED_W = {"great", "amazing", "love", "excellent", "perfect", "brilliant", "awesome", "best", "superb", "helpful", "acha", "achha", "zabardast", "mast", "badhiya"}
CONFUSED_W = {"confused", "unclear", "lost", "samajh", "meaning", "huh", "don't understand", "not clear"}
FRUSTRATED_W = {"frustrated", "annoying", "hate", "angry", "ridiculous", "stop", "enough", "tired", "bakwas", "bekar", "galat"}
EXCITED_W = {"wow", "amazing", "incredible", "mind", "blown", "excited", "unbelievable", "wah", "waah", "zabardast"}


def detect_emotion_mix(comments: List[str]) -> Dict[str, int]:
    curious = satisfied = confused = frustrated = excited = 0
    total = len(comments) or 1
    for c in comments:
        lower = c.lower()
        words = set(re.findall(r"\b\w+\b", lower))
        if "?" in c or words & CURIOUS_W:
            curious += 1
        if words & SATISFIED_W:
            satisfied += 1
        if words & CONFUSED_W or any(p in lower for p in ["don't understand", "samajh nahi", "not clear"]):
            confused += 1
        if words & FRUSTRATED_W:
            frustrated += 1
        if "!" in c or words & EXCITED_W:
            excited += 1

    return {
        "curious": min(round(curious / total * 100), 100),
        "satisfied": min(round(satisfied / total * 100), 100),
        "confused": min(round(confused / total * 100), 100),
        "frustrated": min(round(frustrated / total * 100), 100),
        "excited": min(round(excited / total * 100), 100),
    }


# ═══════════════════════════════════════════════════════════════════════════
#  AUDIENCE INTENT
# ═══════════════════════════════════════════════════════════════════════════

def detect_audience_intent(counts: Dict[str, int]) -> Dict[str, int]:
    praise = counts.get("praise", 0)
    questions = counts.get("questions", 0)
    concerns = counts.get("concerns", counts.get("complaints", 0))
    suggestions = counts.get("suggestions", 0)
    general = counts.get("general", 0)
    total = praise + questions + concerns + suggestions + general or 1
    return {
        "praising": round(praise / total * 100),
        "asking": round(questions / total * 100),
        "concerned": round(concerns / total * 100),
        "suggesting": round(suggestions / total * 100),
    }


# ═══════════════════════════════════════════════════════════════════════════
#  CONTENT GAPS
# ═══════════════════════════════════════════════════════════════════════════

def detect_content_gaps(
    question_comments: List[str], concern_comments: List[str]
) -> List[str]:
    all_relevant = question_comments + concern_comments
    gaps: List[str] = []
    seen: set = set()
    for c in all_relevant:
        lower = c.lower()
        for phrase in GAP_PHRASES:
            if phrase in lower:
                idx = lower.find(phrase)
                snippet = c[idx:idx + 70].strip()
                key = phrase
                if key not in seen and len(snippet) > 10:
                    seen.add(key)
                    gaps.append(_clean_comment(snippet, 70))
                break
    return gaps[:4]


# ═══════════════════════════════════════════════════════════════════════════
#  CREATOR ACTIONS
# ═══════════════════════════════════════════════════════════════════════════

def generate_creator_actions(
    counts: Dict[str, int],
    gaps: List[str],
    question_comments: List[str],
    concern_comments: List[str],
    keywords: List[Dict],
) -> List[str]:
    actions: List[str] = []
    questions = counts.get("questions", 0)
    concerns = counts.get("concerns", counts.get("complaints", 0))
    praise = counts.get("praise", 0)
    total = sum(counts.values()) or 1

    if questions / total > 0.2 and question_comments:
        q_sample = _clean_comment(question_comments[0], 65)
        actions.append(
            f"Pin a response or make a short follow-up addressing common questions — "
            f"e.g. \"{q_sample}\""
        )

    if concerns / total > 0.15 and concern_comments:
        actions.append(
            "Respond to the top concerns in the comments section to build trust and credibility with your audience."
        )

    if gaps:
        actions.append(f"Create a follow-up video covering: \"{gaps[0]}\"")
    elif keywords:
        top_kw = keywords[0]["keyword"].capitalize()
        actions.append(
            f"A deeper video on '{top_kw}' could perform well — "
            f"it's the most discussed topic in the comments."
        )

    if len(actions) < 3:
        actions.append(
            "Engage with your top-liked comments to boost community interaction and algorithm performance."
        )

    return actions[:3]


# ═══════════════════════════════════════════════════════════════════════════
#  AI HEADLINE  (varied, natural phrasing)
# ═══════════════════════════════════════════════════════════════════════════

def generate_ai_headline(
    pos_pct: int,
    neg_pct: int,
    counts: Dict[str, int],
    keywords: List[Dict],
    question_comments: List[str],
    concern_comments: List[str],
    praise_comments: List[str],
) -> str:
    top_kw = keywords[0]["keyword"] if keywords else "this topic"
    questions = counts.get("questions", 0)
    concerns = counts.get("concerns", counts.get("complaints", 0))
    praise = counts.get("praise", 0)
    total = sum(counts.values()) or 1

    q_ratio = questions / total
    c_ratio = concerns / total
    p_ratio = praise / total

    if p_ratio > 0.45:
        return (
            f"Viewers are overwhelmingly positive in the comments. Most express genuine "
            f"satisfaction with the content, and the discussion around {top_kw} has been well received."
        )
    elif q_ratio > 0.40:
        q_sample = _clean_comment(question_comments[0], 60) if question_comments else ""
        q_snip = f" A recurring question: \"{q_sample}\"" if q_sample else ""
        return (
            f"Audience engagement is driven by curiosity. {round(q_ratio * 100)}% of comments are "
            f"asking questions about {top_kw}.{q_snip}"
        )
    elif c_ratio > 0.30:
        return (
            f"This video has generated a polarised response. A notable segment of viewers "
            f"is challenging the narrative around {top_kw}, making this a heavily debated topic."
        )
    elif neg_pct > 30:
        return (
            f"The audience reaction is mixed to critical. While some appreciate the coverage on "
            f"{top_kw}, a significant portion of viewers express disagreement or concern."
        )
    else:
        return (
            f"The audience is engaged and well-distributed across appreciation, curiosity, and debate "
            f"around the topic of {top_kw}. The discussion is active and constructive overall."
        )


# ═══════════════════════════════════════════════════════════════════════════
#  HUMAN-LIKE AUDIENCE REACTION (analyst-style prose, comment-based only)
# ═══════════════════════════════════════════════════════════════════════════

def generate_human_audience_reaction(
    comments: List[str],
    counts: Dict[str, int],
    pos_pct: int,
    neg_pct: int,
    question_comments: List[str],
    concern_comments: List[str],
    praise_comments: List[str],
) -> str:
    """
    Write a human analyst-style paragraph describing how the audience is reacting.
    Focus on emotional tone, engagement type, and observable patterns.
    Does NOT list keywords. Does NOT just repeat counts.
    Handles Hinglish comments correctly.
    """
    questions = counts.get("questions", 0)
    concerns = counts.get("concerns", counts.get("complaints", 0))
    praise = counts.get("praise", 0)
    suggestions = counts.get("suggestions", 0)
    total = sum(counts.values()) or 1

    q_ratio = questions / total
    c_ratio = concerns / total
    p_ratio = praise / total

    # ── Detect specific signals ───────────────────────────────────────────────
    confusion_count = sum(
        1 for c in comments if any(p in c.lower() for p in CONFUSION_SIGNALS)
    )
    curiosity_count = sum(
        1 for c in comments if any(p in c.lower() for p in CURIOSITY_SIGNALS)
    )
    appreciation_count = sum(
        1 for c in comments if any(p in c.lower() for p in APPRECIATION_PATTERNS)
    )
    disagreement_count = sum(
        1 for c in comments if any(p in c.lower() for p in DISAGREEMENT_SIGNALS)
    )

    conf_ratio = confusion_count / total
    curosity_ratio = curiosity_count / total
    appr_ratio = appreciation_count / total
    disag_ratio = disagreement_count / total

    # ── Build opening sentence ────────────────────────────────────────────────
    if q_ratio > 0.40:
        opening = (
            "The audience is highly engaged and intellectually curious. "
            "A large share of viewers are asking follow-up questions and seeking deeper understanding of the topic, "
            "suggesting the video successfully sparked interest but left some viewers wanting more explanation."
        )
    elif p_ratio > 0.45 and appr_ratio > 0.10:
        opening = (
            "The audience reaction is strongly positive and appreciative. "
            "Most viewers found the content informative and well-presented, "
            "with many explicitly praising the explanation and clarity of delivery."
        )
    elif c_ratio > 0.30 or disag_ratio > 0.10:
        opening = (
            "The audience reaction is notably polarised and, at times, critical. "
            "A significant portion of viewers are pushing back on the content, "
            "either disagreeing with the framing, questioning the accuracy, or expressing concern about the implications."
        )
    elif neg_pct > 30:
        opening = (
            "The reaction from viewers is mixed, skewing somewhat negative. "
            "While a portion of the audience appreciates the coverage, many are expressing frustration, "
            "scepticism, or dissatisfaction with aspects of the topic."
        )
    elif conf_ratio > 0.08:
        opening = (
            "Many viewers appear confused or unsatisfied with the level of explanation in the video. "
            "There are recurring comments asking for clarification, simpler explanations, or more examples."
        )
    else:
        opening = (
            "The audience is engaged in an active, balanced discussion. "
            "The comment section reflects a healthy mix of appreciation, curiosity, and thoughtful debate, "
            "indicating the video has resonated broadly across different viewer perspectives."
        )

    # ── Build supporting details ───────────────────────────────────────────────
    details: List[str] = []

    if curosity_ratio > 0.08:
        details.append(
            f"Many viewers are curious about related topics and are requesting follow-up videos or deeper dives"
        )

    if confusion_count > total * 0.06 and "confused" not in opening:
        details.append(
            f"Some viewers ({confusion_count}) appear to be struggling to follow the content and have asked for simpler or more detailed explanations"
        )

    if appreciation_count > total * 0.10 and "appreciat" not in opening:
        details.append(
            f"A solid segment found the content genuinely valuable, with viewers explicitly calling it informative or well-explained"
        )

    if dispute := (concern_comments[:1]):
        if disag_ratio > 0.08 and "disagree" not in opening and "polarised" not in opening:
            details.append(
                f"Some viewers are actively disagreeing with the content's premises or conclusions"
            )

    if suggestions > total * 0.05:
        details.append(
            f"Several viewers offered constructive suggestions and ideas for future videos"
        )

    # ── Compose final text ────────────────────────────────────────────────────
    if details:
        detail_str = "; ".join(details) + "."
        detail_str = detail_str[0].upper() + detail_str[1:]
        return f"{opening} {detail_str}"

    return opening


# ═══════════════════════════════════════════════════════════════════════════
#  MOST LIKED COMMENTS
# ═══════════════════════════════════════════════════════════════════════════

def get_most_liked_comments(
    raw_comments: List[Dict],
    praise_set: set,
    question_set: set,
    concern_set: set,
    top_n: int = 5,
) -> List[Dict[str, Any]]:
    sorted_comments = sorted(raw_comments, key=lambda c: c.get("likes", 0), reverse=True)
    result: List[Dict] = []
    for c in sorted_comments[:top_n * 3]:
        text = _clean_comment(c.get("text", ""), 140)
        likes = c.get("likes", 0)
        if not text:
            continue
        if text in praise_set:
            ctype = "praise"
        elif text in question_set:
            ctype = "question"
        elif text in concern_set:
            ctype = "concern"
        else:
            ctype = "general"
        result.append({
            "text": text,
            "author": c.get("author", "Viewer"),
            "likes": likes,
            "replies": int(c.get("replies", 0)),
            "sentiment": c.get("sentiment", "neutral"),
            "type": ctype,
        })
        if len(result) >= top_n:
            break
    return result


# ═══════════════════════════════════════════════════════════════════════════
#  EXECUTIVE SUMMARY  (3 analyst-style paragraphs, comment-based only)
# ═══════════════════════════════════════════════════════════════════════════

def build_executive_summary(
    total: int,
    pos_pct: int,
    neg_pct: int,
    counts: Dict[str, int],
    keywords: List[Dict],
    question_comments: List[str],
    concern_comments: List[str],
    praise_comments: List[str],
) -> List[str]:
    """
    Return a list of 3 paragraphs that form a professional executive summary
    of the comment section.  Written in analyst prose — no bullet lists,
    no keyword dumps, no robotic repetition.
    """
    questions = counts.get("questions", 0)
    concerns = counts.get("concerns", counts.get("complaints", 0))
    praise = counts.get("praise", 0)
    suggestions = counts.get("suggestions", 0)
    total_cats = sum(counts.values()) or 1
    neu_pct = max(0, 100 - pos_pct - neg_pct)

    top_kw = keywords[0]["keyword"] if keywords else "the topic"
    second_kw = keywords[1]["keyword"] if len(keywords) > 1 else None

    # ── Para 1: Overall sentiment snapshot ────────────────────────────────
    if pos_pct >= 60:
        tone_desc = "overwhelmingly positive"
        tone_detail = (
            "The majority of viewers expressed satisfaction and genuine appreciation for the content."
        )
    elif pos_pct >= 40:
        tone_desc = "broadly positive with some debate"
        tone_detail = (
            "While most viewers responded favourably, a meaningful segment raised questions or concerns."
        )
    elif neg_pct >= 40:
        tone_desc = "predominantly critical"
        tone_detail = (
            "A significant share of viewers pushed back against the content, "
            "expressing disagreement, frustration, or scepticism."
        )
    else:
        tone_desc = "mixed and varied"
        tone_detail = (
            "The audience is split between appreciation, curiosity, and criticism, "
            "reflecting the topic's complexity."
        )

    para1 = (
        f"Across {total} comments analysed, the overall audience sentiment is {tone_desc} "
        f"({pos_pct}% positive, {neu_pct}% neutral, {neg_pct}% negative). "
        f"{tone_detail}"
    )

    # ── Para 2: Engagement patterns & discussion focus ────────────────────
    engagement_parts: List[str] = []

    if praise / total_cats > 0.30:
        engagement_parts.append(
            f"Praise and appreciation dominate the conversation, with {praise} comments "
            f"expressing admiration for the quality, clarity, or value of the content"
        )

    if questions / total_cats > 0.15:
        q_sample = _clean_comment(question_comments[0], 60) if question_comments else ""
        q_snip = f' — for example: "{q_sample}"' if q_sample else ""
        engagement_parts.append(
            f"{questions} viewers asked follow-up questions{q_snip}, "
            f"indicating strong curiosity and room for deeper exploration"
        )

    if concerns / total_cats > 0.10:
        engagement_parts.append(
            f"{concerns} comments flagged concerns or disagreements, "
            f"suggesting parts of the narrative attracted pushback"
        )

    if suggestions / total_cats > 0.05:
        engagement_parts.append(
            f"{suggestions} viewers offered constructive suggestions for future content"
        )

    if engagement_parts:
        para2 = ". ".join(engagement_parts) + "."
        para2 = para2[0].upper() + para2[1:]
    else:
        para2 = (
            "The comments are largely general in nature, without a dominant "
            "trend towards praise, criticism, or specific questions."
        )

    # Add keyword context
    kw_context = f' The discussion centred around "{top_kw}"'
    if second_kw:
        kw_context += f' and "{second_kw}"'
    kw_context += ", which emerged as the most talked-about themes."
    para2 += kw_context

    # ── Para 3: Strategic takeaway ────────────────────────────────────────
    if concerns / total_cats > 0.20 and question_comments:
        para3 = (
            "From a strategic standpoint, the creator should consider addressing "
            "the recurring viewer concerns directly — either through a pinned comment "
            "or a follow-up video. Failing to acknowledge the criticism risks eroding "
            "trust with an engaged but sceptical segment of the audience."
        )
    elif questions / total_cats > 0.25:
        para3 = (
            "The high volume of audience questions represents a clear opportunity. "
            "A dedicated Q&A or follow-up video addressing the most common queries "
            "could drive strong repeat engagement and reinforce creator credibility."
        )
    elif praise / total_cats > 0.50:
        para3 = (
            "The overwhelmingly positive reception signals strong content–audience fit. "
            "The creator should look at doubling down on this format and consider "
            "a deeper follow-up, as viewer appetite for similar content appears high."
        )
    else:
        para3 = (
            "Overall, the comment section reflects an active and engaged audience. "
            "Strategically, the creator can strengthen loyalty by engaging directly "
            "with top questions and producing follow-up content around the most-discussed themes."
        )

    return [para1, para2, para3]


# ═══════════════════════════════════════════════════════════════════════════
#  AUDIENCE REACTION  (concise 1–2 sentence summary, no keyword lists)
# ═══════════════════════════════════════════════════════════════════════════

def build_audience_reaction(
    pos_pct: int,
    neg_pct: int,
    counts: Dict[str, int],
    keywords: List[Dict],
    question_comments: List[str],
    concern_comments: List[str],
) -> str:
    """
    A short, punchy 1–2 sentence summary of the audience mood.
    Used for the quick-glance card on the dashboard. Does NOT list keywords.
    """
    questions = counts.get("questions", 0)
    concerns = counts.get("concerns", counts.get("complaints", 0))
    praise = counts.get("praise", 0)
    total = sum(counts.values()) or 1

    q_ratio = questions / total
    c_ratio = concerns / total
    p_ratio = praise / total

    top_kw = keywords[0]["keyword"] if keywords else "the topic"

    if p_ratio > 0.50:
        return (
            f"Viewers are overwhelmingly positive — the audience clearly resonated with "
            f"the content on {top_kw}. Praise and appreciation dominate the conversation."
        )
    elif q_ratio > 0.35:
        return (
            f"The comment section is buzzing with questions about {top_kw}. "
            f"Viewers are highly engaged and eager for more detail."
        )
    elif c_ratio > 0.25:
        return (
            f"A notable portion of the audience is pushing back on the content. "
            f"Concerns and disagreements around {top_kw} are a recurring theme."
        )
    elif neg_pct > 35:
        return (
            f"The audience reaction is mixed to critical. While some viewers value "
            f"the coverage, many express frustration or scepticism."
        )
    else:
        return (
            f"The audience is engaged in a balanced discussion around {top_kw}, "
            f"with a healthy mix of appreciation, curiosity, and constructive debate."
        )
