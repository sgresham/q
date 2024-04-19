import logging
import logging.config
import pathlib
import json
import time
import speech_recognition as sr
import re

logger = logging.getLogger('q_root')

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
        self.state = state
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone(device_index=19)
        self.is_trigger_listener_active = None
        self.start_listener()

    def stop_listen_for_trigger(self):
        print("Stopping listener for trigger")
        self.stop_listening(wait_for_stop=False)
        self.is_trigger_listener_active = False
        self.state.disable_listening()

    def just_decode(self, recognizer, audio):
        try:
            output = recognizer.recognize_whisper(audio, model= "medium.en", language="english")
            logger.info(output)
            if 'alfred' in output.lower(): 
                if re.search(r'\b(shut\s?down|power\s?off|terminate)\b', output, re.IGNORECASE):
                    print("Yes sir? Shutdown sequence initiated.")
                    self.stop_listen_for_trigger()
                else:
                    print("Yes sir?")
        except sr.UnknownValueError:
            print("Whisper could not understand audio")
        except sr.RequestError as e:
            print("Whisper error; {0}".format(e))

    def start_listener(self):
        print("Starting trigger listener")
        self.is_trigger_listener_active = True
        self.recognizer.pause_threshold = 0.5

        print('--- Optimizing for ambient noise. Please wait 5 seconds ---')
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=5.0)
        print('--- Ok. Ready for voice ---')
        self.stop_listening = self.recognizer.listen_in_background(self.microphone, self.just_decode)

        while self.is_trigger_listener_active:
            time.sleep(0.1)

        print("TriggerListener finished!")

if __name__ == "__main__":
    setup_logging()
    logger.info("Lets get this party started")
    state = ListenerState()
    while state.listening_enabled:
        TriggerListener(state)
        print("TriggerListener main thread finished! 1")



