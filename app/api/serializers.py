from rest_framework import serializers

from api.models import Literature


class LiteratureSerializer(serializers.Serializer):

    title = serializers.CharField()
    abstract = serializers.CharField()
    publication_date = serializers.DateTimeField(read_only=True, format="%Y-%m-%d")

    class Meta:
        fields = (
            "title",
            "abstract",
            "publication_date",
        )
