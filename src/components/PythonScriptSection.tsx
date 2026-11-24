import React, { useMemo, useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { PostcardConfig } from '../types/postcard';
import { generatePythonScript, hexToRgbTuple } from '../utils/pillowEngine';

interface PythonScriptSectionProps {
  config: PostcardConfig;
}

export const PythonScriptSection: React.FC<PythonScriptSectionProps> = ({ config }) => {
  const [copied, setCopied] = useState(false);
  const script = useMemo(() => generatePythonScript(config), [config]);
  const lines = useMemo(() => script.split('\n'), [script]);
  const [r, g, b] = hexToRgbTuple(config.textColor);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback copy via temporary textarea
      const ta = document.createElement('textarea');
      ta.value = script;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleDownloadPy = () => {
    const blob = new Blob([script], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'make_postcard.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="script" className="border-t border-zinc-200 pt-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        {/* Left: Editorial Pipeline Steps */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <div>
            <h2 className="font-[var(--font-display)] text-2xl font-semibold tracking-tight text-zinc-900 text-balance">
              Synchronized Pillow & QRCode Pipeline
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Every adjustment in the studio updates the equivalent Python script below so you can run the exact same image pipeline locally with Pillow and <code className="font-mono text-xs text-zinc-800">qrcode</code>.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-zinc-200 border-y border-zinc-200">
            <div className="py-4">
              <h3 className="text-sm font-semibold text-zinc-900">01. Open, Convert & Resize</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                Inspects format and source size, normalizes color channels to <code className="font-mono text-zinc-800">RGB</code>, and resamples the frame to <code className="font-mono text-zinc-800 tabular-nums">800 × 600</code>.
              </p>
            </div>
            <div className="py-4">
              <h3 className="text-sm font-semibold text-zinc-900">02. Convolution Filter Stack</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                Executes Pillow&apos;s <code className="font-mono text-zinc-800">5×5 BLUR</code> ({config.applyBlur ? `${config.blurPasses}×` : 'off'}) followed by <code className="font-mono text-zinc-800">3×3 SHARPEN</code> ({config.applySharpen ? `${config.sharpenPasses}×` : 'off'}) directly on pixel buffers.
              </p>
            </div>
            <div className="py-4">
              <h3 className="text-sm font-semibold text-zinc-900">03. Typography & Ink Color</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                Composites the <code className="font-mono text-zinc-800 tabular-nums">800 × 720</code> white canvas and draws “{config.text}” at <code className="font-mono text-zinc-800 tabular-nums">({config.textX}, {config.textY})</code> in <code className="font-mono text-zinc-800 tabular-nums">rgb({r}, {g}, {b})</code>.
              </p>
            </div>
            <div className="py-4">
              <h3 className="text-sm font-semibold text-zinc-900">04. QR Matrix & Dual Export</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                Encodes <code className="font-mono text-zinc-800">{config.qrUrl}</code>, resizes to <code className="font-mono text-zinc-800 tabular-nums">{config.qrSize} × {config.qrSize}</code>, pastes at <code className="font-mono text-zinc-800 tabular-nums">({config.qrX}, {config.qrY})</code>, and writes both <code className="font-mono text-zinc-800">myqrcode.jpg</code> and <code className="font-mono text-zinc-800">postcard.jpg</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Clean Code Block */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <span className="font-mono font-medium text-zinc-900">make_postcard.py</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{lines.length} lines</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096]"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadPy}
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005096]"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Download .py</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-[#FAFAFA] p-4 font-mono text-xs leading-6 text-zinc-800">
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index} className="hover:bg-zinc-100/80">
                    <td className="w-9 pr-4 text-right text-zinc-400 select-none tabular-nums">
                      {index + 1}
                    </td>
                    <td className="whitespace-pre text-zinc-800">{line || ' '}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
