import pywifi
import time
import requests
import csv
import re
from datetime import datetime
import vonage

api_key = 'c8588b6778b94c1da71c7c90926bccf4'

def get_address(latitude, longitude):
    url = f'https://api.geoapify.com/v1/geocode/reverse?lat={latitude}&lon={longitude}&apiKey={api_key}'
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if 'features' in data and data['features']:
            address = data['features'][0]['properties']['formatted']
            return address
    return None


def connect_to_wifi(ssid, password):
    try:
        # Interface selection
        wifi = pywifi.PyWiFi()
        iface = wifi.interfaces()[0]  # Replace with the index of your WiFi interface if needed

        # Connect to a specific network
        profile = pywifi.Profile()
        profile.ssid = ssid
        profile.auth = pywifi.const.AUTH_ALG_OPEN  # Change if required (e.g., AUTH_ALG_WPA2PSK)
        profile.akm.append(pywifi.const.AKM_TYPE_WPA2PSK)  # Add AKM type for WPA2 networks
        profile.cipher = pywifi.const.CIPHER_TYPE_CCMP  # Set cipher type
        profile.key = password

        iface.remove_all_network_profiles()
        tmp_profile = iface.add_network_profile(profile)
        iface.connect(tmp_profile)

        # Check connection status
        time.sleep(5)  # Wait for a few seconds before checking
        if iface.status() == pywifi.const.IFACE_CONNECTED:
            print("Connected to WiFi successfully!")
            return True
        else:
            print("Connection failed.")
            return False

    except Exception as e:
        print(f"Error connecting to WiFi: {e}")
        return False


# Define the target URL for sensor and GPS data
url = "http://192.168.4.1/"

# Example Usage (replace with your credentials)
ssid = "MyServoControl"
password = "12345678"

# New credentials
new_ssid = "Redmi"
new_password = "hello123"

while True:
    if connect_to_wifi(ssid, password):
        try:
            # Send a GET request to the sensor data URL
            response = requests.get(url)
            response.raise_for_status()  # Raise an exception for unsuccessful requests

            # Get the webpage content
            content = response.text

            # Extract sensor distances and GPS data using regular expressions (unchanged)
            sensor1_match = re.search(r"Distance \(Sensor 1\): (\d+) cm", content)
            sensor2_match = re.search(r"Distance \(Sensor 2\): (\d+) cm", content)
            latitude_match = re.search(r"Latitude: ([\d.-]+)", content)  # Capture latitude with decimals
            longitude_match = re.search(r"Longitude: ([\d.-]+)", content)  # Capture longitude with decimals

            if sensor1_match and sensor2_match and latitude_match and longitude_match:
                sensor1_distance = int(sensor1_match.group(1))
                sensor2_distance = int(sensor2_match.group(1))
                latitude = float(latitude_match.group(1))
                longitude = float(longitude_match.group(1))

                now = datetime.now()
                timestamp = now.strftime("%Y-%m-%d %H:%M:%S")

                status = ""
                if sensor1_distance > 20 and sensor2_distance > 20:
                    status = "Bin Empty"
                elif sensor1_distance < 20 and sensor2_distance < 20:
                    status = "Bin Filled"
                elif sensor1_distance < 20 and sensor2_distance >= 20:
                    status = "Bin partially filled"
                elif sensor1_distance >= 20 and sensor2_distance < 20:
                    status = "Bin partially filled"
                else:
                    status = "status unknown"

                # Check for duplicate latitude and longitude before writing to CSV
                duplicate_found = False
                with open("sensor_data.csv", "r") as csvfile:
                    reader = csv.reader(csvfile)
                    next(reader)  # Skip the header row
                    for row in reader:
                        existing_latitude, existing_longitude = row[0], row[1]
                        if latitude == existing_latitude and longitude == existing_longitude:
                            duplicate_found = True
                            break

                # Process and utilize the data (sensor distances and GPS coordinates)
                if not duplicate_found:
                    print(f"Latitude: {latitude}")
                    print(f"Longitude: {longitude}")
                    print(f"Sensor 1 Distance: {sensor1_distance} cm")
                    print(f"Sensor 2 Distance: {sensor2_distance} cm")
                    print(f"status: {status}")
                    print(f"timestamp: {timestamp} cm")

                    # Optional: Save data to CSV (modify as needed)
                    with open("sensor_data.csv", "a", newline="") as csvfile:
                        writer = csv.writer(csvfile)
                        if not duplicate_found:  # Only write if not a duplicate
                            writer.writerow([latitude, longitude, sensor1_distance, sensor2_distance, status, timestamp])

        except requests.exceptions.RequestException as e:
            print(f"Error scraping webpage: {e}")

    # Wait for some time
    time.sleep(5)

    # Connect to the new network
    if connect_to_wifi(new_ssid, new_password):
        with open("sensor_data.csv", "r") as csvfile:
            reader = csv.reader(csvfile)
            next(reader)  # Skip the header row
            last_row = None
            for row in reader:
                last_row = row  # Keep updating last_row with the current row

        if last_row is not None:
            # Push the last row to Supabase
            latitude, longitude, sensor1_distance, sensor2_distance, status, timestamp = last_row
            data = {
                "latitude": latitude,
                "longitude": longitude,
                "sensor1_distance": sensor1_distance,
                "sensor2_distance": sensor2_distance,
                "status": status,
                "timestamp": timestamp,
            }
            supabase_url = "https://xzesgzaoewbtbiivxcal.supabase.co/rest/v1/wastedata"
            headers = {
                "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZXNnemFvZXdidGJpaXZ4Y2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA1MjE3ODksImV4cCI6MjAyNjA5Nzc4OX0.D5II1tvD3grGOoNwMkDsibaFBR1TvitYz5J5b8RIi7k",
                "Content-Type": "application/json",
            }
            response = requests.post(supabase_url, headers=headers, json=data)
            if response.status_code == 201:
                print(f"Pushed data to Supabase: {data}")
            else:
                print(f"Failed to push data to Supabase: {response.content}")


            if status == "Bin Filled":
                latitude = latitude
                longitude = longitude
                address = get_address(latitude, longitude)
                if address:
                    print(f"Address: {address}")
                else:
                    print("Failed to fetch address.")

                client = vonage.Client(key="2f4a1b8f", secret="IrZszE0IqVimlwir")
                sms = vonage.Sms(client)
                responseData = sms.send_message(
                    {
                        "from": "ANK.data",
                        "to": "918252851022",
                        "text": f"the dustbin at latitude: {latitude}, longitude: {longitude} and address: {address} has been filled please empty it.",
                    }
                )

                if responseData["messages"][0]["status"] == "0":
                    print("Message sent successfully.")
                else:
                    print(f"Message failed with error: {responseData['messages'][0]['error-text']}")



    # Wait for some time
    time.sleep(5)