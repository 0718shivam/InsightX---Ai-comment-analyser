import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

def preprocess_text(text: str, return_string: bool = False) -> list[str]:
    """
    1. Convert to lowercase
    2. Remove URLs, mentions (@user), hashtags
    3. Remove special characters (keep only letters/spaces)
    4. Tokenize using NLTK
    5. Remove stopwords (NLTK English stopwords)
    6. Remove tokens shorter than 3 characters
    """
    if not text:
        return [] if not return_string else ""
        
    # Convert to lowercase
    text = str(text).lower()
    
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    
    # Remove mentions and hashtags
    text = re.sub(r'@\w+|#\w+', '', text)
    
    # Remove special characters (keep only letters/spaces)
    text = re.sub(r'[^a-z\s]', ' ', text)
    
    # Tokenize
    try:
        tokens = word_tokenize(text)
    except LookupError:
        # Fallback if punkt is not downloaded somehow
        tokens = text.split()
        
    # Remove stopwords and short tokens
    try:
        stop_words = set(stopwords.words('english'))
    except LookupError:
        stop_words = set()
        
    clean_tokens = [tok for tok in tokens if tok not in stop_words and len(tok) >= 3]
    
    if return_string:
        return " ".join(clean_tokens)
    return clean_tokens
