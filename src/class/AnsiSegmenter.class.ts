/* eslint-disable no-cond-assign */
// Import Third-party Dependencies
import ansiRegex from "ansi-regex";

export class AnsiSegmenter {
  public segmenter: Intl.Segmenter;

  constructor(
    locales?: string,
    options?: Intl.SegmenterOptions
  ) {
    this.segmenter = new Intl.Segmenter(locales, options);
  }

  * segment(
    nonSegmentedInput: string
  ): IterableIterator<string> {
    for (const { text, type } of splitAnsiString(nonSegmentedInput)) {
      if (type === "ansi") {
        yield text;
      }
      else {
        for (const { segment } of this.segmenter.segment(text)) {
          yield segment;
        }
      }
    }
  }
}

type splitAnsiResult =
  { text: string, type: "text" } |
  { text: string, type: "ansi" };

function* splitAnsiString(
  input: string
): IterableIterator<splitAnsiResult> {
  const regexp = ansiRegex();
  let lastIndex = 0;

  for (
    let result: RegExpExecArray | null;
    result = regexp.exec(input);
    result !== null
  ) {
    if (lastIndex < result.index) {
      yield {
        text: input.slice(lastIndex, result.index),
        type: "text"
      };
    }

    const ansiValue = result[0];
    lastIndex = result.index + ansiValue.length;

    yield {
      text: input.slice(result.index, lastIndex),
      type: "ansi"
    };
  }

  if (lastIndex < input.length) {
    yield {
      text: input.slice(lastIndex, input.length),
      type: "text"
    };
  }
}
