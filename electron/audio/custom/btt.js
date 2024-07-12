// btt.js

class BttProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = (event) => {
      console.log("[BttProcessor]", event.data);
    };
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    // const windowed = [];
    // output.forEach(element => {
    //   windowed.push(new Float32Array(element.length));
    // });

    for (let channel = 0; channel < input.length; ++channel) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];
      // const windowedChannel = windowed[channel];

      for (let i = 0; i < inputChannel.length; ++i) {
        outputChannel[i] = inputChannel[i];
        // windowedChannel[i] = inputChannel[i];

        // // Apply windowing with overlapping ratio of 87.5%
        // const windowSize = inputChannel.length;
        // const overlapRatio = 0.875;
        // const overlap = Math.floor(windowSize * overlapRatio);
        // const window = new Float32Array(windowSize);

        // for (let i = 0; i < windowSize; i++) {
        //   const windowValue = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (windowSize - 1)));
        //   window[i] = windowValue;
        // }

        // for (let i = 0; i < inputChannel.length; i += overlap) {
        //   const chunk = inputChannel.slice(i, i + windowSize);
        //   const windowedChunk = new Float32Array(windowSize);

        //   for (let j = 0; j < windowSize; j++) {
        //     windowedChunk[j] = chunk[j] * window[j];
        //   }

          // Perform further processing on the windowed chunk
          // ...

          // Copy the windowed chunk back to the output
          // windowedChannel.set(windowedChunk, i);
        // }
      }
    }

    this.port.postMessage({
      signal: output,
      // windowed: windowed
    });

    return true;
  }
}

registerProcessor("btt-processor", BttProcessor);