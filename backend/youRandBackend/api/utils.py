import random
import math

##
# Utility function that takes the category_likes dict as a paremeter and returns a tag
# Performs weighted search but uses weight smooving to give less-frequently accessed tags more chance to support randomness
##
def weighted_tag_selector_smooth(category_likes):
    if not category_likes:
        return None

    tags = list(category_likes.keys())
    raw_weights = list(category_likes.values())

    #Smoove weights in an attempt to even the odds 
    if all(w == 0 for w in raw_weights):
        weights = [1] * len(tags)
    else:
        weights = [math.sqrt(w) for w in raw_weights]

    #return modified random tag
    selected_tag = random.choices(tags, weights=weights, k=1)[0]
    return selected_tag

## Utility function that converts raw view numbers to the standard youtube format "1.2M or 1.3k or 24k" and so on
def format_views_short(views):
    try:
        num = int(views)
    except (ValueError, TypeError):
        return "0"
    
    if num < 1000:
        return str(num)
    elif num < 1_000_000:
        if num < 10_000:
            # Convert to single digit thousands format
            return f"{num / 1000:.1f}K"
        else:
            # Convert to multi digit thousands format
            return f"{num // 1000}K"
    elif num < 1_000_000_000:
        # Millions
        if num < 10_000_000:
            # Convert to single digit millions format
            return f"{num / 1_000_000:.1f}M"
        else:
            # Convert to multi digit millions format
            return f"{num // 1_000_000}M"
    else:
        if num < 10_000_000_000:
            # Convert to single digit billions format
            return f"{num / 1_000_000_000:.1f}B"
        else:
            # Convert to multi digit billions format
            return f"{num // 1_000_000_000}B"