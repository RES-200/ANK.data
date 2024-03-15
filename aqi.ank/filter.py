import pandas as pd

def filter_aqi_data(aqi_file, cities_file, output_file):
    # Load the AQI data with 'City' as the first column
    aqi_data = pd.read_csv(aqi_file, header=None, names=['City', 'Air Quality', 'Index Value', 'Prominent Pollutant', 'No. of Monitoring Stations', 'Date'])

    # Remove duplicates from the AQI data
    aqi_data.drop_duplicates(inplace=True)

    # Load the cities
    cities = pd.read_csv(cities_file)

    # Filter AQI data based on cities listed in the second CSV file
    filtered_data = aqi_data[aqi_data['City'].isin(cities['City Names'])]

    # Save the filtered data into the output file
    filtered_data.to_excel(output_file, index=False)

if __name__ == "__main__":
    
    aqi_file = r"C:\Users\falcon\Desktop\ANK.data\aqi.ank\AQI.csv"
    cities_file = r"C:\Users\falcon\Desktop\ANK.data\aqi.ank\data\cities.csv"
    output_file = r"C:\Users\falcon\Desktop\ANK.data\aqi.ank\data\filter.xlsx"
    # Filter AQI data
    filter_aqi_data(aqi_file, cities_file, output_file)
