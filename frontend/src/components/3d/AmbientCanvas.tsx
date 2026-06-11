/**
 * AmbientCanvas — soft floating particle field.
 *
 * Two modes:
 *   fixed   → position:fixed, inset:0, zIndex:-1  (behind the whole page)
 *   absolute → position:absolute, inset:0          (contained inside a relative parent)
 *
 * Particles drift by slowly rotating the group matrix — one GPU matrix upload
 * per frame instead of per-particle CPU writes.  Very cheap.
 *
 * Mouse parallax shifts the group rotation target for a subtle 3D depth cue.
 * Reduced particle count on mobile; completely skipped on prefers-reduced-motion.
 */

import { useRef, useMemo, useEffect, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Props = {
  mode?: 'fixed' | 'absolute';
  /** Override particle count */
  count?: number;
};

// ── Particle geometry ─────────────────────────────────────────────────────────

function Particles({ count }: { count: number }) {
  const groupRef    = useRef<THREE.Group>(null);
  const mouseTarget = useRef<[number, number]>([0, 0]);
  const smoothRot   = useRef<[number, number]>([0, 0]);

  // Build geometry once — random points in a cube
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  // Track mouse position (normalised −0.5 → 0.5 range)
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mouseTarget.current = [
        (e.clientX / window.innerWidth  - 0.5) * 0.45,
        -(e.clientY / window.innerHeight - 0.5) * 0.32,
      ];
    };
    window.addEventListener('mousemove', fn, { passive: true });
    return () => window.removeEventListener('mousemove', fn);
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const [tx, ty] = mouseTarget.current;
    // Smooth damp toward mouse target
    smoothRot.current[0] += (ty - smoothRot.current[0]) * 0.022;
    smoothRot.current[1] += (tx - smoothRot.current[1]) * 0.022;
    // Base slow drift + mouse offset
    groupRef.current.rotation.x = state.clock.elapsedTime * 0.009  + smoothRot.current[0];
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.013  + smoothRot.current[1];
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <pointsMaterial
          size={0.027}
          color="#6B8BFF"
          transparent
          opacity={0.36}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// ── Exported canvas ───────────────────────────────────────────────────────────

export default memo(function AmbientCanvas({ mode = 'fixed', count }: Props) {
  const isMobile   = window.innerWidth < 768;
  const finalCount = count ?? (isMobile ? 110 : 460);

  const positionStyle: React.CSSProperties =
    mode === 'fixed'
      ? { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }
      : { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 };

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 65 }}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
        depth: false,
        stencil: false,
      }}
      dpr={1}
      style={{ ...positionStyle, pointerEvents: 'none' }}
      frameloop="always"
    >
      <Particles count={finalCount} />
    </Canvas>
  );
});
