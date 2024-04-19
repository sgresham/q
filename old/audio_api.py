from flask import Flask, request, jsonify
import numpy as np
import wave
import os
import time
import whisper

model = whisper.load_model("tiny.en")
app = Flask(__name__)

# Directory to save WAV files
SAVE_DIR = 'recordings'

# Ensure the directory exists
os.makedirs(SAVE_DIR, exist_ok=True)

@app.route('/save_audio', methods=['POST'])
def save_audio():
    # Receive audio data as a NumPy array
    audio_data = np.array(request.json['audio_data'], dtype=np.int16)
    
    # Create a WAV file path with a unique filename
    timestamp = int(time.time())
    filename = f"{timestamp}.wav"
    filepath = os.path.join(SAVE_DIR, filename)
    
    # Write the audio data to a WAV file
    with wave.open(filepath, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit audio
        wf.setframerate(16000)
        wf.writeframes(audio_data.tobytes())
    
    return 'Audio saved successfully.'

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    # Receive audio data as a NumPy array
    audio_data = np.array(request.json['audio_data'], dtype=np.int16)
    audio_data = audio_data.astype(np.float32) / 32768.0

    # Assuming sample_rate and num_channels are known
    # audio_data = audio_data.reshape((-1, CHANNELS))  # If the audio was stereo, for example
    
    # # Convert the bytes back to a NumPy array
    # audio = np.frombuffer(audio_bytes, np.int16).astype(np.float32)/ 32768.0
    # print(audio.shape)
    
    # # Perform transcriptions using OpenAI-Whisper
    # transcription = transcribe_with_whisper(audio)
    # print(audio_data.shape)
    transcription = transcribe_with_whisper(audio_data)
    return jsonify({'transcription': transcription})

def transcribe_with_whisper(audio_data):
        # load audio and pad/trim it to fit 30 seconds
    parsed_data = model.transcribe(audio_data, language='english', fp16=model.device )
    # Print the "text" parts
    for segment in parsed_data['segments']:
        print(segment['text'])

if __name__ == '__main__':
    app.run(debug=False)
