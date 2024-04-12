import pyaudio
import numpy as np
import noisereduce as nr
import wave

# Parameters
CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
RECORD_SECONDS = 10
OUTPUT_SPEAKERS_FILENAME = "speakers.wav"
OUTPUT_MIC_FILENAME = "microphone.wav"
OUTPUT_COMBINED_FILENAME = "combined.wav"
GAIN = 10.0  # Amplification factor

# Create a PyAudio object
p = pyaudio.PyAudio()

# Open a stream for loopback audio (input from speakers)
stream_speakers = p.open(format=FORMAT,
                          channels=CHANNELS,
                          rate=RATE,
                          input=True,
                          frames_per_buffer=CHUNK,
                          input_device_index=5)  # Adjust the input device index accordingly

# Open a stream for microphone input
stream_mic = p.open(format=FORMAT,
                     channels=CHANNELS,
                     rate=RATE,
                     input=True,
                     frames_per_buffer=CHUNK,
                     input_device_index=2)  # Adjust the input device index accordingly

frames_speakers = []
frames_mic = []
frames_combined = []

try:
    for i in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
        # Read loopback audio data (from speakers)
        speakers_data = stream_speakers.read(CHUNK)

        # Read microphone audio data
        mic_data = stream_mic.read(CHUNK)

        # Convert loopback audio data (from speakers) to numpy array
        speakers_array = np.frombuffer(speakers_data, dtype=np.int16)

        # Convert microphone audio data to numpy array
        mic_array = np.frombuffer(mic_data, dtype=np.int16)

        # Make a copy of the array
        mic_array_boost = mic_array.copy()

        # Amplify the microphone audio
        mic_array_boost = (mic_array_boost * GAIN).astype(np.int16)

        frames_mic.append(mic_array_boost.tobytes())

        # Combine speakers and microphone audio
        combined_array = speakers_array + mic_array

        # Apply noise reduction to the combined audio
        # reduced_noise = nr.reduce_noise(y=combined_array, sr=RATE, stationary=True, chunk_size=1024,padding=0)
        reduced_noise = nr.reduce_noise(y=mic_array_boost, y_noise=speakers_array, sr=RATE, stationary=True, chunk_size=1024,padding=0)
        frames_speakers.append(speakers_data)
        # frames_mic.append(mic_data)
        frames_combined.append(reduced_noise.tobytes())

except KeyboardInterrupt:
    print("Recording interrupted")

finally:
    print("Recording finished")

    # Close the streams
    stream_speakers.stop_stream()
    stream_speakers.close()
    stream_mic.stop_stream()
    stream_mic.close()
    p.terminate()

    # Write the recorded audio to WAV files
    wf = wave.open(OUTPUT_SPEAKERS_FILENAME, 'wb')
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(p.get_sample_size(FORMAT))
    wf.setframerate(RATE)
    wf.writeframes(b''.join(frames_speakers))
    wf.close()
    print("Speakers audio saved to", OUTPUT_SPEAKERS_FILENAME)

    wf = wave.open(OUTPUT_MIC_FILENAME, 'wb')
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(p.get_sample_size(FORMAT))
    wf.setframerate(RATE)
    wf.writeframes(b''.join(frames_mic))
    wf.close()
    print("Microphone audio saved to", OUTPUT_MIC_FILENAME)

    wf = wave.open(OUTPUT_COMBINED_FILENAME, 'wb')
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(p.get_sample_size(FORMAT))
    wf.setframerate(RATE)
    wf.writeframes(b''.join(frames_combined))
    wf.close()
    print("Combined audio saved to", OUTPUT_COMBINED_FILENAME)
