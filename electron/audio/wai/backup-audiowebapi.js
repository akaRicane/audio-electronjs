console.log("backup-audiowebapi.js");

let ALL_LOGS = false;

function buildUI() {
  const app = document.getElementById("app");
  app.style.display = "flex";
  app.style.flexDirection = "column";

  const h1 = document.createElement("h1");
  h1.innerText = "Audio Web API";
  app.appendChild(h1);

  const mediaStreamInfos = document.createElement("div");
  mediaStreamInfos.id = "mediaStreamInfos";
  mediaStreamInfos.style.display = "flex";
  mediaStreamInfos.style.flexDirection = "column";

  const streamStatus = document.createElement("div");
  streamStatus.id = "streamStatus";
  const streamStatusLabel = document.createElement("label");
  streamStatusLabel.innerText = "Stream Status: ";
  streamStatus.appendChild(streamStatusLabel);
  const streamStatusValue = document.createElement("span");
  streamStatusValue.id = "streamStatusValue";
  streamStatusValue.innerText = "waiting for stream...";
  streamStatus.appendChild(streamStatusValue);
  mediaStreamInfos.appendChild(streamStatus);

  const streamId = document.createElement("div");
  streamId.id = "streamId";
  const streamIdLabel = document.createElement("label");
  streamIdLabel.innerText = "Stream ID: ";
  streamId.appendChild(streamIdLabel);
  const streamIdValue = document.createElement("span");
  streamIdValue.id = "streamIdValue";
  streamIdValue.innerText = "12345";
  streamId.appendChild(streamIdValue);
  mediaStreamInfos.appendChild(streamId);

  const audioTracks = document.createElement("div");
  audioTracks.id = "audioTracks";
  const audioTracksLabel = document.createElement("label");
  audioTracksLabel.innerText = "Audio Tracks: ";
  audioTracks.appendChild(audioTracksLabel);
  const audioTracksValue = document.createElement("span");
  audioTracksValue.id = "audioTracksValue";
  audioTracksValue.innerText = "waiting for stream...";
  audioTracks.appendChild(audioTracksValue);
  mediaStreamInfos.appendChild(audioTracks);
  app.appendChild(mediaStreamInfos);

  const mediaStreamAudioTracksInfos = document.createElement("div");
  mediaStreamAudioTracksInfos.id = "mediaStreamAudioTracksInfos";
  mediaStreamAudioTracksInfos.style.display = "flex";
  mediaStreamAudioTracksInfos.style.flexDirection = "column";
  const mediaStreamAudioTracksInfosLabel = document.createElement("label");
  mediaStreamAudioTracksInfosLabel.innerText =
    "Media Stream Audio Tracks Infos";
  mediaStreamAudioTracksInfos.appendChild(mediaStreamAudioTracksInfosLabel);
  const mediaStreamAudioTracksInfosList = document.createElement("ul");
  mediaStreamAudioTracksInfosList.id = "mediaStreamAudioTracksInfosList";
  mediaStreamAudioTracksInfos.appendChild(mediaStreamAudioTracksInfosList);
  app.appendChild(mediaStreamAudioTracksInfos);

  const audioNodesWrapper = document.createElement("div");
  audioNodesWrapper.id = "audioNodesWrapper";
  const audioNodesLabel = document.createElement("label");
  audioNodesLabel.innerText = "Audio Nodes";
  audioNodesWrapper.appendChild(audioNodesLabel);
  app.appendChild(audioNodesWrapper);
}

function displayStreamInfo(stream) {
  ALL_LOGS ? console.log(stream) : null;
  const streamStatus = document.getElementById("streamStatusValue");
  streamStatus.innerText = stream.active ? "active" : "inactive";
  const streamId = document.getElementById("streamIdValue");
  streamId.innerText = stream.id;
}

function displayMediaStreamTracksInfo(mediaStreamTracks) {
  ALL_LOGS ? console.log(mediaStreamTracks) : null;

  const audioTracks = document.getElementById("audioTracksValue");
  audioTracks.innerText = mediaStreamTracks.length;

  const mediaStreamAudioTracksInfosList = document.getElementById(
    "mediaStreamAudioTracksInfosList"
  );
  mediaStreamTracks.forEach((audioTrack) => {
    ALL_LOGS ? console.log(audioTrack) : null;
    const audioTrackInfo = document.createElement("li");
    audioTrackInfo.innerText =
      audioTrack.label + ` - [${audioTrack.readyState}]`;
    mediaStreamAudioTracksInfosList.appendChild(audioTrackInfo);
  });
}

function addMediaStreamSourceNode(audioCxt, stream) {
  const source = audioCxt.createMediaStreamSource(stream);
  ALL_LOGS ? console.log(source) : null;

  const li = document.createElement("div");
  li.innerText = "MediaStreamAudioSourceNode";

  insertBullet(li);

  document.getElementById("audioNodesWrapper").appendChild(li);

  return source;
}

