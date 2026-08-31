import { useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from './gameStore';

const _dir = new THREE.Vector3();
const _toObj = new THREE.Vector3();

/**
 * Crosshair — raycasts from camera center to detect interactable objects.
 * Shows "E to interact" prompt. Triggers interaction on E press.
 *
 * interactables: Array<{ id: string, ref: React.RefObject, maxDistance?: number }>
 */
export default function Crosshair({ interactables = [], onInteract }) {
  const { camera } = useThree();
  const [hovered, setHovered] = useState(null);
  const setHoveredObject = useGameStore((s) => s.setHoveredObject);

  useFrame(() => {
    if (!interactables.length) return;

    // Camera forward direction
    _dir.set(0, 0, -1).applyQuaternion(camera.quaternion);

    let closest = null;
    let closestDist = Infinity;

    for (const obj of interactables) {
      if (!obj.ref?.current) continue;

      const worldPos = new THREE.Vector3();
      obj.ref.current.getWorldPosition(worldPos);

      _toObj.subVectors(worldPos, camera.position);
      const dist = _toObj.length();

      if (dist > (obj.maxDistance || 4)) continue;

      // Check if object is roughly in front (45° cone)
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

  // E key listener
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
