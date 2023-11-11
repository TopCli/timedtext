// Import Node.js Dependencies
import timers from "node:timers/promises";

// Import Internal Dependencies
import { Action } from "./Action.class.js";
import { sleep } from "../utils.js";
import { TTYCursor } from "../cursor.js";

export interface WriteOptions {
  interval?: number;
  segmenter: Intl.Segmenter;
}

export class Write extends Action {
  public readonly name = "write";

  public input: string;
  public interval: number;
  public segmenter: Intl.Segmenter;

  constructor(input: string, options: WriteOptions) {
    super();
    const { interval = 0, segmenter } = options;

    this.input = input;
    this.interval = interval;
    this.segmenter = segmenter;
  }

  get length() {
    return this.input.length;
  }

  getIterableSegments() {
    return this.segmenter.segment(this.input);
  }

  getIterableSegmentsReversed() {
    return Array.from(
      this.getIterableSegments()
    ).reverse();
  }

  sleep() {
    if (this.interval > 0) {
      sleep(this.interval);
    }
  }

  sleepAsync() {
    return timers.setTimeout(this.interval);
  }

  execute(cursor: TTYCursor): void {
    for (const { segment } of this.getIterableSegments()) {
      cursor.write(segment);
      this.sleep();
    }
  }

  async executeAsync(cursor: TTYCursor): Promise<void> {
    for (const { segment } of this.getIterableSegments()) {
      cursor.write(segment);
      await this.sleepAsync();
    }
  }
}
