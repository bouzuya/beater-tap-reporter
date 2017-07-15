import * as assert from 'power-assert';
import * as sinon from 'sinon';
import { run, runWithOptions, test } from 'beater';

import { reporter } from '../src';

const test1 = test('test1', () => void 0);
const test2 = test('test2', () => void 0);
const test3 = test('test3', () => { throw new Error('foo'); });

const tests1 = [
  test('1 test passed all', () => {
    const p = sinon.stub();
    const run = runWithOptions({ reporter: reporter(p) });
    return run([test1]).then(() => {
      assert(p.callCount === 3);
      assert(p.getCall(0).args[0] === 'TAP version 13');
      assert(p.getCall(1).args[0] === '1..1');
      assert(p.getCall(2).args[0] === 'ok 1 - test1');
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
      assert(p.callCount === 9);
      assert(p.getCall(0).args[0] === 'TAP version 13');
      assert(p.getCall(1).args[0] === '1..1');
      assert(p.getCall(2).args[0] === 'not ok 1 - test3');
      assert(p.getCall(3).args[0] === '  ---');
      assert(p.getCall(4).args[0] === '  name: Error');
      assert(p.getCall(5).args[0] === '  message: foo');
      assert(p.getCall(6).args[0] === '  stack: |');
      assert(p.getCall(7).args[0].match(/^    Error: foo.*/m));
      assert(p.getCall(8).args[0] === '  ...');
    });
  })
];

run(tests1).catch(() => process.exit(1));
