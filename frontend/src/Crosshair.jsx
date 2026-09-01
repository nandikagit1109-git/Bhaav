import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from './gameStore';

// Reuse vectors to avoid GC
const _dir = new THREE.Vector3();
const _toObj = new THREE.Vector3();
const _worldPos = new THREE.Vector3();

/**
 * Optimized crosshair — raycast every 5 frames.
 *
 * PERFORMANCE: Uses refs instead of React state for hover tracking.
 * The previous version called setHovered() (React state) from inside
 * useFrame, which triggered a full React re-render of MoodRoom every
 * 5 frames — completely unnecessary during pointer movement.
 *
 * Now: hover state lives in a ref. Only the Zustand store update (which
 * is cheap) fires, and only when the hovered object actually changes.
 */
export default function Crosshair({ interactables = [], onInteract }) {
  const { camera } = useThree();
  const setHoveredObject = useGameStore((s) => s.setHoveredObject);
  const frameCount = useRef(0);
  const currentHovered = useRef(null);

  useFrame(() => {
    frameCount.current++;
    if (frameCount.current % 5 !== 0) return;
    if (!interactables.length) return;

    _dir.set(0, 0, -1).applyQuaternion(camera.quaternion);

    let closest = null;
    let closestDist = Infinity;

    for (const obj of interactables) {
      if (!obj.ref?.current) continue;

      obj.ref.current.getWorldPosition(_worldPos);
      _toObj.subVectors(_worldPos, camera.position);
      const dist = _toObj.length();

      if (dist > (obj.maxDistance || 4)) continue;

      const dot = _dir.dot(_toObj.normalize());
      if (dot < 0.7) continue;

      if (dist < closestDist) {
        closestDist = dist;
        closest = obj;
      }
    }

    const newHovered = closest ? closest.id : null;

    // Only update Zustand if changed — no React state, no re-render
    if (currentHovered.current !== newHovered) {
      currentHovered.current = newHovered;
      setHoveredObject(newHovered);
    }
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyE' && currentHovered.current) {
        onInteract?.(currentHovered.current);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onInteract]);

  return null;
}
