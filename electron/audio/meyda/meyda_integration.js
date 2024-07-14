console.log("meyda_integration.js");

let METRICS = ["amplitudeSpectrum", "rms"];
let CHART_BTT = null;
let counter = 0;
let MEANS = [];
let THRESHED = [];
let MAX_IS_OVER_STD = false;
let PULSE = 0.0;
let PULSE_DECAY = 0.5;
let NOISE_GATE_THRESHOLD = -1;
let FILTER_FLUX = 5;
let STD_FACTOR = 0.5;
let STD_OFFSET = 3.0;
let MEYDA_BUFFER_SIZE = 1024;
let MAX_MEMORY_GRAPH_SIZE = 20;

class PulseGenerator {
  constructor() {
    this.pulse = 0.0;
    this.activeBpm = 120.0;
    this.decay = 0.5;
    this.waitForSync = false;
    this.expectedFramesBetweenPulses = 0;
    this.framesSinceLastPulse = 0;
    this.taptempoBuffer = [];
    this.autotempo = false;
    this.updateActiveBpm(this.activeBpm);
    this.pulseGenerator();
  }

  buildUI() {
    const wrapper = document.getElementById("bpmGeneratorWrapper");
    console.log(document.getElementById("bpmGeneratorWrapper"));

    const title = document.createElement("label");
    title.innerText = "Pulse Generator";
    title.style.fontWeight = "bold";
    title.style.marginTop = "20px";
    wrapper.appendChild(title);

    const activeBpmWrapper = document.createElement("div");
    activeBpmWrapper.style.display = "flex";
    activeBpmWrapper.style.flexDirection = "row";
    activeBpmWrapper.style.marginTop = "10px";

    const activeBpmLabel = document.createElement("label");
    activeBpmLabel.innerText = "Active BPM";
    activeBpmLabel.style.width = "25%";
    activeBpmWrapper.appendChild(activeBpmLabel);

    const activeBpmValue = document.createElement("label");
    activeBpmValue.id = "activeBpmValue";
    activeBpmValue.innerText = this.activeBpm;
    activeBpmValue.style.width = "25%";
    activeBpmWrapper.appendChild(activeBpmValue);

    wrapper.appendChild(activeBpmWrapper);

    const queryManualBpmWrapper = document.createElement("div");
    queryManualBpmWrapper.style.display = "flex";
    queryManualBpmWrapper.style.flexDirection = "row";
    queryManualBpmWrapper.style.marginTop = "10px";

    const queryManualBpmLabel = document.createElement("label");
    queryManualBpmLabel.innerText = "Manual BPM";
    queryManualBpmLabel.style.width = "25%";
    queryManualBpmWrapper.appendChild(queryManualBpmLabel);

    const taptempoButton = document.createElement("button");
    taptempoButton.innerText = "Tap Tempo";
    taptempoButton.onclick = () => {
      this.taptempo();
    };
    queryManualBpmWrapper.appendChild(taptempoButton);

    const autotempoButton = document.createElement("button");
    autotempoButton.innerText = "Auto Tempo";
    autotempoButton.onclick = () => {
      this.autotempo = !this.autotempo;
      if (this.autotempo) {
        autotempoButton.style.backgroundColor = "green";
      } else {
        autotempoButton.style.backgroundColor = "transparent";
      }
    };
    queryManualBpmWrapper.appendChild(autotempoButton);

    const queryManualBpmValue = document.createElement("input");
    queryManualBpmValue.id = "queryManualBpmValue";
    queryManualBpmValue.type = "number";
    queryManualBpmValue.min = 0.0;
    queryManualBpmValue.max = 200.0;
    queryManualBpmValue.step = 1.0;
    queryManualBpmValue.value = 120.0;
    queryManualBpmWrapper.appendChild(queryManualBpmValue);

    const queryManualBpmButton = document.createElement("button");
    queryManualBpmButton.innerText = "Set Manual BPM";
    queryManualBpmButton.onclick = () => {
      this.updateActiveBpm(parseFloat(queryManualBpmValue.value));
    };
    queryManualBpmWrapper.appendChild(queryManualBpmButton);

    const syncManualBpmButton = document.createElement("button");
    syncManualBpmButton.innerText = "Sync Manual BPM";
    syncManualBpmButton.style.width = "25%";
    syncManualBpmButton.onclick = () => {
      this.waitForSync = true;
    };
    queryManualBpmWrapper.appendChild(syncManualBpmButton);

    wrapper.appendChild(queryManualBpmWrapper);
  }

