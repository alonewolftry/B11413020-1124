import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { InspectorPanel } from './components/InspectorPanel';
import { LightboxPreviewModal } from './components/LightboxPreviewModal';
import { PostcardCanvasStage } from './components/PostcardCanvasStage';
import { PresetGallerySection } from './components/PresetGallerySection';
import { PythonScriptSection } from './components/PythonScriptSection';
import {
  DEFAULT_POSTCARD_CONFIG,
  ImageMeta,
  PostcardConfig,
  TAIWAN_PRESET_PHOTOS,
} from './types/postcard';
import { renderPostcardToCanvas } from './utils/pillowEngine';

export default function App() {
  const [config, setConfig] = useState<PostcardConfig>(DEFAULT_POSTCARD_CONFIG);
  const [imageMeta, setImageMeta] = useState<ImageMeta>({
    format: 'JPEG',
    width: 1200,
    height: 900,
    mode: 'RGB',
    fileSizeLabel: 'Sample preset',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  const [rawPhotoDataUrl, setRawPhotoDataUrl] = useState<string | null>(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);
  const [lightboxDataUrl, setLightboxDataUrl] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  }, []);

  // Ensure web fonts (Kai / Serif / Sans) are ready before final canvas text draw
  useEffect(() => {
    let mounted = true;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (mounted) setFontsLoaded(true);
      });
    } else {
      setFontsLoaded(true);
    }
    return () => {
      mounted = false;
    };
  }, []);

  // Load image whenever imageSrc changes
  useEffect(() => {
    let cancelled = false;
    setRenderError(null);
    setIsRendering(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      loadedImageRef.current = img;

      const ext = config.imageName.split('.').pop()?.toUpperCase();
      const format =
        ext === 'PNG' ? 'PNG' : ext === 'WEBP' ? 'WEBP' : 'JPEG';

      setImageMeta((prev) => ({
        ...prev,
        format,
        width: img.naturalWidth,
        height: img.naturalHeight,
        mode: 'RGB',
      }));

      if (canvasRef.current) {
        renderPostcardToCanvas(canvasRef.current, img, config)
          .then((res) => {
            if (cancelled) return;
            setRawPhotoDataUrl(res.rawPhotoCanvas.toDataURL('image/jpeg', 0.92));
            setQrPreviewUrl(res.qrDataUrl);
            setIsRendering(false);
          })
          .catch((err) => {
            if (cancelled) return;
            setRenderError(err instanceof Error ? err.message : 'Failed to composite postcard.');
            setIsRendering(false);
          });
      }
    };
    img.onerror = () => {
      if (cancelled) return;
      setRenderError(`Could not load "${config.imageName}". Please choose a preset or upload another image.`);
      setIsRendering(false);
    };
    img.src = config.imageSrc;

    return () => {
      cancelled = true;
    };
    // Intentionally only reload HTMLImageElement when imageSrc changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.imageSrc]);

  // Re-render canvas when any studio parameter or font state changes
  useEffect(() => {
    const img = loadedImageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !img.complete || img.naturalWidth === 0) return;

    let cancelled = false;
    setIsRendering(true);

    renderPostcardToCanvas(canvas, img, config)
      .then((res) => {
        if (cancelled) return;
        setRawPhotoDataUrl(res.rawPhotoCanvas.toDataURL('image/jpeg', 0.92));
        setQrPreviewUrl(res.qrDataUrl);
        setIsRendering(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setRenderError(err instanceof Error ? err.message : 'Render error');
        setIsRendering(false);
      });

    return () => {
      cancelled = true;
    };
  }, [config, fontsLoaded]);

  const handleUpdateConfig = useCallback((patch: Partial<PostcardConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleUploadFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const sizeKb = Math.round(file.size / 1024);
        setImageMeta((prev) => ({
          ...prev,
          fileSizeLabel: `${sizeKb} KB`,
        }));
        setConfig((prev) => ({
          ...prev,
          imageSrc: reader.result as string,
          imageName: file.name || 'uploaded_photo.jpg',
        }));
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSelectPreset = useCallback(
    (presetId: string) => {
      const preset = TAIWAN_PRESET_PHOTOS.find((p) => p.id === presetId);
      if (!preset) return;
      setImageMeta((prev) => ({ ...prev, fileSizeLabel: 'Sample preset' }));
      setConfig((prev) => ({
        ...prev,
        imageSrc: preset.src,
        imageName: preset.filename,
        text: preset.defaultGreeting,
        textColor: preset.defaultColor,
        qrUrl: preset.defaultUrl,
      }));
      showToast(`Loaded ${preset.title} recipe`);
    },
    [showToast]
  );

  const handleDownloadPostcard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', config.jpegQuality / 100);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'postcard.jpg';
    link.click();
    showToast(`Saved postcard.jpg (quality ${config.jpegQuality}%)`);
  }, [config.jpegQuality, showToast]);

  const handleDownloadQr = useCallback(() => {
    if (!qrPreviewUrl) return;
    const link = document.createElement('a');
    link.href = qrPreviewUrl;
    link.download = 'myqrcode.jpg';
    link.click();
    showToast('Saved myqrcode.jpg');
  }, [qrPreviewUrl, showToast]);

  const handleOpenLightbox = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setLightboxDataUrl(canvas.toDataURL('image/jpeg', config.jpegQuality / 100));
    setIsLightboxOpen(true);
  }, [config.jpegQuality]);

  const handleResetDefaults = useCallback(() => {
    setConfig(DEFAULT_POSTCARD_CONFIG);
    showToast('Restored script defaults');
  }, [showToast]);

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-zinc-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-[#F7F7F5]/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#studio"
            className="font-[var(--font-display)] text-lg font-semibold tracking-tight text-zinc-900 whitespace-nowrap shrink-0"
          >
            Formosa Postcard Studio
          </a>

          {/* Zone 2: Clean single-line text nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600">
            <a
              href="#studio"
              className="underline-offset-4 transition-colors hover:text-zinc-900 hover:underline whitespace-nowrap shrink-0"
            >
              Studio
            </a>
            <a
              href="#presets"
              className="underline-offset-4 transition-colors hover:text-zinc-900 hover:underline whitespace-nowrap shrink-0"
            >
              Recipes
            </a>
            <a
              href="#script"
              className="underline-offset-4 transition-colors hover:text-zinc-900 hover:underline whitespace-nowrap shrink-0"
            >
              Python Script
            </a>
            <button
              type="button"
              onClick={handleOpenLightbox}
              className="underline-offset-4 transition-colors hover:text-zinc-900 hover:underline whitespace-nowrap shrink-0"
            >
              Preview
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleDownloadPostcard}
              className="inline-flex items-center gap-2 rounded-lg bg-[#005096] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#004078] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096]"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Export postcard.jpg</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="studio" className="mx-auto flex max-w-[1400px] flex-col gap-14 px-6 py-8 lg:py-10">
        {/* Editorial Intro */}
        <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h1 className="font-[var(--font-display)] text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl text-balance">
              Digital Postcard & QR Darkroom
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 sm:text-base">
              Resize photography to 800 × 600, run Pillow blur and sharpen convolution kernels, typeset bilingual calligraphy greetings, and embed a scannable QR code in one live canvas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 tabular-nums">
            <span>Output 800 × 720 px</span>
            <span aria-hidden="true">·</span>
            <span>Pillow Blur + Sharpen</span>
            <span aria-hidden="true">·</span>
            <span>JPEG Quality {config.jpegQuality}%</span>
          </div>
        </div>

        {/* Primary Two-Column Studio Workspace */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7 xl:col-span-8">
            <PostcardCanvasStage
              config={config}
              imageMeta={imageMeta}
              canvasRef={canvasRef}
              rawPhotoDataUrl={rawPhotoDataUrl}
              isRendering={isRendering}
              renderError={renderError}
              onOpenLightbox={handleOpenLightbox}
              onResetDefaults={handleResetDefaults}
            />
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <InspectorPanel
              config={config}
              qrPreviewUrl={qrPreviewUrl}
              onChange={handleUpdateConfig}
              onUploadFile={handleUploadFile}
              onSelectPreset={handleSelectPreset}
              onDownloadPostcard={handleDownloadPostcard}
              onDownloadQr={handleDownloadQr}
              onOpenLightbox={handleOpenLightbox}
            />
          </div>
        </div>

        {/* Curated Taiwan Landscape Recipes */}
        <PresetGallerySection
          activeImageSrc={config.imageSrc}
          onApplyPreset={handleSelectPreset}
        />

        {/* Synchronized Python Script Section */}
        <PythonScriptSection config={config} />
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="mt-16 border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-zinc-500">
          <span>Formosa Postcard Studio · 800 × 720 Composite Canvas</span>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={handleDownloadQr}
              className="hover:text-zinc-900 hover:underline underline-offset-4"
            >
              Download myqrcode.jpg
            </button>
            <button
              type="button"
              onClick={handleDownloadPostcard}
              className="hover:text-zinc-900 hover:underline underline-offset-4"
            >
              Download postcard.jpg
            </button>
          </div>
        </div>
      </footer>

      {/* Fullscreen Lightbox (postcard.show) */}
      <LightboxPreviewModal
        isOpen={isLightboxOpen}
        postcardDataUrl={lightboxDataUrl}
        config={config}
        onClose={() => setIsLightboxOpen(false)}
        onDownloadPostcard={handleDownloadPostcard}
        onDownloadQr={handleDownloadQr}
      />

      {/* Subtle Toast Confirmation */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-6 bottom-6 z-40 rounded-lg border border-zinc-200 bg-zinc-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
