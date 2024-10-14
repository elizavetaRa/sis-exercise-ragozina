import requests
from celery import shared_task
from api.models import Literature
from datetime import datetime
from elasticsearch.helpers import BulkIndexError

INSPIREHEP_API_URL = "https://inspirehep.net/api/literature"
PAGE_SIZE = 40

@shared_task
def harvest_literature():
    """Harvest papers from the INSPIREHEP API based on a search query and save titles, abstracts, and other information."""
    print("Fetching literature...")
    
    papers = fetch_literature()
    if papers:
        for paper in papers:
            metadata = extract_metadata(paper)
            publication_date = parse_publication_date(metadata.get("year"))
            save_literature(metadata, publication_date)

def fetch_literature():
    """Fetch literature from the INSPIREHEP API."""
    response = requests.get(f"{INSPIREHEP_API_URL}?sort=mostrecent&size={PAGE_SIZE}&page=1")
    if response.status_code == 200:
        return response.json().get("hits", {}).get("hits", [])
    else:
        print(f"Failed to fetch papers: {response.status_code}, {response.text}")
        return None

def extract_metadata(paper):
    """Extract relevant metadata from a paper."""
    metadata = paper.get("metadata", {})

    # Extract publication year
    publication_info = metadata.get("publication_info", [])
    year = publication_info[0].get("year") if publication_info else None # Safely access year

    return {
        "title": metadata.get("titles", [{}])[0].get("title", ""),
        "abstract": metadata.get("abstracts", [{}])[0].get("value", ""),
        "arxiv_id": metadata.get("arxiv_eprint", None),
        "year": year
    }

def parse_publication_date(publication_year):
    """Parse the publication year into a date object."""

   

    if publication_year:
         
        # Original date string: contsraint: it requires month and day but only year is provided
        dt_string = str("01/01/" + str(publication_year))

        # Convert to datetime object
        dt_object = datetime.strptime(dt_string, "%d/%m/%Y")
        try:
            return dt_object.strftime("%Y-%m-%d")
        except ValueError:
            return None
    return None

def save_literature(metadata, publication_date):
    """Save literature to the database, updating if necessary."""
    try:
        Literature.objects.update_or_create(
            title=metadata["title"],
            defaults={
                "abstract": metadata["abstract"],
                "arxiv_id": metadata["arxiv_id"],
                "publication_date": publication_date,
            },
        )
    except BulkIndexError as e:
        print(f"Failed to index document: {e}")
        for error in e.errors:
            print(f"Error details: {error}")
    except Exception as e:
        print(f"Unexpected error while saving literature: {e}")
