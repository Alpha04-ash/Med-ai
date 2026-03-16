"use client";

import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF, Center } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------
   SINGLE REGION MESH
   Invisible box geometry placed precisely over the human body.
   Highlights emerald on hover, bright emerald on selection.
------------------------------------------------------------------ */
function Region({
  name,
  position,
  scale,
  onSelect,
  selectedPart,
}: {
  name: string;
  position: [number, number, number];
  scale: [number, number, number];
  onSelect: (n: string) => void;
  selectedPart: string | null;
}) {
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedPart === name;

  return (
    <mesh
      position={position}
      scale={scale}
      onClick={(e) => { e.stopPropagation(); onSelect(name); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={isSelected ? "#10b981" : hovered ? "#34d399" : "#10b981"}
        transparent
        opacity={isSelected ? 0.55 : hovered ? 0.35 : 0.0}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------
   REALISTIC HUMAN BODY (GLB MODEL)
------------------------------------------------------------------ */
function HumanMesh() {
  const { scene } = useGLTF("/models/human.glb");
  return (
    <primitive
      object={scene}
      scale={1.35}
      position={[0, -1.2, 0]}
    />
  );
}

/* ------------------------------------------------------------------
   ALL 30+ BODY REGIONS  (anterior z=+0.35, posterior z=−0.35)
------------------------------------------------------------------ */
function AllRegions({ view, onSelect, selectedPart }: {
  view: "front" | "back";
  onSelect: (n: string) => void;
  selectedPart: string | null;
}) {
  const z = view === "front" ? 0.35 : -0.35;

  const regions: { name: string; pos: [number, number, number]; scale: [number, number, number] }[] = [
    // ── HEAD ──────────────────────────────────────────
    { name: "Head",             pos: [0,    3.0,  z],  scale: [0.85, 0.85, 0.6] },
    { name: "Face",             pos: [0,    2.75, z],  scale: [0.75, 0.5,  0.5] },
    { name: "Forehead",         pos: [0,    3.2,  z],  scale: [0.7,  0.3,  0.4] },
    { name: "Jaw / Chin",       pos: [0,    2.45, z],  scale: [0.7,  0.3,  0.4] },

    // ── NECK ──────────────────────────────────────────
    { name: "Neck",             pos: [0,    2.15, z],  scale: [0.5,  0.5,  0.5] },

    // ── SHOULDERS ─────────────────────────────────────
    { name: "Left Shoulder",    pos: [-1.45, 2.05, z], scale: [0.75, 0.55, 0.55] },
    { name: "Right Shoulder",   pos: [ 1.45, 2.05, z], scale: [0.75, 0.55, 0.55] },

    // ── CHEST ─────────────────────────────────────────
    { name: "Upper Chest",      pos: [0,    1.65, z],  scale: [1.75, 0.6,  0.6] },
    { name: "Lower Chest",      pos: [0,    1.15, z],  scale: [1.7,  0.6,  0.6] },
    { name: "Left Pectoral",    pos: [-0.55, 1.55, z], scale: [0.75, 0.85, 0.55] },
    { name: "Right Pectoral",   pos: [ 0.55, 1.55, z], scale: [0.75, 0.85, 0.55] },

    // ── ABDOMEN ───────────────────────────────────────
    { name: "Upper Abdomen",    pos: [0,    0.75, z],  scale: [1.65, 0.75, 0.6] },
    { name: "Lower Abdomen",    pos: [0,    0.05, z],  scale: [1.55, 0.75, 0.6] },

    // ── BACK (only shown in posterior view) ────────────
    { name: "Upper Back",       pos: [0,    1.65, -z], scale: [1.7,  0.75, 0.6] },
    { name: "Mid Back",         pos: [0,    1.1,  -z], scale: [1.6,  0.65, 0.6] },
    { name: "Lower Back",       pos: [0,    0.5,  -z], scale: [1.55, 0.65, 0.6] },
    { name: "Left Glute",       pos: [-0.5,-0.3,  -z], scale: [0.75, 0.65, 0.55] },
    { name: "Right Glute",      pos: [ 0.5,-0.3,  -z], scale: [0.75, 0.65, 0.55] },

    // ── HIPS / PELVIS ─────────────────────────────────
    { name: "Left Hip",         pos: [-0.65,-0.75, z], scale: [0.65, 0.65, 0.65] },
    { name: "Right Hip",        pos: [ 0.65,-0.75, z], scale: [0.65, 0.65, 0.65] },

    // ── ARMS ──────────────────────────────────────────
    { name: "Left Upper Arm",   pos: [-1.95, 1.35, z], scale: [0.58, 1.3,  0.58] },
    { name: "Right Upper Arm",  pos: [ 1.95, 1.35, z], scale: [0.58, 1.3,  0.58] },
    { name: "Left Elbow",       pos: [-1.95, 0.35, z], scale: [0.5,  0.45, 0.5] },
    { name: "Right Elbow",      pos: [ 1.95, 0.35, z], scale: [0.5,  0.45, 0.5] },
    { name: "Left Forearm",     pos: [-1.95,-0.4,  z], scale: [0.55, 1.15, 0.55] },
    { name: "Right Forearm",    pos: [ 1.95,-0.4,  z], scale: [0.55, 1.15, 0.55] },
    { name: "Left Wrist",       pos: [-1.95,-1.1,  z], scale: [0.45, 0.35, 0.45] },
    { name: "Right Wrist",      pos: [ 1.95,-1.1,  z], scale: [0.45, 0.35, 0.45] },
    { name: "Left Hand",        pos: [-1.95,-1.5,  z], scale: [0.55, 0.5,  0.45] },
    { name: "Right Hand",       pos: [ 1.95,-1.5,  z], scale: [0.55, 0.5,  0.45] },

    // ── LEGS ──────────────────────────────────────────
    { name: "Left Thigh",       pos: [-0.6, -1.95, z], scale: [0.88, 1.65, 0.78] },
    { name: "Right Thigh",      pos: [ 0.6, -1.95, z], scale: [0.88, 1.65, 0.78] },
    { name: "Left Knee",        pos: [-0.6, -3.05, z], scale: [0.6,  0.55, 0.6] },
    { name: "Right Knee",       pos: [ 0.6, -3.05, z], scale: [0.6,  0.55, 0.6] },
    { name: "Left Lower Leg",   pos: [-0.6, -4.15, z], scale: [0.78, 1.65, 0.7] },
    { name: "Right Lower Leg",  pos: [ 0.6, -4.15, z], scale: [0.78, 1.65, 0.7] },
    { name: "Left Ankle",       pos: [-0.6, -5.1,  z], scale: [0.6,  0.35, 0.55] },
    { name: "Right Ankle",      pos: [ 0.6, -5.1,  z], scale: [0.6,  0.35, 0.55] },
    { name: "Left Foot",        pos: [-0.6, -5.5,  z], scale: [0.85, 0.35, 1.25] },
    { name: "Right Foot",       pos: [ 0.6, -5.5,  z], scale: [0.85, 0.35, 1.25] },
  ];

  // In posterior view, only show back-specific regions + symmetric ones
  // In anterior view, hide the explicitly-back regions
  const backOnly = new Set(["Upper Back","Mid Back","Lower Back","Left Glute","Right Glute"]);

  const visible = regions.filter(r => {
    if (view === "front" && backOnly.has(r.name)) return false;
    if (view === "back" && (r.name === "Face" || r.name === "Forehead" || r.name.includes("Pectoral") || r.name.includes("Chest") || r.name.includes("Abdomen"))) return false;
    return true;
  });

  return (
    <>
      {visible.map((r) => (
        <Region
          key={r.name}
          name={r.name}
          position={r.pos}
          scale={r.scale}
          onSelect={onSelect}
          selectedPart={selectedPart}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------
   MAIN EXPORT
------------------------------------------------------------------ */
export interface BodyModelProps {
  onSelect: (part: string) => void;
  hoveredPart?: string | null;
  setHoveredPart?: (part: string | null) => void;
  selectedPart: string | null;
  view: "front" | "back";
}

export default function BodyModel({ onSelect, selectedPart, view }: BodyModelProps) {
  return (
    <div className="w-full h-full relative rounded-[3rem] overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        shadows
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <spotLight position={[-5, 8, 5]} intensity={0.8} angle={0.3} penumbra={1} />
        <hemisphereLight intensity={0.4} groundColor="#000" color="#fff" />

        <Center top>
          <group scale={0.55}>
            <HumanMesh />
            <AllRegions view={view} onSelect={onSelect} selectedPart={selectedPart} />
          </group>
        </Center>

        <ContactShadows position={[0, -1.35, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        <OrbitControls enablePan={false} minDistance={4} maxDistance={14} makeDefault />
        <Environment preset="city" />
      </Canvas>

      {/* View label */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="px-5 py-2 bg-slate-900/90 rounded-full border border-emerald-500/40 backdrop-blur-md shadow-xl">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.25em]">
            {view === "front" ? "Anterior View" : "Posterior View"}
          </span>
        </div>
      </div>

      {/* Selected badge */}
      <AnimatePresence>
        {selectedPart && (
          <motion.div
            key={selectedPart}
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.92 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          >
            <div className="px-7 py-3 bg-emerald-500 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.45)] border border-emerald-400">
              <span className="text-sm font-black text-white uppercase tracking-widest whitespace-nowrap">
                ✦ {selectedPart}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ── MEDICAL SCANNER HUD ── */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Scanner Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ 
               backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`,
               backgroundSize: '40px 40px' 
             }} 
        />
        
        {/* Pulse Scan Line */}
        <motion.div 
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.5)] opacity-50"
        />

        {/* Floating Data Points (Decoration) */}
        <div className="absolute top-1/4 left-10 w-32 space-y-2">
           <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Aura_SCAN.v2</span>
           </div>
           <div className="h-0.5 w-12 bg-emerald-500/20" />
           <p className="text-[7px] font-mono text-emerald-600/40 leading-tight">RESOLVING_MESH...<br/>SYNC_LATENCY: 12ms</p>
        </div>

        <div className="absolute bottom-1/4 right-10 w-32 space-y-2 text-right">
           <p className="text-[7px] font-mono text-emerald-600/40 leading-tight">DATA_STREAM_7DA<br/>VITAL_CORRELATION: OK</p>
           <div className="h-0.5 w-12 bg-emerald-500/20 ml-auto" />
           <div className="flex items-center justify-end gap-2">
              <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Biometric_Lock</span>
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
           </div>
        </div>

        {/* Corners */}
        <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-emerald-500/20" />
        <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-emerald-500/20" />
        <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-emerald-500/20" />
        <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-emerald-500/20" />
      </div>
    </div>
  );
}
