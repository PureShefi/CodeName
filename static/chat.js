var socket = io('', {'sync disconnect on unload': true,  query: "session_id=12345"});

const recordAudio = () => {
  return new Promise(resolve => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        var audioChunks = [];

        mediaRecorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });

        const start = () => {
          audioChunks = []
          mediaRecorder.start();
        };

        const stop = () => {
          return new Promise(resolve => {
            mediaRecorder.addEventListener("stop", () => {
              resolve({ audioChunks });
            });

            mediaRecorder.stop();
          });
        };

        resolve({ start, stop });
      });
  });
};

(async () => {
    const recorder = await recordAudio();
    recorder.start();
    setInterval(async () => {
        const audio = await recorder.stop();
        socket.emit("voice message", {"session_id": "asdasd", "audioBlob": audio.audioChunks})
        recorder.start()
    }, 3000);
})();

socket.on('voice message', function(data){
    const audioBlob = new Blob(data.audioBlob);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play()
})
