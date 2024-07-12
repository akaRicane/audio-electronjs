console.log("audiowebapi.js");

async function startMultipathProcessing() {
  const constraints = { audio: true };
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  await audioCtx.audioWorklet.addModule("../custom/muter.js");
  ALL_LOGS ? console.log(audioCtx) : null;
  updateSampleRate(audioCtx.sampleRate);

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      /* use the stream */
      displayStreamInfo(stream);
      /* get the audio tracks */
      const mediaStreamTracks = stream.getAudioTracks();
      displayMediaStreamTracksInfo(mediaStreamTracks);

      const audioChain = [];

      /* create audio nodes */
      audioChain.push(addMergerNode(audioCtx, [
        {
          type: 'stream',
          stream: stream,
        },
        {
          type: "oscillator",
        },
        {
          type: "oscillator",
        },
      ]));

      audioChain.push(addGainNode(audioCtx, 1.0, 100.0));
      audioChain.push(addFftNode(audioCtx, fftCallback));

      audioChain.push(addCustomNode(audioCtx, "muter-processor"));

      /* connect the nodes */
      plugAudioNodes(audioCtx, audioChain);
    })
    .catch(function (err) {
      /* handle the error */
      console.log(err.name + ": " + err.message);
      const streamStatus = document.getElementById("streamStatusValue");
      streamStatus.innerText = "error";
      const streamId = document.getElementById("streamIdValue");
      streamId.innerText = "error";
    });
}

buildUI();
startMultipathProcessing();
