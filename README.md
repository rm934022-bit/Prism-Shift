# 🎨 PRISM SHIFT — Precision 2D Platformer

> **"The rule is simple: you can only land on platforms that match your color. Open the color wheel to slow down time, pick the right color mid-jump, and don't let the timer run out."**

Built with pure HTML5 Canvas and Web Audio API—zero bloat, zero missing assets, instant 60 FPS precision platforming.

---

## 🎮 Play Live

Play the game online:
👉 **[https://prism-shift.onrender.com](https://prism-shift.onrender.com)**

---

## 🕹️ Controls

| Action | Desktop (Keyboard & Mouse) | Mobile / Tablet Touch |
|---|---|---|
| **Run Left / Right** | <kbd>A</kbd> / <kbd>D</kbd> or <kbd>←</kbd> / <kbd>→</kbd> | Left / Right buttons on bottom-left |
| **Jump** | <kbd>Space</kbd> / <kbd>W</kbd> / <kbd>↑</kbd> (Hold for higher jump) | **JUMP** button on bottom-right |
| **Open Color Wheel & Slow Down Time** | Hold <kbd>Shift</kbd>, <kbd>E</kbd>, <kbd>Q</kbd> or **Right Click** | Touch & drag **SLOW-MO** wheel button |
| **Instant Color Switch** | <kbd>1</kbd> Red · <kbd>2</kbd> Blue · <kbd>3</kbd> Yellow · <kbd>4</kbd> Green | Tap color dots on the top HUD |
| **Restart Level** | <kbd>R</kbd> | Tap Retry button |

---

## 🔹 Features & Mechanics

1. **Color-Match Platform Collision**:
   - Matching color platforms are **solid** and can be landed on.
   - Non-matching platforms are **semi-transparent ghost platforms**—you fall right through them!
   - Neutral white platforms are always solid.
2. **Radial Color Wheel with Matrix Slow-Motion**:
   - Holding Shift/Right Click dilates time to 15% speed.
   - The audio smoothly muffles with a resonant lowpass filter.
   - Flick your cursor towards any color quadrant to select mid-air and release to snap back to full speed!
3. **50 Levels across 5 Difficulty Tiers**:
   - **Tier 1: Fundamentals (Levels 1–10)**: Mid-air switching, learning rhythm, gap crossings.
   - **Tier 2: Kinetic Momentum (Levels 11–20)**: Moving platforms along rails, wall slides/jumps, hazard spikes.
   - **Tier 3: Chroma Shift (Levels 21–30)**: Rhythmically color-changing platforms that pulse colors every few beats.
   - **Tier 4: The Ascendant Towers (Levels 31–40)**: Vertical climbing towers, high-altitude wall bounces, moving elevators.
   - **Tier 5: Color Carpets & The Gauntlet (Levels 41–50)**: High-speed accelerator "color carpets", rapid sequential switching, and the ultimate **Sector 50: The Master Prism Gauntlet**.
4. **Speedrun Timers & 3-Star Rating**:
   - ★ Level Cleared
   - ★★ Zero Deaths (Flawless run)
   - ★★★ Under Target Time
   - Progress and best records are automatically saved in local storage.
5. **Multiplayer Party Race Mode**:
   - Click **PARTY**, generate a 4-letter Party Code, or share an invite link.
   - Race alongside your friends in real-time as ghost runners to see who reaches the Prism Gateway first!