function addGainNode(audioCxt, defaultGain = 0.0, maxGain = 1.0) {
  const gainNode = audioCxt.createGain();
  gainNode.gain.value = defaultGain;

  const li = document.createElement("div");

  li.style.display = "flex";
  li.style.flexDirection = "row";

  const label = document.createElement("label");
  label.innerText = `GainNode (${
    defaultGain > maxGain ? maxGain : defaultGain
  })`;
  label.style.minWidth = "200px";

  const input = document.createElement("input");
  input.type = "range";
  input.min = 0;
  input.max = maxGain;
  input.step = 0.1;
  input.value = defaultGain > maxGain ? maxGain : defaultGain;
  input.oninput = function () {
    gainNode.gain.value = input.value > maxGain ? maxGain : input.value;
    label.innerText = `GainNode (${input.value})`;
  };
  li.appendChild(label);
  li.appendChild(input);

  insertBullet(li);

  document.getElementById("audioNodesWrapper").appendChild(li);

  return gainNode;
}

function addAnalyserNode(audioCxt, callback = () => {}) {
  const analyser = audioCxt.createAnalyser();
  analyser.fftSize = 1024;
  analyser.minDecibels = -100;
  analyser.maxDecibels = 0;
  analyser.smoothingTimeConstant = 0.85;

  let bufferLength = analyser.frequencyBinCount;
  let dataArray = new Uint8Array(bufferLength);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  const li = document.createElement("div");
  li.innerText = "AnalyserNode";

  const div = document.createElement("div");
  div.style.display = "flex";
  div.style.flexDirection = "column";

  const drawSelect = document.createElement("select");
  drawSelect.id = "drawSelect";
  const drawSelectOptions = ["spectrum", "waveform"];
  drawSelectOptions.forEach((option) => {
    const drawOption = document.createElement("option");
    drawOption.value = option;
    drawOption.innerText = option;
    drawSelect.appendChild(drawOption);
  });
  drawSelect.onchange = function () {
    if (drawSelect.value === "waveform") {
      drawWaveform();
    } else {
      drawSpectrum();
    }
  };
  div.appendChild(drawSelect);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const drawWaveform = function () {
    analyser.getByteTimeDomainData(dataArray);
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(200, 200, 200)";
    ctx.beginPath();
    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    requestAnimationFrame(drawWaveform);
  };

  const drawSpectrum = function () {
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i];
      ctx.fillStyle = "rgb(" + (barHeight + 100) + ",50,50)";
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
    requestAnimationFrame(drawSpectrum);
  };
  drawSpectrum();
  div.appendChild(canvas);

  const additionalControls = document.createElement("div");
  additionalControls.style.display = "flex";
  additionalControls.style.flexDirection = "column";

  const fftSizeWrapper = document.createElement("div");
  fftSizeWrapper.style.display = "flex";
  fftSizeWrapper.style.flexDirection = "row";
  const fftSizeLabel = document.createElement("label");
  fftSizeLabel.innerText = `FFT Size: ${analyser.fftSize} `;
  fftSizeLabel.style.width = "25%";
  fftSizeWrapper.appendChild(fftSizeLabel);
  const fftSizeInput = document.createElement("select");
  fftSizeInput.id = "fftSizeInput";
  const fftOptionsValues = [32, 64, 128, 256, 512, 1024, 2048, 4096];
  fftOptionsValues.forEach((value) => {
    const fftOption = document.createElement("option");
    fftOption.value = value;
    fftOption.innerText = value;
    fftSizeInput.appendChild(fftOption);
  });
  fftSizeInput.value = analyser.fftSize;
  fftSizeInput.onchange = function () {
    analyser.fftSize = fftSizeInput.value;
    fftSizeLabel.innerText = `FFT Size: ${fftSizeInput.value} `;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  fftSizeWrapper.appendChild(fftSizeInput);
  additionalControls.appendChild(fftSizeWrapper);

  const minDecibelsWrapper = document.createElement("div");
  minDecibelsWrapper.style.display = "flex";
  minDecibelsWrapper.style.flexDirection = "row";
  const minDecibelsLabel = document.createElement("label");
  minDecibelsLabel.innerText = `Min Decibels: ${analyser.minDecibels} `;
  minDecibelsLabel.style.width = "25%";
  minDecibelsWrapper.appendChild(minDecibelsLabel);
  const minDecibelsInput = document.createElement("input");
  minDecibelsInput.type = "range";
  minDecibelsInput.min = -120;
  minDecibelsInput.max = -40;
  minDecibelsInput.step = 1;
  minDecibelsInput.value = analyser.minDecibels;
  minDecibelsInput.oninput = function () {
    analyser.minDecibels = minDecibelsInput.value;
    minDecibelsLabel.innerText = `Min Decibels: ${minDecibelsInput.value} `;
  };
  minDecibelsWrapper.appendChild(minDecibelsInput);
  additionalControls.appendChild(minDecibelsWrapper);

  const maxDecibelsWrapper = document.createElement("div");
  maxDecibelsWrapper.style.display = "flex";
  maxDecibelsWrapper.style.flexDirection = "row";
  const maxDecibelsLabel = document.createElement("label");
  maxDecibelsLabel.innerText = `Max Decibels: ${analyser.maxDecibels} `;
  maxDecibelsLabel.style.width = "25%";
  maxDecibelsWrapper.appendChild(maxDecibelsLabel);
  const maxDecibelsInput = document.createElement("input");
  maxDecibelsInput.type = "range";
  maxDecibelsInput.min = -80;
  maxDecibelsInput.max = 0;
  maxDecibelsInput.step = 1;
  maxDecibelsInput.value = analyser.maxDecibels;
  maxDecibelsInput.oninput = function () {
    analyser.maxDecibels = maxDecibelsInput.value;
    maxDecibelsLabel.innerText = `Max Decibels: ${maxDecibelsInput.value} `;
  };
  maxDecibelsWrapper.appendChild(maxDecibelsInput);
  additionalControls.appendChild(maxDecibelsWrapper);

  const smoothingTimeConstantWrapper = document.createElement("div");
  smoothingTimeConstantWrapper.style.display = "flex";
  smoothingTimeConstantWrapper.style.flexDirection = "row";
  const smoothingTimeConstantLabel = document.createElement("label");
  smoothingTimeConstantLabel.innerText = `Smoothing Time Constant: ${analyser.smoothingTimeConstant} `;
  smoothingTimeConstantLabel.style.width = "25%";
  smoothingTimeConstantWrapper.appendChild(smoothingTimeConstantLabel);
  const smoothingTimeConstantInput = document.createElement("input");
  smoothingTimeConstantInput.type = "range";
  smoothingTimeConstantInput.min = 0;
  smoothingTimeConstantInput.max = 1;
  smoothingTimeConstantInput.step = 0.01;
  smoothingTimeConstantInput.value = analyser.smoothingTimeConstant;
  smoothingTimeConstantInput.oninput = function () {
    analyser.smoothingTimeConstant = smoothingTimeConstantInput.value;
    smoothingTimeConstantLabel.innerText = `Smoothing Time Constant: ${smoothingTimeConstantInput.value} `;
  };
  smoothingTimeConstantWrapper.appendChild(smoothingTimeConstantInput);
  additionalControls.appendChild(smoothingTimeConstantWrapper);

  additionalControls.style.marginLeft = "10%";
  div.appendChild(additionalControls);

  li.appendChild(div);

  insertBullet(li);

  document.getElementById("audioNodesWrapper").appendChild(li);

  return analyser;
}

