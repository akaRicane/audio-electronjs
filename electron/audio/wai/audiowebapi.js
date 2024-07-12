console.log("audiowebapi.js");

async function startAudioStreamEngine() {
  const constraints = { audio: true };
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  await audioCtx.audioWorklet.addModule("../custom/muter.js");
  await audioCtx.audioWorklet.addModule("../custom/wide_band_beatdetector.js");
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
      const isStream = true;
      /* create audio nodes */
      audioChain.push(
        isStream
          ? addMediaStreamSourceNode(audioCtx, stream)
          : addOscillatorNode(audioCtx)
      );
      audioChain.push(
        addBiquadFilterNode(audioCtx, {
          type: "allpass",
          frequency: 80,
          q: 400,
          gain: 0,
        })
      );
      audioChain.push(addGainNode(audioCtx, 1.0, 100.0));
      audioChain.push(addFftNode(audioCtx, fftCallback));
      audioChain.push(addAnalyserPlotterNode(audioCtx));
      audioChain.push(
        addCustomNode(audioCtx, "wide-band-beatdetector-processor")
      );
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
startAudioStreamEngine();
