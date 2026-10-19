import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  GiftOpeningStage,
  createDoubleTapDetector,
  computeDragRotation,
  normalizeAngle360,
} from '../utils/gesture';
import { SoundEngine } from '../utils/sound';
import { Sparkles, Heart, RotateCcw, Play, Pause, Compass } from 'lucide-react';

interface GiftBox3DProps {
  stage: GiftOpeningStage;
  onOpen: () => void;
}

export const GiftBox3D: React.FC<GiftBox3DProps> = ({ stage, onOpen }) => {
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: -16, y: 32 });
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [singleTapHint, setSingleTapHint] = useState<boolean>(false);
  const [nudging, setNudging] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const isDraggingRef = useRef<boolean>(false);
  const hasCapturedRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; rotX: number; rotY: number; moved: boolean }>({
    x: 0,
    y: 0,
    rotX: -16,
    rotY: 32,
    moved: false,
  });

  const animFrameRef = useRef<number | null>(null);
  const detectorRef = useRef(createDoubleTapDetector(450, 50));
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-rotation loop (smooth ~0.35 deg per frame)
  useEffect(() => {
    if (stage !== 'idle' || !isAutoRotating || isDragging) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(32, now - lastTime);
      lastTime = now;

      setRotation((prev) => ({
        x: prev.x,
        y: normalizeAngle360(prev.y + (dt / 16) * 0.4),
      }));

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [stage, isAutoRotating, isDragging]);

  const triggerOpen = useCallback(() => {
    setSingleTapHint(false);
    setIsAutoRotating(false);
    onOpen();
  }, [onOpen]);

  // Pointer Drag Handlers (supports Mouse & Touch seamlessly)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (stage !== 'idle') return;

    isDraggingRef.current = true;
    hasCapturedRef.current = false;
    setIsDragging(true);

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotation.x,
      rotY: rotation.y,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || stage !== 'idle') return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 5) {
      dragStartRef.current.moved = true;
      if (!hasCapturedRef.current) {
        hasCapturedRef.current = true;
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
    }

    const next = computeDragRotation(
      { x: dragStartRef.current.rotX, y: dragStartRef.current.rotY },
      dx,
      dy,
      0.6
    );

    setRotation(next);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    if (hasCapturedRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      hasCapturedRef.current = false;
    }

    // If pointer barely moved, count as a tap!
    if (!dragStartRef.current.moved) {
      const isDouble = detectorRef.current.registerTap();
      if (isDouble) {
        triggerOpen();
      } else {
        setSingleTapHint(true);
        setNudging(true);
        SoundEngine.playHeartPop();
        setTimeout(() => setNudging(false), 380);

        if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = setTimeout(() => {
          setSingleTapHint(false);
        }, 2200);
      }
    }
  };

  const resetViewAngle = () => {
    setRotation({ x: -16, y: 32 });
    SoundEngine.playSparkle();
  };

  const toggleAutoRotate = () => {
    setIsAutoRotating((prev) => !prev);
  };

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, []);

  const isAside = stage === 'card_open';
  const isFocusing = stage === 'focusing_top';
  const isUntying = stage === 'untying_bow';
  const isLidOpening = stage === 'opening_lid' || stage === 'revealing_card' || stage === 'card_open';

  return (
    <div
      className={`w-full flex flex-col items-center justify-center transition-all duration-1000 ${
        isAside
          ? 'absolute -bottom-8 -left-8 md:bottom-4 md:left-4 scale-45 md:scale-55 opacity-25 md:opacity-45 pointer-events-none z-10'
          : 'relative scale-100 translate-x-0 translate-y-0 opacity-100 z-20'
      }`}
    >
      {/* 360° Drag Interactive Stage Wrapper */}
      <div
        className="perspective-container relative w-[340px] h-[370px] flex items-center justify-center select-none cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          isDraggingRef.current = false;
          setIsDragging(false);
        }}
        onDoubleClick={triggerOpen}
        role="region"
        aria-label="Khu vực xoay 360 độ hộp quà"
      >
        {/* Ground Soft Radial Shadow */}
        <div
          className="absolute w-60 h-32 rounded-full pointer-events-none transition-transform duration-700"
          style={{
            top: '74%',
            background: 'radial-gradient(ellipse at center, rgba(165, 40, 85, 0.25) 0%, rgba(200, 75, 120, 0.08) 55%, transparent 75%)',
            transform: isAside ? 'scale(0.5)' : 'scale(1)',
          }}
        />

        {/* 3D Box Entity with 360° Rotation */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Hộp quà 3D có thể xoay 360 độ. Nhấn 2 lần để mở."
          data-testid="gift-box-3d"
          onDoubleClick={triggerOpen}
          className={`preserve-3d relative w-[210px] h-[155px] transition-transform ${
            nudging ? 'box-nudge' : ''
          }`}
          style={{
            transform: isFocusing || isUntying
              ? 'scale(1.35) translateY(35px) translateZ(70px) rotateX(-22deg) rotateY(18deg)'
              : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isDragging
              ? 'none'
              : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {/* Animated Hand for Untying Bow */}
          {(isFocusing || isUntying) && (
            <div
              className="absolute z-50 pointer-events-none select-none hand-untying-anim"
              style={{
                top: '-70px',
                left: '70px',
                fontSize: '70px',
                filter: 'drop-shadow(0 10px 14px rgba(100, 30, 60, 0.3))',
              }}
            >
              🤏🏻
            </div>
          )}

          {/* Sparkles around knot during untying */}
          {isUntying && (
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-50 animate-ping">
              <span className="text-amber-400 text-4xl">✨</span>
            </div>
          )}

          {/* ================= LID (3D Top Component) ================= */}
          <div
            className={`preserve-3d absolute -top-[28px] -left-[10px] w-[230px] h-[40px] transition-all duration-700 ${
              isLidOpening ? 'lid-opening pointer-events-none' : ''
            }`}
          >
            {/* Lid Top Face (horizontal plane) */}
            <div
              className="preserve-3d absolute inset-0 w-[230px] h-[230px] bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 border border-rose-300/40"
              style={{
                transform: 'rotateX(90deg) translateZ(115px)',
              }}
            >
              {/* Golden cross ribbons on lid top */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-9 gold-shimmer shadow-xs border-x border-amber-600/30" />
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-9 gold-shimmer shadow-xs border-y border-amber-600/30" />

              {/* 3D Plush Bow mounted directly on the Lid Top Face (Visible from all 360° directions) */}
              <div
                className={`preserve-3d absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 pointer-events-none transition-all ${
                  isUntying || isLidOpening ? 'bow-untying' : ''
                }`}
                style={{
                  transform: 'translateZ(6px)',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Center 3D Golden Knot */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 via-amber-300 to-amber-600 shadow-xl border-2 border-amber-100 z-40"
                  style={{ transform: 'translateZ(26px)' }}
                >
                  <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-transparent via-white/80 to-transparent" />
                </div>

                {/* Symmetrical 3D Ribbon Loops facing 4 quadrants */}
                {/* 1. North-West Loop */}
                <div
                  className="preserve-3d absolute top-1/2 left-1/2 w-14 h-8 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 border-2 border-amber-200 shadow-xl origin-left"
                  style={{
                    transform: 'translateZ(18px) rotateZ(-45deg) rotateY(28deg)',
                  }}
                >
                  <div className="absolute inset-1 rounded-full bg-amber-600/20" />
                </div>

                {/* 2. North-East Loop */}
                <div
                  className="preserve-3d absolute top-1/2 right-1/2 w-14 h-8 rounded-full bg-gradient-to-l from-amber-300 via-amber-400 to-amber-500 border-2 border-amber-200 shadow-xl origin-right"
                  style={{
                    transform: 'translateZ(18px) rotateZ(45deg) rotateY(-28deg)',
                  }}
                >
                  <div className="absolute inset-1 rounded-full bg-amber-600/20" />
                </div>

                {/* 3. South-West Loop */}
                <div
                  className="preserve-3d absolute top-1/2 left-1/2 w-14 h-8 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 border-2 border-amber-200 shadow-xl origin-left"
                  style={{
                    transform: 'translateZ(18px) rotateZ(-135deg) rotateY(28deg)',
                  }}
                >
                  <div className="absolute inset-1 rounded-full bg-amber-600/20" />
                </div>

                {/* 4. South-East Loop */}
                <div
                  className="preserve-3d absolute top-1/2 right-1/2 w-14 h-8 rounded-full bg-gradient-to-l from-amber-300 via-amber-400 to-amber-500 border-2 border-amber-200 shadow-xl origin-right"
                  style={{
                    transform: 'translateZ(18px) rotateZ(135deg) rotateY(-28deg)',
                  }}
                >
                  <div className="absolute inset-1 rounded-full bg-amber-600/20" />
                </div>

                {/* 5. Horizontal Left Loop */}
                <div
                  className="preserve-3d absolute top-1/2 right-1/2 w-13 h-7 rounded-full bg-gradient-to-l from-amber-300 via-amber-400 to-amber-500 border border-amber-200 shadow-lg origin-right opacity-90"
                  style={{
                    transform: 'translateZ(14px) rotateZ(0deg) rotateY(-24deg)',
                  }}
                />

                {/* 6. Horizontal Right Loop */}
                <div
                  className="preserve-3d absolute top-1/2 left-1/2 w-13 h-7 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 border border-amber-200 shadow-lg origin-left opacity-90"
                  style={{
                    transform: 'translateZ(14px) rotateZ(0deg) rotateY(24deg)',
                  }}
                />

                {/* Cascading Ribbon Tails draping outward */}
                <div
                  className="absolute top-1/2 left-1/2 w-5 h-16 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 rounded-b shadow-md origin-top"
                  style={{
                    transform: 'translate(-50%, 0) translateZ(10px) rotate(35deg)',
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%)',
                  }}
                />
                <div
                  className="absolute top-1/2 left-1/2 w-5 h-16 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 rounded-b shadow-md origin-top"
                  style={{
                    transform: 'translate(-50%, 0) translateZ(10px) rotate(-35deg)',
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 86%, 0 100%)',
                  }}
                />
              </div>
            </div>

            {/* Lid Front Rim (0°) */}
            <div
              className="absolute inset-0 w-[230px] h-[40px] bg-gradient-to-b from-rose-500 to-rose-600 border border-rose-400/30 flex items-center justify-center shadow-xs"
              style={{ transform: 'translateZ(115px)' }}
            >
              <div className="w-9 h-full gold-shimmer border-x border-amber-600/30" />
            </div>

            {/* Lid Back Rim (180°) */}
            <div
              className="absolute inset-0 w-[230px] h-[40px] bg-gradient-to-b from-rose-600 to-rose-700 border border-rose-500/30 flex items-center justify-center"
              style={{ transform: 'rotateY(180deg) translateZ(115px)' }}
            >
              <div className="w-9 h-full gold-shimmer border-x border-amber-600/30" />
            </div>

            {/* Lid Left Rim (270°) */}
            <div
              className="absolute inset-0 w-[230px] h-[40px] bg-gradient-to-b from-rose-500 to-rose-600 border border-rose-400/30 flex items-center justify-center"
              style={{ transform: 'rotateY(-90deg) translateZ(115px)' }}
            >
              <div className="w-9 h-full gold-shimmer border-x border-amber-600/30" />
            </div>

            {/* Lid Right Rim (90°) */}
            <div
              className="absolute inset-0 w-[230px] h-[40px] bg-gradient-to-b from-rose-600 to-pink-600 border border-rose-400/30 flex items-center justify-center"
              style={{ transform: 'rotateY(90deg) translateZ(115px)' }}
            >
              <div className="w-9 h-full gold-shimmer border-x border-amber-600/30" />
            </div>
          </div>

          {/* ================= BOX BODY (Base 3D Component) ================= */}
          {/* Front Face (0°) */}
          <div
            className="absolute inset-0 w-[210px] h-[155px] bg-gradient-to-b from-rose-400 via-pink-500 to-rose-600 rounded-b-md shadow-md border border-rose-300/30 flex items-center justify-center"
            style={{ transform: 'translateZ(105px)' }}
          >
            <div className="w-8 h-full gold-shimmer border-x border-amber-600/30" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
          </div>

          {/* Back Face (180°) */}
          <div
            className="absolute inset-0 w-[210px] h-[155px] bg-gradient-to-b from-rose-500 via-pink-600 to-rose-700 border border-rose-500/30 flex items-center justify-center"
            style={{ transform: 'rotateY(180deg) translateZ(105px)' }}
          >
            <div className="w-8 h-full gold-shimmer border-x border-amber-600/30" />
          </div>

          {/* Left Face (270°) */}
          <div
            className="absolute inset-0 w-[210px] h-[155px] bg-gradient-to-b from-rose-600 via-pink-700 to-rose-800 border border-rose-500/30 flex items-center justify-center"
            style={{ transform: 'rotateY(-90deg) translateZ(105px)' }}
          >
            <div className="w-8 h-full gold-shimmer border-x border-amber-600/30 opacity-90" />
          </div>

          {/* Right Face (90°) */}
          <div
            className="absolute inset-0 w-[210px] h-[155px] bg-gradient-to-b from-rose-400 via-pink-400 to-rose-500 border border-pink-300/30 flex items-center justify-center"
            style={{ transform: 'rotateY(90deg) translateZ(105px)' }}
          >
            <div className="w-8 h-full gold-shimmer border-x border-amber-600/30" />
          </div>

          {/* Bottom Face */}
          <div
            className="absolute inset-0 w-[210px] h-[210px] bg-rose-950 flex items-center justify-center"
            style={{ transform: 'rotateX(-90deg) translateZ(52px)' }}
          >
            <div className="w-8 h-full gold-shimmer border-x border-amber-600/30 opacity-50" />
            <div className="absolute left-0 right-0 h-8 gold-shimmer border-y border-amber-600/30 opacity-50" />
          </div>

          {/* Inner Velvet & Golden Radiance (visible when lid is opened) */}
          {isLidOpening && (
            <div
              className="absolute inset-0 w-[210px] h-[210px] bg-gradient-to-br from-amber-200 via-rose-300 to-rose-950 shadow-[0_0_80px_rgba(251,191,36,0.9)] flex items-center justify-center"
              style={{
                transform: 'rotateX(90deg) translateZ(75px)',
              }}
            >
              <span className="text-4xl animate-ping">✨</span>
            </div>
          )}
        </div>
      </div>

      {/* 360 Rotation Controls & Hint Badge */}
      {stage === 'idle' && (
        <div className="mt-2 flex flex-col items-center gap-2.5 z-10 transition-all">
          {/* Main Action Pill */}
          <button
            type="button"
            onClick={triggerOpen}
            data-testid="open-gift-btn"
            className="group px-6 py-2.5 rounded-full bg-white/95 hover:bg-white text-rose-800 text-sm md:text-base font-semibold shadow-md shadow-pink-200/50 backdrop-blur-md border border-pink-200 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Nhấn 2 lần vào hộp quà để mở</span>
            <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">2x Click</span>
          </button>

          {/* Secondary 360° Controls Bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 border border-rose-200/70 shadow-xs backdrop-blur-md text-xs font-semibold text-rose-700">
            <span className="flex items-center gap-1 text-rose-500 pr-1 border-r border-rose-200">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
              <span>Kéo xoay 360°</span>
            </span>

            <button
              type="button"
              onClick={toggleAutoRotate}
              data-testid="toggle-autorotate-btn"
              title="Bật/Tắt tự động xoay 360 độ"
              className="flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-rose-100 transition-colors cursor-pointer"
            >
              {isAutoRotating ? (
                <>
                  <Pause className="w-3 h-3 text-rose-600" />
                  <span>Dừng xoay</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-600" />
                  <span>Tự xoay 360°</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetViewAngle}
              data-testid="reset-view-btn"
              title="Đặt lại góc nhìn chính diện"
              className="flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-rose-500" />
              <span>Góc chuẩn</span>
            </button>
          </div>

          {/* Single Tap Nudge Message */}
          {singleTapHint && (
            <div className="animate-bounce text-xs font-bold text-rose-600 bg-rose-50 px-3.5 py-1 rounded-full border border-rose-200 shadow-sm flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-ping" />
              <span>Chạm thêm 1 lần nữa để mở nhé! 💕</span>
            </div>
          )}
        </div>
      )}

      {/* Opening progress hint */}
      {stage !== 'idle' && !isAside && (
        <div className="mt-3 px-4 py-1.5 rounded-full bg-white/80 text-rose-700 text-xs md:text-sm font-semibold backdrop-blur-sm shadow-sm flex items-center gap-2 animate-pulse">
          <span>✨</span>
          <span>
            {stage === 'focusing_top' && 'Đang tiến đến tháo nơ...'}
            {stage === 'untying_bow' && 'Đang tháo nơ xinh xắn... 🎀'}
            {stage === 'opening_lid' && 'Mở nắp hộp quà... 🎁'}
            {stage === 'revealing_card' && 'Bức thư đang bay lên... 💌'}
          </span>
        </div>
      )}
    </div>
  );
};
