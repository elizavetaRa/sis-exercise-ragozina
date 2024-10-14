from django.db import models


class Literature(models.Model):
    title = models.CharField(max_length=200)
    abstract = models.TextField()
    arxiv_id = models.CharField(max_length=50, blank=True, null=True)
    publication_date = models.DateField(blank=True, null=True) # Allow publication dates with zero values 



class OpenAIAPIMetrics(models.Model):
    query = models.CharField(max_length=255)
    response_time_ms = models.FloatField()  # Response time in ms
    timestamp = models.DateTimeField(auto_now_add=True)  # Automatic timestamp

    def __str__(self):
        return f"{self.query} - {self.response_time_ms} ms"
    

class OpenAIAPIStatistics(models.Model):
    query = models.CharField(max_length=255, unique=True)  # Unique query for statistics
    count = models.IntegerField(default=0)  # Count of occurrences
    average_response_time_ms = models.FloatField(default=0.0)  # Average response time in ms
    max_response_time_ms = models.FloatField(default=0.0)  # Maximum response time in ms
    min_response_time_ms = models.FloatField(default=0.0)  # Minimum response time in ms

    def __str__(self):
        return f"Stats for {self.query}: Count={self.count}, Avg={self.average_response_time_ms} ms"    