import assert from 'node:assert/strict';
import { test } from 'node:test';
import { transformGesture } from './gesture.ts';
const initial = { x: 0, y: 0, scale: 100, rotation: 0 };
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);
test('one finger translates; a remaining finger continues without a jump', () => {
  const next = transformGesture(initial, [{ x: 20, y: 30 }], [{ x: 30, y: 50 }]);
  assert.deepEqual(next, { ...initial, x: 10, y: 20 });
  assert.deepEqual(transformGesture(next, [{ x: 30, y: 50 }], [{ x: 31, y: 52 }]), { ...initial, x: 11, y: 22 });
});
test('pinch rotates and scales around the fingers, preserving the touched image location', () => {
  const next = transformGesture(initial, [{ x: 50, y: 0 }, { x: 150, y: 0 }], [{ x: 100, y: -100 }, { x: 100, y: 100 }]);
  close(next.scale, 200); close(next.rotation, 90); close(next.x, 100); close(next.y, -200);
});
test('scale clamps and crossing the angle boundary remains continuous', () => {
  const next = transformGesture(initial, [{ x: -10, y: 0 }, { x: 10, y: 0 }], [{ x: -100, y: 0 }, { x: 100, y: 0 }]);
  assert.equal(next.scale, 300);
  const result = transformGesture({ ...initial, rotation: 179 }, [{ x: 0, y: 0 }, { x: -100, y: 1 }], [{ x: 0, y: 0 }, { x: -100, y: -1 }]);
  assert.ok(result.rotation > -180 && result.rotation < -179);
});
test('coincident fingers and changing pointer counts cannot corrupt the transform', () => {
  const next = transformGesture(initial, [{ x: 0, y: 0 }, { x: 0, y: 0 }], [{ x: 1, y: 2 }, { x: 1, y: 2 }]);
  assert.deepEqual(next, { ...initial, x: 1, y: 2 });
  assert.deepEqual(transformGesture(initial, [], [{ x: 1, y: 2 }]), initial);
});
