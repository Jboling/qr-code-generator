export type ContentType =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'vcard'
  | 'geo';

export interface UrlContent {
  type: 'url';
  url: string;
}

export interface TextContent {
  type: 'text';
  text: string;
}

export interface EmailContent {
  type: 'email';
  to: string;
  subject: string;
  body: string;
}

export interface PhoneContent {
  type: 'phone';
  phone: string;
}

export interface SmsContent {
  type: 'sms';
  phone: string;
  message: string;
}

export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface WifiContent {
  type: 'wifi';
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
}

export interface VCardContent {
  type: 'vcard';
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phone: string;
  email: string;
  url: string;
  address: string;
}

export interface GeoContent {
  type: 'geo';
  lat: string;
  lng: string;
}

export type QrContent =
  | UrlContent
  | TextContent
  | EmailContent
  | PhoneContent
  | SmsContent
  | WifiContent
  | VCardContent
  | GeoContent;

export type DotStyle =
  | 'square'
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'classy-rounded'
  | 'extra-rounded';

export type CornerSquareStyle = 'square' | 'dot' | 'extra-rounded';
export type CornerDotStyle = 'square' | 'dot';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrStyle {
  foreground: string;
  background: string;
  transparentBackground: boolean;
  dotStyle: DotStyle;
  cornerSquareStyle: CornerSquareStyle;
  cornerDotStyle: CornerDotStyle;
  errorCorrection: ErrorCorrectionLevel;
  margin: number;
}

export interface LogoConfig {
  dataUrl: string | null;
  filename: string | null;
  size: number;
  margin: number;
  hideBackgroundDots: boolean;
}

export type ExportFormat = 'png' | 'svg' | 'jpeg' | 'webp';

export interface ExportConfig {
  width: number;
  height: number;
  linkAspect: boolean;
  format: ExportFormat;
}