  updateActiveBpm(bpm) {
    this.activeBpm = bpm;
    // Calculate beats per second
    const bps = bpm / 60.0;
    // Calculate Meyda framerate (how often Meyda calculates the audio feature per second)
    const meydaFramerate = AUDIO_SAMPLE_RATE / MEYDA_BUFFER_SIZE; // e.g., 44100 / 512
    // Adjust expected frames between pulses for Meyda framerate
    this.expectedFramesBetweenPulses = meydaFramerate / bps;
    console.log(
      "expectedFramesBetweenPulses: " + this.expectedFramesBetweenPulses
    );
    const label = document.getElementById("activeBpmValue");
    label ? (label.innerText = bpm) : null;
  }

  taptempo() {
    const now = new Date().getTime();
    this.taptempoBuffer.forEach((element, index) => {
      if (now - element > 5000) {
        this.taptempoBuffer.splice(index, 1);
      }
    });
    this.taptempoBuffer.push(now);
    const timeDiffs = [];
    this.taptempoBuffer.forEach((element, index) => {
      if (index > 0) {
        timeDiffs.push(element - this.taptempoBuffer[index - 1]);
      }
    });
    if (timeDiffs.length > 2) {
      const avg = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
      const bpm = Math.floor(60000 / avg);
      const input = document.getElementById("queryManualBpmValue");
      input ? (input.value = bpm) : null;
    }
  }

  pulseFromExternal() {
    console.log("pulseFromExternal");
    if (this.autotempo) {
      this.autotempoFinder();
    }
    if (this.waitForSync) {
      this.waitForSync = false;
    }
  }

  autotempoFinder() {}

  pulseGenerator() {
    if (this.waitForSync) {
      this.pulse = 0.0;
      return;
    }
    if (this.framesSinceLastPulse >= this.expectedFramesBetweenPulses) {
      this.pulse = 1.0;
      this.framesSinceLastPulse = 0;
    } else {
      this.pulse *= this.decay;
      this.framesSinceLastPulse += 1;
    }
  }
}

