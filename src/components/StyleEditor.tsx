import {
  Box,
  FormControlLabel,
  MenuItem,
  Slider,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import type {
  CornerDotStyle,
  CornerSquareStyle,
  DotStyle,
  ErrorCorrectionLevel,
  QrStyle,
} from '../types';

export interface StyleEditorProps {
  style: QrStyle;
  onChange: (style: QrStyle) => void;
}

const DOT_STYLES: { value: DotStyle; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy rounded' },
  { value: 'extra-rounded', label: 'Extra rounded' },
];

const CORNER_SQUARE_STYLES: { value: CornerSquareStyle; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
  { value: 'extra-rounded', label: 'Rounded' },
];

const CORNER_DOT_STYLES: { value: CornerDotStyle; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
];

const ERROR_CORRECTION: {
  value: ErrorCorrectionLevel;
  label: string;
  description: string;
}[] = [
  { value: 'L', label: 'L', description: 'Low — ~7%' },
  { value: 'M', label: 'M', description: 'Medium — ~15%' },
  { value: 'Q', label: 'Q', description: 'Quartile — ~25%' },
  { value: 'H', label: 'H', description: 'High — ~30%' },
];

export function StyleEditor({ style, onChange }: StyleEditorProps) {
  const set = (patch: Partial<QrStyle>) => onChange({ ...style, ...patch });

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <ColorField
          label="Foreground"
          value={style.foreground}
          onChange={(v) => set({ foreground: v })}
        />
        <ColorField
          label="Background"
          value={style.background}
          onChange={(v) => set({ background: v })}
          disabled={style.transparentBackground}
        />
      </Stack>

      <FormControlLabel
        control={
          <Switch
            checked={style.transparentBackground}
            onChange={(e) => set({ transparentBackground: e.target.checked })}
          />
        }
        label="Transparent background"
      />

      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">
          Dot style
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={style.dotStyle}
          onChange={(_, v) => v && set({ dotStyle: v })}
        >
          {DOT_STYLES.map((opt) => (
            <ToggleButton key={opt.value} value={opt.value}>
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
        <Stack spacing={1} flex={1}>
          <Typography variant="body2" color="text.secondary">
            Corner frame
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={style.cornerSquareStyle}
            onChange={(_, v) => v && set({ cornerSquareStyle: v })}
          >
            {CORNER_SQUARE_STYLES.map((opt) => (
              <ToggleButton key={opt.value} value={opt.value}>
                {opt.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
        <Stack spacing={1} flex={1}>
          <Typography variant="body2" color="text.secondary">
            Corner center
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={style.cornerDotStyle}
            onChange={(_, v) => v && set({ cornerDotStyle: v })}
          >
            {CORNER_DOT_STYLES.map((opt) => (
              <ToggleButton key={opt.value} value={opt.value}>
                {opt.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      <TextField
        select
        fullWidth
        label="Error correction"
        value={style.errorCorrection}
        onChange={(e) =>
          set({ errorCorrection: e.target.value as ErrorCorrectionLevel })
        }
        helperText="Higher levels scan better but encode less data"
      >
        {ERROR_CORRECTION.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label} — {opt.description}
          </MenuItem>
        ))}
      </TextField>

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          <Typography variant="body2" color="text.secondary">
            Quiet zone (outer margin)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(style.margin * 100).toFixed(1)}%
          </Typography>
        </Stack>
        <Slider
          min={0}
          max={0.1}
          step={0.005}
          value={style.margin}
          onChange={(_, v) => set({ margin: v as number })}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => `${((v as number) * 100).toFixed(1)}%`}
          sx={{ mt: 0.5 }}
        />
      </Box>
    </Stack>
  );
}

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function ColorField({ label, value, onChange, disabled }: ColorFieldProps) {
  return (
    <TextField
      fullWidth
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <Box
            component="input"
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            sx={{
              width: 32,
              height: 32,
              border: 'none',
              padding: 0,
              marginRight: 1,
              backgroundColor: 'transparent',
              cursor: disabled ? 'not-allowed' : 'pointer',
              borderRadius: 1,
            }}
          />
        ),
      }}
    />
  );
}
