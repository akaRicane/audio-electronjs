class BttNode extends AudioWorkletNode {
  constructor(audioContext, htmlDestination) {
    super(audioContext, "btt-processor");
    this.port.onmessage = (event) => {
      // console.log("[BttNode]", event.data);
      this.process(event.data.signal, event.data.windowed);
    };
    this.buildUI(htmlDestination);
    this.chartMemory = 256;
    this.chartManager = new RealTimeSignalChart(this.canvas.id, this.chartMemory);
  }

  buildUI(htmlDestination) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "row";

    document.getElementById(htmlDestination).appendChild(wrapper);

    this.wrapper = wrapper;
    insertBullet(this.wrapper);

    this.body = document.createElement("div");
    this.body.style.display = "flex";
    this.body.style.flexDirection = "column";
    this.wrapper.appendChild(this.body);

    const title = document.createElement("label");
    title.innerText = "BttNode";
    this.body.appendChild(title);

    const label = document.createElement("label");
    label.innerText = "expression space";
    this.body.appendChild(label);
    
    this.canvas = document.createElement("canvas");
    this.canvas.id = 'btt-canvas-' + Math.random().toString(36).substring(7);
    console.log(this.canvas.id);
    this.body.appendChild(this.canvas);
  }

  /**
   * 
   * @param {Float32Array} chunk 
   */
  process(outputChunk, windowedChunk) {
    // FFT of chunks
    // const fft = Meyda.amplitudeSpectrum(windowedChunk);
    // spectral flux = windowed DFT of signal
    // noise gate = truncate values below threshold
    // windowed signal normalization = skipped
    // compression gamma = skipped
    // filter cut off (low pass) fc = 10 Hz (order 15 ?)
    // onset threshold = 0.1 (std above mean + offset)
  }
}


class RealTimeSignalChart {
  constructor(canvasId, memory) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.memory = memory;
    this.chunks = [];
    this.initChart();
  }

  initChart() {
    this.chart = new Chart(this.canvas.getContext("2d"), {
      type: "line",
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        animations: false,
      }
    });
  }
}