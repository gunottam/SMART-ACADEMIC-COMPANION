"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

// Memoize the deep background to prevent Next.js from destroying
// the GPU context on Layout shift re-renders.
export const Ambient3DBackground = React.memo(function Ambient3DBackground() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-[-1] bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/30 via-black to-black" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[-1] bg-black">
      {/* Deep Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/30 via-black to-black" />
      
      {/* 
        ThreeJS WebGL Canvas 
        - Strict Hardware DP limits (max 1.5) to prevent Apple silicon throttling 
        - Antialias off because it's just stars, saving massive GPU compute
      */}
      <Canvas 
        camera={{ position: [0, 0, 1] }} 
        dpr={[1, 1.5]} 
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Stars 
          radius={100} 
          depth={50} 
          count={4000} 
          factor={4} 
          saturation={1} 
          fade 
          speed={0.5} 
        />
        <ambientLight intensity={0.5} />
      </Canvas>

      {/* Subtle Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none" />
    </div>
  );
});

export default Ambient3DBackground;
