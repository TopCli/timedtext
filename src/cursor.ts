// Import Node.js Dependencies
import readline from "node:readline";
import * as TTY from "node:tty";

// Import Third-party Dependencies
import wcwidth from "@topcli/wcwidth";
import getCursorPosition from "get-cursor-position";
import ansiRegex from "ansi-regex";

// CONSTANTS
const kAnsiRegex = ansiRegex();

export class Cursor {
  public x: number;
  public y: number;

  public birthLocation: {
    x: number;
    y: number;
  };
  public output: TTY.WriteStream;

  constructor(output: TTY.WriteStream) {
    this.#getCursorPosition();
    this.birthLocation = {
      x: this.x,
      y: this.y
    };

    this.output = output;
  }

  reset(jumpToBirthLocation = false) {
    this.x = this.birthLocation.x;
    this.y = this.birthLocation.y;

    if (jumpToBirthLocation) {
      this.jumpTo();
    }

    return this;
  }

  #getCursorPosition() {
    const { row, col } = getCursorPosition.sync();

    this.x = col - 1;
    this.y = row - 1;

    return this;
  }

  moveTo(x = 0, y = 0) {
    readline.moveCursor(this.output, x, y);

    return this;
  }

  jumpTo(x = this.x, y = this.y) {
    readline.cursorTo(this.output, x, y);

    return this;
  }

  writeRaw(input: string) {
    this.output.write(input.replace(/\r?\n|\r/g, ""));

    return this;
  }

  write(input: string, ansi = "") {
    this.jumpTo();

    const dy = (input.match(/\n/g) || "").length;
    this.y += dy;
    this.x = dy === 0 ? this.x + wcwidth(input.replace(kAnsiRegex, "")) : 0;

    return this.writeRaw(ansi + input);
  }

  erase(input: string) {
    this.jumpTo();
    const inputLength = wcwidth(input);
    this.x -= inputLength;

    readline.moveCursor(this.output, -inputLength, 0);
    readline.clearLine(this.output, 1);
  }

  up(dx = 0) {
    this.jumpTo();
    this.x = dx;
    this.y -= 1;

    return this.moveTo(dx, -1);
  }

  down(dx = 0) {
    this.jumpTo();
    this.x = dx;
    this.y += 1;

    return this.moveTo(dx, 1);
  }
}
