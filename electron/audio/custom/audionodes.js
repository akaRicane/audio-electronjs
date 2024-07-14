let ALL_LOGS = false;
let AUDIO_SAMPLE_RATE = 48000;

function updateSampleRate(sampleRate) {
  AUDIO_SAMPLE_RATE = sampleRate;
  document.getElementById("sampleRateValue").innerText = AUDIO_SAMPLE_RATE;
}

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

  const sampleRate = document.createElement("div");
  sampleRate.id = "sampleRate";
  const sampleRateLabel = document.createElement("label");
  sampleRateLabel.innerText = "Sample Rate: ";
  sampleRate.appendChild(sampleRateLabel);
  const sampleRateValue = document.createElement("span");
  sampleRateValue.id = "sampleRateValue";
  sampleRateValue.innerText = AUDIO_SAMPLE_RATE;
  sampleRate.appendChild(sampleRateValue);
  app.appendChild(sampleRate);

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
  audioNodesLabel.style.fontWeight = "bold";
  audioNodesWrapper.appendChild(audioNodesLabel);
  app.appendChild(audioNodesWrapper);

  const bpmGeneratorWrapper = document.createElement("div");
  bpmGeneratorWrapper.id = "bpmGeneratorWrapper";
  bpmGeneratorWrapper.style.display = "flex";
  bpmGeneratorWrapper.style.flexDirection = "column";
  app.appendChild(bpmGeneratorWrapper);

  const footerSection = document.createElement("div");
  footerSection.id = "footerSection";
  footerSection.style.display = "flex";
  footerSection.style.flexDirection = "column";
  app.appendChild(footerSection);
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

function addMediaStreamSourceNode(
  audioCtx,
  stream,
  htmlDestination = "audioNodesWrapper"
) {
  const source = audioCtx.createMediaStreamSource(stream);
  ALL_LOGS ? console.log(source) : null;

  const li = document.createElement("div");
  li.innerText = "MediaStreamAudioSourceNode";

  insertBullet(li);

  document.getElementById(htmlDestination).appendChild(li);

  return source;
}

function addOscillatorNode(audioCtx, htmlDestination = "audioNodesWrapper") {
  const oscillator = audioCtx.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
  oscillator.start();

  const li = document.createElement("div");
  li.innerText = "OscillatorNode";

  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.flexDirection = "column";

  const frequencyWrapper = document.createElement("div");
  frequencyWrapper.style.display = "flex";
  frequencyWrapper.style.flexDirection = "row";
  const frequencyLabel = document.createElement("label");
  frequencyLabel.innerText = `Frequency: ${oscillator.frequency.value} `;
  frequencyLabel.style.width = "25%";
  frequencyWrapper.appendChild(frequencyLabel);
  const frequencyInput = document.createElement("input");
  frequencyInput.type = "number";
  frequencyInput.min = 20;
  frequencyInput.max = AUDIO_SAMPLE_RATE / 2;
  frequencyInput.step = 1;
  frequencyInput.value = oscillator.frequency.value;
  frequencyInput.oninput = function () {
    oscillator.frequency.setValueAtTime(
      frequencyInput.value,
      audioCtx.currentTime
    );
    frequencyLabel.innerText = `Frequency: ${frequencyInput.value} `;
  };
  frequencyWrapper.appendChild(frequencyInput);
  controls.appendChild(frequencyWrapper);

  const typeWrapper = document.createElement("div");
  typeWrapper.style.display = "flex";
  typeWrapper.style.flexDirection = "row";
  const typeLabel = document.createElement("label");
  typeLabel.innerText = `Type: ${oscillator.type} `;
  typeLabel.style.width = "25%";
  typeWrapper.appendChild(typeLabel);
  const typeInput = document.createElement("select");
  typeInput.id = "typeInput";
  const typeOptionsValues = ["sine", "square", "sawtooth", "triangle"];
  typeOptionsValues.forEach((value) => {
    const typeOption = document.createElement("option");
    typeOption.value = value;
    typeOption.innerText = value;
    typeInput.appendChild(typeOption);
  });
  typeInput.value = oscillator.type;
  typeInput.onchange = function () {
    oscillator.type = typeInput.value;
    typeLabel.innerText = `Type: ${typeInput.value} `;
  };
  typeWrapper.appendChild(typeInput);
  controls.appendChild(typeWrapper);

  controls.style.marginLeft = "10%";
  li.appendChild(controls);

  insertBullet(li);

  document.getElementById(htmlDestination).appendChild(li);

  return oscillator;
}

