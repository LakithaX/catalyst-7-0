import { requireSupabase } from './supabase';

export type RegistrationEmailStatus = 'sent' | 'failed' | 'uncertain' | 'unchanged';
export async function dispatchRegistrationEmail(registrationId: string): Promise<RegistrationEmailStatus> {
  const { data, error } = await requireSupabase().auth.getSession();
  if (error || !data.session) throw new Error('Your session expired. Sign in again before sending.');
  const response = await fetch('/api/registration-acceptance', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
    body: JSON.stringify({ registrationId }), signal: AbortSignal.timeout(45000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Could not send the acknowledgement. Refresh its status before retrying.');
  if (!['sent', 'failed', 'uncertain', 'unchanged'].includes(result.status)) throw new Error('Unknown email result. Refresh its status before retrying.');
  return result.status;
}

export async function requestAcceptanceEmail(registrationId: string): Promise<string> {
  try {
    const status = await dispatchRegistrationEmail(registrationId);
    if (status === 'sent') return 'Registration received. Interest acknowledgement sent.';
    if (status === 'failed') return 'Registration received. Email sending failed. Use Retry email to try again.';
    if (status === 'uncertain') return 'Registration received. Email delivery needs checking. Check the Gmail Sent folder before any further send.';
    return 'Registration received. Email already sent, in progress, or unavailable. Check the status below.';
  } catch {
    return 'Registration received. The email request was interrupted. Refresh its status before retrying.';
  }
}
