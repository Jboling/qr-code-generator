import { useState } from 'react';
import {
  Alert,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import QRCodeStyling, { type Options } from 'qr-code-styling';

import type {
  ExportConfig,
  ExportFormat,
  LogoConfig,
  QrStyle,
} from '../types';

export interface ExportBarProps {
  data: string;
  style: QrStyle;
  logo: LogoConfig;
  exportConfig: ExportConfig;
  onExportConfigChange: (next: ExportConfig) => void;
  filenameBase: string;
}

const SIZE_PRESETS = [256, 512, 1024, 2048];

const FORMATS: { value: ExportFormat; label: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'svg', label: 'SVG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
];

const MIN_PX = 64;
const MAX_PX = 4096;

function clamp(n: number): number {
  if (!Number.isFinite(n)) return MIN_PX;
  return Math.max(MIN_PX, Math.min(MAX_PX, Math.round(n)));
}

function buildExportOptions(
  data: string,
  style: QrStyle,
  logo: LogoConfig,
  width: number,
  height: number,
  format: ExportFormat,
): Options {
  const options: Options = {
    width,
    height,
    type: format === 'svg' ? 'svg' : 'canvas',
    data: data || ' ',
    margin: style.margin,
    qrOptions: { errorCorrectionLevel: style.errorCorrection },
    dotsOptions: { color: style.foreground, type: style.dotStyle },
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
  if (logo.dataUrl) options.image = logo.dataUrl;
  return options;
}

export function ExportBar({
  data,
  style,
  logo,
  exportConfig,
  onExportConfigChange,
  filenameBase,
}: ExportBarProps) {
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyPreset = (size: number) => {
    onExportConfigChange({ ...exportConfig, width: size, height: size });
  };

  const setWidth = (value: number) => {
    const w = clamp(value);
    onExportConfigChange({
      ...exportConfig,
      width: w,
      height: exportConfig.linkAspect ? w : exportConfig.height,
    });
  };

  const setHeight = (value: number) => {
    const h = clamp(value);
    onExportConfigChange({
      ...exportConfig,
      height: h,
      width: exportConfig.linkAspect ? h : exportConfig.width,
    });
  };

  const toggleLink = () => {
    const linking = !exportConfig.linkAspect;
    onExportConfigChange({
      ...exportConfig,
      linkAspect: linking,
      height: linking ? exportConfig.width : exportConfig.height,
    });
  };

  const download = async () => {
    if (!data) {
      setError('Add some content before downloading.');
      return;
    }
    try {
      setBusy(true);
      const instance = new QRCodeStyling(
        buildExportOptions(
          data,
          style,
          logo,
          exportConfig.width,
          exportConfig.height,
          exportConfig.format,
        ),
      );
      await instance.download({
        name: filenameBase || 'qr-code',
        extension: exportConfig.format,
      });
    } catch (err) {
      console.error(err);
      setError('Something went wrong while generating the file.');
    } finally {
      setBusy(false);
    }
  };

  const copyPng = async () => {
    if (!data) {
      setError('Add some content before copying.');
      return;
    }
    try {
      setBusy(true);
      const instance = new QRCodeStyling(
        buildExportOptions(
          data,
          style,
          logo,
          exportConfig.width,
          exportConfig.height,
          'png',
        ),
      );
      const blob = (await instance.getRawData('png')) as Blob | null;
      if (!blob) throw new Error('No blob');
      if (!('ClipboardItem' in window) || !navigator.clipboard?.write) {
        throw new Error('Clipboard images are not supported in this browser.');
      }
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setToast('PNG copied to clipboard');
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not copy to clipboard.',
      );
    } finally {
      setBusy(false);
    }
  };

  const presetValue =
    exportConfig.width === exportConfig.height &&
    SIZE_PRESETS.includes(exportConfig.width)
      ? exportConfig.width
      : null;

  return (
    <Stack spacing={2.5}>
      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">
          Size presets
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={presetValue}
          onChange={(_, v) => typeof v === 'number' && applyPreset(v)}
        >
          {SIZE_PRESETS.map((s) => (
            <ToggleButton key={s} value={s}>
              {s}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" color="text.secondary" flex={1}>
            Custom size
          </Typography>
          <Tooltip
            title={
              exportConfig.linkAspect
                ? 'Unlink to set width and height separately'
                : 'Link width and height'
            }
          >
            <IconButton
              size="small"
              onClick={toggleLink}
              color={exportConfig.linkAspect ? 'primary' : 'default'}
              aria-label="Toggle aspect lock"
            >
              {exportConfig.linkAspect ? (
                <LinkIcon fontSize="small" />
              ) : (
                <LinkOffIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            fullWidth
            label="Width"
            type="number"
            value={exportConfig.width}
            onChange={(e) => setWidth(Number(e.target.value))}
            inputProps={{ min: MIN_PX, max: MAX_PX, step: 16 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
          />
          <Typography variant="body2" color="text.secondary">
            ×
          </Typography>
          <TextField
            fullWidth
            label="Height"
            type="number"
            value={exportConfig.height}
            onChange={(e) => setHeight(Number(e.target.value))}
            inputProps={{ min: MIN_PX, max: MAX_PX, step: 16 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
          />
        </Stack>
        {exportConfig.width !== exportConfig.height && (
          <Typography variant="caption" color="text.secondary">
            Tip: most scanners expect a square QR code.
          </Typography>
        )}
      </Stack>

      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">
          Format
        </Typography>
        <TextField
          select
          fullWidth
          value={exportConfig.format}
          onChange={(e) =>
            onExportConfigChange({
              ...exportConfig,
              format: e.target.value as ExportFormat,
            })
          }
        >
          {FORMATS.map((f) => (
            <MenuItem key={f.value} value={f.value}>
              {f.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack spacing={1}>
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={<DownloadIcon />}
          onClick={download}
          disabled={busy}
        >
          Download {exportConfig.format.toUpperCase()}
        </Button>
        <Button
          variant="outlined"
          size="large"
          fullWidth
          startIcon={<ContentCopyIcon />}
          onClick={copyPng}
          disabled={busy}
        >
          Copy PNG
        </Button>
      </Stack>

      <Snackbar
        open={!!toast}
        autoHideDuration={2500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setToast(null)}
        >
          {toast}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
