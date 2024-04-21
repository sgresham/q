import pyaudio
import numpy as np
import asyncio
import websockets
import argparse

# Parameters
CHUNK = 1024*5
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
RECORD_SECONDS = 5
WEBSOCKET_URI = 'ws://localhost:8765'
CONNECT_TIMEOUT = 120  # Timeout in seconds

# Parse the command line arguments
parser = argparse.ArgumentParser()
parser.add_argument("-d", "--device", default=0, help="input device number")
parser.add_argument("-s", "--server", default="localhost", help="server IP address")
parser.add_argument("-p", "--port", default=8765, help="port number")
args = parser.parse_args()
WEBSOCKET_URI = f'ws://{args.server}:{args.port}'

# convert arg device from string to integer and error if it is not an integer and terminate the program
try:
    device = int(args.device)
except ValueError:
    device = args.device
    raise ValueError("Invalid device number. Must be an integer.")


# Open the microphone and set up the audio stream
p = pyaudio.PyAudio()
stream = p.open(format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK,
                input_device_index=device)

print("Recording...")

async def send_audio(websocket):
    try:
        while True:
            # Record audio for the specified duration and transmit it to the WebSocket server in chunks
            audio_data_chunks = []
            for _ in range(int(RATE / CHUNK * RECORD_SECONDS)):
                data = stream.read(CHUNK)
                audio_data_chunks.append(data)

            # Concatenate the audio data chunks into a single NumPy array
            audio_data = np.concatenate([np.frombuffer(chunk, dtype=np.int16) for chunk in audio_data_chunks])

            # Transmit the current chunk of audio data to the WebSocket server with timeout
            await asyncio.wait_for(websocket.send(audio_data.tobytes()), timeout=CONNECT_TIMEOUT)
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"WebSocket connection closed unexpectedly: {e}")
    except asyncio.TimeoutError:
        print(f"Sending audio data timed out after {CONNECT_TIMEOUT} seconds.")
    except asyncio.CancelledError:
        print("Recording stopped by user.")
    except Exception as e:
        print(f"An error occurred: {e}")

async def main():
    try:
        async with websockets.connect(WEBSOCKET_URI, ping_timeout=None) as websocket:
            await send_audio(websocket)
    except ConnectionRefusedError:
        print(f"Could not connect to WebSocket server at {WEBSOCKET_URI}")
    finally:
        # Close the audio stream
        stream.stop_stream()
        stream.close()
        p.terminate()

asyncio.run(main())
