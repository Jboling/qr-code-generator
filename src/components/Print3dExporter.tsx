import { useState } from 'react';
import {
  Alert,
  Button,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ViewInArIcon from '@mui/icons-material/ViewInAr';

import { buildPrint3dSvg, downloadSvg } from '../print3d';
import type { ErrorCorrectionLevel, LogoConfig } from '../types';

export interface Print3dExporterProps {
  data: string;
  errorCorrection: ErrorCorrectionLevel;
  logo: LogoConfig;
  filenameBase: string;
}

const MIN_MM = 10;
const MAX_MM = 400;
const MIN_QZ = 0;
const MAX_QZ = 10;

export function Print3dExporter({
  data,
  errorCorrection,
  logo,
  filenameBase,
}: Print3dExporterProps) {
  const [sizeMm, setSizeMm] = useState(80);
  const [quietZone, setQuietZone] = useState(4);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!data) {
      setError('Add some content before exporting.');
      return;
    }
    try {
      setBusy(true);
      const svg = await buildPrint3dSvg(data, {
        sizeMm,
        errorCorrection,
        quietZoneModules: quietZone,
        logo: logo.dataUrl
          ? {
              dataUrl: logo.dataUrl,
              size: logo.size,
              hideBackgroundDots: logo.hideBackgroundDots,
            }
          : null,
      });
      downloadSvg(`${filenameBase || 'qr-code'}-3dprint`, svg);
      setToast('3D-print SVG ready');
    } catch (err) {
      console.error(err);
      setError('Could not generate the 3D-print SVG.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          label="Physical size"
          type="number"
          value={sizeMm}
          onChange={(e) =>
            setSizeMm(
              Math.max(
                MIN_MM,
                Math.min(MAX_MM, Math.round(Number(e.target.value) || 0)),
              ),
            )
          }
          inputProps={{ min: MIN_MM, max: MAX_MM, step: 1 }}
          InputProps={{
            endAdornment: <InputAdornment position="end">mm</InputAdornment>,
          }}
        />
        <TextField
          fullWidth
          label="Quiet zone"
          type="number"
          value={quietZone}
          onChange={(e) =>
            setQuietZone(
              Math.max(
                MIN_QZ,
                Math.min(MAX_QZ, Math.round(Number(e.target.value) || 0)),
              ),
            )
          }
          inputProps={{ min: MIN_QZ, max: MAX_QZ, step: 1 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">modules</InputAdornment>
            ),
          }}
          helperText="QR spec is 4"
        />
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Exports the QR modules and your logo in a single slicer-friendly SVG.
        Modules are always square for reliable extrusion and scanning,
        regardless of the dot style used in the preview. Import in
        PrusaSlicer and print onto the build plate with a brim.
      </Typography>

      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={<DownloadIcon />}
        endIcon={<ViewInArIcon />}
        onClick={handleDownload}
        disabled={busy}
      >
        {busy ? 'Generating…' : 'Download 3D-print SVG'}
      </Button>

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
