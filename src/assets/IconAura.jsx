import React from "react";
import { LuComputer } from "react-icons/lu";

export default function IconAura({icon}) {
  return (
    <>
      {/* Inline Pure CSS for complex keyframe animations */}
      <style>{`
        @keyframes auraPulse {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 0.6;
            border-radius: 40% 60% 60% 40% / 40% 50% 50% 60%;
          }
          50% {
            transform: scale(1.15) rotate(180deg);
            opacity: 0.8;
            /* Morphing the boundary to mimic the fluid wavy lines in the image */
            border-radius: 60% 40% 40% 60% / 50% 60% 40% 50%;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 0.6;
            border-radius: 40% 60% 60% 40% / 40% 50% 50% 60%;
          }
        }

        @keyframes innerGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(0, 242, 254, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(185, 43, 227, 0.6); }
        }
      `}</style>

      {/* Main Container - Fixed Positioning */}
      <div style={styles.container}>
        {/* Animated Aura Ring */}
        <div style={styles.auraRing} />

        {/* Central Icon Button */}
        <div style={styles.iconCore}>
          <LuComputer size={16} style={styles.icon} />
        </div>
      </div>
    </>
  );
}

// Inline Styles mapped exactly to the image palette
const styles = {
  container: {
    position: "fixed",
    top: "8px",           // "top 2" (assuming standard 8px/2rem spacing scale)
    left: "8px",          // "left 2"
    zIndex: 9999,         // Ensures it floats on top of all other elements
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "64px",
    height: "64px",
    background: "transparent",
  },
  auraRing: {
    position: "absolute",
    width: "100%",
    height: "100%",
    // Linear gradient using the cyan, blue, and purple tones from your image
    background: "linear-gradient(135deg, rgba(0, 242, 254, 0.3), rgba(79, 110, 242, 0.2), rgba(185, 43, 227, 0.4))",
    // border: ".1px dashed rgba(0, 242, 254, 0.4)",
    animation: "auraPulse 6s ease-in-out infinite",
    pointerEvents: "none",
    filter: "blur(2px)",
  },
  iconCore: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    // Metallic iridescent finish mirroring the central text
    background: "linear-gradient(135deg, #ffffff 0%, #e0e5ff 50%, #b9d5ff 100%)",
    animation: "innerGlow 3s ease-in-out infinite",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  icon: {
    // Deep blue-purple tint for high-contrast visibility against the bright core
    color: "#2b3080",
  },
};