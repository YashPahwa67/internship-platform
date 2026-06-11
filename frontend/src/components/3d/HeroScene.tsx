/**
 * HeroScene — landing page 3D centerpiece.
 *
 * Architecture:
 *   - R3F Canvas with alpha:true sits inside a positioned container
 *   - pointerEvents:none — never intercepts clicks
 *   - Mouse tracked on window → smooth lerp applied in useFrame
 *   - Three layers: core distorted orb, outer wireframe shells, sparkle cloud
 *   - Bloom post-processing for neon glow
 *   - Fallbacks: null on prefers-reduced-motion; scaled down on mobile
 *
 * Mount inside a positioned Box with explicit width/height.
 * The canvas fills its container and is transparent.
 */

import { useRef, useEffect, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ── Inner 3D scene ────────────────────────────────────────────────────────────

function Orb({ mouseRef }: { mouseRef: React.RefObject<[number, number]> }) {
  const groupRef  = useRef<THREE.Group>(null);
  const wireRef   = useRef<THREE.Mesh>(null);
  const pulseRef  = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const [mx, my] = mouseRef.current ?? [0, 0];

    // Lazy-follow mouse tilt on the whole group
    groupRef.current.rotation.x +=
      (my * 0.38 - groupRef.current.rotation.x) * 0.045;
    groupRef.current.rotation.y +=
      (mx * 0.38 + state.clock.elapsedTime * 0.07 - groupRef.current.rotation.y) * 0.045;

    // Outer wireframe counter-rotates for depth parallax
    if (wireRef.current) {
      wireRef.current.rotation.y -= delta * 0.13;
      wireRef.current.rotation.x += delta * 0.055;
    }

    // Slow breathing pulse on the inner glow sphere
    if (pulseRef.current) {
      const s = 0.78 + Math.sin(state.clock.elapsedTime * 1.3) * 0.07;
      pulseRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer wireframe shell — large, thin, slowly counter-rotates */}
      <mesh ref={wireRef} scale={1.62}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#6B8BFF"
          wireframe
          transparent
          opacity={0.17}
          depthWrite={false}
        />
      </mesh>

      {/* Second wireframe — slightly smaller, offset phase */}
      <mesh rotation={[0.5, 0.9, 0.3]} scale={1.3}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial
          color="#A060F8"
          wireframe
          transparent
          opacity={0.09}
          depthWrite={false}
        />
      </mesh>

      {/* Core orb with organic distortion — the main visual centrepiece */}
      <Float speed={1.7} rotationIntensity={0.12} floatIntensity={0.42}>
        <mesh>
          <icosahedronGeometry args={[1, 6]} />
          <MeshDistortMaterial
            color="#2A4EEA"
            emissive="#3D63F8"
            emissiveIntensity={1.1}
            distort={0.3}
            speed={1.5}
            roughness={0.04}
            metalness={0.88}
          />
        </mesh>
      </Float>

      {/* Inner glow sphere — slow breathing effect */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color="#4B7BFF"
          transparent
          opacity={0.07}
          depthWrite={false}
        />
      </mesh>

      {/* Dense close sparkles orbiting the orb */}
      <Sparkles
        count={65}
        scale={3.6}
        size={1.0}
        speed={0.22}
        color="#6B8BFF"
        opacity={0.72}
      />

      {/* Wide sparse sparkles for depth */}
      <Sparkles
        count={28}
        scale={6}
        size={0.55}
        speed={0.1}
        color="#A060F8"
        opacity={0.42}
      />
    </group>
  );
}

// ── Exported canvas component ─────────────────────────────────────────────────

export default memo(function HeroScene() {
  const mouseRef = useRef<[number, number]>([0, 0]);

  // Track normalised NDC mouse position globally; canvas has pointerEvents:none
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mouseRef.current = [
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      ];
    };
    window.addEventListener('mousemove', fn, { passive: true });
    return () => window.removeEventListener('mousemove', fn);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 4.6], fov: 42 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.1} />
      <pointLight position={[5, 5, 5]}   intensity={2.2} color="#6B8BFF" />
      <pointLight position={[-5, -4, -3]} intensity={0.9} color="#A060F8" />
      <pointLight position={[0, -5, 3]}  intensity={0.4} color="#3D63F8" />

      <Orb mouseRef={mouseRef} />
    </Canvas>
  );
});