let PULSE_GENERATOR = new PulseGenerator();

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

  const noisereducerWrapper = document.createElement("div");
  noisereducerWrapper.id = "noisereducerWrapper";
  noisereducerWrapper.style.display = "flex";
  noisereducerWrapper.style.flexDirection = "row";

  const noisereducerLabel = document.createElement("label");
  noisereducerLabel.id = "noisereducerLabel";
  noisereducerLabel.innerText = "noisereducer";
  noisereducerLabel.style.width = "25%";
  noisereducerWrapper.appendChild(noisereducerLabel);

  const noisereducerValue = document.createElement("input");
  noisereducerValue.id = "noisereducerValue";
  noisereducerValue.type = "range";
  noisereducerValue.min = -100;
  noisereducerValue.max = 0.0;
  noisereducerValue.step = 1;
  noisereducerValue.value = NOISE_GATE_THRESHOLD;
  noisereducerValue.style.width = "25%";
  noisereducerValue.oninput = (event) => {
    noisereducerLabel.innerText = "noisereducer (" + event.target.value + ")";
    NOISE_GATE_THRESHOLD = parseFloat(event.target.value);
  };
  noisereducerWrapper.appendChild(noisereducerValue);
  metricsWrapper.appendChild(noisereducerWrapper);

  const filterFluxWrapper = document.createElement("div");
  filterFluxWrapper.id = "filterFluxWrapper";
  filterFluxWrapper.style.display = "flex";
  filterFluxWrapper.style.flexDirection = "row";

  const filterFluxLabel = document.createElement("label");
  filterFluxLabel.id = "filterFluxLabel";
  filterFluxLabel.innerText = "filterFlux";
  filterFluxLabel.style.width = "25%";
  filterFluxWrapper.appendChild(filterFluxLabel);

  const filterFluxValue = document.createElement("input");
  filterFluxValue.id = "filterFluxValue";
  filterFluxValue.type = "range";
  filterFluxValue.min = 0.0;
  filterFluxValue.max = 200;
  filterFluxValue.step = 1;
  filterFluxValue.value = FILTER_FLUX;
  filterFluxValue.style.width = "25%";
  filterFluxValue.oninput = (event) => {
    filterFluxLabel.innerText = "filterFlux (" + event.target.value + ")";
    FILTER_FLUX = parseFloat(event.target.value);
  };
  filterFluxWrapper.appendChild(filterFluxValue);
  metricsWrapper.appendChild(filterFluxWrapper);

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

  const ymaxWrapper = document.createElement("div");
  ymaxWrapper.id = "ymaxWrapper";
  ymaxWrapper.style.display = "flex";
  ymaxWrapper.style.flexDirection = "row";

  const ymaxLabel = document.createElement("label");
  ymaxLabel.id = "ymaxLabel";
  ymaxLabel.innerText = "ymax";
  ymaxLabel.style.width = "25%";
  ymaxWrapper.appendChild(ymaxLabel);

  const ymaxValue = document.createElement("input");
  ymaxValue.id = "ymaxValue";
  ymaxValue.type = "range";
  ymaxValue.min = 1.0;
  ymaxValue.max = 100.0;
  ymaxValue.step = 1.0;
  ymaxValue.value = 10.0;
  ymaxValue.style.width = "25%";
  ymaxValue.oninput = (event) => {
    ymaxLabel.innerText = "ymax (" + event.target.value + ")";
    CHART_BTT.options.scales.y.max = parseFloat(event.target.value);
  };
  ymaxWrapper.appendChild(ymaxValue);
  metricsWrapper.appendChild(ymaxWrapper);

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
          opacity: 0.2,
          fill: false,
        },
        {
          label: "mean",
          data: [],
          opacity: 0.5,
          fill: false,
        },
        {
          label: "std",
          data: [],
          opacity: 0.3,
          fill: false,
        },
        {
          label: "pulse",
          data: [],
          opacity: 1.0,
          fill: false,
        },
        {
          label: "BPM Pulse",
          data: [],
          opacity: 1.0,
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
          max: parseInt(ymaxValue.value),
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
  PULSE *= PULSE_DECAY;
  let amplitudeSpectrum = [];

  // compute the max value of the DFT
  const max = Math.max(...chunk);
  // threshold the amplitude spectrum
  chunk.forEach((value, index) => {
    if (
      (Math.log10(value / max) > NOISE_GATE_THRESHOLD) &&
      (index < FILTER_FLUX)
    ) {
      // amplitudeSpectrum.push(value / (2 * index + 1));
      // amplitudeSpectrum.push(Math.sqrt(value));
      amplitudeSpectrum.push(value);
    } else {
      amplitudeSpectrum.push(0);
    }
  });

  console.log(amplitudeSpectrum);
  // amplitudeSpectrum.forEach((element) => {
  //   element = element / max;
  // });
  const dftMax = Math.max(...amplitudeSpectrum);

  // onset threshold = 0.1 (std above mean + offset)
  const mean = chunk.reduce((a, b) => a + b, 0) / chunk.length;
  const variance =
    chunk.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / chunk.length;;
  const stdDev = Math.sqrt(variance);
  const stdDevAboveMean = mean + STD_FACTOR * stdDev + STD_OFFSET;

  if (dftMax > stdDevAboveMean) {
    if (MAX_IS_OVER_STD === false && PULSE < 0.01) {
      onPulseComputeBpm();
    }
    MAX_IS_OVER_STD = true;
  } else {
    MAX_IS_OVER_STD = false;
  }
  PULSE < 0.01 ? (PULSE = 0) : null;

  return {
    amplitudeSpectrum: amplitudeSpectrum,
    dftMax: dftMax,
    mean: mean,
    stdDevAboveMean: stdDevAboveMean,
  };
}

function onPulseComputeBpm() {
  // console.log("pulse detected!");
  PULSE_GENERATOR.pulseFromExternal();
  PULSE = 1.0;
}

function addToChartBtt(res) {
  CHART_BTT.data.labels.push(counter);
  CHART_BTT.data.datasets[0].data.push(res.dftMax);
  CHART_BTT.data.datasets[1].data.push(res.mean);
  CHART_BTT.data.datasets[2].data.push(res.stdDevAboveMean);
  CHART_BTT.data.datasets[3].data.push(PULSE);
  CHART_BTT.data.datasets[4].data.push(PULSE_GENERATOR.pulse);
  if (CHART_BTT.data.labels.length > MAX_MEMORY_GRAPH_SIZE) {
    CHART_BTT.data.labels.shift();
    CHART_BTT.data.datasets[0].data.shift();
    CHART_BTT.data.datasets[1].data.shift();
    CHART_BTT.data.datasets[2].data.shift();
    CHART_BTT.data.datasets[3].data.shift();
    CHART_BTT.data.datasets[4].data.shift();
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

  PULSE_GENERATOR.buildUI();

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
      audioChain.push(addGainNode(audioCtx, 1.0, 100.0));
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
          source: audioChain[1],
          bufferSize: MEYDA_BUFFER_SIZE,
          featureExtractors: METRICS,
          callback: (features) => {
            PULSE_GENERATOR.pulseGenerator();
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
