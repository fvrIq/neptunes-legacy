import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Grid, Line } from '@react-three/drei';
import { useRef, useMemo, useEffect, memo } from 'react';
import * as THREE from 'three';
import { mdaNodes } from '../mdaData';

/* ==================== OCEAN (Optimized) ==================== */
function Ocean({ isDark }) {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    const pos = meshRef.current.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      pos.setZ(i, Math.sin(x * 0.3 + t * 0.8) * 0.05 + Math.cos(y * 0.3 + t * 0.6) * 0.05);
    }
    pos.needsUpdate = true;
  });
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[80, 80, 32, 32]} />
      <meshStandardMaterial
        color={isDark ? '#1A3A5C' : '#5BAED0'}
        roughness={0.25} metalness={0.55} transparent opacity={0.95}
        flatShading
      />
    </mesh>
  );
}

/* ==================== NATUNA ISLAND ==================== */
function NatunaIsland({ position, scale = 1 }) {
  const islandShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(4*scale, 2*scale, 7*scale, -1*scale, 6*scale, -5*scale);
    s.bezierCurveTo(4*scale, -8*scale, -1*scale, -7*scale, -4*scale, -4*scale);
    s.bezierCurveTo(-7*scale, -1*scale, -5*scale, 3*scale, 0, 0);
    return s;
  }, [scale]);
  const beachShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(4.8*scale, 2.5*scale, 8*scale, -1.2*scale, 6.8*scale, -5.8*scale);
    s.bezierCurveTo(4.5*scale, -9.2*scale, -1.2*scale, -8*scale, -4.8*scale, -4.8*scale);
    s.bezierCurveTo(-8*scale, -1.2*scale, -5.8*scale, 3.5*scale, 0, 0);
    return s;
  }, [scale]);
  const vegetationShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(3*scale, 1.3*scale, 5*scale, -0.8*scale, 4.3*scale, -3.8*scale);
    s.bezierCurveTo(2.8*scale, -5.8*scale, -0.8*scale, -5.2*scale, -3*scale, -3*scale);
    s.bezierCurveTo(-5*scale, -0.8*scale, -3.8*scale, 2.2*scale, 0, 0);
    return s;
  }, [scale]);
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <shapeGeometry args={[beachShape]} />
        <meshBasicMaterial color="#A8E0EC" transparent opacity={0.45} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <shapeGeometry args={[islandShape]} />
        <meshStandardMaterial color="#E8D5B0" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <shapeGeometry args={[vegetationShape]} />
        <meshStandardMaterial color="#7BA968" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ==================== REALISTIC SHIP (Optimized) ==================== */
