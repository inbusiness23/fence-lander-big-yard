import { useState, useRef, useCallback } from "react";
import { BEFORE_AFTER } from "../data/mock";

export const BeforeAfterSection = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    handleMove(e.clientX);

    const onMouseMove = (e) => {
      if (isDragging.current) handleMove(e.clientX);
    };
    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [handleMove]);

  const handleTouchStart = useCallback((e) => {
    isDragging.current = true;
    handleMove(e.touches[0].clientX);

    const onTouchMove = (e) => {
      if (isDragging.current) handleMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => {
      isDragging.current = false;
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);
  }, [handleMove]);

  return (
    <section className="py-24 bg-white" id="transformations">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-amber-700 text-sm font-semibold uppercase tracking-[0.15em] mb-4">
            Real Transformations
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold text-stone-900 mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            See the Difference a Premium Fence Makes
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            Drag the slider to reveal the transformation. Same beautiful yard —
            the only difference is the fence.
          </p>
        </div>

        {/* Slider Container */}
        <div className="max-w-4xl mx-auto">
          <div
            ref={containerRef}
            className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden cursor-col-resize select-none shadow-2xl shadow-stone-300/40 border border-stone-200/60"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* After Image (full background) */}
            <img
              src={BEFORE_AFTER.after.image}
              alt={BEFORE_AFTER.after.caption}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />

            {/* Before Image (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={BEFORE_AFTER.before.image}
                alt={BEFORE_AFTER.before.caption}
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  width: containerRef.current
                    ? `${containerRef.current.offsetWidth}px`
                    : "100vw",
                  maxWidth: "none",
                }}
                draggable={false}
              />
            </div>

            {/* Slider Line */}
            <div
              className="absolute top-0 bottom-0 z-20"
              style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
            >
              <div className="w-[3px] h-full bg-white shadow-lg" />

              {/* Slider Handle */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-stone-200 hover:scale-110 transition-transform"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 4L3 10L7 16" stroke="#78716c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 4L17 10L13 16" stroke="#78716c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-5 left-5 z-10">
              <span className="bg-red-500/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-sm shadow-lg">
                Before
              </span>
            </div>
            <div className="absolute top-5 right-5 z-10">
              <span className="bg-emerald-500/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-sm shadow-lg">
                After
              </span>
            </div>

            {/* Bottom captions */}
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent p-6">
              <div className="flex justify-between items-end">
                <p className="text-white/90 text-sm font-medium max-w-[45%]">
                  {BEFORE_AFTER.before.caption}
                </p>
                <p className="text-white/90 text-sm font-medium text-right max-w-[45%]">
                  {BEFORE_AFTER.after.caption}
                </p>
              </div>
            </div>
          </div>

          {/* Instruction */}
          <p className="text-center text-stone-400 text-sm mt-4">
            Drag the slider left and right to compare
          </p>
        </div>
      </div>
    </section>
  );
};
