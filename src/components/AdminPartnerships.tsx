import React, { useEffect, useState } from "react";
import { Image, Link2, Plus, Save, Trash2 } from "lucide-react";
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

export default function AdminPartnerships() {
  const [content, setContent] = useState(INITIAL_CONTENT);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
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
              <label>Logo image URL<input maxLength={500} placeholder="https://… or /assets/partners/logo.webp" value={content.presenting.logo || ""} onChange={e => updatePresenting("logo", e.target.value)} /></label>
              <label>Website URL<input maxLength={500} placeholder="https://…" value={content.presenting.url || ""} onChange={e => updatePresenting("url", e.target.value)} /></label>
              <label className="wide">Announcement text<textarea required rows={3} maxLength={800} value={content.presenting.blurb} onChange={e => updatePresenting("blurb", e.target.value)} /></label>
            </div>
          </section>

          <section className="admin-partnerships-panel">
            <div className="admin-partnerships-panel-heading">
              <div><h3>Partner cards</h3><p>Add up to 12 logos or names to the Current Partners grid.</p></div>
              <button
                className="admin-partnerships-add"
                type="button"
                disabled={content.partners.length >= 12}
                onClick={() => setContent(current => ({ ...current, partners: [...current.partners, { name: "", logo: "", url: "" }] }))}
              ><Plus size={16} /> Add card</button>
            </div>
            {!content.partners.length && <p className="admin-partnerships-empty">No partner cards yet. Add a card to announce a partner on the homepage.</p>}
            <div className="admin-partner-card-list">
              {content.partners.map((partner, index) => (
                <article className="admin-partner-editor" key={index}>
                  <div className="admin-partner-editor-top">
                    <strong>Partner card {index + 1}</strong>
                    <button type="button" className="admin-partnerships-remove" aria-label={`Remove partner card ${index + 1}`} onClick={() => setContent(current => ({ ...current, partners: current.partners.filter((_, i) => i !== index) }))}><Trash2 size={16} /> Remove</button>
                  </div>
                  <div className="admin-partnerships-fields">
                    <label>Partner name<input required maxLength={120} value={partner.name} onChange={e => updatePartner(index, "name", e.target.value)} /></label>
                    <label><span><Image size={14} /> Logo image URL</span><input maxLength={500} placeholder="https://… or /assets/partners/logo.webp" value={partner.logo || ""} onChange={e => updatePartner(index, "logo", e.target.value)} /></label>
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

          <div className="admin-partnerships-actions">
            <span>Logo fields accept a public HTTPS image URL or a file in <code>/public/assets/</code>.</span>
            <button type="submit" disabled={saving || content.partners.some(partner => !partner.name.trim())}><Save size={16} />{saving ? "Saving…" : "Save and publish"}</button>
          </div>
        </form>
      )}
    </section>
  );
}
