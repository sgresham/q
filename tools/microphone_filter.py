import pyaudio
import numpy as np
import speech_recognition as sr
import noisereduce as nr

# Parameters
CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
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

# Initialize recognizer
recognizer = sr.Recognizer()

while True:
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

    # Combine speakers and microphone audio
    combined_array = speakers_array + mic_array

    # Apply noise reduction to the combined audio
    reduced_noise = nr.reduce_noise(y=mic_array_boost, y_noise=speakers_array, sr=RATE, stationary=True, chunk_size=1024, padding=0)

    # Convert the reduced noise array back to bytes
    reduced_noise_bytes = reduced_noise.tobytes()

    # Pass the reduced noise audio to the recognizer
    with sr.AudioData(reduced_noise_bytes, RATE, FORMAT) as audio_data:
        try:
            # Use recognizer to transcribe speech
            text = recognizer.recognize_google(audio_data)
            print("Recognized speech:", text)
        except sr.UnknownValueError:
            print("Speech not recognized")
        except sr.RequestError as e:
            print("Could not request results from Google Speech Recognition service; {0}".format(e))
