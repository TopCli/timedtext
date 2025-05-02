# Timedtext
Display text in the terminal with temporal effects like a typewriter ✍️, pauses ⏸️, and erasures ⌫ — built for expressive and dynamic CLI experiences.

> [!CAUTION]
> The erase feature is not fully stable and may result in unexpected behavior. Use with caution.

## Requirements
- [Node.js](https://nodejs.org/en/) v22 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @topcli/timedtext
# or
$ yarn add @topcli/timedtext
```

## Usage example

Execute one synchronously

```ts
import TimedText from "@topcli/timedtext";
import kleur from "kleur";

new TimedText()
  .write("Hello world!\n", {
    interval: 40
  })
  .write(kleur.yellow(`Coding a ${kleur.green("cool")} new ${kleur.blue("package")} for ${kleur.white("CLI")} 😲`), {
    interval: 50
  })
  .pause(250)
  .erase({ steps: 1 })
  .pause(100)
  .write(kleur.magenta("Get the party started!"), {
    interval: 150,
    segmenter: {
      granularity: "word"
    }
  })
  .execute({ jumpLineBeforeExecution: true });
```

## API

```ts
class TimedText {
  constructor(options?: TimedTextOptions);

  jumpCursorToTheEnd(): void;
  write(input: string, options?: WriteTextOptions): this;
  pause(duration: number): this;
  erase(options?: EraseTextOptions): this;
  execute(options?: ExecuteOptions): void;
  executeAsync(options?: ExecuteOptions): Promise<void>;

  static DefaultLocal: Intl.LocalesArgument;
  static DefaultSegmenterGranularity: Intl.SegmenterOptions["granularity"];
}
```

### write(input: string, options?: WriteTextOptions): this
Add a timed write action to the sequence.

```ts
interface WriteTextOptions {
  interval?: number;
  segmenter?: SegmenterOptions;
}
```

### pause(duration: number): this
Pause the sequence for duration milliseconds.

### erase(options?: EraseTextOptions): this
Erase one or multiple previous `write()` calls.

```ts
type EraseTextOptions = {
  length?: number;
  steps?: number;
};
```

If no options are provided, all previous writes are erased.

> [!WARNING]
> Calling `erase()` before any `write()` or after a full erase will throw an error.

### execute(options?: ExecuteOptions): void
Execute the sequence synchronously (using Atomics.wait under the hood).

```ts
type ExecuteOptions = {
  /**
   * @description
   * Default to `true` for Synchronous execution and `false` for Asynchronous
   */
  jumpToCursorAfterExecution?: boolean;
};
```

### executeAsync(options?: ExecuteOptions): Promise<void>
Same as `execute()`, but supports asynchronous delays (useful for orchestrating multiple instances).

Example

```ts
console.log("");
const tt1 = new TimedText();

console.log("\n\n");
const tt2 = new TimedText();

await Promise.all([
  tt1.executeAsync(),
  tt2.executeAsync()
]);

tt2.jumpCursorToTheEnd();
```

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
