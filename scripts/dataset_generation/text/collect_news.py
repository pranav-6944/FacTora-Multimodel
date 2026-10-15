import os
import json
import uuid
from datetime import datetime

# Define paths relative to the project root
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
RAW_DATA_DIR = os.path.join(PROJECT_ROOT, 'datasets', 'raw', 'text')

def ensure_dirs():
    """Ensure that the necessary data directories exist."""
    os.makedirs(RAW_DATA_DIR, exist_ok=True)
    print(f"Verified directory exists: {RAW_DATA_DIR}")

def fetch_real_news():
    """Placeholder for fetching real news from an API or web scraper."""
    print("Fetching real news... (Placeholder)")
    # In the future, integrate NewsAPI, web scraping (BeautifulSoup), etc. here.
    return [
        {
            "id": str(uuid.uuid4()),
            "text": "The stock market reached an all-time high today as tech companies reported record earnings.",
            "label": "real",
            "source": "dummy_financial_news",
            "timestamp": datetime.now().isoformat()
        }
    ]

def fetch_fake_news():
    """Placeholder for fetching fake news."""
    print("Fetching fake news... (Placeholder)")
    # In the future, integrate scraping from known misinformation sites or synthetic generation.
    return [
        {
            "id": str(uuid.uuid4()),
            "text": "Scientists discover that drinking salt water cures all known ailments instantly.",
            "label": "fake",
            "source": "dummy_satire_site",
            "timestamp": datetime.now().isoformat()
        }
    ]

def save_data(data, filename):
    """Save the collected data to a JSON file."""
    filepath = os.path.join(RAW_DATA_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)
    print(f"Successfully saved {len(data)} records to {filepath}")

def main():
    print("Starting Text/News Dataset Pipeline...")
    ensure_dirs()
    
    # Fetch Data
    real_news = fetch_real_news()
    fake_news = fetch_fake_news()
    
    # Combine and save
    all_news = real_news + fake_news
    
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"news_batch_{timestamp_str}.json"
    
    save_data(all_news, output_filename)
    print("Pipeline execution complete.")

if __name__ == "__main__":
    main()
