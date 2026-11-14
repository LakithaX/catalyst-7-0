import React, { useEffect, useState } from "react";
import { Link2, Plus, Save, Trash2 } from "lucide-react";
import { errorMessage, requireSupabase } from "../lib/supabase";
import "./admin-partnerships.css";

type PartnerCard = { name: string; logo?: string; url?: string };
type PartnershipContent = {
  title: string;
  intro: string;
  presenting: PartnerCard & { blurb: string };
  partners: PartnerCard[];
  cta_label: string;
  cta_url: string;
};

const INITIAL_CONTENT: PartnershipContent = {
  title: "PARTNERSHIP ANNOUNCEMENT",
  intro: "The organisations walking with us towards Catalyst 7.0.",
  presenting: {
    name: "TO BE ANNOUNCED",
    blurb: "Our presenting partner stands beside Catalyst 7.0 from the first day to the last. Their name will be revealed soon.",
    logo: "",
    url: "",
  },
  partners: [],
  cta_label: "Become a partner",
  cta_url: "#contact",
};

export default function AdminPartnerships({ readOnly = true }: { readOnly?: boolean }) {
  const [content, setContent] = useState(INITIAL_CONTENT);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { data, error: loadError } = await requireSupabase()
          .from("partnership_settings")
          .select("content")
          .eq("id", true)
          .single();
        if (loadError) throw loadError;
        if (!cancelled && data?.content) {
          const saved = data.content as Partial<PartnershipContent>;
          setContent({
            title: saved.title ?? INITIAL_CONTENT.title,
            intro: saved.intro ?? INITIAL_CONTENT.intro,
            presenting: { ...INITIAL_CONTENT.presenting, ...saved.presenting },
            partners: Array.isArray(saved.partners) ? saved.partners : INITIAL_CONTENT.partners,
            cta_label: saved.cta_label ?? INITIAL_CONTENT.cta_label,
            cta_url: saved.cta_url ?? INITIAL_CONTENT.cta_url,
          });
        }
      } catch (cause) {
        if (!cancelled) setError(`${errorMessage(cause)} Apply migration 202611100001_partnership_announcements.sql if this table is missing.`);
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const updatePresenting = (key: keyof PartnershipContent["presenting"], value: string) =>
    setContent(current => ({ ...current, presenting: { ...current.presenting, [key]: value } }));

  const updatePartner = (index: number, key: keyof PartnerCard, value: string) =>
    setContent(current => ({
      ...current,
      partners: current.partners.map((partner, i) => i === index ? { ...partner, [key]: value } : partner),
    }));

  const uploadLogo = async (file: File | undefined, index: number | null) => {
    if (!file || readOnly || uploading || saving) return;
    setError(""); setMessage("");
    const extensions: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
    if (!extensions[file.type] || file.size < 1 || file.size > 2 * 1024 * 1024) {
      setError('Choose a PNG, JPEG or WebP logo up to 2 MB.'); return;
    }
    setUploading(true);
    try {
      // Decode locally before publishing the image to public storage.
      const bitmap = await createImageBitmap(file);
      bitmap.close();
      const db = requireSupabase();
      const { data: auth, error: authError } = await db.auth.getUser();
      if (authError || !auth.user) throw new Error('Sign in before uploading a logo.');
      const key = `${auth.user.id}/${crypto.randomUUID()}.${extensions[file.type]}`;
      const { error: uploadError } = await db.storage.from('partner-logos').upload(key, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data } = db.storage.from('partner-logos').getPublicUrl(key);
      if (index === null) updatePresenting('logo', data.publicUrl);
      else updatePartner(index, 'logo', data.publicUrl);
      setMessage('Logo uploaded. Click Save and publish to update the homepage.');
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setUploading(false); }
  };

  const logoUpload = (logo: string | undefined, index: number | null) => <div className="admin-partner-logo-upload">
    {logo && <img src={logo} alt={index === null ? 'Featured partner logo preview' : `Partner card ${index + 1} logo preview`} />}
    {!readOnly && <label>Upload logo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => {
      const file = event.target.files?.[0]; event.target.value = ''; void uploadLogo(file, index);
    }} /><small>PNG, JPEG or WebP, up to 2 MB. Uploaded images are public.</small></label>}
  </div>;

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (readOnly || saving || uploading) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const { error: saveError } = await requireSupabase().rpc("admin_save_partnerships", { p_content: content });
      if (saveError) throw saveError;
      setMessage("Partnership announcement saved and published on the homepage.");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-partnerships">
      <div className="admin-partnerships-intro">
        <div>
          <p className="admin-eyebrow">HOMEPAGE CONTENT</p>
          <h2>Partnership announcement</h2>
          <p>Build the featured announcement and partner cards shown on the public homepage.</p>
        </div>
        <span className="admin-partnerships-count">{content.partners.length} / 12 cards</span>
      </div>

      {message && <p className="admin-partnerships-message" role="status">{message}</p>}
      {error && <p className="admin-partnerships-error" role="alert">{error}</p>}

      {busy ? <p className="admin-partnerships-loading" role="status">Loading announcement…</p> : (
        <form className="admin-partnerships-form" onSubmit={save}>
          <fieldset disabled={readOnly || uploading || saving} style={{border:0,padding:0,margin:0,minWidth:0,display:'contents'}}>
          <section className="admin-partnerships-panel">
            <div className="admin-partnerships-panel-heading">
              <div><h3>Section heading</h3><p>Set the title and supporting line above the cards.</p></div>
            </div>
            <div className="admin-partnerships-fields">
              <label>Section title<input required maxLength={100} value={content.title} onChange={e => setContent({ ...content, title: e.target.value })} /></label>
              <label>Supporting text<textarea required rows={3} maxLength={500} value={content.intro} onChange={e => setContent({ ...content, intro: e.target.value })} /></label>
            </div>
          </section>

          <section className="admin-partnerships-panel">
            <div className="admin-partnerships-panel-heading">
              <div><h3>Featured announcement card</h3><p>This large card appears above the partner cards.</p></div>
            </div>
            <div className="admin-partnerships-fields">
              <label>Partner name<input required maxLength={120} value={content.presenting.name} onChange={e => updatePresenting("name", e.target.value)} /></label>
              {logoUpload(content.presenting.logo, null)}
              <label>Website URL<input maxLength={500} placeholder="https://…" value={content.presenting.url || ""} onChange={e => updatePresenting("url", e.target.value)} /></label>
              <label className="wide">Announcement text<textarea required rows={3} maxLength={800} value={content.presenting.blurb} onChange={e => updatePresenting("blurb", e.target.value)} /></label>
            </div>
          </section>

          <section className="admin-partnerships-panel">
            <div className="admin-partnerships-panel-heading">
              <div><h3>Partner cards</h3><p>Add up to 12 logos or names to the Current Partners grid.</p></div>
              {!readOnly && <button
                className="admin-partnerships-add"
                type="button"
                disabled={content.partners.length >= 12}
                onClick={() => setContent(current => ({ ...current, partners: [...current.partners, { name: "", logo: "", url: "" }] }))}
              ><Plus size={16} /> Add card</button>}
            </div>
            {!content.partners.length && <p className="admin-partnerships-empty">No partner cards yet. Add a card to announce a partner on the homepage.</p>}
            <div className="admin-partner-card-list">
              {content.partners.map((partner, index) => (
                <article className="admin-partner-editor" key={index}>
                  <div className="admin-partner-editor-top">
                    <strong>Partner card {index + 1}</strong>
                    {!readOnly && <button type="button" className="admin-partnerships-remove" aria-label={`Remove partner card ${index + 1}`} onClick={() => setContent(current => ({ ...current, partners: current.partners.filter((_, i) => i !== index) }))}><Trash2 size={16} /> Remove</button>}
                  </div>
                  <div className="admin-partnerships-fields">
                    <label>Partner name<input required maxLength={120} value={partner.name} onChange={e => updatePartner(index, "name", e.target.value)} /></label>
                    {logoUpload(partner.logo, index)}
                    <label><span><Link2 size={14} /> Website URL</span><input maxLength={500} placeholder="https://…" value={partner.url || ""} onChange={e => updatePartner(index, "url", e.target.value)} /></label>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-partnerships-panel">
            <div className="admin-partnerships-panel-heading">
              <div><h3>Partnership call to action</h3><p>Choose the button text and destination.</p></div>
            </div>
            <div className="admin-partnerships-fields">
              <label>Button text<input required maxLength={80} value={content.cta_label} onChange={e => setContent({ ...content, cta_label: e.target.value })} /></label>
              <label>Button link<input required maxLength={500} placeholder="#contact or https://…" value={content.cta_url} onChange={e => setContent({ ...content, cta_url: e.target.value })} /></label>
            </div>
          </section>

          </fieldset>
          {!readOnly && <div className="admin-partnerships-actions">
            <span>Upload partner logos, then save and publish when ready.</span>
            <button type="submit" disabled={saving || uploading || content.partners.some(partner => !partner.name.trim())}><Save size={16} />{uploading ? "Uploading logo…" : saving ? "Saving…" : "Save and publish"}</button>
          </div>}
        </form>
      )}
    </section>
  );
}
