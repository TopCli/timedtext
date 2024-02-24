/* eslint-disable func-style */
// Import Node.js Dependencies
import timers from "node:timers/promises";

// Import Third-party Dependencies
import wcswidth from "@topcli/wcwidth";

// Import Internal Dependencies
import { Action } from "./Action.class.js";
import { sleep } from "../utils.js";
import { Cursor } from "../cursor.js";
import { AnsiSegmenter } from "../index.js";
import { AnsiSegments } from "../class/AnsiSegments.class.js";

// CONSTANTS
const kAnsiReset = `\x1b[0m`;

export type WriteInput = {
  raw: string;
}

export interface WriteOptions {
  interval?: number;
  segmenter: AnsiSegmenter;
}

export class Write extends Action {
  public readonly name = "write";

  public inputs: WriteInput[] = [];
  public interval: number;
  public segmenter: AnsiSegmenter;
  public length = 0;

  constructor(
    inputs: Iterable<string>,
    options: WriteOptions
  ) {
    super();
    const { interval = 0, segmenter } = options;

    this.interval = interval;
    this.segmenter = segmenter;
    for (const input of inputs) {
      this.length += wcswidth(
        input
      );

      this.inputs.push({
        raw: input
      });
    }
  }

  * getIterableSegments(): IterableIterator<AnsiSegments> {
    for (const input of this.inputs) {
      yield* this.segmenter.segment(input.raw);
    }
  }

  getIterableSegmentsReversed(): string[] {
    return Array.from(this.getIterableSegments())
      .map((segment) => segment.segment)
      .reverse();
  }

  sleep() {
    if (this.interval > 0) {
      sleep(this.interval);
    }
  }

  sleepAsync() {
    return timers.setTimeout(this.interval);
  }

  execute(cursor: Cursor): void {
    const ansiCodesMemory: string[] = [];

    for (const segment of this.getIterableSegments()) {
      const lastMemoizedAnsiCode = ansiCodesMemory.at(-1) ?? kAnsiReset;
      cursor.write(segment.toString(), lastMemoizedAnsiCode);

      const lastSegmentAnsiCode = segment.last;
      if (lastSegmentAnsiCode) {
        ansiCodesMemory.push(lastSegmentAnsiCode);
      }

      this.sleep();
    }
  }

  async executeAsync(cursor: Cursor): Promise<void> {
    const ansiCodesMemory: string[] = [];

    for (const segment of this.getIterableSegments()) {
      const lastMemoizedAnsiCode = ansiCodesMemory.at(-1) ?? kAnsiReset;
      cursor.write(segment.toString(), lastMemoizedAnsiCode);

      const lastSegmentAnsiCode = segment.last;
      if (lastSegmentAnsiCode) {
        ansiCodesMemory.push(lastSegmentAnsiCode);
      }

      await this.sleepAsync();
    }
  }
}
