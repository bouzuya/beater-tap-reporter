import { Test, TestReporter, TestResult } from 'beater-reporter';

class TapLikeReporter {
  private tests: Test[];
  private p: (s: string) => void;

  constructor(p:  (s: string) => void) {
    this.p = p;
  }

  finished(_: TestResult[]): void {
    // do nothing
  }

  started(tests: Test[]): void {
    this.tests = tests;
    this.p('TAP version 13');
    this.p(`1..${tests.length}`);
  }

  testStarted(_: Test): void {
    // do nothing
  }

  testFinished({ error, test }: TestResult): void {
    const nameOrUndefined = test.meta.get('name');
    const name = typeof nameOrUndefined === 'undefined'
      ? '' : nameOrUndefined;
    const ok = typeof error === 'undefined' ? 'ok' : 'not ok';
    const no = this.tests.indexOf(test) + 1;
    this.p(`${ok} ${no} - ${name}`);
    if (typeof error !== 'undefined') {
      this.p('  ---');
      this.p('  name: ' + error.name);
      this.p('  message: ' + error.message);
      this.p('  stack: |');
      this.p('    ' + error.stack.split(/\n/).join('\n    '));
      this.p('  ...');
    }
  }
}

const reporter = (p?: (s: string) => void): TestReporter => {
  const r = new TapLikeReporter(
    typeof p === 'undefined' ? console.log.bind(console) : p
  );
  return {
    finished: r.finished.bind(r),
    started: r.started.bind(r),
    testFinished: r.testFinished.bind(r),
    testStarted: r.testStarted.bind(r)
  };
};

export { reporter };
