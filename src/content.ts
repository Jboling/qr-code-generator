import type { QrContent } from './types';

const esc = (value: string): string =>
  value.replace(/([\\;,":])/g, '\\$1');

const mecardEsc = (value: string): string =>
  value.replace(/([\\;,:"])/g, '\\$1');

export function buildQrData(content: QrContent): string {
  switch (content.type) {
    case 'url': {
      const url = content.url.trim();
      if (!url) return '';
      if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) return url;
      return `https://${url}`;
    }
    case 'text':
      return content.text;
    case 'email': {
      const to = content.to.trim();
      if (!to) return '';
      const params = new URLSearchParams();
      if (content.subject) params.set('subject', content.subject);
      if (content.body) params.set('body', content.body);
      const qs = params.toString();
      return `mailto:${to}${qs ? `?${qs}` : ''}`;
    }
    case 'phone':
      return content.phone.trim() ? `tel:${content.phone.trim()}` : '';
    case 'sms': {
      const phone = content.phone.trim();
      if (!phone) return '';
      return content.message
        ? `SMSTO:${phone}:${content.message}`
        : `sms:${phone}`;
    }
    case 'wifi': {
      if (!content.ssid) return '';
      const parts = [
        `T:${content.encryption}`,
        `S:${esc(content.ssid)}`,
      ];
      if (content.encryption !== 'nopass') {
        parts.push(`P:${esc(content.password)}`);
      }
      if (content.hidden) parts.push('H:true');
      return `WIFI:${parts.join(';')};;`;
    }
    case 'vcard': {
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${mecardEsc(content.lastName)};${mecardEsc(content.firstName)}`,
        `FN:${mecardEsc(`${content.firstName} ${content.lastName}`.trim())}`,
      ];
      if (content.organization) lines.push(`ORG:${mecardEsc(content.organization)}`);
      if (content.title) lines.push(`TITLE:${mecardEsc(content.title)}`);
      if (content.phone) lines.push(`TEL:${mecardEsc(content.phone)}`);
      if (content.email) lines.push(`EMAIL:${mecardEsc(content.email)}`);
      if (content.url) lines.push(`URL:${mecardEsc(content.url)}`);
      if (content.address) lines.push(`ADR:;;${mecardEsc(content.address)};;;;`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }
    case 'geo': {
      const lat = content.lat.trim();
      const lng = content.lng.trim();
      if (!lat || !lng) return '';
      return `geo:${lat},${lng}`;
    }
  }
}

export function defaultContentFor(type: QrContent['type']): QrContent {
  switch (type) {
    case 'url':
      return { type: 'url', url: 'https://example.com' };
    case 'text':
      return { type: 'text', text: '' };
    case 'email':
      return { type: 'email', to: '', subject: '', body: '' };
    case 'phone':
      return { type: 'phone', phone: '' };
    case 'sms':
      return { type: 'sms', phone: '', message: '' };
    case 'wifi':
      return {
        type: 'wifi',
        ssid: '',
        password: '',
        encryption: 'WPA',
        hidden: false,
      };
    case 'vcard':
      return {
        type: 'vcard',
        firstName: '',
        lastName: '',
        organization: '',
        title: '',
        phone: '',
        email: '',
        url: '',
        address: '',
      };
    case 'geo':
      return { type: 'geo', lat: '', lng: '' };
  }
}
