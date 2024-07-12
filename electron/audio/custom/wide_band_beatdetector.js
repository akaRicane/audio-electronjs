// wide_band_beatdetector.js

class WideBandBeatDetectorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.threshold = 0.5;
    this.previousMax = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    // console.log("new frame")

    for (let channel = 0; channel < input.length; ++channel) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];

      for (let i = 0; i < inputChannel.length; ++i) {
        if (inputChannel[i] > this.threshold && this.previousMax <= this.threshold) {
          console.log("beat");
        }
        this.previousMax = Math.max(inputChannel[i], this.previousMax);
        outputChannel[i] = inputChannel[i];
      }
    }

    return true;
  }
}

registerProcessor("wide-band-beatdetector-processor", WideBandBeatDetectorProcessor);