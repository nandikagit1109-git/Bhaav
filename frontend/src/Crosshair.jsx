import { useEffect, useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from './gameStore';

// Reuse vectors to avoid GC
const _dir = new THREE.Vector3();
const _toObj = new THREE.Vector3();
const _worldPos = new THREE.Vector3();

/**
 * Optimized crosshair — raycast every 3 frames.
 */
export default function Crosshair({ interactables = [], onInteract }) {
  const { camera } = useThree();
  const [hovered, setHovered] = useState(null);
  const setHoveredObject = useGameStore((s) => s.setHoveredObject);
  const frameCount = useRef(0);

  useFrame(() => {
    frameCount.current++;
    if (frameCount.current % 5 !== 0) return; // Only every 5th frame
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
    setHovered((prev) => {
      if (prev !== newHovered) {
        setHoveredObject(newHovered);
        return newHovered;
      }
      return prev;
    });
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyE' && hovered) {
        onInteract?.(hovered);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hovered, onInteract]);

  return null;
}
