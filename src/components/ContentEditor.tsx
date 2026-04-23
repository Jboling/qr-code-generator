import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import NotesIcon from '@mui/icons-material/Notes';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SmsIcon from '@mui/icons-material/Sms';
import WifiIcon from '@mui/icons-material/Wifi';
import PersonIcon from '@mui/icons-material/Person';
import PlaceIcon from '@mui/icons-material/Place';

import type {
  ContentType,
  EmailContent,
  GeoContent,
  PhoneContent,
  QrContent,
  SmsContent,
  TextContent,
  UrlContent,
  VCardContent,
  WifiContent,
} from '../types';
import { defaultContentFor } from '../content';

export interface ContentEditorProps {
  content: QrContent;
  onChange: (content: QrContent) => void;
}

const TABS: { value: ContentType; label: string; icon: React.ReactElement }[] = [
  { value: 'url', label: 'URL', icon: <LinkIcon fontSize="small" /> },
  { value: 'text', label: 'Text', icon: <NotesIcon fontSize="small" /> },
  { value: 'email', label: 'Email', icon: <EmailIcon fontSize="small" /> },
  { value: 'phone', label: 'Phone', icon: <PhoneIcon fontSize="small" /> },
  { value: 'sms', label: 'SMS', icon: <SmsIcon fontSize="small" /> },
  { value: 'wifi', label: 'Wi-Fi', icon: <WifiIcon fontSize="small" /> },
  { value: 'vcard', label: 'vCard', icon: <PersonIcon fontSize="small" /> },
  { value: 'geo', label: 'Location', icon: <PlaceIcon fontSize="small" /> },
];

export function ContentEditor({ content, onChange }: ContentEditorProps) {
  const handleTabChange = (_: React.SyntheticEvent, value: ContentType) => {
    if (value !== content.type) {
      onChange(defaultContentFor(value));
    }
  };

  return (
    <Stack spacing={2}>
      <Tabs
        value={content.type}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
          />
        ))}
      </Tabs>
      <Box>
        {content.type === 'url' && (
          <UrlForm content={content} onChange={onChange} />
        )}
        {content.type === 'text' && (
          <TextForm content={content} onChange={onChange} />
        )}
        {content.type === 'email' && (
          <EmailForm content={content} onChange={onChange} />
        )}
        {content.type === 'phone' && (
          <PhoneForm content={content} onChange={onChange} />
        )}
        {content.type === 'sms' && (
          <SmsForm content={content} onChange={onChange} />
        )}
        {content.type === 'wifi' && (
          <WifiForm content={content} onChange={onChange} />
        )}
        {content.type === 'vcard' && (
          <VCardForm content={content} onChange={onChange} />
        )}
        {content.type === 'geo' && (
          <GeoForm content={content} onChange={onChange} />
        )}
      </Box>
    </Stack>
  );
}

interface FormProps<T extends QrContent> {
  content: T;
  onChange: (content: QrContent) => void;
}

function UrlForm({ content, onChange }: FormProps<UrlContent>) {
  return (
    <TextField
      fullWidth
      label="URL"
      placeholder="https://example.com"
      value={content.url}
      onChange={(e) => onChange({ ...content, url: e.target.value })}
      helperText="https:// is added automatically if missing"
    />
  );
}

function TextForm({ content, onChange }: FormProps<TextContent>) {
  return (
    <TextField
      fullWidth
      multiline
      minRows={3}
      maxRows={8}
      label="Plain text"
      value={content.text}
      onChange={(e) => onChange({ ...content, text: e.target.value })}
    />
  );
}

function EmailForm({ content, onChange }: FormProps<EmailContent>) {
  return (
    <Stack spacing={2}>
      <TextField
        fullWidth
        label="Recipient email"
        placeholder="you@example.com"
        value={content.to}
        onChange={(e) => onChange({ ...content, to: e.target.value })}
      />
      <TextField
        fullWidth
        label="Subject"
        value={content.subject}
        onChange={(e) => onChange({ ...content, subject: e.target.value })}
      />
      <TextField
        fullWidth
        multiline
        minRows={2}
        label="Body"
        value={content.body}
        onChange={(e) => onChange({ ...content, body: e.target.value })}
      />
    </Stack>
  );
}

