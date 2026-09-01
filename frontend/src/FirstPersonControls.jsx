import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * FirstPersonControls — cinematic first-person controller.
 * Click canvas to lock pointer. WASD to walk. Mouse to look. ESC to release.
 * Smooth acceleration/deceleration, subtle breathing motion.
 */
export default function FirstPersonControls({
  moveSpeed = 2.8,
  sprintMultiplier = 1.6,
  lookSpeed = 0.002,
  friction = 6,
  breathFrequency = 0.4,
  breathAmplitude = 0.008,
  initialPosition = [0, 1.6, 2],
  bounds = { minX: -3.5, maxX: 3.5, minZ: -3, maxZ: 3 },
  enabled = true,
}) {
  const { camera, gl } = useThree();

  const velocity = useRef(new THREE.Vector3());
  const targetVelocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isLocked = useRef(false);
  const keys = useRef({});
  const breathPhase = useRef(0);
  const cameraTarget = useRef(new THREE.Vector3(...initialPosition));

  const MAX_PITCH = Math.PI / 3;
  const MIN_PITCH = -Math.PI / 3;

  useEffect(() => {
    camera.position.set(...initialPosition);
    camera.rotation.set(0, 0, 0);
  }, [camera, initialPosition]);

  // Pointer lock state
  useEffect(() => {
    const canvas = gl.domElement;

    const onLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas;
    };

    const onKeyDown = (e) => {
      if (e.code === 'Escape' && isLocked.current) {
        document.exitPointerLock();
      }
    };

    document.addEventListener('pointerlockchange', onLockChange);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerlockchange', onLockChange);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [gl]);

  // Mouse look
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isLocked.current) return;

      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= e.movementX * lookSpeed;
      euler.current.x -= e.movementY * lookSpeed;
      euler.current.x = Math.max(MIN_PITCH, Math.min(MAX_PITCH, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [camera, lookSpeed]);

  // Keyboard
  useEffect(() => {
    const onKeyDown = (e) => { keys.current[e.code] = true; };
    const onKeyUp = (e) => { keys.current[e.code] = false; };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Movement loop
  useFrame((_, delta) => {
    if (!isLocked.current || !enabled) return;

    const { KeyW, KeyA, KeyS, KeyD, ShiftLeft } = keys.current;
    const moving = KeyW || KeyA || KeyS || KeyD;
    const sprinting = ShiftLeft && moving;

    direction.current.set(0, 0, 0);
    if (KeyW) direction.current.z -= 1;
    if (KeyS) direction.current.z += 1;
    if (KeyA) direction.current.x -= 1;
    if (KeyD) direction.current.x += 1;
    direction.current.normalize();

    const yaw = euler.current.y;
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    const worldX = direction.current.x * cos - direction.current.z * sin;
    const worldZ = direction.current.x * sin + direction.current.z * cos;

    const speed = moving ? moveSpeed * (sprinting ? sprintMultiplier : 1) : 0;
    targetVelocity.current.set(worldX * speed, 0, worldZ * speed);

    const lerpFactor = Math.min(delta * friction, 1);
    velocity.current.x += (targetVelocity.current.x - velocity.current.x) * lerpFactor;
    velocity.current.z += (targetVelocity.current.z - velocity.current.z) * lerpFactor;

    cameraTarget.current.x += velocity.current.x * delta;
    cameraTarget.current.z += velocity.current.z * delta;

    // Clamp to bounds (with wall margin)
    const margin = 0.3;
    cameraTarget.current.x = Math.max(bounds.minX + margin, Math.min(bounds.maxX - margin, cameraTarget.current.x));
    cameraTarget.current.z = Math.max(bounds.minZ + margin, Math.min(bounds.maxZ - margin, cameraTarget.current.z));

    // Subtle breathing
    breathPhase.current += delta * breathFrequency;
    const breathY = Math.sin(breathPhase.current) * breathAmplitude;
    cameraTarget.current.y = initialPosition[1] + breathY;

    camera.position.lerp(cameraTarget.current, Math.min(delta * 12, 1));
  });

  return null;
}
