import assert from 'assert';
import sinon from 'sinon';
import { run, runWithOptions } from 'beater';

const test = (name: string, fn: Test): Test => {
  Object.defineProperty(fn, 'name', { value: name });
  return fn;
};

import { reporter } from '../src';
import { Test } from 'beater-reporter';

const test1 = test('test1', () => void 0);
const test2 = test('test2', () => void 0);
const test3 = test('test3', () => { throw new Error('foo'); });
const test4 = test('test4', () => { throw new Error('foo\nbar'); });

const tests1 = [
  test('1 test passed all', () => {
    const p = sinon.stub();
    const run = runWithOptions({ reporter: reporter(p) });
    return run([test1]).then(() => {
      assert.deepEqual(p.callCount, 3);
      assert.deepEqual(p.getCall(0).args[0], 'TAP version 13');
      assert.deepEqual(p.getCall(1).args[0], '1..1');
      assert.deepEqual(p.getCall(2).args[0], 'ok 1 - test1');
    });
  }),
  test('2 tests passed all', () => {
    const p = sinon.stub();
    const run = runWithOptions({ reporter: reporter(p) });
    return run([test1, test2]).then(() => {
      assert(p.callCount === 4);
      assert(p.getCall(0).args[0] === 'TAP version 13');
      assert(p.getCall(1).args[0] === '1..2');
      assert(p.getCall(2).args[0] === 'ok 1 - test1');
      assert(p.getCall(3).args[0] === 'ok 2 - test2');
    });
  }),
  test('1 test failed', () => {
    const p = sinon.stub();
    const run = runWithOptions({ reporter: reporter(p) });
    return run([test3]).then(() => assert.fail(), () => {
      assert(p.callCount === 8);
      assert(p.getCall(0).args[0] === 'TAP version 13');
      assert(p.getCall(1).args[0] === '1..1');
      assert(p.getCall(2).args[0] === 'not ok 1 - test3');
      assert(p.getCall(3).args[0] === '  ---');
      assert(p.getCall(4).args[0] === '  name: Error');
      assert(p.getCall(5).args[0] === '  message: foo');
      assert(p.getCall(6).args[0].match(/^  stack: \|2\n    Error: foo.*/m) !== null);
      assert(p.getCall(7).args[0] === '  ...');
    });
  }),
  test('error message (multiline)', () => {
    const p = sinon.stub();
    // TODO: beater@8
    const run = runWithOptions({ reporter: reporter(p) });
    return run([test4]).then(() => assert.fail(), () => {
      assert(p.callCount === 8);
      assert(p.getCall(0).args[0] === 'TAP version 13');
      assert(p.getCall(1).args[0] === '1..1');
      assert(p.getCall(2).args[0] === 'not ok 1 - test4');
      assert(p.getCall(3).args[0] === '  ---');
      assert(p.getCall(4).args[0] === '  name: Error');
      assert(p.getCall(5).args[0] === '  message: |2\n    foo\n    bar');
      assert(p.getCall(6).args[0].match(/^  stack: \|2\n    Error: foo\n    bar.*/m) !== null);
      assert(p.getCall(7).args[0] === '  ...');
    });
  })
];

run(tests1).catch(() => process.exit(1));
