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
import torch

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
        if not response:
            # If response is empty (indicating an error in the API call), log and return
            logger.error("Failed to get a valid response from the API.")
            return

        if len(response) == 0:
            # If response is empty, log and return
            logger.error("No model response found in the API response.")
            return

        model_response = response[0].get('model_response')
        if model_response is None:
            # If model response is None, log and return
            logger.error("No model response found in the API response.")
            return

        # Store the query and full_response in the conversation history
        self.conversation_history.append({'user_prompt': query, 'model_response': model_response})
        # Log the full response
        logger.info(model_response)
    
    def quick_llm(self, query):
        response = query_api(query, None)
        if not response:
            # If response is empty (indicating an error in the API call), log and return
            logger.error("Failed to get a valid response from the API.")
            return

        if len(response) == 0:
            # If response is empty, log and return
            logger.error("No model response found in the API response.")
            return

        model_response = response[0].get('model_response')
        if model_response is None:
            # If model response is None, log and return
            logger.error("No model response found in the API response.")
            return

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

            output = recognizer.recognize_whisper(audio, model= "tiny.en", language="english")
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

    def start_listener(self):
        print("Starting trigger listener")
        self.recognizer.pause_threshold = 0.5

        print('--- Optimizing for ambient noise. Please wait 5 seconds ---')
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=5.0)
        print('--- Ok. Ready for voice ---')
        self.stop_listening = self.recognizer.listen_in_background(self.microphone, self.just_decode)
        
        # Keep the listener active until is_trigger_listener_active is set
        while self.is_trigger_listener_active.is_set():
            time.sleep(0.1)

        print("TriggerListener finished!")

if __name__ == "__main__":
    setup_logging()
    logger.info("Lets get this party started")
    state = ListenerState()
    while state.listening_enabled:
        TriggerListener(state)
        print("TriggerListener main thread finished! 1")
