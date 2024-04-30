# import torch
# from TTS.api import TTS
# OUTPUT_PATH = "output/test1.wav"

# # Get device
# device = "cuda" if torch.cuda.is_available() else "cpu"

# # List available 🐸TTS models
# tts_manager = TTS().list_models()
# all_models = tts_manager.list_models()
# print(all_models)

# # tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False).to(device)

# tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2", gpu=True)

# # generate speech by cloning a voice using default settings
# tts.tts_to_file(text="It took me quite a long time to develop a voice, and now that I have it I'm not going to be silent.",
#                 file_path=OUTPUT_PATH,
#                 speaker_wav="input/steve.wav",
#                 language="en")


from RealtimeTTS import TextToAudioStream, CoquiEngine, SystemEngine, AzureEngine, ElevenlabsEngine

engine = CoquiEngine() # replace with your TTS engine
stream = TextToAudioStream(engine)
stream.feed("Hello world! How are you today?")
stream.play_async()