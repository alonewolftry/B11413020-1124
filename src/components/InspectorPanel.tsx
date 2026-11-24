import React, { useRef, useState } from 'react';
import { Download, ImagePlus, Maximize2, QrCode, Sliders, Type } from 'lucide-react';
import {
  PostcardConfig,
  PostcardFontFamily,
  QrErrorLevel,
  ResizeFitMode,
  TAIWAN_PRESET_PHOTOS,
} from '../types/postcard';
import { hexToRgbTuple } from '../utils/pillowEngine';

interface InspectorPanelProps {
  config: PostcardConfig;
  qrPreviewUrl: string | null;
  onChange: (patch: Partial<PostcardConfig>) => void;
  onUploadFile: (file: File) => void;
  onSelectPreset: (presetId: string) => void;
  onDownloadPostcard: () => void;
  onDownloadQr: () => void;
  onOpenLightbox: () => void;
}

type InspectorTab = 'photo' | 'typography' | 'qr' | 'export';

const COLOR_SWATCHES = [
  { label: 'Formosa Blue', hex: '#005096' },
  { label: 'Ink Charcoal', hex: '#18181B' },
  { label: 'Lantern Red', hex: '#991B1B' },
  { label: 'Taroko Jade', hex: '#0F5E4E' },
  { label: 'Slate Dusk', hex: '#334155' },
];

