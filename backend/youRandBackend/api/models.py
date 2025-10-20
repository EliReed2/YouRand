from django.db import models

# ExtensionUser model to store user-specific data like uid and likes
class ExtensionUser(models.Model):
    #User ID field (defined on extension installation)
    uid = models.CharField(max_length=255, unique=True)
    #Timestamp field to store when the user was created
    created_at = models.DateTimeField(auto_now_add=True)
    #Timestamp field to store when the user was last active
    last_active = models.DateTimeField(auto_now=True)
    # Timestamp to store the number of times this extension has been used
    usage_count = models.IntegerField(default=0)
    # Dictionary to store any user preferences/settings
    preferences = models.JSONField(default=dict, blank=True)

    ## More complex fields ##

    # List of videos that the user has saved (Contains descriptive info for display in frontend)
    saved_videos = models.JSONField(default=list, blank=True)
    # Map of category names with the number of times a video with that category has been saved or rated as keys
    category_likes = models.JSONField(default=dict, blank=True)
    # List of saved channel names that the user has saved videos from
    saved_channels = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"ExtensionUser {self.uid}"