import { useMemo } from "react";
import { motion } from "framer-motion";

const NOTE_CHARS = ["♩", "♪", "♫", "♬", "♭", "♯"];
const NUM_BARS = 56;
const NUM_NOTES = 18;

/** Deterministic pseudo-random from seed — no Math.random() so SSR-safe */
function rng(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export function MusicBackground({ className = "" }: { className?: string }) {
  const bars = useMemo(
    () =>
      Array.from({ length: NUM_BARS }, (_, i) => ({
        minH: 6 + rng(i * 3) * 24,
        maxH: 30 + rng(i * 7) * 110,
        dur: 0.35 + rng(i * 11) * 0.75,
        delay: rng(i * 17) * 0.6,
        hue: 255 + (i / NUM_BARS) * 50,
      })),
    []
  );

  const notes = useMemo(
    () =>
      Array.from({ length: NUM_NOTES }, (_, i) => ({
        char: NOTE_CHARS[i % NOTE_CHARS.length],
        left: 3 + rng(i * 5) * 94,
        startVh: 70 + rng(i * 13) * 35,
        endVh: -8 - rng(i * 19) * 25,
        size: 10 + rng(i * 23) * 22,
        dur: 8 + rng(i * 29) * 12,
        delay: rng(i * 37) * 12,
        opacity: 0.08 + rng(i * 41) * 0.22,
        hue: 260 + rng(i * 43) * 80,
      })),
    []
  );

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {/* === Base gradient === */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #08081a 0%, #0d0521 25%, #090914 55%, #0f0820 80%, #080818 100%)",
        }}
      />

      {/* === Pulsing gradient orbs === */}
      {[
        { w: 700, h: 700, l: "-15%", t: "-25%", color: "#7c3aed", dur: 9, delay: 0, opacity: 0.18 },
        { w: 550, h: 550, r: "-8%", t: "5%", color: "#a855f7", dur: 11, delay: 2, opacity: 0.14 },
        { w: 450, h: 450, l: "28%", b: "-15%", color: "#6366f1", dur: 13, delay: 4, opacity: 0.12 },
        { w: 320, h: 320, r: "18%", b: "15%", color: "#ec4899", dur: 8, delay: 1, opacity: 0.08 },
        { w: 280, h: 280, l: "55%", t: "35%", color: "#8b5cf6", dur: 10, delay: 3, opacity: 0.06 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.w,
            height: orb.h,
            ...(orb.l !== undefined ? { left: orb.l } : {}),
            ...("r" in orb && orb.r !== undefined ? { right: orb.r } : {}),
            ...(orb.t !== undefined ? { top: orb.t } : {}),
            ...("b" in orb && orb.b !== undefined ? { bottom: orb.b } : {}),
            background: `radial-gradient(circle, ${orb.color}55, transparent 70%)`,
            opacity: orb.opacity,
          }}
          animate={{
            scale: [1, 1.18, 1],
            opacity: [orb.opacity * 0.7, orb.opacity * 1.3, orb.opacity * 0.7],
          }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
        />
      ))}

      {/* === Animated waveform (bottom decoration) === */}
      <div className="absolute bottom-24 left-0 right-0 h-20 opacity-[0.07]">
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <motion.path
            fill="none"
            stroke="url(#wg1)"
            strokeWidth="2"
            d="M0,40 C150,10 300,70 450,40 C600,10 750,70 900,40 C1050,10 1150,60 1200,40"
            animate={{
              d: [
                "M0,40 C150,10 300,70 450,40 C600,10 750,70 900,40 C1050,10 1150,60 1200,40",
                "M0,40 C150,70 300,10 450,40 C600,70 750,10 900,40 C1050,70 1150,20 1200,40",
                "M0,40 C150,10 300,70 450,40 C600,10 750,70 900,40 C1050,10 1150,60 1200,40",
              ],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            fill="none"
            stroke="url(#wg1)"
            strokeWidth="1.5"
            opacity={0.5}
            d="M0,50 C100,25 250,75 400,50 C550,25 700,75 850,50 C1000,25 1120,65 1200,50"
            animate={{
              d: [
                "M0,50 C100,25 250,75 400,50 C550,25 700,75 850,50 C1000,25 1120,65 1200,50",
                "M0,50 C100,75 250,25 400,50 C550,75 700,25 850,50 C1000,75 1120,35 1200,50",
                "M0,50 C100,25 250,75 400,50 C550,25 700,75 850,50 C1000,25 1120,65 1200,50",
              ],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </svg>
      </div>

      {/* === Equalizer bars along the bottom === */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end gap-[1.5px] h-24 px-0 overflow-hidden">
        {bars.map((bar, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-[2px]"
            style={{
              minWidth: 1,
              background: `linear-gradient(to top, hsl(${bar.hue}, 75%, 42%), hsl(${bar.hue + 20}, 80%, 60%) 60%, transparent)`,
            }}
            animate={{ height: [bar.minH, bar.maxH, bar.minH * 0.6, bar.maxH * 0.75, bar.minH] }}
            transition={{ duration: bar.dur, delay: bar.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* === Floating musical notes === */}
      {notes.map((note, i) => (
        <motion.span
          key={i}
          className="absolute font-heading leading-none"
          style={{
            left: `${note.left}%`,
            fontSize: note.size,
            color: `hsl(${note.hue}, 70%, 72%)`,
            willChange: "transform, opacity",
          }}
          initial={{ y: `${note.startVh}vh`, opacity: 0 }}
          animate={{
            y: [`${note.startVh}vh`, `${note.endVh}vh`],
            opacity: [0, note.opacity, note.opacity * 0.8, 0],
            rotate: [-8, 8, -8],
          }}
          transition={{ duration: note.dur, delay: note.delay, repeat: Infinity, ease: "linear" }}
        >
          {note.char}
        </motion.span>
      ))}

      {/* === Subtle dot grid texture === */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(168,85,247,0.8) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* === Edge vignette === */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </div>
  );
}