function RealisticShip({ node, onSelect, isSelected, isDark, isIntercepted }) {
  const ref = useRef();
  const wakeRef = useRef();
  const ringRef = useRef();
  const trailRef = useRef();

  // Position & heading managed via refs (no re-renders)
  const posRef = useRef({ x: node.x, z: node.z });
  const headingRef = useRef(node.heading || 0);
  const targetHeadingRef = useRef(node.heading || 0);

  // Trail management
  const maxTrailPoints = 30;
  const trailPointsRef = useRef([]);
  const trailFrameCount = useRef(0);

  // FIX: Pre-allocate trail buffer once — never create new arrays per frame
  const trailBuffer = useMemo(() => new Float32Array(maxTrailPoints * 3), []);

  // FIX: Set up trail geometry once on mount
  useEffect(() => {
    if (!trailRef.current) return;
    const geo = trailRef.current.geometry;
    geo.setAttribute('position', new THREE.BufferAttribute(trailBuffer, 3));
    geo.setDrawRange(0, 0);
  }, [trailBuffer]);

  const statusColors = {
    normal: { hull: '#F5F0E8', deck: '#4A7BA8', accent: '#3D6A93', container: ['#C8794A', '#5B9BD5', '#7BA968'] },
    dark:   { hull: '#3D2B1F', deck: '#C0504D', accent: '#A0403D', container: ['#8B5E3C', '#6B4226'] },
    spoof:  { hull: '#F5F0E8', deck: '#E8A838', accent: '#C88828', container: ['#D4A256', '#E8A838'] },
  };
  const c = statusColors[node.status] || statusColors.normal;
  const shipScale = node.type === 'Tanker' ? 1.35 : node.type === 'Navy' ? 1.15 : node.type === 'Sail' ? 0.7 : 1.0;
  const s = shipScale;

  const hullShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 2.2 * s);
    shape.quadraticCurveTo(0.85 * s, 1.2 * s, 0.72 * s, -1.6 * s);
    shape.lineTo(-0.72 * s, -1.6 * s);
    shape.quadraticCurveTo(-0.85 * s, 1.2 * s, 0, 2.2 * s);
    return shape;
  }, [s]);
  const deckShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.8 * s);
    shape.quadraticCurveTo(0.6 * s, 1.0 * s, 0.52 * s, -1.3 * s);
    shape.lineTo(-0.52 * s, -1.3 * s);
    shape.quadraticCurveTo(-0.6 * s, 1.0 * s, 0, 1.8 * s);
    return shape;
  }, [s]);
  const wakeShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.45 * s, -1.6 * s);
    shape.lineTo(-2.2 * s, -5.5 * s);
    shape.lineTo(2.2 * s, -5.5 * s);
    shape.lineTo(0.45 * s, -1.6 * s);
    return shape;
  }, [s]);

  const containers = node.type === 'Navy' || node.type === 'Sail' || node.type === 'Unknown'
    ? []
    : [-0.6, 0.0, 0.6].map((z, i) => ({ x: 0, z: z * s, color: c.container[i % c.container.length] }));

  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;

    // FIX: Clamp delta to prevent huge jumps when tab regains focus
    const dt = Math.min(delta, 0.05);

    // FIX: Smooth heading interpolation towards target heading
    let dh = targetHeadingRef.current - headingRef.current;
    while (dh > Math.PI) dh -= 2 * Math.PI;
    while (dh < -Math.PI) dh += 2 * Math.PI;
    headingRef.current += dh * Math.min(1, 3 * dt);

    // FIX: Delta-based movement (frame-rate independent)
    if (!isIntercepted) {
      const moveSpeed = node.speed * 0.06; // units per second
      posRef.current.x += Math.sin(headingRef.current) * moveSpeed * dt;
      posRef.current.z += Math.cos(headingRef.current) * moveSpeed * dt;

      // FIX: Boundary — redirect vessel towards center instead of wrong axis reversal
      const margin = 13;
      let needTurn = false;
      if (posRef.current.x > margin || posRef.current.x < -margin) {
        posRef.current.x = THREE.MathUtils.clamp(posRef.current.x, -margin, margin);
        needTurn = true;
      }
      if (posRef.current.z > margin || posRef.current.z < -margin) {
        posRef.current.z = THREE.MathUtils.clamp(posRef.current.z, -margin, margin);
        needTurn = true;
      }
      if (needTurn) {
        // Aim back towards map center with slight randomness
        targetHeadingRef.current = Math.atan2(-posRef.current.x, -posRef.current.z) + (Math.random() - 0.5) * 0.8;
      }

      // Update node so dispatch & detail panel use real-time coords
      node.x = posRef.current.x;
      node.z = posRef.current.z;
      node.heading = headingRef.current;
    } else {
      // Intercepted — gradually slow down
      const moveSpeed = node.speed * 0.03;
      posRef.current.x += Math.sin(headingRef.current) * moveSpeed * dt;
      posRef.current.z += Math.cos(headingRef.current) * moveSpeed * dt;
      node.x = posRef.current.x;
      node.z = posRef.current.z;
    }

    // Apply position with smooth bobbing
    ref.current.position.x = posRef.current.x;
    ref.current.position.z = posRef.current.z;
    ref.current.position.y = 0.12 + Math.sin(t * 1.2 + node.id * 0.7) * 0.02;
    ref.current.rotation.y = headingRef.current;
    ref.current.rotation.z = Math.sin(t * 0.8 + node.id) * 0.012;

    // Wake opacity
    if (wakeRef.current) {
      wakeRef.current.material.opacity = 0.18 + Math.sin(t * 2 + node.id) * 0.05;
    }

    // Selection ring pulse
    if (ringRef.current) {
      const pulse = 1 + Math.sin(t * 4) * 0.12;
      ringRef.current.scale.set(pulse, pulse, 1);
    }

    // FIX: Trail — update every 4th frame, write to pre-allocated buffer
    trailFrameCount.current++;
    if (trailFrameCount.current % 4 === 0 && !isIntercepted) {
      trailPointsRef.current.push([posRef.current.x, 0.02, posRef.current.z]);
      if (trailPointsRef.current.length > maxTrailPoints) {
        trailPointsRef.current.shift();
      }

      if (trailRef.current) {
        const geo = trailRef.current.geometry;
        // Safety: ensure position attribute exists
        if (!geo.attributes.position) {
          geo.setAttribute('position', new THREE.BufferAttribute(trailBuffer, 3));
        }
        // Copy points to pre-allocated buffer (no new allocation)
        const points = trailPointsRef.current;
        for (let i = 0; i < points.length; i++) {
          trailBuffer[i * 3]     = points[i][0];
          trailBuffer[i * 3 + 1] = points[i][1];
          trailBuffer[i * 3 + 2] = points[i][2];
        }
        geo.attributes.position.needsUpdate = true;
        geo.setDrawRange(0, points.length);
      }
    }
  });

  const labelBg = isDark ? 'rgba(20, 40, 56, 0.95)' : 'rgba(250, 246, 240, 0.95)';
  const labelColor = isDark ? '#E8F0F8' : '#3D2B1F';
  const trailColor = node.status === 'dark' ? '#E0605D' : node.status === 'spoof' ? '#F0B848' : '#5B9BD5';

  return (
    <group
      ref={ref}
      position={[node.x, 0.12, node.z]}
      rotation={[0, node.heading || 0, 0]}
      onClick={(e) => { e.stopPropagation(); onSelect(node); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      {/* Trail always rendered — geometry set up in useEffect, controlled by drawRange */}
      <line ref={trailRef}>
        <bufferGeometry />
        <lineBasicMaterial color={trailColor} transparent opacity={0.3} />
      </line>

      {/* Selection Ring */}
      {isSelected && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
          <ringGeometry args={[1.8, 2.1, 32]} />
          <meshBasicMaterial color="#E8985C" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Intercepted Warning Ring */}
      {isIntercepted && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <ringGeometry args={[2.2, 2.5, 32]} />
          <meshBasicMaterial color="#E0605D" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1 * s, -0.08, 0.1 * s]}>
        <shapeGeometry args={[hullShape]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.12} />
      </mesh>

      {/* Hull */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[hullShape]} />
        <meshStandardMaterial color={c.hull} roughness={0.55} metalness={0.1} />
      </mesh>

      {/* Deck */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <shapeGeometry args={[deckShape]} />
        <meshStandardMaterial color={c.deck} roughness={0.45} metalness={0.15} />
      </mesh>

      {/* Containers */}
      {containers.map((cnt, i) => (
        <mesh key={i} position={[cnt.x, 0.14, cnt.z]}>
          <boxGeometry args={[0.85 * s, 0.22, 0.45 * s]} />
          <meshStandardMaterial color={cnt.color} roughness={0.6} />
        </mesh>
      ))}

      {/* Navy gun turret */}
      {node.type === 'Navy' && (
        <mesh position={[0, 0.14, 1.0 * s]}>
          <cylinderGeometry args={[0.18 * s, 0.2 * s, 0.12, 12]} />
          <meshStandardMaterial color="#2C2C2C" metalness={0.3} />
        </mesh>
      )}

      {/* Bridge + Funnel */}
      {node.status !== 'dark' && (
        <>
          <mesh position={[0, 0.2, -0.9 * s]}>
            <boxGeometry args={[0.55 * s, 0.38, 0.55 * s]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.28, -0.9 * s]}>
            <boxGeometry args={[0.5 * s, 0.06, 0.01]} />
            <meshStandardMaterial color="#2C3E50" metalness={0.5} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.38, -1.15 * s]}>
            <cylinderGeometry args={[0.1 * s, 0.12 * s, 0.22, 8]} />
            <meshStandardMaterial color={c.accent} roughness={0.4} />
          </mesh>
        </>
      )}

      {/* Sail mast */}
      {node.type === 'Sail' && (
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 6]} />
          <meshStandardMaterial color="#8B5E3C" />
        </mesh>
      )}

      {/* Wake */}
      <mesh ref={wakeRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <shapeGeometry args={[wakeShape]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.2} />
      </mesh>

      {/* Label */}
      <Html distanceFactor={22} position={[0, 1.8, 0]} center zIndexRange={[10, 0]}>
        <div style={{
          background: labelBg, backdropFilter: 'blur(4px)',
          border: `2px solid ${c.deck}`, borderRadius: '8px', padding: '4px 10px',
          fontSize: '11px', fontWeight: 700, color: labelColor, whiteSpace: 'nowrap',
          boxShadow: '0 3px 10px rgba(0,0,0,0.12)', pointerEvents: 'none',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>
          {node.name}
          <span style={{ color: c.deck, marginLeft: '5px' }}>●</span>
        </div>
      </Html>
    </group>
  );
}

// memo() prevents unnecessary re-renders when App state changes
const MemoizedShip = memo(RealisticShip, (prev, next) => {
  return prev.isSelected === next.isSelected &&
         prev.isDark === next.isDark &&
         prev.isIntercepted === next.isIntercepted &&
         prev.node === next.node &&
         prev.onSelect === next.onSelect;
});

/* ==================== AUTHORITY VESSEL ==================== */
function AuthorityVessel({ mission, isDark, lang }) {
  const groupRef = useRef();
  const ringRef = useRef();
  const lightRef = useRef();
  const progressRef = useRef(0);
  const { fromX, fromZ, toX, toZ } = mission;

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    progressRef.current = Math.min(progressRef.current + dt * 0.18, 1);
    const p = progressRef.current;
    const x = THREE.MathUtils.lerp(fromX, toX, p);
    const z = THREE.MathUtils.lerp(fromZ, toZ, p);
    groupRef.current.position.x = x;
    groupRef.current.position.z = z;
    const dx = toX - x, dz = toZ - z;
    if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) groupRef.current.rotation.y = Math.atan2(dx, dz);
    groupRef.current.position.y = 0.12 + Math.sin(clock.elapsedTime * 1.5) * 0.03;
    if (ringRef.current) {
      const scale = 1 + Math.sin(clock.elapsedTime * 3) * 0.25;
      ringRef.current.scale.set(scale, scale, 1);
      ringRef.current.material.opacity = 0.4 + Math.sin(clock.elapsedTime * 3) * 0.2;
    }
    if (lightRef.current) lightRef.current.material.opacity = Math.abs(Math.sin(clock.elapsedTime * 5));
  });

  const hullShape = useMemo(() => {
    const s = 1.15;
    const shape = new THREE.Shape();
    shape.moveTo(0, 2.5 * s);
    shape.quadraticCurveTo(0.9 * s, 1.3 * s, 0.78 * s, -1.8 * s);
    shape.lineTo(-0.78 * s, -1.8 * s);
    shape.quadraticCurveTo(-0.9 * s, 1.3 * s, 0, 2.5 * s);
    return shape;
  }, []);

  const interceptingText = lang === 'id' ? 'Mencegat' : 'Intercepting';

  return (
    <>
      <Line points={[[fromX, 0.1, fromZ], [toX, 0.1, toZ]]} color="#E0605D" lineWidth={2} dashed dashSize={0.6} gapSize={0.4} />
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[toX, 0.08, toZ]}>
        <ringGeometry args={[1.5, 1.9, 32]} />
        <meshBasicMaterial color="#E0605D" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <group ref={groupRef} position={[fromX, 0.12, fromZ]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
          <shapeGeometry args={[hullShape]} />
          <meshBasicMaterial color="#000" transparent opacity={0.15} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <shapeGeometry args={[hullShape]} />
          <meshStandardMaterial color="#2C3E50" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <shapeGeometry args={[hullShape]} />
          <meshStandardMaterial color="#34495E" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.25, -0.9]}>
          <boxGeometry args={[0.6, 0.4, 0.6]} />
          <meshStandardMaterial color="#ECF0F1" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.18, 1.0]}>
          <cylinderGeometry args={[0.18, 0.2, 0.14, 12]} />
          <meshStandardMaterial color="#2C2C2C" metalness={0.4} />
        </mesh>
        <mesh ref={lightRef} position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#FF0000" transparent opacity={1} />
        </mesh>
        <pointLight position={[0, 0.6, 0]} color="#FF0000" intensity={2} distance={6} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, -2.5]}>
          <planeGeometry args={[1.5, 4]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.2} />
        </mesh>
        <Html distanceFactor={22} position={[0, 2.2, 0]} center>
          <div className="authority-label">
            🚨 {mission.authorityVessel}
            <small>→ {interceptingText} {mission.targetName}</small>
          </div>
        </Html>
      </group>
    </>
  );
}

