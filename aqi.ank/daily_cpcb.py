from datetime import datetime, timedelta
import os
import requests
import pandas as pd

# Date
today = datetime.today()
date_str = today.strftime("%Y%m%d")

# Functions
def download_file(date_str):
    """
    Download AQI Bulletin PDF file for a specific date.
    """
    file_url = f"https://cpcb.nic.in//upload/Downloads/AQI_Bulletin_{date_str}.pdf"
    filename = f"AQI_Bulletin_{date_str}.pdf"
    response = requests.get(file_url)
    
    with open(os.path.join("aqi.ank/data/", filename), "wb") as f:
        f.write(response.content)

# Get current date
today = datetime.now().date()  # Get current date
yesterday = today - timedelta(days=1)  # Calculate the date for yesterday
date_str = yesterday.strftime("%Y%m%d")  # Format the date string

download_file(date_str)


