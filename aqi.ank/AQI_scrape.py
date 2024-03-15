import pandas as pd
import camelot
from datetime import datetime, timedelta

def extract_aqi_data_from_pdf(pdf_file):
    try:
        # Extract tables from PDF
        tables = camelot.read_pdf(pdf_file, pages='all', strip_text='\n', flag_size=True)
        
        # Define headers
        def filter_df(df):
            df.columns = ['City', 'Air Quality', 'Index Value', 'Prominent Pollutant', 'No. of Monitoring Stations']
            df.reset_index(drop=True, inplace=True)
            return df
        
        # Extract data from tables
        table_list = []
        for num, table in enumerate(tables):
            if num < len(tables) - 1:
                table_df = table.df
                modified_df = table_df.drop(0).drop(0, axis=1)
                table_list.append(modified_df)
        
        # Concatenate dataframes
        df = pd.concat(table_list)
        df = df.pipe(filter_df)
        
        return df
    except Exception as e:
        print(f"Error occurred while extracting data: {e}")
        return None

def main():
    try:
        # Get the date for the day before the current day
        today = datetime.now().date()  # Get current date
        yesterday = today - timedelta(days=1)  # Calculate the date for yesterday
        date_str = yesterday.strftime("%Y%m%d")  # Format the date string
        
        # PDF file path
        file = f'aqi.ank/data/AQI_Bulletin_{date_str}.pdf'
        
        # Extract AQI data from PDF
        df = extract_aqi_data_from_pdf(file)
        
        if df is not None:
            # Add date 
            df['Date'] = date_str
            
            # Append new data to CSV file
            df.to_csv('AQI.csv', mode='a', header=False, index=False)
            
            print("Data extraction and appending to CSV completed successfully.")
        else:
            print("Failed to extract data from PDF.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