/* ==================== MAIN MAP ==================== */
export default function Map3D({ onSelectVessel, selectedVessel, missions = [], isDark = false, interceptedVesselIds = [], lang = 'en' }) {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 28, 12], fov: 45, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false }}
      onPointerMissed={() => onSelectVessel(null)}
    >
      <ambientLight intensity={isDark ? 0.5 : 0.75} color={isDark ? '#4A6FA5' : '#FFF8EE'} />
      <directionalLight position={[15, 25, 10]} intensity={isDark ? 0.8 : 1.1} color={isDark ? '#A8C8E8' : '#FFF5E0'} castShadow />
      <hemisphereLight args={[isDark ? '#2A4A6A' : '#FFF5E0', isDark ? '#0F2540' : '#5BAED0', isDark ? 0.3 : 0.4]} />
      <fog attach="fog" args={[isDark ? '#0D1B2A' : '#7EC8E0', 35, 65]} />

      <Ocean isDark={isDark} />

      <Grid
        position={[0, 0.005, 0]} args={[80, 80]}
        cellSize={2} cellThickness={0.5}
        cellColor={isDark ? '#2A4A6A' : '#FFFFFF'}
        sectionSize={10} sectionThickness={1}
        sectionColor={isDark ? '#4A7BA8' : '#FFFFFF'}
        fadeDistance={40} fadeStrength={1.5} infiniteGrid={false}
      />

      <NatunaIsland position={[-7, 0, 5]} scale={1} />
      <NatunaIsland position={[8, 0, -8]} scale={0.35} />
      <NatunaIsland position={[-10, 0, -7]} scale={0.25} />

      {mdaNodes.map(node => (
        <MemoizedShip
          key={node.id}
          node={node}
          onSelect={onSelectVessel}
          isSelected={selectedVessel?.id === node.id}
          isDark={isDark}
          isIntercepted={interceptedVesselIds.includes(node.id)}
        />
      ))}

      {missions.map(mission => (
        <AuthorityVessel key={mission.id} mission={mission} isDark={isDark} lang={lang} />
      ))}

      <OrbitControls
        enableRotate={false} enablePan={true} enableZoom={true}
        minDistance={12} maxDistance={40} panSpeed={0.8} zoomSpeed={0.8}
      />
    </Canvas>
  );
}