// Import Third-party Dependencies
import wcswidth from "@topcli/wcwidth";

// Import Internal Dependencies
import { Action } from "./Action.class.ts";
import { Write } from "./Write.class.ts";
import { Cursor } from "../cursor.ts";

export type EraseOptions = {
  length?: number;
  steps?: number;
};

export class Erase extends Action {
  public readonly name = "erase";

  private length = Infinity;
  private steps = 1;

  constructor(options: EraseOptions) {
    super();

    Object.assign(this, options);
  }

  execute(
    cursor: Cursor,
    actions: Iterable<Write>
  ): void {
    let numberOfSteps = 0;
    let mustMoveCursor = false;

    for (const writeAction of actions) {
      if (numberOfSteps++ === this.steps) {
        break;
      }
      mustMoveCursor && cursor.up(writeAction.length);
      let currLength = 0;

      for (const segment of writeAction.getIterableSegmentsReversed()) {
        currLength += wcswidth(segment);

        cursor.erase(segment);
        writeAction.sleep();

        if (currLength >= this.length) {
          break;
        }
      }
      mustMoveCursor = true;
    }
  }

  async executeAsync(
    cursor: Cursor,
    actions: Iterable<Write>
  ): Promise<void> {
    let numberOfSteps = 0;
    let mustMoveCursor = false;

    for (const writeAction of actions) {
      if (numberOfSteps++ === this.steps) {
        break;
      }
      mustMoveCursor && cursor.up(writeAction.length);
      let currLength = 0;

      for (const segment of writeAction.getIterableSegmentsReversed()) {
        currLength += wcswidth(segment);

        cursor.erase(segment);
        await writeAction.sleepAsync();

        if (currLength >= this.length) {
          break;
        }
      }
      mustMoveCursor = true;
    }
  }
}
