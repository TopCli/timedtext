// Import Node.js Dependencies
import * as TTY from "node:tty";

// Import Third-party Dependencies
import { AnsiSegmenter } from "@topcli/ansi-segmenter";

// Import Internal Dependencies
import {
  Write,
  type WriteOptions,
  Pause,
  Erase,
  type EraseOptions
} from "./actions/index.ts";
import { Cursor } from "./cursor.ts";

export type SegmenterOptions = {
  local: Intl.LocalesArgument;
} & Intl.SegmenterOptions;

export interface TimedTextOptions {
  stream?: TTY.WriteStream;
  segmenter?: SegmenterOptions;
}

export type WriteTextOptions = Omit<WriteOptions, "segmenter"> & {
  segmenter?: SegmenterOptions;
};
export type EraseTextOptions = EraseOptions;
export type ExecuteOptions = {
  /**
   * @description
   * Default to `true` for Synchronous execution and `false` for Asynchronous
   */
  jumpToCursorAfterExecution?: boolean;
};

export default class TimedText {
  static DefaultLocal: Intl.LocalesArgument = "en";
  static DefaultSegmenterGranularity: Intl.SegmenterOptions["granularity"] = "grapheme";

  private cursor: Cursor;
  private segmenter: AnsiSegmenter;

  private lastActionIsAFullErase = false;
  private writeActionCount = 0;

  #actions: (Write | Pause | Erase)[] = [];

  constructor(
    options: TimedTextOptions = {}
  ) {
    const {
      stream = process.stdout,
      segmenter = {
        local: TimedText.DefaultLocal,
        granularity: TimedText.DefaultSegmenterGranularity
      }
    } = options;

    this.cursor = new Cursor(stream);
    const { local, ...segmenterOptions } = segmenter;

    this.segmenter = new AnsiSegmenter(
      local,
      segmenterOptions
    );
  }

  jumpCursorToTheEnd() {
    this.cursor.jumpTo();
  }

  write(
    input: string,
    options: WriteTextOptions = {}
  ) {
    const { interval = 0 } = options;

    let segmenter = this.segmenter;
    if (options.segmenter) {
      const { local, ...segmenterOptions } = options.segmenter;

      segmenter = new AnsiSegmenter(
        local,
        segmenterOptions
      );
    }

    this.#actions.push(
      new Write([input], { segmenter, interval })
    );
    this.lastActionIsAFullErase = false;
    this.writeActionCount++;

    return this;
  }

  pause(
    time: number
  ) {
    this.#actions.push(new Pause(time));

    return this;
  }

  erase(
    options: EraseTextOptions = {}
  ) {
    if (this.#actions.length === 0) {
      throw new Error("must have at least one write before erasing");
    }
    if (this.lastActionIsAFullErase) {
      throw new Error("cannot erase after a full erase");
    }

    // Erase all previous write actions if options is empty
    if (Object.keys(options).length === 0) {
      options.steps = this.writeActionCount;
      this.lastActionIsAFullErase = true;
    }
    this.#actions.push(new Erase(options));

    return this;
  }

  * #getPreviousWriteActions(id: number): Iterable<Write> {
    for (let index = id; index >= 0; index--) {
      const action = this.#actions[index];
      if (action.name === "write") {
        yield action;
      }
    }
  }

  execute(
    options: ExecuteOptions = {}
  ) {
    const {
      jumpToCursorAfterExecution = true
    } = options;

    for (let id = 0; id < this.#actions.length; id++) {
      const action = this.#actions[id];

      switch (action.name) {
        case "pause":
        case "write":
          action.execute(this.cursor);
          break;
        case "erase":
          action.execute(this.cursor, this.#getPreviousWriteActions(id));
          break;
      }
    }

    if (jumpToCursorAfterExecution) {
      this.cursor.jumpTo();
    }
  }

  async executeAsync(
    options: ExecuteOptions = {}
  ) {
    const {
      jumpToCursorAfterExecution = false
    } = options;

    for (let id = 0; id < this.#actions.length; id++) {
      const action = this.#actions[id];

      switch (action.name) {
        case "pause":
        case "write":
          await action.executeAsync(this.cursor);
          break;
        case "erase":
          await action.executeAsync(this.cursor, this.#getPreviousWriteActions(id));
          break;
      }
    }

    if (jumpToCursorAfterExecution) {
      this.cursor.jumpTo();
    }
  }
}
