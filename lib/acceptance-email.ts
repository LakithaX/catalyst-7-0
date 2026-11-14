import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const acceptanceSubject = 'Your spark has reached us | Catalyst 7.0';
export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}
export function renderAcceptanceEmail(template: string, name: string, reference: string, origin: string) {
  const site = new URL(origin);
  if (site.protocol !== 'https:' || site.username || site.password || site.pathname !== '/' || site.search || site.hash) {
    throw new Error('EMAIL_SITE_URL must be an HTTPS origin');
  }
  const html = template.replaceAll('https://catalyst-7-0.vercel.app', site.origin)
    .replace(/{{\s*(full_name|reference)\s*}}/g, (_, key) => escapeHtml(key === 'full_name' ? name : reference));
  const text = `Your spark has reached us | Catalyst 7.0.\n\nHey ${name},\n\nWe’ve received your interest in Catalyst 7.0. Thank you for taking the first step towards a chapter of bold ideas, new connections, and discovery.\n\nEvery journey begins with a spark of curiosity. Our team will review your details and share the next steps. Until then, keep that spark alive.\n\nYour reference: ${reference}\nKeep this reference handy when contacting the team.\n\nExplore Catalyst: ${site.origin}\nContact the team: ${site.origin}/#contact\n\nUntil the next chapter,\nThe Catalyst 7.0 Team\nAIESEC in SLIIT`;
  return { subject: acceptanceSubject, html, text };
}
export function loadAcceptanceTemplate() {
  return readFileSync(resolve(process.cwd(), 'supabase/templates/registration-accepted.html'), 'utf8');
}
