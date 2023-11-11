const nil = new Int32Array(new SharedArrayBuffer(4));

export function sleep(ms: number): void {
  Atomics.wait(nil, 0, 0, ms);
}
