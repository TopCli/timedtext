// Import Internal Dependencies
import { TTYCursor } from "../cursor.js";

export abstract class Action {
  abstract readonly name: string;

  abstract execute(cursor: TTYCursor, ...args: any[]): void;
  abstract executeAsync(cursor: TTYCursor, ...args: any[]): Promise<void>;
}
