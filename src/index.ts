import { Test, TestReporter, TestResult } from "beater-reporter";

class TapLikeReporter {
  private tests: Test[] = [];
  private p: (s: string) => void;

  constructor(p: (s: string) => void) {
    this.p = p;
  }

  finished(_: TestResult[]): void {
    // do nothing
  }

  started(tests: Test[]): void {
    this.tests = tests;
    this.p("TAP version 13");
    this.p(`1..${tests.length}`);
  }

  testStarted(_: Test): void {
    // do nothing
  }

  testFinished({ error, test }: TestResult): void {
    const name = test.name;
    const ok = typeof error === "undefined" ? "ok" : "not ok";
    const no = this.tests.indexOf(test) + 1;
    this.p(`${ok} ${no} - ${name}`);
    if (typeof error !== "undefined") {
      const stack = error.stack ?? "";
      this.p("  ---");
      this.p("  name: " + error.name);
      this.p(
        "  message: " +
          (error.message.indexOf("\n") >= 0
            ? "|2\n    " + error.message.split(/\n/).join("\n    ")
            : error.message)
      );
      this.p(
        "  stack: " +
          (stack.indexOf("\n") >= 0
            ? "|2\n    " + stack.split(/\n/).join("\n    ")
            : stack)
      );
      this.p("  ...");
    }
  }
}

const reporter = (p?: (s: string) => void): TestReporter => {
  const r = new TapLikeReporter(p ?? console.log.bind(console));
  return {
    finished: r.finished.bind(r),
    started: r.started.bind(r),
    testFinished: r.testFinished.bind(r),
    testStarted: r.testStarted.bind(r),
  };
};

export { reporter };
