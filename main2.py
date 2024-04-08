#!/usr/bin/env python3

import time
import speech_recognition as sr
from speech_recognition import Recognizer, Microphone

class TriggerListener():
    def __init__(self):
        self.recognizer = Recognizer()
        # self.microphone = Microphone(device_index=0, sample_rate=16000, chunk_size=256)
        self.microphone = Microphone()
        self.is_trigger_listener_active = None
        self.start_listener()

    def stop_listen_for_trigger(self):
        print("Stopping listener for trigger")
        self.stop_listening(wait_for_stop=False)
        self.is_trigger_listener_active = False

    def process_trigger(self, data):
        if "computer" in data.lower():
            print("computer found")
            self.stop_listen_for_trigger()

    def listen_for_trigger(self, recognizer, audio):
        try:
            print("Sound detected...")
            trigger = recognizer.recognize_sphinx(audio, keyword_entries=[('computer', 0.5)])
            if trigger:
                print(f"Trigger detected! - {trigger}")
                self.process_trigger(trigger)
        except sr.UnknownValueError:
            print("Sphinx could not understand audio")
        except sr.RequestError as e:
            print("Sphinx error; {0}".format(e))

    def start_listener(self):
        print("Starting trigger listener")
        self.is_trigger_listener_active = True
        self.recognizer.pause_threshold = 0.5

        print('--- Optimizing for ambient noise ---')
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=5.0)

        self.stop_listening = self.recognizer.listen_in_background(self.microphone, self.listen_for_trigger, phrase_time_limit=1.5)

        while self.is_trigger_listener_active:
            print("Listening...")
            time.sleep(1.0)

        print("TriggerListener finished!")

if __name__ == "__main__":
    while True:
        TriggerListener()
        print("TriggerListener main thread finished! 1")
        TriggerListener()
        print("TriggerListener main thread finished! 2")




""" r = sr.Recognizer()
r.pause_threshold = 0.5

# Setting chunk_size to a small value (e.g. 256) increases the sensitiy of the sound detection
m = sr.Microphone(device_index=0, sample_rate=16000, chunk_size=256)

def process_trigger(data):
    print(data)
    if "computer" in data.lower():
        print("computer found")

def stop_listen_for_trigger():
    print("Stopping listener for trigger")
    stop_listening(wait_for_stop=False)

def listen_for_trigger(recognizer, audio):
    try:
        print("Sound detected...")
        trigger = recognizer.recognize_sphinx(audio, keyword_entries=[('computer', 0.5)])
        if trigger:
            print(f"Trigger detected! - {trigger}")
            process_trigger(trigger)
            # stop_listen_for_trigger()
    except sr.UnknownValueError:
        print("Sphinx could not understand audio")
    except sr.RequestError as e:
        print("Sphinx error; {0}".format(e))

with m as source:
    r.adjust_for_ambient_noise(source, duration=2.0)

stop_listening = r.listen_in_background(m, listen_for_trigger, phrase_time_limit=1.5)

counter = 0
while counter < 500:
    counter += 1
    print("Listening...")
    time.sleep(1.0)

# stop_listening(wait_for_stop=False) """