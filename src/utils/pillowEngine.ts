import QRCode from 'qrcode';
import { PostcardConfig, PostcardFontFamily } from '../types/postcard';

export const POSTCARD_WIDTH = 800;
export const POSTCARD_HEIGHT = 720;
export const PHOTO_WIDTH = 800;
export const PHOTO_HEIGHT = 600;

/**
 * Exact Pillow ImageFilter.BLUR kernel (5x5, scale 16):
 * [1,1,1,1,1, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 1,1,1,1,1] / 16
 */
const PILLOW_BLUR_KERNEL = [
  1, 1, 1, 1, 1,
  1, 0, 0, 0, 1,
  1, 0, 0, 0, 1,
  1, 0, 0, 0, 1,
  1, 1, 1, 1, 1,
];

/**
 * Exact Pillow ImageFilter.SHARPEN kernel (3x3, scale 16):
 * [-2,-2,-2, -2,32,-2, -2,-2,-2] / 16
 */
const PILLOW_SHARPEN_KERNEL = [
  -2, -2, -2,
  -2, 32, -2,
  -2, -2, -2,
];

export function applyConvolution(
  srcData: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[],
  kernelSize: number,
  scale: number
): Uint8ClampedArray<ArrayBuffer> {
  const output = new Uint8ClampedArray(new ArrayBuffer(srcData.length));
  const half = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dstIdx = (y * width + x) * 4;

      // Preserve 2px edge cleanly like Pillow's 3x3/5x5 filter edge clamp
      if (x < half || x >= width - half || y < half || y >= height - half) {
        output[dstIdx] = srcData[dstIdx];
        output[dstIdx + 1] = srcData[dstIdx + 1];
        output[dstIdx + 2] = srcData[dstIdx + 2];
        output[dstIdx + 3] = 255;
        continue;
      }

      let r = 0;
      let g = 0;
      let b = 0;

      for (let ky = 0; ky < kernelSize; ky++) {
        const py = y + ky - half;
        for (let kx = 0; kx < kernelSize; kx++) {
          const px = x + kx - half;
          const weight = kernel[ky * kernelSize + kx];
          if (weight === 0) continue;
          const srcIdx = (py * width + px) * 4;
          r += srcData[srcIdx] * weight;
          g += srcData[srcIdx + 1] * weight;
          b += srcData[srcIdx + 2] * weight;
        }
      }

      output[dstIdx] = Math.min(255, Math.max(0, Math.round(r / scale)));
      output[dstIdx + 1] = Math.min(255, Math.max(0, Math.round(g / scale)));
      output[dstIdx + 2] = Math.min(255, Math.max(0, Math.round(b / scale)));
      output[dstIdx + 3] = 255;
    }
  }

  return output;
}

export function hexToRgbTuple(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return [0, 80, 150];
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [
    Number.isNaN(r) ? 0 : r,
    Number.isNaN(g) ? 80 : g,
    Number.isNaN(b) ? 150 : b,
  ];
}

export function getCanvasFontString(family: PostcardFontFamily, size: number): string {
  switch (family) {
    case 'kai':
      return `${size}px "LXGW WenKai TC", "BiauKai", "DFKai-SB", "KaiTi", "Noto Serif TC", serif`;
    case 'serif':
      return `600 ${size}px "Playfair Display", "Noto Serif TC", Georgia, serif`;
    case 'sans':
      return `600 ${size}px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif`;
  }
}

export async function generateQrCanvas(config: PostcardConfig): Promise<HTMLCanvasElement> {
  const qrCanvas = document.createElement('canvas');
  const payload = config.qrUrl.trim() || 'https://www.python.org/';
  await QRCode.toCanvas(qrCanvas, payload, {
    width: config.qrSize,
    margin: 2,
    errorCorrectionLevel: config.qrErrorLevel,
    color: {
      dark: config.qrDarkColor,
      light: config.qrLightColor,
    },
  });
  return qrCanvas;
}

