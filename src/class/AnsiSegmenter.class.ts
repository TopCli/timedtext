// Import Internal Dependencies
import {
  extractAnsiCodesFromSegment
} from "../utils/extractAnsiCodesFromSegment.js";
import { AnsiSegments } from "./AnsiSegments.class.js";

export class AnsiSegmenter {
  public segmenter: Intl.Segmenter;

  constructor(
    locales?: string,
    options?: Intl.SegmenterOptions
  ) {
    this.segmenter = new Intl.Segmenter(locales, options);
  }

  segment(
    nonSegmentedInput: string
  ): AnsiSegments[] {
    const { rawSegment, codes } = extractAnsiCodesFromSegment(nonSegmentedInput);

    const segments: (Intl.SegmentData | AnsiSegments)[] = [
      ...this.segmenter.segment(rawSegment)
    ];

    for (const code of codes) {
      let currentSegmentOffset = 0;

      for (let id = 0; id < segments.length; id++) {
        const segmentData = segments[id];
        currentSegmentOffset += segmentData.segment.length;

        if (code.offset > currentSegmentOffset) {
          continue;
        }

        if (segmentData instanceof AnsiSegments) {
          segmentData.push(code);
        }
        else {
          const offset = currentSegmentOffset - segmentData.segment.length;
          segments[id] = new AnsiSegments(segmentData, offset).push(code);
        }

        break;
      }
    }

    return segments.map(
      (segment) => (segment instanceof AnsiSegments ? segment : new AnsiSegments(segment))
    );
  }
}
