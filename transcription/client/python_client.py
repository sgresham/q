import asyncio
import websockets
import numpy as np
from pyaudio import PyAudio, paInt16
import argparse
import logging

# Parameters
CHUNK = 1024 * 5
FORMAT = paInt16
CHANNELS = 1
RATE = 16000
RECORD_SECONDS = 5
CONNECT_TIMEOUT = 120  # Timeout in seconds
MAX_RETRIES = 5000  # Maximum number of retries
RETRY_DELAY = 5  # in seconds

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
p = PyAudio()
stream = p.open(format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK * 20,
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
    except websockets.exceptions.ConnectionClosedError:
        logging.error("WebSocket connection closed unexpectedly.")
        # Handle the closed connection here (e.g., reconnect, cleanup, etc.)
        # Optionally, you can raise the exception to ensure it's retrieved and handled by the caller
        raise
    except Exception as e:
        logging.error("Error occurred in send_audio: %s", e)

async def receive_response(websocket):
    try:
        async for message in websocket:
            # Handle received messages here
            print("Received message:", message)
    except websockets.exceptions.ConnectionClosedError:
        logging.error("WebSocket connection closed unexpectedly.")
        # Handle the closed connection here (e.g., reconnect, cleanup, etc.)
        # Optionally, you can raise the exception to ensure it's retrieved and handled by the caller
        raise
    except Exception as e:
        logging.error("Error occurred in receive_response: %s", e)

async def main():
    retries = 0
    while True:
        try:
            async with websockets.connect(WEBSOCKET_URI, ping_timeout=None) as websocket:
                await asyncio.gather(send_audio(websocket), receive_response(websocket))
        except Exception:
            pass
        else:
            # If the connection and data transmission succeed, exit the loop
            break
    if retries == MAX_RETRIES:
        print("Max retries reached. Could not establish connection.")

    # Close the audio stream regardless of connection success or failure
    stream.stop_stream()
    stream.close()
    p.terminate()

asyncio.run(main())
