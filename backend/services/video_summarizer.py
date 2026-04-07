"""
video_summarizer.py
─────────────────────────────────────────────────────────────────────────────
Generates a human-like summary of what a YouTube video is ABOUT.

IMPORTANT: This pipeline uses ONLY video metadata (title, description, 
chapters, tags). It does NOT use comment text to describe the video.

Separation of concerns:
  - Video summary  → this file (title + description + chapters + tags)
  - Comment analysis → pure_nlp.py (comments only)
─────────────────────────────────────────────────────────────────────────────
"""
import re
from typing import Dict, Any, List, Optional


# ─────────────────────────────────────────────────────────
#  CHAPTER / DESCRIPTION PARSING
# ─────────────────────────────────────────────────────────

_TIMESTAMP_RE = re.compile(
    r'(?:^|\n)(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—:]?\s*(.+?)(?=\n|$)',
    re.MULTILINE,
)

_LINK_RE = re.compile(r'https?://\S+', re.IGNORECASE)
_EMAIL_RE = re.compile(r'\S+@\S+\.\S+')
_HASHTAG_RE = re.compile(r'#\w+')
_SOCIAL_HEADERS = re.compile(
    r'^(follow|instagram|twitter|facebook|telegram|whatsapp|website|contact|email'
    r'|patreon|merch|support|business|discord|linkedin|youtube)\b',
    re.IGNORECASE,
)


def parse_chapters(description: str) -> List[Dict[str, str]]:
    """Extract chapter timestamps from the video description."""
    chapters = []
    if not description:
        return chapters
    for m in _TIMESTAMP_RE.finditer(description):
        title = m.group(2).strip()
        # Filter out junk: too short, looks like a link, pure numbers
        if title and 4 <= len(title) <= 80 and not _LINK_RE.match(title):
            chapters.append({"timestamp": m.group(1), "title": title})
    return chapters[:20]


def clean_description(description: str, max_chars: int = 700) -> str:
    """
    Strip links, social-media plugs, hashtags, timestamps, and empty lines
    from the description so only meaningful text remains.
    """
    if not description:
        return ""

    lines = description.split("\n")
    clean: List[str] = []

    for line in lines:
        line = line.strip()
        if not line:
            continue
        # Skip timestamp-only lines (chapter markers)
        if _TIMESTAMP_RE.match("\n" + line):
            continue
        # Skip pure link lines
        if _LINK_RE.fullmatch(line) or _EMAIL_RE.search(line):
            continue
        # Skip social-media / follow-us headers
        if _SOCIAL_HEADERS.match(line):
            continue
        # Skip hashtag lines
        if _HASHTAG_RE.fullmatch(line.replace(" ", "")):
            continue
        # Skip very short filler lines
        if len(line) < 15:
            continue

        # Strip inline links / hashtags
        line = _LINK_RE.sub("", line).strip()
        line = _HASHTAG_RE.sub("", line).strip()
        if len(line) > 10:
            clean.append(line)

    return " ".join(clean)[:max_chars].strip()


# ─────────────────────────────────────────────────────────
#  TITLE ANALYSIS
# ─────────────────────────────────────────────────────────

def _parse_title(title: str) -> Dict[str, Any]:
    """
    Extract the core topic and creator hint from the video title.
    Handles patterns like:
      "India To Be Worst Hit Due To Hormuz Blockade? | Iran's War | Akash Banerjee"
      "5 Things You Should Know About XYZ | Channel Name"
    """
    # Split on | or : to find creator suffix
    parts = [p.strip() for p in re.split(r'\s*[\|:]\s*', title)]
    main_part = parts[0] if parts else title

    # Detect creator in last part (usually < 25 chars and looks like a name)
    creator_hint = ""
    if len(parts) > 1:
        last = parts[-1]
        if len(last) < 30 and re.search(r'[A-Z][a-z]', last):
            creator_hint = last

    # Is it a question/debate?
    is_question = "?" in title or any(
        title.lower().startswith(kw) for kw in
        ["why", "how", "what", "is", "can", "will", "should", "are", "does"]
    )

    # Is it a list/explainer?
    is_list = bool(re.match(r'^\d+\s', main_part))

    # Detect if the topic is an event vs concept
    return {
        "main_topic": main_part,
        "creator_hint": creator_hint,
        "is_question": is_question,
        "is_list": is_list,
        "full_title": title,
    }


# ─────────────────────────────────────────────────────────
#  VIDEO SUMMARY GENERATOR
# ─────────────────────────────────────────────────────────

