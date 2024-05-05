export default async function TextToSpeechStream(input) {
    const audioRef = new Audio();
    const SERVER_URL = "http://10.10.10.30:7095/tts";
    
    const response = await fetch(`${SERVER_URL}?text=${input}&stream=true`);
    const reader = response.body.getReader();
    
    const mediaSource = new MediaSource();
    audioRef.src = URL.createObjectURL(mediaSource);
    
    mediaSource.addEventListener('sourceopen', async () => {
        const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            sourceBuffer.appendBuffer(value);
        }
    });
    
    return audioRef;
}