import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { mapText, type MapLocale } from '@/i18n/map';

export function ShareMapDialog({ getUrl, locale = "es" }: { getUrl: () => string; locale?: MapLocale }) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setError(false); }
    catch { setError(true); }
  }
  return <>
    <Button variant="secondary" size="sm" title={mapText(locale, "scenario.share")} onClick={() => { setUrl(getUrl()); setCopied(false); setError(false); }}><Share2 className="h-4 w-4" /><span>{mapText(locale, "scenario.shareButton")}</span></Button>
    <Dialog open={Boolean(url)} onOpenChange={open => { if (!open) setUrl(''); }}>
      <DialogContent aria-describedby={undefined} className="max-w-[min(32rem,calc(100vw-2rem))]">
        <DialogTitle>{mapText(locale, "scenario.share")}</DialogTitle>
        <Input aria-label={mapText(locale, "share.linkLabel")} readOnly value={url} onFocus={e => e.currentTarget.select()} />
        <Button onClick={copy}>{copied ? <Check /> : <Copy />}{copied ? mapText(locale, "share.copied") : mapText(locale, "share.copyLink")}</Button>
        <p role="status" className="text-sm text-muted-foreground">{error ? mapText(locale, "share.copyError") : copied ? mapText(locale, "share.copiedStatus") : ""}</p>
      </DialogContent>
    </Dialog>
  </>;
}
