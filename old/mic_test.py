# Microphone Recorder with WAV Recording

# Import the necessary libraries
import pyaudio
import argparse
import numpy as np
import wave
import time

# Parameters
CHUNK = 1024 * 5
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
RECORD_SECONDS = 10  # Duration of recording in seconds

# Parse the command line arguments
parser = argparse.ArgumentParser()
parser.add_argument("-d", "--device", required=True, help="input device number")
parser.add_argument("-o", "--output", required=True, help="output WAV file name")
args = parser.parse_args()

# Convert arg device from string to integer and error if it is not an integer and terminate the program
try:
    device = int(args.device)
except ValueError:
    device = args.device
    raise ValueError("Invalid device number. Must be an integer.")

# Open the microphone and set up the audio stream
p = pyaudio.PyAudio()
print('device:', isinstance(device, int))
stream = p.open(format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK,
                input_device_index=device)

# Open the output WAV file for writing
wf = wave.open(args.output, 'wb')
wf.setnchannels(CHANNELS)
wf.setsampwidth(p.get_sample_size(FORMAT))
wf.setframerate(RATE)

print("Recording...")

# Record audio until the specified duration is reached
start_time = time.time()
while time.time() - start_time < RECORD_SECONDS:
    data = stream.read(CHUNK)
    wf.writeframes(data)

print("Finished recording.")

# Close the audio stream and WAV file
stream.stop_stream()
stream.close()
wf.close()

# Terminate PyAudio
p.terminate()