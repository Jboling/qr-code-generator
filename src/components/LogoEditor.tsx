import { useRef } from 'react';
import {
  Avatar,
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Slider,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

import type { LogoConfig } from '../types';

export interface LogoEditorProps {
  logo: LogoConfig;
  onChange: (logo: LogoConfig) => void;
}

const ACCEPTED = 'image/png,image/jpeg,image/svg+xml,image/webp,image/gif';

export function LogoEditor({ logo, onChange }: LogoEditorProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File | undefined | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (result) {
        onChange({ ...logo, dataUrl: result, filename: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  const clear = () => {
    onChange({ ...logo, dataUrl: null, filename: null });
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          variant="rounded"
          src={logo.dataUrl ?? undefined}
          sx={{
            width: 64,
            height: 64,
            bgcolor: 'action.hover',
            color: 'text.secondary',
          }}
        >
          {logo.dataUrl ? '' : 'Logo'}
        </Avatar>
        <Stack flex={1} spacing={0.5}>
          <Typography variant="body2" fontWeight={500}>
            {logo.filename ?? 'No logo selected'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            PNG, JPEG, SVG, WebP, or GIF. Processed in your browser only.
          </Typography>
        </Stack>
        {logo.dataUrl && (
          <IconButton onClick={clear} aria-label="Remove logo">
            <DeleteIcon />
          </IconButton>
        )}
      </Stack>

      <Box>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => inputRef.current?.click()}
        >
          {logo.dataUrl ? 'Replace logo' : 'Upload logo'}
        </Button>
      </Box>

      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">
          Logo size: {Math.round(logo.size * 100)}%
        </Typography>
        <Slider
          min={0.1}
          max={0.5}
          step={0.01}
          value={logo.size}
          onChange={(_, v) => onChange({ ...logo, size: v as number })}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => `${Math.round((v as number) * 100)}%`}
          disabled={!logo.dataUrl}
        />
      </Stack>

      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">
          Logo padding: {(logo.margin * 100).toFixed(1)}%
        </Typography>
        <Slider
          min={0}
          max={0.08}
          step={0.005}
          value={logo.margin}
          onChange={(_, v) => onChange({ ...logo, margin: v as number })}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => `${((v as number) * 100).toFixed(1)}%`}
          disabled={!logo.dataUrl}
        />
      </Stack>

      <FormControlLabel
        control={
          <Switch
            checked={logo.hideBackgroundDots}
            onChange={(e) =>
              onChange({ ...logo, hideBackgroundDots: e.target.checked })
            }
            disabled={!logo.dataUrl}
          />
        }
        label="Hide dots behind logo"
      />
    </Stack>
  );
}
