// Import Internal Dependencies
import { Cursor } from "../cursor.js";

export abstract class Action {
  abstract readonly name: string;

  abstract execute(cursor: Cursor, ...args: any[]): void;
  abstract executeAsync(cursor: Cursor, ...args: any[]): Promise<void>;
}
