export default async function TextToSpeechStream(input) {
    const audioRef = new Audio();
    const SERVER_URL = "http://10.10.10.30:7095/tts";
    const response = await fetch(`${SERVER_URL}?text=${input}&stream=true`);
    const responseBlob = await response.blob()
    audioRef.src = URL.createObjectURL(responseBlob);
    // return the object ready to play? audioRef.current.play();
    return audioRef;
  }