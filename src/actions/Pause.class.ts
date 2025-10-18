// Import Node.js Dependencies
import timers from "node:timers/promises";

// Import Internal Dependencies
import { Action } from "./Action.class.ts";
import { Cursor } from "../cursor.ts";
import * as utils from "../utils/index.ts";

export class Pause extends Action {
  public readonly name = "pause";

  public time: number;

  constructor(pauseTimeInMilliseconds: number) {
    super();

    this.time = pauseTimeInMilliseconds;
  }

  execute(_: Cursor): void {
    utils.sleep(this.time);
  }

  async executeAsync(_: Cursor): Promise<void> {
    await timers.setTimeout(this.time);
  }
}
