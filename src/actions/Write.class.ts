/* eslint-disable func-style */
// Import Node.js Dependencies
import timers from "node:timers/promises";

// Import Third-party Dependencies
import ansiRegex from "ansi-regex";
import wcswidth from "@topcli/wcwidth";

// Import Internal Dependencies
import { Action } from "./Action.class.js";
import { sleep } from "../utils.js";
import { Cursor } from "../cursor.js";
import { AnsiSegmenter } from "../class/AnsiSegmenter.class.js";

// CONSTANTS
const kAnsiRegExp = ansiRegex();
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

  * getIterableSegments(): IterableIterator<string> {
    for (const input of this.inputs) {
      yield* this.segmenter.segment(input.raw);
    }
  }

  getIterableSegmentsReversed(): string[] {
    return Array.from(this.getIterableSegments())
      .filter((segment) => !kAnsiRegExp.test(segment))
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
    const lastAnsiSegments: string[] = [];

    for (const segment of this.getIterableSegments()) {
      if (kAnsiRegExp.test(segment)) {
        if (segment.includes(kAnsiReset)) {
          lastAnsiSegments.pop();
        }
        else {
          lastAnsiSegments.push(segment);
        }

        cursor.writeRaw(segment.trim());
      }
      else {
        const lastAnsiSegment = lastAnsiSegments.at(-1) ?? kAnsiReset;

        cursor.write(segment, lastAnsiSegment);
        this.sleep();
      }
    }
  }

  async executeAsync(cursor: Cursor): Promise<void> {
    const lastAnsiSegments: string[] = [];

    for (const segment of this.getIterableSegments()) {
      if (kAnsiRegExp.test(segment)) {
        if (segment.includes(kAnsiReset)) {
          lastAnsiSegments.pop();
        }
        else {
          lastAnsiSegments.push(segment);
        }

        cursor.writeRaw(segment);
      }
      else {
        const lastAnsiSegment = lastAnsiSegments.at(-1) ?? kAnsiReset;

        cursor.write(segment, lastAnsiSegment);
        await this.sleepAsync();
      }
    }
  }
}
