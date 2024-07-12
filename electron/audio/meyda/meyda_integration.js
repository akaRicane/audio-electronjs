console.log("meyda_integration.js");

let METRICS = ["amplitudeSpectrum", "rms"];
let CHART_BTT = null;
let counter = 0;
let MEANS = [];
let THRESHED = [];
let MAX_IS_OVER_STD = false;
let PULSE = 0.0;
let PULSE_DECAY = 0.8;
let STD_FACTOR = 0.5;
let STD_OFFSET = 1.0;

function addPlottingSection() {
  const plottingWrapper = document.createElement("div");

  const metricsWrapper = document.createElement("div");
  metricsWrapper.id = "metricsWrapper";

  const metricsTitle = document.createElement("label");
  metricsTitle.innerText = "Metrics";
  metricsTitle.style.fontWeight = "bold";
  metricsTitle.style.marginTop = "20px";
  metricsWrapper.appendChild(metricsTitle);

  METRICS.forEach((metric) => {
    const metricWrapper = document.createElement("div");
    metricWrapper.id = metric + "Wrapper";
    metricWrapper.style.display = "flex";
    metricWrapper.style.flexDirection = "row";

    const metricLabel = document.createElement("label");
    metricLabel.id = metric + "Label";
    metricLabel.innerText = metric;
    metricLabel.style.width = "25%";
    metricWrapper.appendChild(metricLabel);

    const metricValue = document.createElement("label");
    metricValue.id = metric + "Value";
    metricValue.innerText = "0";
    metricWrapper.appendChild(metricValue);

    metricsWrapper.appendChild(metricWrapper);
  });

  const pulseWrapper = document.createElement("div");
  pulseWrapper.id = "pulseWrapper";
  pulseWrapper.style.display = "flex";
  pulseWrapper.style.flexDirection = "row";
  
  const pulseLabel = document.createElement("label");
  pulseLabel.id = "pulseLabel";
  pulseLabel.innerText = "pulse";
  pulseLabel.style.width = "25%";
  pulseWrapper.appendChild(pulseLabel);

  const pulseValue = document.createElement("label");
  pulseValue.id = "pulseValue";
  pulseValue.innerText = "0";
  pulseWrapper.appendChild(pulseValue);
  metricsWrapper.appendChild(pulseWrapper);

  const decayWrapper = document.createElement("div");
  decayWrapper.id = "decayWrapper";
  decayWrapper.style.display = "flex";
  decayWrapper.style.flexDirection = "row";

  const decayLabel = document.createElement("label");
  decayLabel.id = "decayLabel";
  decayLabel.innerText = "decay";
  decayLabel.style.width = "25%";
  decayWrapper.appendChild(decayLabel);

  const decayValue = document.createElement("input");
  decayValue.id = "decayValue";
  decayValue.type = "range";
  decayValue.min = 0.0;
  decayValue.max = 1.0;
  decayValue.step = 0.0001;
  decayValue.value = PULSE_DECAY;
  decayValue.style.width = "25%";
  decayValue.oninput = (event) => {
    decayLabel.innerText = "decay (" + event.target.value + ")";
    PULSE_DECAY = parseFloat(event.target.value);
  };
  decayWrapper.appendChild(decayValue);

  const stdFactorWrapper = document.createElement("div");
  stdFactorWrapper.id = "stdFactorWrapper";
  stdFactorWrapper.style.display = "flex";
  stdFactorWrapper.style.flexDirection = "row";

  const stdFactorLabel = document.createElement("label");
  stdFactorLabel.id = "stdFactorLabel";
  stdFactorLabel.innerText = "std factor";
  stdFactorLabel.style.width = "25%";
  stdFactorWrapper.appendChild(stdFactorLabel);

  const stdFactorValue = document.createElement("input");
  stdFactorValue.id = "stdFactorValue";
  stdFactorValue.type = "range";
  stdFactorValue.min = 0.0;
  stdFactorValue.max = 10.0;
  stdFactorValue.step = 0.1;
  stdFactorValue.value = STD_FACTOR;
  stdFactorValue.style.width = "25%";
  stdFactorValue.oninput = (event) => {
    stdFactorLabel.innerText = "std factor (" + event.target.value + ")";
    STD_FACTOR = parseFloat(event.target.value);
  };
  stdFactorWrapper.appendChild(stdFactorValue);

  const stdOffsetWrapper = document.createElement("div");
  stdOffsetWrapper.id = "stdOffsetWrapper";
  stdOffsetWrapper.style.display = "flex";
  stdOffsetWrapper.style.flexDirection = "row";
  
  const stdOffsetLabel = document.createElement("label");
  stdOffsetLabel.id = "stdOffsetLabel";
  stdOffsetLabel.innerText = "std offset";
  stdOffsetLabel.style.width = "25%";
  stdOffsetWrapper.appendChild(stdOffsetLabel);

  const stdOffsetValue = document.createElement("input");
  stdOffsetValue.id = "stdOffsetValue";
  stdOffsetValue.type = "range";
  stdOffsetValue.min = 0.0;
  stdOffsetValue.max = 10.0;
  stdOffsetValue.step = 0.1;
  stdOffsetValue.value = STD_OFFSET;
  stdOffsetValue.style.width = "25%";
  stdOffsetValue.oninput = (event) => {
    stdOffsetLabel.innerText = "std offset (" + event.target.value + ")";
    STD_OFFSET = parseFloat(event.target.value);
  };
  stdOffsetWrapper.appendChild(stdOffsetValue);

  metricsWrapper.appendChild(decayWrapper);
  metricsWrapper.appendChild(stdFactorWrapper);
  metricsWrapper.appendChild(stdOffsetWrapper);

  plottingWrapper.appendChild(metricsWrapper);

  const canvasBtt = document.createElement("canvas");
  canvasBtt.id = "plottingCanvasBtt";
  canvasBtt.width = 400;
  canvasBtt.height = 200;
  plottingWrapper.appendChild(canvasBtt);

  const ctxBtt = canvasBtt.getContext("2d");

  CHART_BTT = new Chart(ctxBtt, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "real time dft max",
          data: [],
          fill: false,
        },
        {
          label: "mean",
          data: [],
          fill: false,
        },
        {
          label: "std",
          data: [],
          fill: false,
        },
        {
          label: "pulse",
          data: [],
          fill: false,
        },
      
      ],
    },
    options: {
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          ticks: {
            beginAtZero: true,
          },
        },
        y: {
          type: "linear",
          position: "left",
          min: 0,
          max: 50,
          ticks: {
            beginAtZero: true,
          },
        },
      },
    },
  });
  CHART_BTT.options.animations = false;

  const footer = document.getElementById("footerSection");
  footer.appendChild(plottingWrapper);
}

