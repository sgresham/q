import torch
import wave
from transformers import pipeline, AutoModelForSpeechSeq2Seq, AutoProcessor

# Check if CUDA is available
if torch.cuda.is_available():
    print("CUDA is available!")
    # Print the number of CUDA devices
    print("Number of CUDA devices:", torch.cuda.device_count())
    device = 'cuda'
else:
    print("CUDA is not available.")
    device = 'cpu'

# i am running P40s that dont support float16, you should change int8 to float16 if your card/s do support it
torch_dtype = torch.int8 if torch.cuda.is_available() else torch.float32

# Set up our Models
cheap_model_id = "distil-whisper/distil-large-v3"
expensive_model_id = "openai/whisper-large-v3"
model_id = cheap_model_id
# get your key here -> https://huggingface.co/pyannote/segmentation
VAD_AUTH_TOKEN = "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"
model = AutoModelForSpeechSeq2Seq.from_pretrained(
    model_id, torch_dtype=torch_dtype, low_cpu_mem_usage=True, use_safetensors=True
)
model.to(device)

processor = AutoProcessor.from_pretrained(model_id)

# Define Audio Constants

HOST = '0.0.0.0'
PORT = 8765
SAMPLING_RATE = 16000
AUDIO_CHANNELS = 1
SAMPLES_WIDTH = 2  # int16
DEBUG = False

async def transcribe_long(client_id, websocket, new_audio_data):
    global file_counters    # Add new audio data to the temporary buffer

    audio_data = new_audio_data

    # Initialize file counter for new clients
    if client_id not in file_counters:
        file_counters[client_id] = 0

    # File path
    file_name = f"{audio_dir}/{client_id}_{file_counters[client_id]}.wav"
    
    file_counters[client_id] += 1

    # Save the audio data
    with wave.open(file_name, 'wb') as wav_file:
        wav_file.setnchannels(AUDIO_CHANNELS)
        wav_file.setsampwidth(SAMPLES_WIDTH)
        wav_file.setframerate(SAMPLING_RATE)
        wav_file.writeframes(audio_data)

        if client_configs[client_id]['language'] is not None:
            result = recognition_pipeline(file_name, generate_kwargs={
                                          "language": client_configs[client_id]['language']})
        else:
            result = recognition_pipeline(file_name)

        print(f"Client ID {client_id}: Transcribed : {result['text']}")
        transcript.info(result['text'])

        if result['text']:
            await websocket.send(result['text'])
            # Clear temp buffer after processing
            client_temp_buffers[client_id].clear()
    
    # in the end always delete the created file
    os.remove(file_name)