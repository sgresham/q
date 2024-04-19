import pyaudio
import numpy as np
import requests
import time
from collections import deque

# Parameters
CHUNK = 1024 * 5
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
BUFFER_SIZE = 10 * RATE  # Buffer size in frames (10 seconds)
RECORD_SECONDS = 2
API_URL = 'http://localhost:5000/transcribe'

# Open the microphone and set up the audio stream
p = pyaudio.PyAudio()
stream = p.open(format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK,
                input_device_index=5)

print("Recording...")

# Initialize buffers
num_buffers = 5
buffers = [[] for _ in range(10)]
buffer_initialization = True

try:
    while buffer_initialization == True:
        print('Initializing')
        length = 10
                    # Read audio data from the microphone stream
        audio_data_chunks = []
        for _ in range(int(RATE / CHUNK * RECORD_SECONDS)):
            data = stream.read(CHUNK)
            audio_data_chunks.append(data)
        captured_audio_data = np.concatenate([np.frombuffer(chunk, dtype=np.int16) for chunk in audio_data_chunks])

        for x in range (num_buffers):

            if length > 0:
                buffers[x].append(captured_audio_data)
            length = len(buffers[x])
        if len(buffers[0]) == num_buffers:
            buffer_initialization = False
            print("Buffer initialized")
            print("First sample sent for processing")
            # Concatenate the audio data chunks into a single NumPy array
            audio_data = np.concatenate([np.frombuffer(chunk, dtype=np.int16) for chunk in buffers[0]])
            print(f"Length of audioData: {audio_data.shape}")
            buffers[0].clear()
            response = requests.post(API_URL, json={'audio_data': audio_data.tolist()})
            if response.status_code != 200:
                print("Error sending audio data:", response.text)
            print(audio_data)

    while buffer_initialization == False:
        print("processing")
                    # Read audio data from the microphone stream
        audio_data_chunks = []
        for _ in range(int(RATE / CHUNK * RECORD_SECONDS)):
            data = stream.read(CHUNK)
            audio_data_chunks.append(data)
        captured_audio_data = np.concatenate([np.frombuffer(chunk, dtype=np.int16) for chunk in audio_data_chunks])

        for x in range (num_buffers):

            buffers[x].append(captured_audio_data)
            length = len(buffers[x])
            if length == num_buffers:
                audio_data = np.concatenate([np.frombuffer(chunk, dtype=np.int16) for chunk in buffers[x]])
                print(f"Length of audioData: {audio_data.shape}")
                buffers[x].clear()
                response = requests.post(API_URL, json={'audio_data': audio_data.tolist()})
                if response.status_code != 200:
                    print("Error sending audio data:", response.text)

except KeyboardInterrupt:
    print("Recording stopped by user.")

finally:
    # Close the audio stream
    stream.stop_stream()
    stream.close()
    p.terminate()



        