function onMetrics(features) {
  METRICS.forEach((metric) => {
    const metricLabel = document.getElementById(metric + "Label");
    const metricValue = document.getElementById(metric + "Value");
    if (metric === "amplitudeSpectrum") {
      const res = processAmplitudeSpectrum(features[metric]);
      
      metricLabel.innerText = "amplitudeSpectrum (max)";
      metricValue.innerText = res.dftMax;
      
      document.getElementById("pulseValue").innerText = PULSE.toFixed(2);
      document.getElementById("pulseValue").style.opacity = PULSE.toFixed(2);
    
      addToChartBtt(res);
    } else if (
      typeof features[metric] === "object" ||
      typeof features[metric] === typeof []
    ) {
      return;
    } else {
      metricValue.innerText = features[metric];
    }
  });
}

function processAmplitudeSpectrum(chunk) {

  // spectral flux = windowed DFT of signal
  const amplitudeSpectrum = chunk.map((value) => value);
  // noise gate = truncate values below threshold -> skipped
  // windowed signal normalization -> skipped
  // compression gamma -> skipped

  // compute the max value of the DFT
  const dftMax = Math.max(...amplitudeSpectrum);
  // const dftMax = Math.log10(Math.max(...amplitudeSpectrum));

  // filter cut off (low pass) fc = 10 Hz (order 15 ?)
  // var fft = new FFT(1024, AUDIO_SAMPLE_RATE);
  // fft.forward(amplitudeSpectrum);
  // var spectrum = fft.spectrum;
  // var lpfilter = IIRFilter(LOWPASS, 15, AUDIO_SAMPLE_RATE);
  // lpfilter.process(spectrum);

  // onset threshold = 0.1 (std above mean + offset)
  const mean = amplitudeSpectrum.reduce((a, b) => a + b, 0) / amplitudeSpectrum.length;
  const variance = amplitudeSpectrum.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amplitudeSpectrum.length;
  const stdDev = Math.sqrt(variance);
  const stdDevAboveMean = mean + STD_FACTOR * stdDev + STD_OFFSET;

  if (dftMax > stdDevAboveMean) {
    if (MAX_IS_OVER_STD === false) {
      console.log("pulse detected!");
      PULSE = 1.0;
    }
    MAX_IS_OVER_STD = true;
  } else {
    MAX_IS_OVER_STD = false;
  }
  PULSE *= PULSE_DECAY;

  return {
    amplitudeSpectrum: amplitudeSpectrum,
    dftMax: dftMax,
    mean: mean,
    stdDevAboveMean: stdDevAboveMean,
  };
}

function addToChartBtt(res) {
  CHART_BTT.data.labels.push(counter);
  CHART_BTT.data.datasets[0].data.push(res.dftMax);
  CHART_BTT.data.datasets[1].data.push(res.mean);
  CHART_BTT.data.datasets[2].data.push(res.stdDevAboveMean);
  CHART_BTT.data.datasets[3].data.push(PULSE);
  if (CHART_BTT.data.labels.length > 500) {
    CHART_BTT.data.labels.shift();
    CHART_BTT.data.datasets[0].data.shift();
    CHART_BTT.data.datasets[1].data.shift();
    CHART_BTT.data.datasets[2].data.shift();
    CHART_BTT.data.datasets[3].data.shift();
  }
  counter += 1;
  CHART_BTT.update();
}

async function startBttRoutine() {
  const constraints = { audio: true };
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  await audioCtx.audioWorklet.addModule("../custom/btt.js");
  await audioCtx.audioWorklet.addModule("../custom/muter.js");
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
      audioChain.push(addMediaStreamSourceNode(audioCtx, stream));
      audioChain.push(
        addBiquadFilterNode(audioCtx, {
          type: "bandpass",
          frequency: 160,
          q: 60,
          gain: 20.0,
        })
      );
      audioChain.push(addGainNode(audioCtx, 1.0, 100.0));
      // audioChain.push(addFftNode(audioCtx, fftCallback));
      audioChain.push(addCustomNode(audioCtx, "muter-processor"));

      /* connect the nodes */
      plugAudioNodes(audioCtx, audioChain);

      /* add plotting section */
      addPlottingSection();

      /* meyda analyzer */
      if (typeof Meyda === "undefined") {
        console.log("Meyda could not be found! Have you included it?");
      } else {
        const analyzerA = Meyda.createMeydaAnalyzer({
          audioContext: audioCtx,
          source: audioChain[2],
          bufferSize: 1024,
          featureExtractors: METRICS,
          callback: (features) => {
            onMetrics(features);
          },
        });
        analyzerA.start();
      }
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
startBttRoutine();
