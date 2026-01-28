export function getNow(req) {
  if (process.env.TEST_MODE === "1") {
    const fakeNow = req.headers["x-test-now-ms"];
    if (fakeNow) return Number(fakeNow);
  }
  return Date.now();
}