const GREETING_SAMPLES = [
  'Greetings from Taiwan!',
  '來自台灣的問候！',
  'Taipei · Taroko · Alishan',
  'Hello from Formosa 2026',
];

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  config,
  qrPreviewUrl,
  onChange,
  onUploadFile,
  onSelectPreset,
  onDownloadPostcard,
  onDownloadQr,
  onOpenLightbox,
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('photo');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [r, g, b] = hexToRgbTuple(config.textColor);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUploadFile(file);
    }
  };

  return (
    <aside
      aria-label="Postcard Studio Controls"
      className="flex flex-col rounded-xl border border-zinc-200 bg-white"
    >
      {/* Segmented Inspector Navigation */}
      <div className="border-b border-zinc-200 p-3">
        <div className="grid grid-cols-4 gap-1 rounded-lg bg-zinc-100 p-1" role="tablist">
          {(
            [
              { id: 'photo', label: 'Photo', icon: Sliders },
              { id: 'typography', label: 'Text', icon: Type },
              { id: 'qr', label: 'QR Code', icon: QrCode },
              { id: 'export', label: 'Export', icon: Download },
            ] as const
          ).map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(id)}
                className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096] ${
                  active
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Body */}
      <div className="flex flex-col gap-6 p-5">
        {activeTab === 'photo' && (
          <>
            {/* Upload Dropzone */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-semibold text-zinc-900">Source Photograph</label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-5 text-center transition-colors ${
                  isDragOver
                    ? 'border-[#005096] bg-[#005096]/5'
                    : 'border-zinc-300 bg-zinc-50/70 hover:border-zinc-400'
                }`}
              >
                <ImagePlus className="h-5 w-5 text-zinc-500" aria-hidden="true" />
                <div className="text-xs text-zinc-600">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-semibold text-[#005096] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096]"
                  >
                    Upload image
                  </button>{' '}
                  or drop JPG / PNG / WebP
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                  aria-label="Upload source photograph"
                />
              </div>

              {/* Sample Preset Switcher */}
              <div className="mt-1 grid grid-cols-3 gap-2">
                {TAIWAN_PRESET_PHOTOS.map((preset) => {
                  const selected = config.imageSrc === preset.src;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onSelectPreset(preset.id)}
                      className={`group flex flex-col overflow-hidden rounded-lg border text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096] ${
                        selected
                          ? 'border-[#005096] ring-1 ring-[#005096]'
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                        <img
                          src={preset.src}
                          alt={preset.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                      <span className="truncate px-2 py-1.5 text-[11px] font-medium text-zinc-800">
                        {preset.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-zinc-100" />

            {/* Resize Mode */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900">Resize to 800 × 600</span>
                <span className="font-mono text-[11px] text-zinc-500">im.resize</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-zinc-100 p-1">
                {(
                  [
                    { value: 'stretch', label: 'Stretch' },
                    { value: 'cover', label: 'Cover Crop' },
                    { value: 'contain', label: 'Contain' },
                  ] as { value: ResizeFitMode; label: string }[]
                ).map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onChange({ fitMode: item.value })}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096] ${
                      config.fitMode === item.value
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-zinc-100" />

            {/* Pillow Convolution Filters */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900">Pillow Filter Pipeline</span>
                <span className="font-mono text-[11px] text-zinc-500">ImageFilter</span>
              </div>

              {/* BLUR Control */}
              <div className="flex flex-col gap-2.5 rounded-lg border border-zinc-200 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-zinc-900">Box Blur</p>
                    <p className="font-mono text-[11px] text-zinc-500">ImageFilter.BLUR</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={config.applyBlur}
                    onClick={() => onChange({ applyBlur: !config.applyBlur })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096] ${
                      config.applyBlur ? 'bg-[#005096]' : 'bg-zinc-300'
                    }`}
                    aria-label="Toggle ImageFilter.BLUR"
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition ${
                        config.applyBlur ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {config.applyBlur && (
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <label htmlFor="blur-passes" className="text-xs text-zinc-600">
                      Passes
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="blur-passes"
                        type="range"
                        min={1}
                        max={3}
                        step={1}
                        value={config.blurPasses}
                        onChange={(e) => onChange({ blurPasses: Number(e.target.value) })}
                        className="w-28 accent-[#005096]"
                      />
                      <span className="w-6 text-right font-mono text-xs text-zinc-800 tabular-nums">
                        {config.blurPasses}×
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* SHARPEN Control */}
              <div className="flex flex-col gap-2.5 rounded-lg border border-zinc-200 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-zinc-900">Edge Sharpen</p>
                    <p className="font-mono text-[11px] text-zinc-500">ImageFilter.SHARPEN</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={config.applySharpen}
                    onClick={() => onChange({ applySharpen: !config.applySharpen })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096] ${
                      config.applySharpen ? 'bg-[#005096]' : 'bg-zinc-300'
                    }`}
                    aria-label="Toggle ImageFilter.SHARPEN"
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition ${
                        config.applySharpen ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {config.applySharpen && (
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <label htmlFor="sharpen-passes" className="text-xs text-zinc-600">
                      Passes
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="sharpen-passes"
                        type="range"
                        min={1}
                        max={3}
                        step={1}
                        value={config.sharpenPasses}
                        onChange={(e) => onChange({ sharpenPasses: Number(e.target.value) })}
                        className="w-28 accent-[#005096]"
                      />
                      <span className="w-6 text-right font-mono text-xs text-zinc-800 tabular-nums">
                        {config.sharpenPasses}×
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'typography' && (
          <>
            {/* Greeting Copy */}
            <div className="flex flex-col gap-2">
              <label htmlFor="greeting-text" className="text-xs font-semibold text-zinc-900">
                Greeting Message
              </label>
              <input
                id="greeting-text"
                type="text"
                value={config.text}
                onChange={(e) => onChange({ text: e.target.value })}
                placeholder="Greetings from Taiwan!"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#005096] focus:outline-none"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {GREETING_SAMPLES.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => onChange({ text: sample })}
                    className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 whitespace-nowrap shrink-0"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-zinc-100" />

            {/* Typeface & Size */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-zinc-900">Typeface & Scale</span>
              <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-zinc-100 p-1">
                {(
                  [
                    { value: 'kai', label: 'KaiU 楷體' },
                    { value: 'serif', label: 'Serif' },
                    { value: 'sans', label: 'Sans' },
                  ] as { value: PostcardFontFamily; label: string }[]
                ).map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onChange({ fontFamily: item.value })}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      config.fontFamily === item.value
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <label htmlFor="font-size" className="text-xs text-zinc-600">
                  Font Size
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    id="font-size"
                    type="range"
                    min={18}
                    max={48}
                    step={1}
                    value={config.fontSize}
                    onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
                    className="w-36 accent-[#005096]"
                  />
                  <span className="w-11 text-right font-mono text-xs text-zinc-800 tabular-nums">
                    {config.fontSize}px
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-zinc-100" />

            {/* Ink Color */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900">Ink Color</span>
                <span className="font-mono text-[11px] text-zinc-600 tabular-nums">
                  ({r}, {g}, {b})
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                {COLOR_SWATCHES.map((swatch) => {
                  const active = config.textColor.toLowerCase() === swatch.hex.toLowerCase();
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => onChange({ textColor: swatch.hex })}
                      title={`${swatch.label} (${swatch.hex})`}
                      aria-label={`Select ${swatch.label}`}
                      className={`h-7 w-7 rounded-full border transition-transform ${
                        active
                          ? 'scale-110 border-zinc-900 ring-2 ring-zinc-900/20'
                          : 'border-zinc-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                    />
                  );
                })}
                <label className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1 text-xs text-zinc-700 hover:border-zinc-300">
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={(e) => onChange({ textColor: e.target.value })}
                    className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0"
                    aria-label="Custom ink color"
                  />
                  <span className="font-mono text-[11px] uppercase">{config.textColor}</span>
                </label>
              </div>
            </div>

            <hr className="border-zinc-100" />

            {/* Coordinates */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-zinc-900">Text Position (px)</span>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="text-x" className="text-xs text-zinc-600">
                  X Offset
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    id="text-x"
                    type="range"
                    min={10}
                    max={400}
                    value={config.textX}
                    onChange={(e) => onChange({ textX: Number(e.target.value) })}
                    className="w-36 accent-[#005096]"
                  />
                  <span className="w-11 text-right font-mono text-xs text-zinc-800 tabular-nums">
                    {config.textX}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="text-y" className="text-xs text-zinc-600">
                  Y Offset
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    id="text-y"
                    type="range"
                    min={605}
                    max={685}
                    value={config.textY}
                    onChange={(e) => onChange({ textY: Number(e.target.value) })}
                    className="w-36 accent-[#005096]"
                  />
                  <span className="w-11 text-right font-mono text-xs text-zinc-800 tabular-nums">
                    {config.textY}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'qr' && (
          <>
            {/* Standalone QR Preview + URL */}
            <div className="flex items-start gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-white p-1.5">
                {qrPreviewUrl ? (
                  <img
                    src={qrPreviewUrl}
                    alt="Generated QR code preview"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <QrCode className="h-8 w-8 text-zinc-300" aria-hidden="true" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <label htmlFor="qr-url" className="text-xs font-semibold text-zinc-900">
                  QR Destination URL
                </label>
                <input
                  id="qr-url"
                  type="url"
                  value={config.qrUrl}
                  onChange={(e) => onChange({ qrUrl: e.target.value })}
                  placeholder="https://www.python.org/"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs text-zinc-900 focus:border-[#005096] focus:outline-none"
                />
                <span className="text-[11px] text-zinc-500 tabular-nums">
                  Standalone output: myqrcode.jpg ({config.qrSize} × {config.qrSize})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'python.org', url: 'https://www.python.org/' },
                { label: 'taiwan.net.tw', url: 'https://eng.taiwan.net.tw/' },
                { label: 'taroko.gov.tw', url: 'https://www.taroko.gov.tw/en/' },
              ].map((item) => (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => onChange({ qrUrl: item.url })}
                  className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[11px] text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 whitespace-nowrap shrink-0"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <hr className="border-zinc-100" />

            {/* QR Geometry */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-zinc-900">Size & Placement</span>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="qr-size" className="text-xs text-zinc-600">
                  QR Size
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    id="qr-size"
                    type="range"
                    min={64}
                    max={114}
                    step={2}
                    value={config.qrSize}
                    onChange={(e) => onChange({ qrSize: Number(e.target.value) })}
                    className="w-36 accent-[#005096]"
                  />
                  <span className="w-11 text-right font-mono text-xs text-zinc-800 tabular-nums">
                    {config.qrSize}px
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="qr-x" className="text-xs text-zinc-600">
                  X Position
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    id="qr-x"
                    type="range"
                    min={460}
                    max={720}
                    value={config.qrX}
                    onChange={(e) => onChange({ qrX: Number(e.target.value) })}
                    className="w-36 accent-[#005096]"
                  />
                  <span className="w-11 text-right font-mono text-xs text-zinc-800 tabular-nums">
                    {config.qrX}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="qr-y" className="text-xs text-zinc-600">
                  Y Position
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    id="qr-y"
                    type="range"
                    min={602}
                    max={650}
                    value={config.qrY}
                    onChange={(e) => onChange({ qrY: Number(e.target.value) })}
                    className="w-36 accent-[#005096]"
                  />
                  <span className="w-11 text-right font-mono text-xs text-zinc-800 tabular-nums">
                    {config.qrY}
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-zinc-100" />

            {/* Error Correction */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-zinc-900">Error Correction Level</span>
              <div className="grid grid-cols-4 gap-1.5 rounded-lg bg-zinc-100 p-1">
                {(['L', 'M', 'Q', 'H'] as QrErrorLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onChange({ qrErrorLevel: lvl })}
                    className={`rounded-md py-1.5 font-mono text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      config.qrErrorLevel === lvl
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'export' && (
          <>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900">JPEG Compression</span>
                <span className="font-mono text-xs text-zinc-800 tabular-nums">
                  quality={config.jpegQuality}
                </span>
              </div>
              <input
                type="range"
                min={60}
                max={100}
                step={1}
                value={config.jpegQuality}
                onChange={(e) => onChange({ jpegQuality: Number(e.target.value) })}
                aria-label="JPEG export quality"
                className="w-full accent-[#005096]"
              />
              <p className="text-xs text-zinc-500">
                Matches <code className="font-mono text-zinc-700">postcard.save(&apos;postcard.jpg&apos;, quality={config.jpegQuality})</code>.
              </p>
            </div>

            <hr className="border-zinc-100" />

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onDownloadPostcard}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#005096] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#004078] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Download postcard.jpg</span>
              </button>

              <button
                type="button"
                onClick={onDownloadQr}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096]"
              >
                <QrCode className="h-4 w-4" aria-hidden="true" />
                <span>Download myqrcode.jpg</span>
              </button>

              <button
                type="button"
                onClick={onOpenLightbox}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096]"
              >
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
                <span>Open Fullscreen (postcard.show)</span>
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
