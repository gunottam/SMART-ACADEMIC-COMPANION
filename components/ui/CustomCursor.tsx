"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);

  // Directly mutate values outside React's Virtual DOM rendering cycle
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Physics bindings
  const smoothX = useSpring(mouseX, { stiffness: 1000, damping: 50, mass: 0.1 });
  const smoothY = useSpring(mouseY, { stiffness: 1000, damping: 50, mass: 0.1 });

  const smoothRingX = useSpring(mouseX, { stiffness: 150, damping: 15, mass: 0.8 });
  const smoothRingY = useSpring(mouseY, { stiffness: 150, damping: 15, mass: 0.8 });

  useEffect(() => {
    let animationFrameId: number;
    // Start at center until movement is detected
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;

    const updateMousePosition = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const loop = () => {
      mouseX.set(targetX);
      mouseY.set(targetY);
      animationFrameId = requestAnimationFrame(loop);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'input' ||
        target.closest('button') ||
        target.closest('a') ||
        window.getComputedStyle(target).cursor === 'pointer'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    
    mouseX.set(targetX);
    mouseY.set(targetY);
    loop();

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-cyan-400 rounded-full pointer-events-none z-[9999] mix-blend-screen"
        style={{ x: smoothX, y: smoothY, translateX: "-50%", translateY: "-50%" }}
        animate={{ scale: isHovering ? 0 : 1 }}
        transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border-2 border-emerald-400/80 rounded-full pointer-events-none z-[9998] mix-blend-screen shadow-[0_0_15px_rgba(52,211,153,0.5)]"
        style={{ x: smoothRingX, y: smoothRingY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? "rgba(52, 211, 153, 0.1)" : "rgba(52, 211, 153, 0)",
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}
