import pyaudio
import numpy as np
import noisereduce as nr
import wave

# Parameters
CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 2
RATE = 16000
RECORD_SECONDS = 10
OUTPUT_FILENAME = "output.wav"

# Create a PyAudio object
p = pyaudio.PyAudio()

# Open a stream for loopback audio (input from speakers)
stream = p.open(format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK,
                input_device_index=5)  # Adjust the input device index accordingly

frames = []

try:
    for i in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
        # Read loopback audio data
        loopback_data = stream.read(CHUNK)

        # Convert loopback audio data to numpy array
        loopback_array = np.frombuffer(loopback_data, dtype=np.int16)

        # Apply noise reduction to the loopback audio
        reduced_noise = nr.reduce_noise(y=loopback_array, sr=RATE)

        frames.append(reduced_noise.tobytes())

except KeyboardInterrupt:
    print("Recording interrupted")

finally:
    print("Recording finished")

    # Close the stream
    stream.stop_stream()
    stream.close()
    p.terminate()

    # Write the recorded audio to a WAV file
    wf = wave.open(OUTPUT_FILENAME, 'wb')
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(p.get_sample_size(FORMAT))
    wf.setframerate(RATE)
    wf.writeframes(b''.join(frames))
    wf.close()

    print("Audio saved to", OUTPUT_FILENAME)
