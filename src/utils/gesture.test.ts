import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDoubleTapDetector,
  getStageDescription,
  normalizeAngle360,
  clampPitch,
  computeDragRotation,
} from './gesture.ts';

test('createDoubleTapDetector registers single tap as false and rapid follow-up as true', () => {
  const detector = createDoubleTapDetector(400, 40);

  const firstTapResult = detector.registerTap(1000);
  assert.equal(firstTapResult, false);

  const secondTapResult = detector.registerTap(1250);
  assert.equal(secondTapResult, true);

  const thirdTapResult = detector.registerTap(1300);
  assert.equal(thirdTapResult, false);
});

test('normalizeAngle360 maps any degree into [0, 360)', () => {
  assert.equal(normalizeAngle360(0), 0);
  assert.equal(normalizeAngle360(360), 0);
  assert.equal(normalizeAngle360(450), 90);
  assert.equal(normalizeAngle360(-90), 270);
  assert.equal(normalizeAngle360(-360), 0);
});

test('clampPitch keeps vertical tilt within bounds', () => {
  assert.equal(clampPitch(0, -60, 60), 0);
  assert.equal(clampPitch(85, -60, 60), 60);
  assert.equal(clampPitch(-85, -60, 60), -60);
});

test('computeDragRotation updates angles accurately', () => {
  const initial = { x: -16, y: 30 };
  const rotated = computeDragRotation(initial, 100, 20, 0.5);

  // deltaX = 100 * 0.5 = 50 -> y = 30 + 50 = 80
  assert.equal(rotated.y, 80);
  // deltaY = 20 * 0.4 = 8 -> x = -16 - 8 = -24
  assert.equal(rotated.x, -24);
});
