from django.db import models


class Literature(models.Model):
    title = models.CharField(max_length=200)
    abstract = models.TextField()
    arxiv_id = models.CharField(max_length=50, blank=True, null=True)
    publication_date = models.DateField(blank=True, null=True) # Allow publication dates with zero values 
