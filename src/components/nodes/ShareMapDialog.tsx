import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useT } from '@/i18n/useT';

export function ShareMapDialog({ getUrl }: { getUrl: () => string }) {
  const t = useT().share;
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setError(false); }
    catch { setError(true); }
  }
  return <>
    <Button variant="secondary" size="sm" title={t.title} onClick={() => { setUrl(getUrl()); setCopied(false); setError(false); }}><Share2 className="h-4 w-4" /><span>{t.button}</span></Button>
    <Dialog open={Boolean(url)} onOpenChange={open => { if (!open) setUrl(''); }}>
      <DialogContent aria-describedby={undefined} className="max-w-[min(32rem,calc(100vw-2rem))]">
        <DialogTitle>{t.title}</DialogTitle>
        <Input aria-label={t.linkAria} readOnly value={url} onFocus={e => e.currentTarget.select()} />
        <Button onClick={copy}>{copied ? <Check /> : <Copy />}{copied ? t.copied : t.copy}</Button>
        <p role="status" className="text-sm text-muted-foreground">{error ? t.error : copied ? t.copiedStatus : ''}</p>
      </DialogContent>
    </Dialog>
  </>;
}
