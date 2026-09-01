import { useEffect, useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from './gameStore';

// Reuse vectors to avoid GC
const _dir = new THREE.Vector3();
const _toObj = new THREE.Vector3();
const _worldPos = new THREE.Vector3();

/**
 * Crosshair + interaction detector.
 *
 * Raycasts from camera every 3 frames to find the closest interactable object.
 * When E is pressed, triggers the interaction callback.
 * Also handles pointer lock — clicking anywhere on the canvas enables mouse look.
 */
export default function Crosshair({ interactables = [], onInteract }) {
  const { camera, gl } = useThree();
  const setHoveredObject = useGameStore((s) => s.setHoveredObject);
  const frameCount = useRef(0);
  const currentHovered = useRef(null);
  const isLocked = useRef(false);

  // Pointer lock — click anywhere to enable mouse look
  useEffect(() => {
    const canvas = gl.domElement;

    const handleClick = () => {
      if (!isLocked.current) {
        canvas.requestPointerLock();
      }
    };

    const onLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas;
    };

    canvas.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', onLockChange);

    return () => {
      canvas.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', onLockChange);
    };
  }, [gl]);

  // Raycast to find hovered object
  useFrame(() => {
    frameCount.current++;
    if (frameCount.current % 3 !== 0) return; // Every 3rd frame
    if (!interactables.length) return;

    _dir.set(0, 0, -1).applyQuaternion(camera.quaternion);

    let closest = null;
    let closestDist = Infinity;

    for (const obj of interactables) {
      if (!obj.ref?.current) continue;

      obj.ref.current.getWorldPosition(_worldPos);
      _toObj.subVectors(_worldPos, camera.position);
      const dist = _toObj.length();

      if (dist > (obj.maxDistance || 5)) continue;

      // Dot product — lower threshold = easier to detect
      const dot = _dir.dot(_toObj.normalize());
      if (dot < 0.5) continue;

      if (dist < closestDist) {
        closestDist = dist;
        closest = obj;
      }
    }

    const newHovered = closest ? closest.id : null;

    if (currentHovered.current !== newHovered) {
      currentHovered.current = newHovered;
      setHoveredObject(newHovered);
    }
  });

  // E key interaction
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
