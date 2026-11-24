import React from 'react';
import { TAIWAN_PRESET_PHOTOS } from '../types/postcard';

interface PresetGallerySectionProps {
  activeImageSrc: string;
  onApplyPreset: (presetId: string) => void;
}

export const PresetGallerySection: React.FC<PresetGallerySectionProps> = ({
  activeImageSrc,
  onApplyPreset,
}) => {
  return (
    <section id="presets" className="border-t border-zinc-200 pt-12">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-[var(--font-display)] text-2xl font-semibold tracking-tight text-zinc-900 text-balance">
            Taiwan Landscape Recipes
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Load a curated 4:3 photograph with paired calligraphy ink and QR destination.
          </p>
        </div>
        <span className="text-xs text-zinc-500 tabular-nums">
          3 compositions · 800 × 600 target frame
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {TAIWAN_PRESET_PHOTOS.map((preset) => {
          const isCurrent = activeImageSrc === preset.src;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset.id)}
              className={`group flex flex-col overflow-hidden rounded-xl border bg-white text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096] ${
                isCurrent
                  ? 'border-[#005096] ring-1 ring-[#005096]'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                <img
                  src={preset.src}
                  alt={preset.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between gap-3 p-5">
                <div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{preset.filename}</span>
                    <span aria-hidden="true">·</span>
                    <span>{preset.subtitle}</span>
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold text-zinc-900">
                    {preset.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 line-clamp-1">
                    “{preset.defaultGreeting}”
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-xs">
                  <span className="font-mono text-zinc-500 truncate max-w-[180px]">
                    {preset.defaultUrl.replace('https://', '')}
                  </span>
                  <span
                    className={`font-medium whitespace-nowrap shrink-0 ${
                      isCurrent ? 'text-[#005096]' : 'text-zinc-800 group-hover:text-[#005096]'
                    }`}
                  >
                    {isCurrent ? 'Active in Studio' : 'Load Recipe'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
