import requests
import pyaudio

text_to_tts = "The conversation is between Tracy and Steve, who are discussing a suspicious email that Tracy received. Tracy is nervous and unsure about what to do with the email, which appears to be trying to gather information about her browsing history. Steve is helping Tracy understand how to view her browser history on her computer and sharing his screen to show her how to do it.Tracy is concerned that someone may be trying to hack into her computer or gather personal information from her browsing history. She mentions that she was looking at buying a dog online around the time of the suspicious email, which makes her think that maybe someone is trying to gather more information about her Steve reassures Tracy that it's likely just a legitimate IT issue and not necessarily malicious. He suggests taking a screenshot of the browser history and sending it to the cyber team for further investigation. Tracy agrees and thanks Steve for his help. The conversation ends with Tracy feeling relieved and grateful for Steve's assistance"

# Configuration
SERVER_URL = "http://localhost:8000/tts"
AUDIO_FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 24000  # coqui (24000), azure (16000), openai (22050), system (22050)
CHUNK_SIZE = 1024

# Initialize PyAudio
pyaudio_instance = pyaudio.PyAudio()
stream = pyaudio_instance.open(format=AUDIO_FORMAT, channels=CHANNELS, rate=RATE, output=True)

# Function to play audio stream
def play_audio(response):
    for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
        if chunk:
            stream.write(chunk)

# Function to request text-to-speech conversion
def request_tts(text):
    response = requests.get(SERVER_URL, params={"text": text}, stream=True)
    play_audio(response)

# Test the client
try:
    request_tts(text_to_tts)
finally:
    stream.stop_stream()
    stream.close()
    pyaudio_instance.terminate()