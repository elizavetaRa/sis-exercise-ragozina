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
        search = LiteratureDocument.search().query(
        "multi_match", query=search_query, fields=["title", "abstract"]
        )
        results = search.execute()
        prompt = "Assume that you are a literature expert. I will give you few points to write related literature summary upon. This summary should be around 300 words. These points are: "
        prompt += " ".join([f"Title: {result.title}, Abstract: {result.abstract}" for result in results])
        # summary = client.chat.completions.create(
        #     model="gpt-3.5-turbo",
        #     messages=[{"role": "user", "content": prompt}],
        #     max_tokens=100,
        # )
        response = "Duis aliquet Congue scelerisque risus elementum pulvinar. Scelerisque Ad cum, nisl pretium ullamcorper eget pretium. Elementum phasellus quam viverra adipiscing arcu quisque nonummy imperdiet pretium molestie ligula. Tempor massa tincidunt nisi. Aliquam potenti cum mi parturient ullamcorper sollicitudin semper ultrices hac sem ultrices sociosqu dis dapibus blandit ad dictum laoreet neque, mi, etiam Nisl sapien Sociis fringilla porta malesuada, duis, feugiat auctor condimentum venenatis platea convallis non vestibulum at. Congue mollis luctus lectus faucibus libero mi blandit elementum potenti placerat tempor ante justo viverra montes. Per luctus turpis nostra, ut, placerat et. Ipsum tellus fusce, magna class ante. Senectus nam malesuada mollis fames sociosqu. Taciti per nonummy pede faucibus enim ligula ullamcorper, luctus odio sed Hymenaeos primis. Tortor orci varius torquent nibh, phasellus sollicitudin nisi cubilia rhoncus eu. Tristique condimentum inceptos.Fermentum feugiat inceptos congue sollicitudin arcu nunc nam class, torquent primis montes proin nibh, nam nostra urna. Nonummy pulvinar. Sociosqu aenean fames. Dolor ipsum. Lobortis justo senectus metus sociis mauris. Morbi feugiat porttitor porta hendrerit aliquam lacus. Euismod convallis dignissim cubilia arcu faucibus placerat imperdiet Tempus. Consequat laoreet hymenaeos conubia suscipit rhoncus velit platea dis. Nec velit euismod tempor, vivamus augue sed massa nisl gravida integer tellus amet lacus volutpat euismod tincidunt. Orci lobortis quam. Egestas conubia netus." #summary.choices[0].message.content
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