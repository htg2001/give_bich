/**
 * Gesture detection utility for double tap, double click, and 360-degree 3D rotation.
 */

export interface DoubleTapDetector {
  registerTap(timestamp?: number): boolean;
  reset(): void;
  getLastTapDelta(timestamp?: number): number | null;
}

export function createDoubleTapDetector(maxIntervalMs = 400, minIntervalMs = 40): DoubleTapDetector {
  let lastTapTime = 0;

  return {
    registerTap(timestamp?: number): boolean {
      const now = timestamp ?? Date.now();
      const interval = now - lastTapTime;

      if (interval >= minIntervalMs && interval <= maxIntervalMs) {
        lastTapTime = 0;
        return true;
      }

      lastTapTime = now;
      return false;
    },
    reset(): void {
      lastTapTime = 0;
    },
    getLastTapDelta(timestamp?: number): number | null {
      if (lastTapTime === 0) return null;
      const now = timestamp ?? Date.now();
      return Math.max(0, now - lastTapTime);
    }
  };
}

export type GiftOpeningStage = 
  | 'idle'
  | 'focusing_top'
  | 'untying_bow'
  | 'opening_lid'
  | 'revealing_card'
  | 'card_open';

export function getStageDescription(stage: GiftOpeningStage): string {
  switch (stage) {
    case 'idle':
      return 'Nhấn 2 lần vào hộp quà để mở';
    case 'focusing_top':
      return 'Tiến đến tháo nơ...';
    case 'untying_bow':
      return 'Đang tháo nơ xinh xắn... ✨';
    case 'opening_lid':
      return 'Mở nắp hộp quà... 🎁';
    case 'revealing_card':
      return 'Bức thư đang bay lên... 💌';
    case 'card_open':
      return 'Dành tặng cậu những điều ngọt ngào nhất 💗';
  }
}

/**
 * Normalizes an angle into [0, 360) range.
 */
export function normalizeAngle360(deg: number): number {
  const norm = ((deg % 360) + 360) % 360;
  return Object.is(norm, -0) ? 0 : norm;
}

/**
 * Clamps vertical pitch angle so the box doesn't flip completely inverted.
 */
export function clampPitch(deg: number, min = -60, max = 60): number {
  return Math.max(min, Math.min(max, deg));
}

/**
 * Computes updated 3D rotation angles from pointer drag deltas.
 */
export function computeDragRotation(
  startRot: { x: number; y: number },
  deltaX: number,
  deltaY: number,
  sensitivity = 0.5
): { x: number; y: number } {
  return {
    x: clampPitch(startRot.x - deltaY * (sensitivity * 0.8)),
    y: normalizeAngle360(startRot.y + deltaX * sensitivity),
  };
}
