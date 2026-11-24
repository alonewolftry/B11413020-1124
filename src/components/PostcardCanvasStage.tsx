import React, { useEffect, useRef, useState } from 'react';
import { Columns2, Eye, Grid, Maximize2, RotateCcw } from 'lucide-react';
import { ImageMeta, PostcardConfig } from '../types/postcard';
import {
  PHOTO_HEIGHT,
  PHOTO_WIDTH,
  POSTCARD_HEIGHT,
  POSTCARD_WIDTH,
  hexToRgbTuple,
} from '../utils/pillowEngine';

interface PostcardCanvasStageProps {
  config: PostcardConfig;
  imageMeta: ImageMeta;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  rawPhotoDataUrl: string | null;
  isRendering: boolean;
  renderError: string | null;
  onOpenLightbox: () => void;
  onResetDefaults: () => void;
}

export const PostcardCanvasStage: React.FC<PostcardCanvasStageProps> = ({
  config,
  imageMeta,
  canvasRef,
  rawPhotoDataUrl,
  isRendering,
  renderError,
  onOpenLightbox,
  onResetDefaults,
}) => {
  const [showGuides, setShowGuides] = useState(false);
  const [splitCompare, setSplitCompare] = useState(false);
  const [splitPos, setSplitPos] = useState(50);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  const [r, g, b] = hexToRgbTuple(config.textColor);

  useEffect(() => {
    if (!isDraggingSplit) return;

    const handleMove = (clientX: number) => {
      const el = stageContainerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setSplitPos(Math.min(96, Math.max(4, pct)));
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const stop = () => setIsDraggingSplit(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
    };
  }, [isDraggingSplit]);

  const filterSummary = (() => {
    const steps: string[] = [];
    if (config.applyBlur) steps.push(`Blur ${config.blurPasses}×`);
    if (config.applySharpen) steps.push(`Sharpen ${config.sharpenPasses}×`);
    return steps.length > 0 ? steps.join(' → ') : 'Unfiltered';
  })();

  return (
    <section aria-label="Postcard Canvas Preview" className="flex flex-col gap-4">
      {/* Stage Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-600 tabular-nums">
          <span className="font-medium text-zinc-900">{config.imageName}</span>
          <span aria-hidden="true">·</span>
          <span>{imageMeta.format}</span>
          <span aria-hidden="true">·</span>
          <span>
            {imageMeta.width} × {imageMeta.height} → {PHOTO_WIDTH} × {PHOTO_HEIGHT}
          </span>
          <span aria-hidden="true">·</span>
          <span>{imageMeta.mode}</span>
          <span aria-hidden="true">·</span>
          <span>{filterSummary}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
            <button
              type="button"
              onClick={() => setSplitCompare(false)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096] ${
                !splitCompare
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Composite</span>
            </button>
            <button
              type="button"
              onClick={() => setSplitCompare(true)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096] ${
                splitCompare
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Columns2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Before / After</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowGuides((prev) => !prev)}
            aria-pressed={showGuides}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096] ${
              showGuides
                ? 'border-[#005096] bg-[#005096]/8 text-[#005096]'
                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-900'
            }`}
          >
            <Grid className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Guides</span>
          </button>

          <button
            type="button"
            onClick={onOpenLightbox}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096]"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Show</span>
          </button>
        </div>
      </div>

      {/* Archival Matboard Canvas Frame */}
      <div className="relative flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-[#EFEFED] p-5 sm:p-8 lg:p-10">
        {renderError ? (
          <div className="flex aspect-[800/720] w-full max-w-[720px] flex-col items-center justify-center gap-3 rounded-sm border border-zinc-300 bg-white p-8 text-center">
            <p className="text-sm font-medium text-zinc-900">Unable to render source image</p>
            <p className="max-w-sm text-xs text-zinc-600">{renderError}</p>
            <button
              type="button"
              onClick={onResetDefaults}
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-[#005096] px-4 py-2 text-xs font-medium text-white hover:bg-[#004078]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Restore Default Photo</span>
            </button>
          </div>
        ) : (
          <div
            ref={stageContainerRef}
            className="relative w-full max-w-[720px] overflow-hidden bg-white shadow-[0_18px_45px_-18px_rgba(24,24,27,0.28)] ring-1 ring-zinc-900/10"
            style={{ aspectRatio: `${POSTCARD_WIDTH} / ${POSTCARD_HEIGHT}` }}
          >
            <canvas
              ref={canvasRef}
              width={POSTCARD_WIDTH}
              height={POSTCARD_HEIGHT}
              className="block h-full w-full"
              aria-label={`Live postcard preview: ${config.text}`}
            />

            {/* Before / After Comparison Layer over the 800x600 top photo region */}
            {splitCompare && rawPhotoDataUrl && (
              <div
                className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
                style={{
                  height: `${(PHOTO_HEIGHT / POSTCARD_HEIGHT) * 100}%`,
                }}
              >
                <div
                  className="h-full overflow-hidden border-r-2 border-white shadow-[2px_0_10px_rgba(0,0,0,0.3)]"
                  style={{ width: `${splitPos}%` }}
                >
                  <img
                    src={rawPhotoDataUrl}
                    alt="Original resized photo before Pillow filters"
                    referrerPolicy="no-referrer"
                    className="h-full max-w-none object-fill"
                    style={{
                      width: stageContainerRef.current
                        ? `${stageContainerRef.current.clientWidth}px`
                        : '100%',
                    }}
                  />
                </div>

                {/* Comparison Labels */}
                <span className="absolute top-3 left-3 rounded bg-zinc-900/80 px-2 py-1 text-[11px] font-medium text-white">
                  Original Resize
                </span>
                <span className="absolute top-3 right-3 rounded bg-[#005096]/90 px-2 py-1 text-[11px] font-medium text-white">
                  {filterSummary}
                </span>

                {/* Interactive Draggable Split Handle */}
                <div
                  className="pointer-events-auto absolute inset-y-0 z-10 flex -translate-x-1/2 cursor-ew-resize items-center"
                  style={{ left: `${splitPos}%` }}
                  onMouseDown={() => setIsDraggingSplit(true)}
                  onTouchStart={() => setIsDraggingSplit(true)}
                  role="slider"
                  aria-label="Before and after filter comparison slider"
                  aria-valuemin={4}
                  aria-valuemax={96}
                  aria-valuenow={Math.round(splitPos)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') setSplitPos((p) => Math.max(4, p - 4));
                    if (e.key === 'ArrowRight') setSplitPos((p) => Math.min(96, p + 4));
                  }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-md">
                    <Columns2 className="h-4 w-4" aria-hidden="true" />
                  </div>
                </div>
              </div>
            )}

            {/* Pillow Coordinate Guides Overlay */}
            {showGuides && (
              <div className="pointer-events-none absolute inset-0">
                {/* 800x600 Image Paste Boundary */}
                <div
                  className="absolute inset-x-0 top-0 border-b border-dashed border-[#005096]/70"
                  style={{ height: `${(PHOTO_HEIGHT / POSTCARD_HEIGHT) * 100}%` }}
                >
                  <span className="absolute bottom-1.5 left-2 bg-white/90 px-1.5 py-0.5 font-mono text-[10px] text-[#005096] tabular-nums">
                    paste(im, (0, 0)) · 800 × 600
                  </span>
                </div>

                {/* Text Anchor Crosshair */}
                <div
                  className="absolute border border-dashed border-amber-600/80 bg-amber-500/10"
                  style={{
                    left: `${(config.textX / POSTCARD_WIDTH) * 100}%`,
                    top: `${(config.textY / POSTCARD_HEIGHT) * 100}%`,
                    padding: '2px 6px',
                  }}
                >
                  <span className="font-mono text-[10px] font-medium text-amber-800 whitespace-nowrap tabular-nums">
                    text ({config.textX}, {config.textY})
                  </span>
                </div>

                {/* QR Bounding Box */}
                <div
                  className="absolute border border-dashed border-emerald-700/80 bg-emerald-500/10"
                  style={{
                    left: `${(config.qrX / POSTCARD_WIDTH) * 100}%`,
                    top: `${(config.qrY / POSTCARD_HEIGHT) * 100}%`,
                    width: `${(config.qrSize / POSTCARD_WIDTH) * 100}%`,
                    height: `${(config.qrSize / POSTCARD_HEIGHT) * 100}%`,
                  }}
                >
                  <span className="absolute -top-4 left-0 bg-white/95 px-1 font-mono text-[10px] font-medium text-emerald-800 whitespace-nowrap tabular-nums">
                    qr ({config.qrX}, {config.qrY}) · {config.qrSize}px
                  </span>
                </div>
              </div>
            )}

            {isRendering && (
              <div className="pointer-events-none absolute right-3 bottom-3 rounded bg-zinc-900/75 px-2.5 py-1 text-[11px] font-medium text-white">
                Rendering canvas…
              </div>
            )}
          </div>
        )}

        {/* Bottom Precision Readout Strip */}
        <div className="mt-4 flex w-full max-w-[720px] flex-wrap items-center justify-between gap-2 text-xs text-zinc-600 tabular-nums">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
            <span>
              Canvas {POSTCARD_WIDTH}×{POSTCARD_HEIGHT}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              RGB ({r}, {g}, {b})
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Text ({config.textX}, {config.textY})
            </span>
            <span aria-hidden="true">·</span>
            <span>
              QR ({config.qrX}, {config.qrY})
            </span>
          </div>
          <button
            type="button"
            onClick={onResetDefaults}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 underline-offset-4 hover:text-[#005096] hover:underline whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096]"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>Reset Script Defaults</span>
          </button>
        </div>
      </div>
    </section>
  );
};
