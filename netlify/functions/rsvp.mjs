import { getStore } from "@netlify/blobs";

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  let b;
  try { b = await req.json(); } catch { return json({ error: "bad" }, 400); }
  if (b.website) return json({ ok: true }); // honeypot: bots fill this in

  const name = String(b.name || "").trim().slice(0, 80);
  const att = b.att === "yes" ? "yes" : "no";
  const guests = att === "yes" ? parseInt(b.guests, 10) : 0;
  const note = String(b.note || "").trim().slice(0, 300);
  if (!name) return json({ error: "name" }, 400);
  if (att === "yes" && !(guests >= 1 && guests <= 3)) return json({ error: "guests" }, 400);

  const store = getStore("rsvps");
  const at = Date.now();
  const id = `${at}-${crypto.randomUUID().slice(0, 8)}`;
  await store.setJSON(id, { id, name, att, guests, note, at });

  // Email the hosts (never fail the guest's RSVP because of an email problem)
  const apiKey = Netlify.env.get("RESEND_API_KEY");
  const to = Netlify.env.get("NOTIFY_EMAIL");
  if (apiKey && to) {
    try {
      let total = 0, yesCount = 0, noCount = 0;
      const { blobs } = await store.list();
      for (const { key } of blobs) {
        const r = await store.get(key, { type: "json" });
        if (!r) continue;
        if (r.att === "yes") { yesCount++; total += r.guests || 1; } else noCount++;
      }
      const subject = att === "yes"
        ? `RSVP: ${name} is coming (party of ${guests})`
        : `RSVP: ${name} can't make it`;
      const line = att === "yes" ? `${name} will be there, party of ${guests}.` : `${name} can't make it.`;
      const text = `${line}${note ? `\nNote: ${note}` : ""}\n\nSo far: ${total} guests coming (${yesCount} yes, ${noCount} no).`;
      const html = `<p><b>${esc(line)}</b></p>${note ? `<p>Note: ${esc(note)}</p>` : ""}<p>So far: <b>${total}</b> guests coming (${yesCount} yes, ${noCount} no).</p>`;
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: Netlify.env.get("FROM_EMAIL") || "Baby Shower RSVP <onboarding@resend.dev>",
          to: [to], subject, text, html,
        }),
      });
    } catch (e) { console.error("email failed", e); }
  }
  return json({ ok: true });
};

export const config = { path: "/api/rsvp" };
