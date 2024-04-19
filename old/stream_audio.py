import pyaudio
import numpy as np
import requests

# Parameters
CHUNK = 1024 * 5
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
RECORD_SECONDS = 10
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

try:
    while True:
        audio_data_chunks = []
        for _ in range(int(RATE / CHUNK * RECORD_SECONDS)):
            data = stream.read(CHUNK)
            audio_data_chunks.append(data)
        
        # Concatenate the audio data chunks into a single NumPy array
        audio_data = np.concatenate([np.frombuffer(chunk, dtype=np.int16) for chunk in audio_data_chunks])
        # Transmit the current chunk of audio data to the API
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
