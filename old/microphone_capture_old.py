import logging
import logging.config
import pathlib
import json
import time
import speech_recognition as sr
import re
import threading
from llm_integration.private_gpt import query_api
from tools.extract_log_chat import getlogsbyduration
from recognize_speech import speech_recognition_with_noise_reduction, speech_recognition_mic_only
import torch
import pyaudio
import numpy as np
import noisereduce as nr
import whisper

# Parameters
CHUNK = 16000*5
FORMAT = pyaudio.paInt16
FORMATOUT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
GAIN = 10.0  # Amplification factor

logger = logging.getLogger('q_root')
print (torch.cuda.is_available())

class ListenerState:
    def __init__(self):
        self.listening_enabled = True

    def disable_listening(self):
        self.listening_enabled = False

def setup_logging():
    config_file = pathlib.Path("log_config/config.json")
    with open(config_file) as f_in:
        config = json.load(f_in)
    logging.config.dictConfig(config)

class TriggerListener:
    def __init__(self, state):
        self.conversation_history = []  # Initialize an empty list to store conversation history
        self.state = state
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.is_trigger_listener_active = threading.Event()  # Event to signal listener activity
        self.is_trigger_listener_active.set()  # Set event initially to True
        self.start_listener()

    def stop_listen_for_trigger(self):
        print("Stopping listener for trigger")
        self.stop_listening(wait_for_stop=False)
        self.is_trigger_listener_active.clear()  # Clear the event to signal listener deactivation
        self.state.disable_listening()  # Set listening_enabled to False

    def manage_llm(self, query):
        response = query_api(query, self.get_conversation_history_string())
        model_response = response[0]['model_response']
        # Store the query and full_response in the conversation history
        self.conversation_history.append({'user_prompt': query, 'model_response': model_response})
        # Log the full response
        logger.info(model_response)
    
    def quick_llm(self, query):
        response = query_api(query, None)
        model_response = response[0]['model_response']
        # Log the full response
        logger.info(model_response)

    def print_conversation_history(self):
        print("Conversation History:")
        for conversation in self.conversation_history:
            print("user_prompt: ", conversation['user_prompt'])
            print("model_response: ", conversation['model_response'])
            print()
    
    def get_conversation_history_string(self):
        conversation_string = ""
        for conversation in self.conversation_history:
            conversation_string += "\nuser_prompt: ".format(conversation['user_prompt'])
            conversation_string += "\nmodel_response: ".format(conversation['model_response'])
        return conversation_string
    
    def get_transcript_by_duration(self, length):
        getlogsbyduration(length)
    
    def summarize_transcript_by_duration(self):
        transcript = self.get_transcript_by_duration(5)
        self.quick_llm(transcript)

    def just_decode(self, recognizer, audio):
        try:
            # Regular expression pattern for shutdown
            shutdown_pattern = r'\b(shut\s?down|power\s?off|terminate)\b'
            # Regular expression pattern for conversation history
            llm_history_pattern = r'\b(conversation\s?history|chat\s?log)\b'
            # Regular expression pattern for retrieving transcript history
            transcription_history_pattern = r'\btranscri(?:be|pt)|5\s*minutes\s*summary\b'
            summarize_transcript_pattern = r'\bsummar(?:ize|y)\b'

            output = recognizer.recognize_whisper(audio, model= "medium.en", language="english")
            logger.info(output)
            if 'alfred' in output.lower(): 
                if re.search(shutdown_pattern, output, re.IGNORECASE):
                    self.stop_listen_for_trigger()
                if re.search(llm_history_pattern, output, re.IGNORECASE):
                    self.print_conversation_history()
                if re.search(transcription_history_pattern, output, re.IGNORECASE):
                    self.get_transcript_by_duration(5)
                if re.search(summarize_transcript_pattern, output, re.IGNORECASE):
                    self.summarize_transcript_by_duration()
                else:
                    self.manage_llm(output)
        except sr.UnknownValueError:
            print("Whisper could not understand audio")
        except sr.RequestError as e:
            print("Whisper error; {0}".format(e))

    def adjust_for_ambient_noise_with_live_microphone(self):
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source)

    def start_listener(self):
        model = whisper.load_model("medium.en")
        print("Starting trigger listener")
        self.recognizer.pause_threshold = 0.5

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

        while True:
            data = stream_mic.read(CHUNK)
            audio = np.frombuffer(data, np.int16).astype(np.float32)/ 32768.0

            # load audio and pad/trim it to fit 30 seconds
            #audio = whisper.load_audio("/home/paul/temp.wav")
            audio = whisper.pad_or_trim(audio)

            # make log-Mel spectrogram and move to the same device as the model
            mel = whisper.log_mel_spectrogram(audio).to(model.device)

            # decode the audio
            options = whisper.DecodingOptions(fp16=False, language='english')
            result = whisper.decode(model, mel, options)

            # print the recognized text
            print(result.text)


if __name__ == "__main__":
    setup_logging()
    logger.info("Lets get this party started")
    state = ListenerState()
    while state.listening_enabled:
        TriggerListener(state)
        print("TriggerListener main thread finished! 1")
