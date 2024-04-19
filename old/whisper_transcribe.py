
from flask import Flask, request, jsonify
import whisper
import numpy as np
import wave

app = Flask(__name__)

# Parameters
CHUNK = 1024*5
# FORMAT = pyaudio.paInt16
# FORMATOUT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
GAIN = 10.0  # Amplification factor

model = whisper.load_model("medium.en")
print("Starting trigger listener")

@app.route('/transcribe', methods=['POST'])

def transcribe_audio():
    audio_bytes = request.data

    # Assuming audio_bytes contains the received audio data
    audio_data = np.frombuffer(audio_bytes, dtype=np.int16)
    audio_data = audio_data.astype(np.float32) / 32768.0

    # Assuming sample_rate and num_channels are known
    audio_data = audio_data.reshape((-1, CHANNELS))  # If the audio was stereo, for example
    
    # # Convert the bytes back to a NumPy array
    # audio = np.frombuffer(audio_bytes, np.int16).astype(np.float32)/ 32768.0
    # print(audio.shape)
    
    # # Perform transcriptions using OpenAI-Whisper
    # transcription = transcribe_with_whisper(audio)
    print(audio_data.shape)
    transcription = transcribe_with_whisper(audio_data)
    return jsonify({'transcription': transcription})

# def transcribe_with_whisper(audio_data):
#         # load audio and pad/trim it to fit 30 seconds
#     audio = whisper.pad_or_trim(audio_data)

#     # make log-Mel spectrogram and move to the same device as the model
#     mel = whisper.log_mel_spectrogram(audio).to(model.device)

#     # decode the audio
#     options = whisper.DecodingOptions(fp16=False, language='english')
#     result = whisper.decode(model, mel, options)

#     # print the recognized text
#     print(result.text)

#     # Extract transcribed text
#     transcribed_text = result.text

#     return transcribed_text

if __name__ == '__main__':
    app.run(debug=True)
