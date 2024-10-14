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
from elasticsearch.exceptions import ConnectionError, NotFoundError, RequestError
import openai
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

    def mock_openai_summarize(self):
        return ("In recent studies on quantum mechanics, researchers have made significant strides in quantum computing, "
                "specifically in the development of qubits that hold potential for unprecedented computational power. "
                "Additionally, advancements in quantum entanglement have sparked new discussions about secure quantum "
                "communication networks, which could revolutionize data encryption. Quantum field theory continues to explore "
                "particle interactions at subatomic levels, leading to deeper insights into fundamental forces. The field of "
                "quantum cryptography also shows promise, offering enhanced security measures through quantum key distribution, "
                "thus opening new frontiers in both theoretical research and practical applications.")

    def search_elasticsearch(self, search_query, offset, limit):
        """
        Handles the Elasticsearch search logic.
        """
        try:
            search = LiteratureDocument.search().query(
                "multi_match", query=search_query, fields=["title", "abstract"]
            )
            # Apply pagination
            search = search[offset: offset + limit]
            results = search.execute()
            return results
        except ConnectionError:
            return Response(
                {"error": "Unable to connect to the search engine. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except NotFoundError:
            return Response(
                {"error": "Search engine returned no results."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except RequestError:
            return Response(
                {"error": "There was an error with the search query. Please check your query and try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def generate_openai_summary(self, results):
        """
        Handles the OpenAI summary generation logic.
        """

        # Check if mock_openai is set to true in environment variables
        mock_openai = os.getenv('MOCK_OPENAI', 'false').lower() == 'true'
        openai_sum_count = os.getenv('OPENAI_SUM_COUNT', 200)

        if mock_openai:
            # Return mock data if the environment variable is set
            return self.mock_openai_summarize()

        prompt = f"I give you the list of article titles with abstracts. Please make a concise summary as an overview of length no more than {openai_sum_count} words of the given information: "
        prompt += " ".join([f"Title: {result.title}, Abstract: {result.abstract}" for result in results])

        try:
            summary = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
            )

            

            return summary
        

        except openai.APIError as e:
            #Handle API error here, e.g. retry or log
            print(f"OpenAI API returned an API Error: {e}")
            pass
        except openai.APIConnectionError as e:
            #Handle connection error here
            print(f"Failed to connect to OpenAI API: {e}")
            pass
        except openai.RateLimitError as e:
            #Handle rate limit error (we recommend using exponential backoff)
            print(f"OpenAI API request exceeded rate limit: {e}")
            pass

    def list(self, request):
        search_query = request.query_params.get("q", "")
        offset = int(request.query_params.get("offset", 0))  # Default offset
        limit = int(request.query_params.get("limit", 10))   # Default limit

        # Search in Elasticsearch
        results = self.search_elasticsearch(search_query, offset, limit)
        if isinstance(results, Response):
            return results  # Return the error response if search failed

        # Generate OpenAI summary
        response = None
        if results and len(results.hits.hits) > 0:  # Check if results are not empty
            response = self.generate_openai_summary(results)
            if isinstance(response, Response):
                return response  # Return the error response if summary generation failed

        # Serialize the results
        serializer = LiteratureSerializer(results, many=True)

        # Get the total count of results before pagination
        total_count = results.hits.total.value

        return Response(
            {
                "search_query": search_query,
                "summary": response,
                "data": serializer.data,
                "count": total_count,
                "offset": offset,
                "limit": limit,
            },
            status=status.HTTP_200_OK
        )