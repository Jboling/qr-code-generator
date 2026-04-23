import { useEffect, useMemo, useRef } from 'react';
import QRCodeStyling, { type Options } from 'qr-code-styling';
import { Box } from '@mui/material';

import type { LogoConfig, QrStyle } from '../types';

export interface QrPreviewProps {
  data: string;
  style: QrStyle;
  logo: LogoConfig;
  onInstanceReady?: (instance: QRCodeStyling) => void;
}

const PREVIEW_SIZE = 320;

function buildOptions(
  data: string,
  style: QrStyle,
  logo: LogoConfig,
  size: number,
): Options {
  const options: Options = {
    width: size,
    height: size,
    type: 'svg',
    data: data || ' ',
    margin: style.margin,
    qrOptions: {
      errorCorrectionLevel: style.errorCorrection,
    },
    dotsOptions: {
      color: style.foreground,
      type: style.dotStyle,
    },
    cornersSquareOptions: {
      color: style.foreground,
      type: style.cornerSquareStyle,
    },
    cornersDotOptions: {
      color: style.foreground,
      type: style.cornerDotStyle,
    },
    backgroundOptions: {
      color: style.transparentBackground ? 'transparent' : style.background,
    },
    imageOptions: {
      hideBackgroundDots: logo.hideBackgroundDots,
      imageSize: logo.size,
      margin: logo.margin,
      crossOrigin: 'anonymous',
    },
  };

  if (logo.dataUrl) {
    options.image = logo.dataUrl;
  }

  return options;
}

export function QrPreview({
  data,
  style,
  logo,
  onInstanceReady,
}: QrPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<QRCodeStyling | null>(null);

  const options = useMemo(
    () => buildOptions(data, style, logo, PREVIEW_SIZE),
    [data, style, logo],
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const instance = new QRCodeStyling(options);
    instanceRef.current = instance;
    containerRef.current.innerHTML = '';
    instance.append(containerRef.current);
    onInstanceReady?.(instance);
    return () => {
      instanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    instanceRef.current?.update(options);
    if (instanceRef.current) {
      onInstanceReady?.(instanceRef.current);
    }
  }, [options, onInstanceReady]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: PREVIEW_SIZE,
        height: PREVIEW_SIZE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
        backgroundColor: '#fff',
        backgroundImage:
          'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
        backgroundSize: '16px 16px',
        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
        boxShadow:
          '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        '& svg, & canvas': {
          display: 'block',
          width: '100%',
          height: '100%',
        },
      }}
    />
  );
}
