// Import Third-party Dependencies
import ansiRegex from "ansi-regex";

export type AnsiCode = {
  offset: number;
  value: string;
}

export function extractAnsiCodesFromSegment(
  input: string
): { rawSegment: string; codes: AnsiCode[]; } {
  const regexp = ansiRegex();
  const codes: AnsiCode[] = [];
  let lastIndex = 0;
  let rawSegment = "";

  for (
    let result: RegExpExecArray | null;
    // eslint-disable-next-line no-cond-assign
    result = regexp.exec(input);
    result !== null
  ) {
    if (lastIndex < result.index) {
      rawSegment += input.slice(lastIndex, result.index);
    }

    const ansiValue = result[0];
    lastIndex = result.index + ansiValue.length;

    codes.push({
      offset: rawSegment.length,
      value: input.slice(result.index, lastIndex)
    });
  }

  if (lastIndex < input.length) {
    rawSegment += input.slice(lastIndex, input.length);
  }

  return { rawSegment, codes };
}