function PhoneForm({ content, onChange }: FormProps<PhoneContent>) {
  return (
    <TextField
      fullWidth
      label="Phone number"
      placeholder="+15555550123"
      value={content.phone}
      onChange={(e) => onChange({ ...content, phone: e.target.value })}
    />
  );
}

function SmsForm({ content, onChange }: FormProps<SmsContent>) {
  return (
    <Stack spacing={2}>
      <TextField
        fullWidth
        label="Phone number"
        placeholder="+15555550123"
        value={content.phone}
        onChange={(e) => onChange({ ...content, phone: e.target.value })}
      />
      <TextField
        fullWidth
        multiline
        minRows={2}
        label="Message"
        value={content.message}
        onChange={(e) => onChange({ ...content, message: e.target.value })}
      />
    </Stack>
  );
}

function WifiForm({ content, onChange }: FormProps<WifiContent>) {
  return (
    <Stack spacing={2}>
      <TextField
        fullWidth
        label="Network name (SSID)"
        value={content.ssid}
        onChange={(e) => onChange({ ...content, ssid: e.target.value })}
      />
      <TextField
        select
        fullWidth
        label="Encryption"
        value={content.encryption}
        onChange={(e) =>
          onChange({
            ...content,
            encryption: e.target.value as WifiContent['encryption'],
          })
        }
      >
        <MenuItem value="WPA">WPA / WPA2 / WPA3</MenuItem>
        <MenuItem value="WEP">WEP</MenuItem>
        <MenuItem value="nopass">No password</MenuItem>
      </TextField>
      {content.encryption !== 'nopass' && (
        <TextField
          fullWidth
          type="password"
          label="Password"
          value={content.password}
          onChange={(e) => onChange({ ...content, password: e.target.value })}
        />
      )}
      <FormControlLabel
        control={
          <Checkbox
            checked={content.hidden}
            onChange={(e) => onChange({ ...content, hidden: e.target.checked })}
          />
        }
        label="Hidden network"
      />
    </Stack>
  );
}

function VCardForm({ content, onChange }: FormProps<VCardContent>) {
  const set = (patch: Partial<VCardContent>) => onChange({ ...content, ...patch });
  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          label="First name"
          value={content.firstName}
          onChange={(e) => set({ firstName: e.target.value })}
        />
        <TextField
          fullWidth
          label="Last name"
          value={content.lastName}
          onChange={(e) => set({ lastName: e.target.value })}
        />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          label="Organization"
          value={content.organization}
          onChange={(e) => set({ organization: e.target.value })}
        />
        <TextField
          fullWidth
          label="Title"
          value={content.title}
          onChange={(e) => set({ title: e.target.value })}
        />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          label="Phone"
          value={content.phone}
          onChange={(e) => set({ phone: e.target.value })}
        />
        <TextField
          fullWidth
          label="Email"
          value={content.email}
          onChange={(e) => set({ email: e.target.value })}
        />
      </Stack>
      <TextField
        fullWidth
        label="Website"
        value={content.url}
        onChange={(e) => set({ url: e.target.value })}
      />
      <TextField
        fullWidth
        label="Address"
        value={content.address}
        onChange={(e) => set({ address: e.target.value })}
      />
    </Stack>
  );
}

function GeoForm({ content, onChange }: FormProps<GeoContent>) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TextField
        fullWidth
        label="Latitude"
        placeholder="37.7749"
        value={content.lat}
        onChange={(e) => onChange({ ...content, lat: e.target.value })}
      />
      <TextField
        fullWidth
        label="Longitude"
        placeholder="-122.4194"
        value={content.lng}
        onChange={(e) => onChange({ ...content, lng: e.target.value })}
      />
    </Stack>
  );
}
