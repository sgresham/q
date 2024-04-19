import numpy as np
import speech_recognition as sr
import noisereduce as nr

def speech_recognition_with_noise_reduction(speakers_data, mic_data, rate=16000, gain=10.0):
    # Convert loopback audio data (from speakers) to numpy array
    speakers_array = np.frombuffer(speakers_data, dtype=np.int16)

    # Convert microphone audio data to numpy array
    mic_array = np.frombuffer(mic_data, dtype=np.int16)

    # Make a copy of the array
    mic_array_boost = mic_array.copy()

    # Amplify the microphone audio
    mic_array_boost = (mic_array_boost * gain).astype(np.int16)

    # Apply noise reduction to the combined audio
    reduced_noise = nr.reduce_noise(y=mic_array_boost, y_noise=speakers_array, sr=rate, stationary=True, chunk_size=1024, padding=0)
    return np.frombuffer(reduced_noise, np.int16).flatten().astype(np.float32) / 32768.0

def convert_to_audio_data(audio_data_bytes, rate=16000):
    sample_width = 2  # Bytes per sample for paInt16 format
    return sr.AudioData(frame_data=audio_data_bytes, sample_rate=rate, sample_width=sample_width)

def speech_recognition_mic_only(mic_data, rate=16000, gain=10.0):

    # Convert microphone audio data to numpy array
    mic_array = np.frombuffer(mic_data, dtype=np.int16)

    # Make a copy of the array
    mic_array_boost = mic_array.copy()

    # Amplify the microphone audio
    mic_array_boost = (mic_array_boost * gain).astype(np.int16)

    # Apply noise reduction to the combined audio
    return np.frombuffer(mic_array_boost, np.int16).flatten().astype(np.float32) / 32768.0

def convert_to_audio_data(audio_data_bytes, rate=16000):
    sample_width = 2  # Bytes per sample for paInt16 format
    return sr.AudioData(frame_data=audio_data_bytes, sample_rate=rate, sample_width=sample_width)