function addGainNode(
  audioCtx,
  defaultGain = 0.0,
  maxGain = 1.0,
  htmlDestination = "audioNodesWrapper"
) {
  const gainNode = audioCtx.createGain();
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

  document.getElementById(htmlDestination).appendChild(li);

  return gainNode;
}

function addFftNode(
  audioCtx,
  callback = () => {},
  htmlDestination = "audioNodesWrapper"
) {
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 4096;
  analyser.minDecibels = -100;
  analyser.maxDecibels = 0;
  analyser.smoothingTimeConstant = 0.85;

  let bufferLength = analyser.frequencyBinCount;
  let dataArray = new Float32Array(bufferLength);

  const spectralAnalysisLoop = function () {
    analyser.getFloatFrequencyData(dataArray);
    callback(dataArray, analyser.fftSize);
    updateChartData(dataArray);
    requestAnimationFrame(spectralAnalysisLoop);
  };

  const li = document.createElement("div");
  li.innerText = "FftNode";

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
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Float32Array(bufferLength);
    fftSizeLabel.innerText = `FFT Size: ${fftSizeInput.value} `;
    resetChart(dataArray, bufferLength);
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
  minDecibelsInput.max = 0;
  minDecibelsInput.step = 1;
  minDecibelsInput.value = analyser.minDecibels;
  minDecibelsInput.oninput = function () {
    if (minDecibelsInput.value > analyser.maxDecibels) {
      analyser.maxDecibels = minDecibelsInput.value + 40;
      maxDecibelsLabel.innerText = `Max Decibels: ${analyser.maxDecibels} `;
      maxDecibelsInput.value = analyser.maxDecibels;
      chart.options.scales.y.max = parseInt(analyser.maxDecibels);
    }
    analyser.minDecibels = minDecibelsInput.value;
    minDecibelsLabel.innerText = `Min Decibels: ${minDecibelsInput.value} `;
    chart.options.scales.y.min = parseInt(minDecibelsInput.value);
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
  maxDecibelsInput.max = 40;
  maxDecibelsInput.step = 1;
  maxDecibelsInput.value = analyser.maxDecibels;
  maxDecibelsInput.oninput = function () {
    if (maxDecibelsInput.value < analyser.minDecibels) {
      analyser.minDecibels = maxDecibelsInput.value - 40;
      minDecibelsLabel.innerText = `Min Decibels: ${analyser.minDecibels} `;
      minDecibelsInput.value = analyser.minDecibels;
      chart.options.scales.y.min = parseInt(analyser.minDecibels);
    }
    analyser.maxDecibels = maxDecibelsInput.value;
    maxDecibelsLabel.innerText = `Max Decibels: ${maxDecibelsInput.value} `;
    chart.options.scales.y.max = parseInt(maxDecibelsInput.value);
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

  const showWrapper = document.createElement("div");
  showWrapper.style.display = "flex";
  showWrapper.style.flexDirection = "row";
  const showLabel = document.createElement("label");
  showLabel.innerText = `Show FFT: `;
  showLabel.style.width = "25%";
  showWrapper.appendChild(showLabel);

  const showButton = document.createElement("button");
  showButton.innerText = "true";
  showButton.onclick = function () {
    showButton.innerText = showButton.innerText === "true" ? "false" : "true";
    showHideFftChart();
  };
  showWrapper.appendChild(showButton);
  additionalControls.appendChild(showWrapper);

  additionalControls.style.marginLeft = "10%";
  li.appendChild(additionalControls);

  const canvas = document.createElement("canvas");
  canvas.id = "fftChart" + Math.random();
  const ctx = canvas.getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "FFT",
          data: [],
          borderColor: "rgb(180, 0, 230)",
          borderWidth: 1,
          fill: false,
        },
      ],
    },
    options: {
      plugins: {
        tooltip: {
          backgroundColor: "rgb(80, 80, 80)",
          bodyColor: "rgb(180, 0, 230)",
        },
      },
      scales: {
        x: {
          display: true,
          min: 20,
          max: AUDIO_SAMPLE_RATE / 2,
          type: "logarithmic",
        },
        y: {
          display: true,
          min: parseInt(minDecibelsInput.value),
          max: parseInt(maxDecibelsInput.value),
        },
      },
    },
  });
  chart.options.animations = false;

  function updateChartData(frequenciesData) {
    chart.data.datasets[0].data = frequenciesData;
    chart.update();
  }

  function resetChart(dataArray, bufferLength) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    chart.data.labels = Array.from(
      { length: bufferLength },
      (_, i) => (i * AUDIO_SAMPLE_RATE) / analyser.fftSize
    );
    chart.data.datasets[0].data = analyser.getFloatFrequencyData(dataArray);
    chart.update();
  }

  function showHideFftChart() {
    if (showButton.innerText === "false") {
      canvas.style.display = "none";
      canvas.width = 0;
      canvas.height = 0;
    } else {
      canvas.style.display = "block";
      canvas.width = 512;
      canvas.height = 256;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  resetChart(dataArray, bufferLength);
  showHideFftChart();
  li.appendChild(canvas);

  insertBullet(li);

  document.getElementById(htmlDestination).appendChild(li);

  spectralAnalysisLoop();

  return analyser;
}

function fftCallback(frequencyData, fftSize) {
  // console.log("fft callback", frequencyData.length, AUDIO_SAMPLE_RATE, fftSize);
}

function addAnalyserPlotterNode(
  audioCtx,
  htmlDestination = "audioNodesWrapper"
) {
  const analyser = audioCtx.createAnalyser();
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
  li.innerText = "AnalyserPlotterNode";

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

  document.getElementById(htmlDestination).appendChild(li);

  return analyser;
}

function addBiquadFilterNode(
  audioCtx,
  options,
  htmlDestination = "audioNodesWrapper"
) {
  const filter = audioCtx.createBiquadFilter();
  filter.type = options.type ? options.type : "highpass";
  filter.frequency.value = options.frequency ? options.frequency : 80;
  filter.Q.value = options.q ? options.q : 1;
  filter.gain.value = options.gain ? options.gain : -40;

  const li = document.createElement("div");
  li.innerText = "BiquadFilterNode";

  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.flexDirection = "column";

  const typeWrapper = document.createElement("div");
  typeWrapper.style.display = "flex";
  typeWrapper.style.flexDirection = "row";
  const typeLabel = document.createElement("label");
  typeLabel.innerText = `Type: ${filter.type} `;
  typeLabel.style.width = "25%";
  typeWrapper.appendChild(typeLabel);
  const typeInput = document.createElement("select");
  typeInput.id = "typeInput";
  const typeOptionsValues = [
    "lowpass",
    "highpass",
    "bandpass",
    "lowshelf",
    "highshelf",
    "peaking",
    "notch",
    "allpass",
  ];
  typeOptionsValues.forEach((value) => {
    const typeOption = document.createElement("option");
    typeOption.value = value;
    typeOption.innerText = value;
    typeInput.appendChild(typeOption);
  });
  typeInput.value = filter.type;
  typeInput.onchange = function () {
    filter.type = typeInput.value;
    typeLabel.innerText = `Type: ${typeInput.value} `;
  };
  typeWrapper.appendChild(typeInput);
  controls.appendChild(typeWrapper);

  const frequencyWrapper = document.createElement("div");
  frequencyWrapper.style.display = "flex";
  frequencyWrapper.style.flexDirection = "row";
  const frequencyLabel = document.createElement("label");
  frequencyLabel.innerText = `Frequency: ${filter.frequency.value} `;
  frequencyLabel.style.width = "25%";
  frequencyWrapper.appendChild(frequencyLabel);
  const frequencyInput = document.createElement("input");
  frequencyInput.type = "number";
  frequencyInput.min = 20;
  frequencyInput.max = AUDIO_SAMPLE_RATE / 2;
  frequencyInput.step = 1;
  frequencyInput.value = filter.frequency.value;
  frequencyInput.oninput = function () {
    filter.frequency.value = frequencyInput.value;
    frequencyLabel.innerText = `Frequency: ${frequencyInput.value} `;
  };
  frequencyWrapper.appendChild(frequencyInput);
  controls.appendChild(frequencyWrapper);

  const qWrapper = document.createElement("div");
  qWrapper.style.display = "flex";
  qWrapper.style.flexDirection = "row";
  const qLabel = document.createElement("label");
  qLabel.innerText = `Q: ${filter.Q.value} `;
  qLabel.style.width = "25%";
  qWrapper.appendChild(qLabel);
  const qInput = document.createElement("input");
  qInput.type = "range";
  qInput.min = 0.001;
  qInput.max = 1000;
  qInput.step = 0.001;
  qInput.value = filter.Q.value;
  qInput.oninput = function () {
    filter.Q.value = qInput.value;
    qLabel.innerText = `Q: ${qInput.value} `;
  };
  qWrapper.appendChild(qInput);
  controls.appendChild(qWrapper);

  const gainWrapper = document.createElement("div");
  gainWrapper.style.display = "flex";
  gainWrapper.style.flexDirection = "row";
  const gainLabel = document.createElement("label");
  gainLabel.innerText = `Gain: ${filter.gain.value} `;
  gainLabel.style.width = "25%";
  gainWrapper.appendChild(gainLabel);
  const gainInput = document.createElement("input");
  gainInput.type = "range";
  gainInput.min = -40;
  gainInput.max = 40;
  gainInput.step = 1;
  gainInput.value = filter.gain.value;

  gainInput.oninput = function () {
    filter.gain.value = gainInput.value;
    gainLabel.innerText = `Gain: ${gainInput.value} `;
  };
  gainWrapper.appendChild(gainInput);
  controls.appendChild(gainWrapper);

  controls.style.marginLeft = "10%";
  li.appendChild(controls);

  insertBullet(li);

  document.getElementById(htmlDestination).appendChild(li);

  return filter;
}

function addMergerNode(
  audioCtx,
  sources,
  htmlDestination = "audioNodesWrapper"
) {
  const merger = audioCtx.createChannelMerger(1);

  const li = document.createElement("div");
  li.innerText = "ChannelMergerNode";
  li.style.display = "flex";
  li.style.flexDirection = "column";
  li.id = "channelMergerNode";

  document.getElementById(htmlDestination).appendChild(li);

  sources.forEach((sourceDescr, index) => {
    let source = undefined;
    if (sourceDescr.type === "stream") {
      source = addMediaStreamSourceNode(audioCtx, sourceDescr.stream, li.id);
    } else if (sourceDescr.type === "oscillator") {
      source = addOscillatorNode(audioCtx, li.id);
    }

    if (source === undefined) {
      return;
    }

    const gainNode = addGainNode(audioCtx, 1.0, 100.0, li.id);
    source.connect(gainNode);
    gainNode.connect(merger);
  });

  const label = document.createElement("label");
  label.innerText = "ChannelMergerNode -- end";
  li.appendChild(label);
  return merger;
}

function addBttCustomNode(audioCtx, htmlDestination = "audioNodesWrapper") {
  const bttNode = new BttNode(audioCtx, htmlDestination);
  return bttNode;
}

function addCustomNode(audioCtx, processorName) {
  const li = document.createElement("div");
  li.style.display = "flex";
  li.style.flexDirection = "row";

  const label = document.createElement("label");
  label.innerText = `${processorName} Custom Node`;

  li.appendChild(label);

  insertBullet(li);

  document.getElementById("audioNodesWrapper").appendChild(li);

  return new AudioWorkletNode(audioCtx, processorName);
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

function plugAudioNodes(audioCtx, audioChain) {
  for (let i = 0; i < audioChain.length; i++) {
    i === audioChain.length - 1
      ? audioChain[i].connect(audioCtx.destination)
      : audioChain[i].connect(audioChain[i + 1]);
  }
}