function addCustomNode(audioCxt, processorName) {
  const li = document.createElement("div");
  li.style.display = "flex";
  li.style.flexDirection = "row";

  const label = document.createElement("label");
  label.innerText = `${processorName} Custom Node`;

  li.appendChild(label);

  insertBullet(li);

  document.getElementById("audioNodesWrapper").appendChild(li);

  return new AudioWorkletNode(audioCxt, processorName);
}

function insertBullet(li) {
  const bulletSpan = document.createElement("span");
  bulletSpan.innerText = "(node)";
  bulletSpan.style.display = "inline-block";
  bulletSpan.style.width = "50px"; // Adjust the width as needed
  bulletSpan.style.marginRight = "10px"; // Space between the bullet and the text

  // Insert the bulletSpan before the label or the first child of the li
  li.insertBefore(bulletSpan, li.firstChild);
}

function plugAudioNodes(audioCxt, audioChain) {
  for (let i = 0; i < audioChain.length; i++) {
    i === audioChain.length - 1
      ? audioChain[i].connect(audioCxt.destination)
      : audioChain[i].connect(audioChain[i + 1]);
  }
}

async function startAudioStreamEngine() {
  const constraints = { audio: true };
  const audioCxt = new (window.AudioContext || window.webkitAudioContext)();
  await audioCxt.audioWorklet.addModule("custom/muter.js");
  await audioCxt.audioWorklet.addModule("custom/wide_band_beatdetector.js");
  ALL_LOGS ? console.log(audioCxt) : null;

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      /* use the stream */
      displayStreamInfo(stream);
      /* get the audio tracks */
      const mediaStreamTracks = stream.getAudioTracks();
      displayMediaStreamTracksInfo(mediaStreamTracks);

      /* create audio nodes */
      const audioChain = [];
      audioChain.push(addMediaStreamSourceNode(audioCxt, stream));
      audioChain.push(addGainNode(audioCxt, 1.0, 100.0));
      audioChain.push(addAnalyserNode(audioCxt));
      audioChain.push(
        addCustomNode(audioCxt, "wide-band-beatdetector-processor")
      );
      audioChain.push(addCustomNode(audioCxt, "muter-processor"));

      /* connect the nodes */
      plugAudioNodes(audioCxt, audioChain);
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
