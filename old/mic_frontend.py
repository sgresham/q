# Microphone Recorder 

# Import the necessary libraries
import pyaudio
import argparse
import requests
import numpy as np

# Parameters
CHUNK = 1024*5
FORMAT = pyaudio.paInt16
FORMATOUT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
GAIN = 10.0  # Amplification factor



# Parse the command line arguments
parser = argparse.ArgumentParser()
parser.add_argument("-d", "--device", required=True, help="input device number")
parser.add_argument("-a", "--api", required=True, help="external API to stream audio to")
args = parser.parse_args()

# convert arg device from string to integer and error if it is not an integer and terminate the program
try:
    device = int(args.device)
except ValueError:
    device = args.device
    raise ValueError("Invalid device number. Must be an integer.")


# Open the microphone and set up the audio stream
p = pyaudio.PyAudio()
print('device:',isinstance(device, int))
stream = p.open(format=FORMAT,
                                channels=CHANNELS,
                                rate=RATE,
                                input=True,
                                frames_per_buffer=CHUNK,
                                input_device_index=device) 

# Start the audio capture loop
while True:
    # Read a block of audio data from the microphone
    data = stream.read(CHUNK)
    audio = np.frombuffer(data, np.int16).astype(np.float32)/ 32768.0
    print(audio.shape)
    # Convert the audio data to bytes
    audio_bytes = audio.tobytes()
    print(len(audio_bytes))

    # Send the audio data to the external API
    response = requests.post(args.api, data=audio_bytes)
    
    if response.status_code != 200:
        print("Error sending audio data:", response.text)
        break
