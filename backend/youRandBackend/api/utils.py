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