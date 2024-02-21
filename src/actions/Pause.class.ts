/* eslint-disable @typescript-eslint/no-unused-vars */
// Import Node.js Dependencies
import timers from "node:timers/promises";

// Import Internal Dependencies
import { Action } from "./Action.class.js";
import { sleep } from "../utils.js";
import { Cursor } from "../cursor.js";

export class Pause extends Action {
  public readonly name = "pause";

  public time: number;

  constructor(pauseTimeInMilliseconds: number) {
    super();

    this.time = pauseTimeInMilliseconds;
  }

  execute(_: Cursor): void {
    sleep(this.time);
  }

  async executeAsync(_: Cursor): Promise<void> {
    await timers.setTimeout(this.time);
  }
}