export function drawResizedPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  fitMode: PostcardConfig['fitMode']
): void {
  const targetW = PHOTO_WIDTH;
  const targetH = PHOTO_HEIGHT;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetW, targetH);

  if (fitMode === 'stretch') {
    ctx.drawImage(img, 0, 0, targetW, targetH);
    return;
  }

  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = targetW / targetH;

  if (fitMode === 'cover') {
    let sx = 0;
    let sy = 0;
    let sw = img.naturalWidth;
    let sh = img.naturalHeight;

    if (imgRatio > targetRatio) {
      sw = img.naturalHeight * targetRatio;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = img.naturalWidth / targetRatio;
      sy = (img.naturalHeight - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
    return;
  }

  // contain
  let dw = targetW;
  let dh = targetH;
  let dx = 0;
  let dy = 0;
  if (imgRatio > targetRatio) {
    dh = targetW / imgRatio;
    dy = (targetH - dh) / 2;
  } else {
    dw = targetH * imgRatio;
    dx = (targetW - dw) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

export interface RenderedPostcardResult {
  rawPhotoCanvas: HTMLCanvasElement;
  filteredPhotoCanvas: HTMLCanvasElement;
  qrDataUrl: string;
}

export async function renderPostcardToCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  config: PostcardConfig
): Promise<RenderedPostcardResult> {
  canvas.width = POSTCARD_WIDTH;
  canvas.height = POSTCARD_HEIGHT;

  // 1. Create raw resized 800x600 photo buffer (im.resize((800, 600)))
  const rawPhotoCanvas = document.createElement('canvas');
  rawPhotoCanvas.width = PHOTO_WIDTH;
  rawPhotoCanvas.height = PHOTO_HEIGHT;
  const rawCtx = rawPhotoCanvas.getContext('2d', { willReadFrequently: true });
  if (!rawCtx) {
    throw new Error('Could not initialize 2D context for photo');
  }
  drawResizedPhoto(rawCtx, img, config.fitMode);

  // 2. Apply Pillow convolution filters (BLUR -> SHARPEN)
  const filteredPhotoCanvas = document.createElement('canvas');
  filteredPhotoCanvas.width = PHOTO_WIDTH;
  filteredPhotoCanvas.height = PHOTO_HEIGHT;
  const filteredCtx = filteredPhotoCanvas.getContext('2d', { willReadFrequently: true });
  if (!filteredCtx) {
    throw new Error('Could not initialize 2D context for filtered photo');
  }

  const imageData = rawCtx.getImageData(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
  let pixels: Uint8ClampedArray<ArrayBuffer> = new Uint8ClampedArray(imageData.data);

  if (config.applyBlur && config.blurPasses > 0) {
    for (let i = 0; i < config.blurPasses; i++) {
      pixels = applyConvolution(pixels, PHOTO_WIDTH, PHOTO_HEIGHT, PILLOW_BLUR_KERNEL, 5, 16);
    }
  }

  if (config.applySharpen && config.sharpenPasses > 0) {
    for (let i = 0; i < config.sharpenPasses; i++) {
      pixels = applyConvolution(pixels, PHOTO_WIDTH, PHOTO_HEIGHT, PILLOW_SHARPEN_KERNEL, 3, 16);
    }
  }

  const outImageData = new ImageData(pixels, PHOTO_WIDTH, PHOTO_HEIGHT);
  filteredCtx.putImageData(outImageData, 0, 0);

  // 3. Create 800x720 postcard canvas & paste filtered photo at (0, 0)
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not initialize postcard 2D context');
  }
  ctx.fillStyle = config.canvasBg;
  ctx.fillRect(0, 0, POSTCARD_WIDTH, POSTCARD_HEIGHT);
  ctx.drawImage(filteredPhotoCanvas, 0, 0);

  // 4. Draw greeting text (draw.text((30, 630), text, fill=text_color, font=font))
  // Pillow uses top-left anchor by default; canvas textBaseline='top' aligns accurately to (x, y)
  ctx.save();
  ctx.font = getCanvasFontString(config.fontFamily, config.fontSize);
  ctx.fillStyle = config.textColor;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText(config.text, config.textX, config.textY);
  ctx.restore();

  // 5. Generate & paste QR code at (650, 610)
  const qrCanvas = await generateQrCanvas(config);
  ctx.drawImage(qrCanvas, config.qrX, config.qrY, config.qrSize, config.qrSize);

  const qrDataUrl = qrCanvas.toDataURL('image/jpeg', 0.98);

  return {
    rawPhotoCanvas,
    filteredPhotoCanvas,
    qrDataUrl,
  };
}

export function generatePythonScript(config: PostcardConfig): string {
  const [r, g, b] = hexToRgbTuple(config.textColor);
  const safeText = config.text.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const safeUrl = config.qrUrl.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const safeFile = config.imageName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  const filterLines: string[] = [];
  if (config.applyBlur) {
    for (let i = 0; i < config.blurPasses; i++) {
      filterLines.push('im = im.filter(ImageFilter.BLUR)');
    }
  }
  if (config.applySharpen) {
    for (let i = 0; i < config.sharpenPasses; i++) {
      filterLines.push('im = im.filter(ImageFilter.SHARPEN)');
    }
  }

  const fontComment =
    config.fontFamily === 'kai'
      ? "'C:\\\\Windows\\\\Fonts\\\\kaiu.ttf'"
      : config.fontFamily === 'serif'
        ? "'C:\\\\Windows\\\\Fonts\\\\georgia.ttf'"
        : "'C:\\\\Windows\\\\Fonts\\\\arial.ttf'";

  return `from PIL import Image, ImageDraw, ImageFont, ImageFilter
import qrcode

im = Image.open('${safeFile}')

print("圖片格式：", im.format)
print("圖片大小：", im.size)

im = im.convert('RGB')
im = im.resize((${PHOTO_WIDTH}, ${PHOTO_HEIGHT}))
${filterLines.length > 0 ? filterLines.join('\n') : '# No convolution filters applied'}

postcard = Image.new('RGB', (${POSTCARD_WIDTH}, ${POSTCARD_HEIGHT}), '${config.canvasBg}')
postcard.paste(im, (0, 0))

draw = ImageDraw.Draw(postcard)

text = '${safeText}'
text_color = (${r}, ${g}, ${b})

font = ImageFont.truetype(
    ${fontComment}, ${config.fontSize}
)

draw.text((${config.textX}, ${config.textY}), text, fill=text_color, font=font)

qr = qrcode.make('${safeUrl}')
qr = qr.resize((${config.qrSize}, ${config.qrSize}))
qr = qr.convert('RGB')
postcard.paste(qr, (${config.qrX}, ${config.qrY}))

qr.save('myqrcode.jpg')
postcard.save('postcard.jpg', quality=${config.jpegQuality})
postcard.show()

print("QR Code 製作完成！")
print("明信片儲存完成！")`;
}
