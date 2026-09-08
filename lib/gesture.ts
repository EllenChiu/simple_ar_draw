export type Point = { x: number; y: number };
export type Transform = { x: number; y: number; scale: number; rotation: number };

// Points are relative to the workspace center, as is the image translation.
export function transformGesture(current: Transform, before: Point[], after: Point[]): Transform {
  if (before.length !== after.length || before.length === 0) return current;
  if (before.length === 1) return { ...current, x: current.x + after[0].x - before[0].x, y: current.y + after[0].y - before[0].y };
  const midpoint = (p: Point[]) => ({ x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 });
  const a = midpoint(before), b = midpoint(after);
  const distance = (p: Point[]) => Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y);
  const angle = (p: Point[]) => Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x);
  // Near-coincident fingers have no reliable direction or scale.
  if (distance(before) < 8 || distance(after) < 8) return { ...current, x: current.x + b.x - a.x, y: current.y + b.y - a.y };
  const scale = Math.max(20, Math.min(300, current.scale * distance(after) / distance(before)));
  const ratio = scale / current.scale;
  const turn = angle(after) - angle(before);
  const dx = current.x - a.x, dy = current.y - a.y;
  return {
    x: b.x + ratio * (dx * Math.cos(turn) - dy * Math.sin(turn)),
    y: b.y + ratio * (dx * Math.sin(turn) + dy * Math.cos(turn)),
    scale,
    rotation: ((current.rotation + turn * 180 / Math.PI + 180) % 360 + 360) % 360 - 180,
  };
}
