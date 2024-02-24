// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Third-party Dependencies
import kleur from "kleur";

// Import Internal Dependencies
import { AnsiSegmenter } from "../src/class/AnsiSegmenter.class.js";

describe("AnsiSegmenter", () => {
  describe("no ANSI characters", () => {
    it("should segment the provided string using 'grapheme' granularity (default)", () => {
      const segmenter = new AnsiSegmenter("en-US");

      const segments = segmenter.segment("hello world!\n")
        .map((segment) => segment.toString());

      assert.deepEqual(
        segments,
        ["h", "e", "l", "l", "o", " ", "w", "o", "r", "l", "d", "!", "\n"]
      );
    });

    it("should segment the provided string using 'word' granularity", () => {
      const segmenter = new AnsiSegmenter("en-US", {
        granularity: "word"
      });

      const segments = segmenter.segment("hello world!\n")
        .map((segment) => segment.toString());

      assert.deepEqual(
        segments,
        ["hello", " ", "world", "!", "\n"]
      );
    });

    it("should segment the provided string using 'sentence' granularity", () => {
      const segmenter = new AnsiSegmenter("en-US", {
        granularity: "sentence"
      });

      const segments = segmenter.segment("hello world!\nHow are you?")
        .map((segment) => segment.toString());

      assert.deepEqual(
        segments,
        ["hello world!\n", "How are you?"]
      );
    });
  });

  describe("with ANSI characters", () => {
    it("should detect the ANSI (color) at the start and end of the provided input", () => {
      const segmenter = new AnsiSegmenter("en-US", {
        granularity: "word"
      });

      const inputToSegment = kleur.blue("oh no!");

      const segments = segmenter.segment(inputToSegment)
        .map((segment) => segment.toString());

      assert.deepEqual(
        segments,
        ["\x1B[34moh", " ", "no", "!\x1B[39m"]
      );
    });

    it("should segments multiple depth of ANSI colors using 'word' granularity", () => {
      const segmenter = new AnsiSegmenter("en-US", {
        granularity: "word"
      });

      const inputToSegment = kleur.blue(`ohhh${kleur.red("hhh")}`) + "yyy";
      const segments = segmenter.segment(inputToSegment)
        .map((segment) => segment.toString());

      assert.deepEqual(
        segments,
        ["\x1B[34mohhh\x1B[31mhhh\x1B[39m\x1B[34m\x1B[39myyy"]
      );
    });
  });
});
