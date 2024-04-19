import speech_recognition as sr
import pyaudio

print(f"Found by SR {sr.Microphone.list_working_microphones()} \n")


def print_input_devices():
    p = pyaudio.PyAudio()
    num_devices = p.get_device_count()
    
    print("Available input devices:")
    for i in range(num_devices):
        device_info = p.get_device_info_by_index(i)
        if device_info["maxInputChannels"] > 0:
            print(f"Device {i}: {device_info['name']}")

    p.terminate()

print_input_devices()