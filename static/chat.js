var socket = io('', {'sync disconnect on unload': true,  query: "session_id=12345"});

var constraints = { audio: true };
navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream) {
    var mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorder.onstart = function(e) {
        this.chunks = [];
    };
    mediaRecorder.ondataavailable = function(e) {
        this.chunks.push(e.data);
    };
    mediaRecorder.onstop = function(e) {
        var blob = new Blob(this.chunks, { 'type' : 'audio/ogg; codecs=opus' });
        socket.emit('radio', blob);
    };

    // Start recording
    mediaRecorder.start();

    // Stop recording after 5 seconds and broadcast it to server
    setTimeout(function() {
        mediaRecorder.stop()
    }, 5000);
});

/*const recordAudio = () => {
  return new Promise(resolve => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        var audioChunks = [];

        mediaRecorder.addEventListener("dataavailable", event => {
            console.log(event.data);

          //audioChunks.push(event.data);
        });

        const start = () => {
          audioChunks = []
          mediaRecorder.start(3000);
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
    setTimeout(async () => {
        const audio = await recorder.stop();
        //socket.emit("voice message", {"session_id": "asdasd", "audioBlob": audio.audioChunks})
        //recorder.start()
    }, 8000);
})();*/

socket.on('voice message', function(data){
    const audioBlob = new Blob([data.audioBlob]);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play()
})
