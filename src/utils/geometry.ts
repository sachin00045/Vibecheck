import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { BodyGeometry, Vec2 } from '@/types';

export const POSE_INDICES = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 15 + 1,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
} as const;

export function landmarkToVec(lm: NormalizedLandmark, width: number, height: number): Vec2 {
  return { x: lm.x * width, y: lm.y * height };
}

export function midpoint(a: Vec2, b: Vec2): Vec2 {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function angleBetween(a: Vec2, b: Vec2): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVec2(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function getLandmark(landmarks: NormalizedLandmark[], index: number): NormalizedLandmark | null {
  if (index >= landmarks.length) return null;
  const lm = landmarks[index];
  if (!lm || lm.visibility < 0.3) return null;
  return lm;
}

export function computeBodyGeometry(
  landmarks: NormalizedLandmark[],
  width: number,
  height: number
): BodyGeometry | null {
  const nose = getLandmark(landmarks, POSE_INDICES.NOSE);
  const ls = getLandmark(landmarks, POSE_INDICES.LEFT_SHOULDER);
  const rs = getLandmark(landmarks, POSE_INDICES.RIGHT_SHOULDER);
  const lh = getLandmark(landmarks, POSE_INDICES.LEFT_HIP);
  const rh = getLandmark(landmarks, POSE_INDICES.RIGHT_HIP);
  const le = getLandmark(landmarks, POSE_INDICES.LEFT_ELBOW);
  const re = getLandmark(landmarks, POSE_INDICES.RIGHT_ELBOW);
  const lw = getLandmark(landmarks, POSE_INDICES.LEFT_WRIST);
  const rw = getLandmark(landmarks, POSE_INDICES.RIGHT_WRIST);

  if (!ls || !rs) return null;

  const shoulderLeft = landmarkToVec(ls, width, height);
  const shoulderRight = landmarkToVec(rs, width, height);
  const shoulderCenter = midpoint(shoulderLeft, shoulderRight);
  const shoulderWidth = distance(shoulderLeft, shoulderRight);

  const hipLeft = lh ? landmarkToVec(lh, width, height) : { x: shoulderLeft.x + shoulderWidth * 0.15, y: shoulderLeft.y + shoulderWidth * 1.2 };
  const hipRight = rh ? landmarkToVec(rh, width, height) : { x: shoulderRight.x - shoulderWidth * 0.15, y: shoulderRight.y + shoulderWidth * 1.2 };
  const hipCenter = midpoint(hipLeft, hipRight);
  const torsoWidth = distance(hipLeft, hipRight);
  const torsoHeight = distance(shoulderCenter, hipCenter);

  const noseVec = nose ? landmarkToVec(nose, width, height) : { x: shoulderCenter.x, y: shoulderCenter.y - shoulderWidth * 0.4 };
  const elbowLeft = le ? landmarkToVec(le, width, height) : { x: shoulderLeft.x - shoulderWidth * 0.3, y: shoulderLeft.y + shoulderWidth * 0.5 };
  const elbowRight = re ? landmarkToVec(re, width, height) : { x: shoulderRight.x + shoulderWidth * 0.3, y: shoulderRight.y + shoulderWidth * 0.5 };
  const wristLeft = lw ? landmarkToVec(lw, width, height) : { x: elbowLeft.x - shoulderWidth * 0.2, y: elbowLeft.y + shoulderWidth * 0.4 };
  const wristRight = rw ? landmarkToVec(rw, width, height) : { x: elbowRight.x + shoulderWidth * 0.2, y: elbowRight.y + shoulderWidth * 0.4 };

  const bodyCenter = midpoint(shoulderCenter, hipCenter);

  const bodyRotation = Math.atan2(
    shoulderRight.y - shoulderLeft.y,
    shoulderRight.x - shoulderLeft.x
  );

  const avgShoulderVis = (ls.visibility + rs.visibility) / 2;
  const hipVis = ((lh?.visibility ?? 0) + (rh?.visibility ?? 0)) / 2;
  const confidence = avgShoulderVis * 0.7 + hipVis * 0.3;

  const refShoulderWidth = width * 0.15;
  const bodyScale = shoulderWidth / refShoulderWidth;
  const cameraDistance = 1 / Math.max(bodyScale, 0.01);

  return {
    shoulderCenter,
    shoulderLeft,
    shoulderRight,
    hipCenter,
    hipLeft,
    hipRight,
    nose: noseVec,
    elbowLeft,
    elbowRight,
    wristLeft,
    wristRight,
    shoulderWidth,
    torsoHeight,
    torsoWidth,
    bodyCenter,
    bodyRotation,
    bodyScale,
    cameraDistance,
    confidence,
  };
}

export function getBodyStatus(geom: BodyGeometry | null): 'detected' | 'partial' | 'none' {
  if (!geom) return 'none';
  if (geom.confidence < 0.4) return 'partial';
  return 'detected';
}

export function getRotationDegrees(geom: BodyGeometry): number {
  return radToDeg(geom.bodyRotation);
}
