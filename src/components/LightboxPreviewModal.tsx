import React, { useEffect } from 'react';
import { Download, QrCode, X } from 'lucide-react';
import { PostcardConfig } from '../types/postcard';
import { POSTCARD_HEIGHT, POSTCARD_WIDTH } from '../utils/pillowEngine';

interface LightboxPreviewModalProps {
  isOpen: boolean;
  postcardDataUrl: string | null;
  config: PostcardConfig;
  onClose: () => void;
  onDownloadPostcard: () => void;
  onDownloadQr: () => void;
}

export const LightboxPreviewModal: React.FC<LightboxPreviewModalProps> = ({
  isOpen,
  postcardDataUrl,
  config,
  onClose,
  onDownloadPostcard,
  onDownloadQr,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 p-4 backdrop-blur-xs sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen postcard preview"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-full w-full max-w-4xl flex-col gap-4 rounded-xl bg-white p-4 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Metadata + Close */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 tabular-nums">
            <span className="font-semibold text-zinc-900">postcard.jpg</span>
            <span aria-hidden="true">·</span>
            <span>
              {POSTCARD_WIDTH} × {POSTCARD_HEIGHT} px
            </span>
            <span aria-hidden="true">·</span>
            <span>JPEG quality {config.jpegQuality}%</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Rendered Postcard Image */}
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#EFEFED] p-4 sm:p-6">
          {postcardDataUrl ? (
            <img
              src={postcardDataUrl}
              alt={`Export preview of ${config.text}`}
              referrerPolicy="no-referrer"
              className="max-h-[68vh] w-auto bg-white shadow-lg ring-1 ring-zinc-900/10"
            />
          ) : (
            <div className="flex h-64 w-full items-center justify-center text-sm text-zinc-500">
              Generating preview…
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-3">
          <span className="font-mono text-xs text-zinc-500 truncate max-w-md">
            QR → {config.qrUrl}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onDownloadQr}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-300 hover:bg-zinc-50 whitespace-nowrap shrink-0"
            >
              <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Save myqrcode.jpg</span>
            </button>
            <button
              type="button"
              onClick={onDownloadPostcard}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#005096] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#004078] whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Save postcard.jpg</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
