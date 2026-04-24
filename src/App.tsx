import { useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Link,
  Paper,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import GitHubIcon from '@mui/icons-material/GitHub';
import RefreshIcon from '@mui/icons-material/Refresh';

import { ContentEditor } from './components/ContentEditor';
import { StyleEditor } from './components/StyleEditor';
import { LogoEditor } from './components/LogoEditor';
import { ExportBar } from './components/ExportBar';
import { Print3dExporter } from './components/Print3dExporter';
import { QrPreview } from './components/QrPreview';
import { buildQrData, defaultContentFor } from './content';
import type {
  ExportConfig,
  LogoConfig,
  QrContent,
  QrStyle,
} from './types';

const DEFAULT_STYLE: QrStyle = {
  foreground: '#1D1B20',
  background: '#FFFFFF',
  transparentBackground: false,
  dotStyle: 'rounded',
  cornerSquareStyle: 'extra-rounded',
  cornerDotStyle: 'dot',
  errorCorrection: 'Q',
  margin: 0.025,
};

const DEFAULT_LOGO: LogoConfig = {
  dataUrl: null,
  filename: null,
  size: 0.3,
  margin: 0.01,
  hideBackgroundDots: true,
};

const DEFAULT_EXPORT: ExportConfig = {
  width: 1024,
  height: 1024,
  linkAspect: true,
  format: 'png',
};

function slugifyForFilename(content: QrContent): string {
  const raw = (() => {
    switch (content.type) {
      case 'url':
        return content.url;
      case 'text':
        return content.text.slice(0, 40);
      case 'email':
        return content.to;
      case 'phone':
      case 'sms':
        return content.phone;
      case 'wifi':
        return content.ssid;
      case 'vcard':
        return `${content.firstName}-${content.lastName}`;
      case 'geo':
        return `${content.lat}-${content.lng}`;
    }
  })();
  const cleaned = raw
    .replace(/https?:\/\//i, '')
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .toLowerCase();
  return cleaned ? `qr-${cleaned}` : 'qr-code';
}

export default function App() {
  const [content, setContent] = useState<QrContent>(defaultContentFor('url'));
  const [style, setStyle] = useState<QrStyle>(DEFAULT_STYLE);
  const [logo, setLogo] = useState<LogoConfig>(DEFAULT_LOGO);
  const [exportConfig, setExportConfig] = useState<ExportConfig>(DEFAULT_EXPORT);

  const data = useMemo(() => buildQrData(content), [content]);
  const filenameBase = useMemo(() => slugifyForFilename(content), [content]);

  const reset = () => {
    setContent(defaultContentFor(content.type));
    setStyle(DEFAULT_STYLE);
    setLogo(DEFAULT_LOGO);
    setExportConfig(DEFAULT_EXPORT);
  };

  return (
    <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Stack direction="row" spacing={1.5} alignItems="center" flex={1}>
            <QrCode2Icon color="primary" />
            <Typography variant="h6" color="text.primary">
              QR Code Generator
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'inline' } }}
            >
              · Private, nothing uploaded
            </Typography>
          </Stack>
          <Tooltip title="Reset to defaults">
            <IconButton onClick={reset} aria-label="Reset">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Source">
            <IconButton
              component="a"
              href="https://github.com/Jboling/qr-code-generator"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, flex: 1 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 2, md: 3 }}
          alignItems="flex-start"
        >
          <Stack spacing={{ xs: 2, md: 3 }} flex={1} width="100%">
            <Section title="Content" description="What should the QR code point to?">
              <ContentEditor content={content} onChange={setContent} />
            </Section>

            <Section title="Style" description="Shapes, colors, and error correction.">
              <StyleEditor style={style} onChange={setStyle} />
            </Section>

            <Section
              title="Logo"
              description="Drop an image into the center. Works best with an error correction level of Q or H."
            >
              <LogoEditor logo={logo} onChange={setLogo} />
            </Section>

            <Section
              title="3D Printing"
              description="Export a slicer-friendly SVG with square modules and a configurable quiet zone."
            >
              <Print3dExporter
                data={data}
                errorCorrection={style.errorCorrection}
                logo={logo}
                filenameBase={filenameBase}
              />
            </Section>
          </Stack>

          <Box
            sx={{
              width: { xs: '100%', md: 380 },
              position: { md: 'sticky' },
              top: { md: 88 },
            }}
          >
            <Paper sx={{ p: 3 }}>
              <Stack spacing={3} alignItems="stretch">
                <Stack alignItems="center" spacing={1}>
                  <Typography variant="overline" color="text.secondary">
                    Preview
                  </Typography>
                  <QrPreview data={data} style={style} logo={logo} />
                  {!data && (
                    <Typography variant="caption" color="text.secondary">
                      Add content to see your QR code.
                    </Typography>
                  )}
                </Stack>
                <ExportBar
                  data={data}
                  style={style}
                  logo={logo}
                  exportConfig={exportConfig}
                  onExportConfigChange={setExportConfig}
                  filenameBase={filenameBase}
                />
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          textAlign: 'center',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Everything runs locally in your browser · Built with{' '}
          <Link href="https://mui.com/" target="_blank" rel="noreferrer">
            MUI
          </Link>{' '}
          and{' '}
          <Link
            href="https://qr-code-styling.com/"
            target="_blank"
            rel="noreferrer"
          >
            qr-code-styling
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Stack>
      {children}
    </Paper>
  );
}
