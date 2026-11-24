export type ResizeFitMode = 'stretch' | 'cover' | 'contain';
export type PostcardFontFamily = 'kai' | 'serif' | 'sans';
export type QrErrorLevel = 'L' | 'M' | 'Q' | 'H';

export interface PostcardConfig {
  imageSrc: string;
  imageName: string;
  fitMode: ResizeFitMode;
  applyBlur: boolean;
  blurPasses: number;
  applySharpen: boolean;
  sharpenPasses: number;
  canvasBg: string;
  text: string;
  textColor: string;
  fontFamily: PostcardFontFamily;
  fontSize: number;
  textX: number;
  textY: number;
  qrUrl: string;
  qrSize: number;
  qrX: number;
  qrY: number;
  qrErrorLevel: QrErrorLevel;
  qrDarkColor: string;
  qrLightColor: string;
  jpegQuality: number;
}

export interface ImageMeta {
  format: string;
  width: number;
  height: number;
  mode: string;
  fileSizeLabel: string;
}

export interface PresetPhoto {
  id: string;
  title: string;
  subtitle: string;
  filename: string;
  src: string;
  defaultGreeting: string;
  defaultColor: string;
  defaultUrl: string;
}

export const TAIWAN_PRESET_PHOTOS: PresetPhoto[] = [
  {
    id: 'taroko',
    title: 'Taroko Gorge',
    subtitle: 'Marble Cliffs · Hualien',
    filename: 'landscape.jpg',
    src: '/src/assets/images/taiwan_taroko_landscape_1795503084433.jpg',
    defaultGreeting: 'Greetings from Taiwan!',
    defaultColor: '#005096',
    defaultUrl: 'https://www.python.org/',
  },
  {
    id: 'jiufen',
    title: 'Jiufen Old Street',
    subtitle: 'Coastal Lanterns · New Taipei',
    filename: 'jiufen_dusk.jpg',
    src: '/src/assets/images/taiwan_jiufen_lanterns_1795503085036.jpg',
    defaultGreeting: '九份山城夜色 · Jiufen Twilight',
    defaultColor: '#8B1E24',
    defaultUrl: 'https://eng.taiwan.net.tw/',
  },
  {
    id: 'alishan',
    title: 'Alishan Sunrise',
    subtitle: 'Sea of Clouds · Chiayi',
    filename: 'alishan_dawn.jpg',
    src: '/src/assets/images/taiwan_alishan_sunrise_1795503084800.jpg',
    defaultGreeting: '阿里山日出雲海 · Alishan Dawn',
    defaultColor: '#1E3A5F',
    defaultUrl: 'https://www.python.org/',
  },
];

export const DEFAULT_POSTCARD_CONFIG: PostcardConfig = {
  imageSrc: TAIWAN_PRESET_PHOTOS[0].src,
  imageName: 'landscape.jpg',
  fitMode: 'stretch',
  applyBlur: true,
  blurPasses: 1,
  applySharpen: true,
  sharpenPasses: 1,
  canvasBg: '#ffffff',
  text: 'Greetings from Taiwan!',
  textColor: '#005096',
  fontFamily: 'kai',
  fontSize: 30,
  textX: 30,
  textY: 630,
  qrUrl: 'https://www.python.org/',
  qrSize: 100,
  qrX: 650,
  qrY: 610,
  qrErrorLevel: 'M',
  qrDarkColor: '#000000',
  qrLightColor: '#ffffff',
  jpegQuality: 95,
};
