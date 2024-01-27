// Import Node.js Dependencies
import readline from "node:readline";
import * as TTY from "node:tty";

// Import Third-party Dependencies
import wcwidth from "@topcli/wcwidth";
import getCursorPosition from "get-cursor-position";

export class TTYCursor {
  public x: number;
  public y: number;
  public stream: TTY.WriteStream;

  constructor(stream: TTY.WriteStream) {
    this.#getPosition();
    this.stream = stream;
  }

  #getPosition() {
    const { row, col } = getCursorPosition.sync();

    this.x = col - 1;
    this.y = row - 1;
  }

  jump() {
    readline.cursorTo(this.stream, this.x, this.y);
  }

  writeRaw(input: string) {
    this.stream.write(input.replace(/\r?\n|\r/g, ""));
  }

  write(input: string) {
    this.jump();

    const dy = (input.match(/\n/g) || "").length;
    this.y += dy;
    this.x = dy === 0 ? this.x + wcwidth(input) : 0;

    this.writeRaw(input);
  }

  erase(input: string) {
    this.jump();
    const inputLength = wcwidth(input);
    this.x -= inputLength;

    readline.moveCursor(this.stream, -inputLength, 0);
    readline.clearLine(this.stream, 1);
  }

  up(dx = 0) {
    this.jump();
    this.x = dx;
    this.y -= 1;

    readline.moveCursor(this.stream, dx, -1);
  }

  down(dx = 0) {
    this.jump();
    this.x = dx;
    this.y += 1;

    readline.moveCursor(this.stream, dx, 1);
  }
}
