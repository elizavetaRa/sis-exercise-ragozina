from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_elasticsearch_dsl_drf.viewsets import DocumentViewSet
from django_elasticsearch_dsl_drf.filter_backends import (
    FilteringFilterBackend,
    OrderingFilterBackend,
    DefaultOrderingFilterBackend,
    SearchFilterBackend,
)
from rest_framework.viewsets import ViewSet
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

from api.serializers import LiteratureSerializer
from api.documents import LiteratureDocument
from api.models import Literature


class LiteratureDocumentViewSet(DocumentViewSet):
    document = LiteratureDocument
    serializer_class = LiteratureSerializer
    lookup_field = "id"
    filter_backends = []
    ordering = ("_score",)
    filter_backends = [
        OrderingFilterBackend,
        DefaultOrderingFilterBackend,
        SearchFilterBackend,
    ]
    search_fields = ("title",)

    ordering_fields = {
        "id": "id",
        "title": "title.raw",
        "publication_date": "publication_date",
    }


class LiteratureSearchViewSet(ViewSet):
    serializer_class = LiteratureSerializer

    def list(self, request):
        search_query = request.query_params.get("q", "")
        search = LiteratureDocument.search().query("match", abstract=search_query)
        results = search.execute()
        prompt = "Assume that you are a literature expert. I will give you few points to write related literature summary upon. This summary should be around 300 words. These points are: "
        prompt += " ".join([result.abstract for result in results])
        summary = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
        )
        response = summary.choices[0].message.content
        serializer = LiteratureSerializer(results, many=True)
        count = results.hits.total.value
        return Response(
            {
                "search_query": search_query,
                "summary": response,
                "data": serializer.data,
                "count": count,
            }
        )