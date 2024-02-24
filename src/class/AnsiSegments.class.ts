// Import Internal Dependencies
import {
  AnsiCode
} from "../utils/extractAnsiCodesFromSegment.js";

export class AnsiSegments {
  public codes: AnsiCode[] = [];
  #segment: string;
  #offset: number;

  constructor(
    segmentData: Intl.SegmentData,
    offset = 0
  ) {
    this.#segment = segmentData.segment;
    this.#offset = offset;
  }

  push(code: AnsiCode) {
    code.offset -= this.#offset;
    this.codes.push(code);

    return this;
  }

  get last(): string | undefined {
    return this.codes.at(-1)?.value;
  }

  get segment() {
    return this.#segment;
  }

  toString() {
    let originalSegment = this.#segment;
    let codeOffset = 0;

    for (const code of this.codes) {
      const offset = codeOffset + code.offset;
      originalSegment =
        originalSegment.slice(0, offset) +
        code.value +
        originalSegment.slice(offset);

      codeOffset += code.value.length;
    }

    return originalSegment;
  }
}
