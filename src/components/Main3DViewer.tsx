import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Edges, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ProgramItem } from '../types';

// ──────────────────────────────────────────────────────────────────────────────
// GLTF export helper (lazy-loaded to avoid bundle bloat when not used)
// ──────────────────────────────────────────────────────────────────────────────
async function exportSceneAsGLTF(scene: THREE.Object3D, filename: string) {
  const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (result) => {
      const blob = result instanceof ArrayBuffer
        ? new Blob([result], { type: 'model/gltf-binary' })
        : new Blob([JSON.stringify(result, null, 2)], { type: 'model/gltf+json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    (err) => { console.error('GLTF export error:', err); },
    { binary: false }
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Internal scene capture hook — exposes the Three.js scene via ref
// ──────────────────────────────────────────────────────────────────────────────
export interface MassingSceneHandle {
  exportGLTF: (filename: string) => void;
}

function SceneCaptureForwarder({ onReady }: { onReady: (scene: THREE.Scene) => void }) {
  const { scene } = useThree();
  React.useEffect(() => { onReady(scene); }, [scene, onReady]);
  return null;
}

function MassingModel({ siteArea, far, bcr, programs, formal_strategy }: { siteArea: number, far: number, bcr: number, programs: ProgramItem[], formal_strategy: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && (formal_strategy === 'ROTATED' || formal_strategy === 'SKEWED')) {
      // Gentle rotation for dynamic forms
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  const materialProps = {
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.85,
  };

  // Dynamic Calculations
  const totalGFA = siteArea * (far / 100);
  const maxFootprint = siteArea * (bcr / 100);
  const siteSide = Math.sqrt(siteArea);
  
  // 3D Unit Scale mapping 
  // Let's fit the site into a 30x30 coordinate space
  const unitScale = 30 / siteSide;

  // Process dimensions for all programs
  const blocks = programs.map(p => {
    const area = totalGFA * p.ratio;
    const fpArea = maxFootprint * p.fpRatio;
    const height = area / fpArea;
    const side = Math.sqrt(fpArea);
    const floors = Math.max(1, Math.round(height / 3.5)); // Assume 3.5m floor-to-floor
    return { ...p, area, fpArea, height, side, floors };
  });

  // Algorithm Factory: Positioning Logic
  let renderBlocks: any[] = [];
  
  if (formal_strategy === 'HORIZONTAL') {
    // Connected linear bar — all blocks touch side-by-side, varying heights like a street block
    const sortedBlocks = [...blocks].sort((a, b) => b.fpArea - a.fpArea);
    const totalW = sortedBlocks.reduce((sum, b) => sum + b.side * unitScale, 0);
    let currentX = -(totalW / 2);
    renderBlocks = sortedBlocks.map((b) => {
      const h = b.height * unitScale;
      const s = b.side * unitScale;
      const depth = s * 0.55; // elongated slab — narrow in Z
      const x = currentX + s / 2;
      currentX += s;
      return { ...b, position: [x, h / 2, 0], scale: [s, h, depth], rotation: [0, 0, 0] };
    });
  } else if (formal_strategy === 'COURTYARD') {
    // U-shape: three wings share corner joints — left / right / back physically connected
    const S = siteSide * unitScale;
    const wt = S * 0.30; // wing thickness
    // Wing definitions: position + scale (XZ). All wings start at Y=0 and stack upward.
    const wingDefs = [
      { px: -(S / 2 - wt / 2), pz: 0,               sx: wt, sz: S    }, // left wing
      { px:  (S / 2 - wt / 2), pz: 0,               sx: wt, sz: S    }, // right wing
      { px: 0,                  pz: -(S / 2 - wt / 2), sx: S - wt * 2, sz: wt }, // back connection
    ];
    const wingHeights = [0, 0, 0];
    renderBlocks = blocks.map((b, i) => {
      const wIdx = i % 3;
      const h = (b.height * unitScale) * 0.45; // sprawling courtyard = lower height
      const wd = wingDefs[wIdx];
      const yPos = wingHeights[wIdx] + h / 2;
      wingHeights[wIdx] += h;
      return {
        ...b,
        position: [wd.px, yPos, wd.pz],
        scale: [wd.sx, h, wd.sz],
        rotation: [0, 0, 0],
      };
    });
  } else if (formal_strategy === 'SKEWED') {
    // Stacked with progressive cantilever — lean proportional to block width so adjacency holds
    let currentY = 0;
    const sortedBlocks = [...blocks].sort((a, b) => b.fpArea - a.fpArea);
    renderBlocks = sortedBlocks.map((b, i) => {
      const h = b.height * unitScale;
      const s = b.side * unitScale;
      const yPos = currentY + h / 2;
      currentY += h;
      const lean = i * (s * 0.12); // lean = fraction of own width → always overlaps with floor below
      const rotY = i * (Math.PI / 20); // 9° gentle twist
      return { ...b, position: [lean, yPos, 0], scale: [s, h, s * 0.75], rotation: [0, rotY, 0] };
    });
  } else if (formal_strategy === 'ROTATED') {
    // Stacked with rotation only — no XZ drift so all floors share the same footprint centre
    let currentY = 0;
    const sortedBlocks = [...blocks].sort((a, b) => b.fpArea - a.fpArea);
    renderBlocks = sortedBlocks.map((b, i) => {
      const h = b.height * unitScale;
      const s = b.side * unitScale;
      const yPos = currentY + h / 2;
      currentY += h;
      const rotY = i * (Math.PI / 6); // 30° per floor — visible spin, no disconnection
      return { ...b, position: [0, yPos, 0], scale: [s, h, s], rotation: [0, rotY, 0] };
    });
  } else {
    // STACKED: sorted by footprint, pure vertical stack with slight taper
    let currentY = 0;
    const sortedBlocks = [...blocks].sort((a, b) => b.fpArea - a.fpArea);
    renderBlocks = sortedBlocks.map((b, i) => {
      const h = b.height * unitScale;
      // Taper: each successive floor is slightly narrower
      const taper = 1 - i * 0.04;
      const s = b.side * unitScale * Math.max(taper, 0.55);
      const yPos = currentY + h / 2;
      currentY += h;
      return { ...b, position: [0, yPos, 0], scale: [s, h, s], rotation: [0, 0, 0] };
    });
  }

  return (
    <group ref={groupRef} position={[0, -3, 0]}>
      
      {/* Visual Site Boundary to understand BCR constraints */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[siteSide * unitScale, siteSide * unitScale]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.03} side={THREE.DoubleSide} />
        <Edges color="#ffffff" transparent opacity={0.15} />
        <Html position={[(siteSide * unitScale)/2, (siteSide * unitScale)/2, 0]} className="pointer-events-none whitespace-nowrap -ml-4 -mt-6">
          <div className="text-[10px] font-mono text-white/50 bg-black/50 px-1 py-0.5 rounded">
            SITE BNDRY {siteArea.toLocaleString()}m² (Max BCR {bcr}%)
          </div>
        </Html>
      </mesh>

      {/* Dynamic Program Blocks */}
      {renderBlocks.map((block) => (
        <mesh 
          key={block.id} 
          position={block.position as any} 
          scale={block.scale as any}
          rotation={block.rotation as any}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={block.color} {...materialProps} />
          <Edges scale={1.001} threshold={15} color="#ffffff" opacity={0.3} transparent />
          <Html position={[0, 0.5, 0]} center className="pointer-events-none">
            <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded px-2 py-1 flex flex-col items-center shadow-xl">
              <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: block.color }}>{block.name}</span>
              <span className="text-[7px] text-white/70">{block.floors}F (H: {block.height.toFixed(1)}m)</span>
            </div>
          </Html>
        </mesh>
      ))}
      
      {/* Context Buildings (Ghosted) */}
      <mesh position={[-15, 2, -10]}>
        <boxGeometry args={[6, 8, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} transparent opacity={0.05} />
        <Edges scale={1.001} threshold={15} color="#ffffff" opacity={0.1} transparent />
      </mesh>
      <mesh position={[12, 3, 14]}>
        <boxGeometry args={[8, 12, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} transparent opacity={0.05} />
        <Edges scale={1.001} threshold={15} color="#ffffff" opacity={0.1} transparent />
      </mesh>
    </group>
  );
}

interface Main3DViewerProps {
  isGenerating: boolean;
  siteArea: number;
  far: number;
  bcr: number;
  programs: ProgramItem[];
  formal_strategy: string;
  variantName?: string;
}

export function Main3DViewer({ isGenerating, siteArea, far, bcr, programs, formal_strategy, variantName }: Main3DViewerProps) {
  const sceneRef = useRef<THREE.Scene | null>(null);

  const handleGLTFExport = () => {
    if (!sceneRef.current) return;
    const filename = `${(variantName || 'variant').replace(/[^a-zA-Z0-9-_]/g, '_')}_massing.gltf`;
    exportSceneAsGLTF(sceneRef.current, filename);
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#1a1a1a] to-[#050505] relative">
      {isGenerating && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <h3 className="text-white font-medium tracking-widest uppercase text-sm">Agents Computing</h3>
          <p className="text-white/50 text-xs mt-2 font-mono">Optimizing spatial ontology...</p>
        </div>
      )}

      {/* GLTF Export Button */}
      <button
        onClick={handleGLTFExport}
        title="Export as GLTF 3D file"
        className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-md text-[10px] font-mono text-white/70 uppercase tracking-wider hover:bg-white/10 hover:text-white transition-colors"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Export GLTF
      </button>

      <Canvas camera={{ position: [25, 25, 30], fov: 35 }}>
        <SceneCaptureForwarder onReady={(s) => { sceneRef.current = s; }} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
        <directionalLight position={[-10, -10, -10]} intensity={0.3} />
        <MassingModel
          siteArea={siteArea}
          far={far}
          bcr={bcr}
          programs={programs}
          formal_strategy={formal_strategy}
        />
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
        <Environment preset="city" />
        <ContactShadows position={[0, -3, 0]} opacity={0.8} scale={40} blur={2.5} far={10} color="#000000" />
        <gridHelper args={[40, 40, '#ffffff', '#ffffff']} position={[0, -3, 0]} material-opacity={0.05} material-transparent />
      </Canvas>
    </div>
  );
}