def generate_video_summary(
    title: str,
    description: str,
    tags: List[str],
    channel: str,
    chapters: Optional[List[Dict]] = None,
) -> Dict[str, Any]:
    """
    Generate a human-like 2–3 paragraph summary of what the video is about.
    Uses ONLY: title, description, chapters, tags, channel name.
    Does NOT use any comment data.
    """
    chapters = chapters or parse_chapters(description)
    title_info = _parse_title(title)
    desc_clean = clean_description(description)

    # Split description into sentences for selective use
    sentences = re.split(r'(?<=[.!?])\s+', desc_clean)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 25]

    # Creator phrase
    creator_line = f"{channel}: " if channel else ""

    paras: List[str] = []
    source = "title"  # track what sources we used

    # ── PARA 1: What the video is about ───────────────────────────────────────
    main_topic = title_info["main_topic"]

    if sentences:
        # Use description's first meaningful sentence(s)
        first_desc = " ".join(sentences[:2])[:280].strip()
        # Avoid descriptions that are just the title re-stated
        if first_desc.lower()[:30] not in title.lower()[:80]:
            if title_info["is_question"]:
                para1 = (
                    f"This video by {creator_line.rstrip(': ') or 'the creator'} explores the question: "
                    f"\"{main_topic}\". {first_desc}"
                )
            elif title_info["is_list"]:
                para1 = (
                    f"The video presents a structured breakdown of {main_topic.lower()}. "
                    f"{first_desc}"
                )
            else:
                para1 = (
                    f"The video covers {main_topic.lower()}. "
                    f"{first_desc}"
                )
            source = "description"
        else:
            # Description just echoes title — use title + tags
            para1 = _infer_from_title_and_tags(main_topic, tags, channel, title_info)
            source = "title+tags"
    else:
        para1 = _infer_from_title_and_tags(main_topic, tags, channel, title_info)
        source = "title+tags"

    paras.append(para1)

    # ── PARA 2: Structure (chapters) or creator intent ─────────────────────────
    if chapters and len(chapters) >= 3:
        chapter_titles = [c["title"] for c in chapters]
        # Show first 4 and note the total
        shown = ", ".join(f'"{t}"' for t in chapter_titles[:4])
        extra = f", and {len(chapters) - 4} more sections" if len(chapters) > 4 else ""
        para2 = (
            f"The content is structured across {len(chapters)} chapters, "
            f"covering topics like {shown}{extra}. This gives the video a clear, "
            f"educational flow suited to both new and informed viewers."
        )
        paras.append(para2)
        source = "chapters+description" if "description" in source else "chapters+title"

    elif sentences and len(sentences) > 2:
        # Use remaining description sentences for more context
        extra_desc = " ".join(sentences[2:5])[:280].strip()
        if extra_desc and extra_desc not in para1:
            paras.append(extra_desc)
            source = "description"

    elif title_info["is_question"]:
        para2 = (
            f"The creator approaches this as an analytical piece, likely presenting "
            f"multiple perspectives and supporting evidence before arriving at a conclusion. "
            f"The framing as a question is designed to provoke thought and engage the audience."
        )
        paras.append(para2)

    # ── PARA 3: Tags / broader context ────────────────────────────────────────
    clean_tags = [
        t for t in (tags or [])[:8]
        if len(t) > 3 and not t.startswith('#') and t.lower() != title.lower()[:20]
    ]
    if clean_tags and len(paras) < 3:
        tag_str = ", ".join(t.lower() for t in clean_tags[:5])
        para3 = (
            f"Related themes explored in this video include: {tag_str}. "
            f"These topics situate the discussion in a broader context relevant to the audience."
        )
        paras.append(para3)

    inferred = source not in ("description", "chapters+description")

    return {
        "paras": paras,
        "source": source,
        "chapters": chapters,
        "inferred": inferred,
        "main_topic": main_topic,
    }


def _infer_from_title_and_tags(
    main_topic: str, tags: List[str], channel: str, title_info: Dict
) -> str:
    """Fallback: infer para 1 from title + tags when description is empty/unhelpful."""
    creator = f"by {channel} " if channel else ""
    clean_tags = [t for t in (tags or [])[:5] if len(t) > 2 and not t.startswith("#")]

    if title_info["is_question"]:
        base = (
            f"This video {creator}poses the question: \"{main_topic}\". "
            f"It appears to be an analytical or opinion piece examining the topic in depth."
        )
    elif title_info["is_list"]:
        base = (
            f"This video {creator}presents a list-style guide on the topic of "
            f"{main_topic.lower()}, covering key points in a structured format."
        )
    else:
        base = (
            f"This video {creator}covers the topic of {main_topic.lower()}, "
            f"providing an in-depth look at the subject."
        )

    if clean_tags:
        base += f" Key themes include: {', '.join(clean_tags[:4])}."

    return base
