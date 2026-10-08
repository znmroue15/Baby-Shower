import { getStore } from "@netlify/blobs";

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

export default async (req) => {
  const pw = Netlify.env.get("TRACKER_PASSWORD");
  if (!pw || req.headers.get("x-tracker-key") !== pw) return json({ error: "unauthorized" }, 401);
  const store = getStore("rsvps");

  if (req.method === "GET") {
    const { blobs } = await store.list();
    const items = (await Promise.all(blobs.map(({ key }) => store.get(key, { type: "json" })))).filter(Boolean);
    items.sort((a, b) => a.at - b.at);
    return json({ items });
  }

  if (req.method === "POST") {
    let b; try { b = await req.json(); } catch { return json({ error: "bad" }, 400); }
    const name = String(b.name || "").trim().slice(0, 80);
    const att = b.att === "yes" ? "yes" : "no";
    const guests = att === "yes" ? Math.min(3, Math.max(1, parseInt(b.guests, 10) || 1)) : 0;
    if (!name) return json({ error: "name" }, 400);
    const at = Date.now();
    const id = `${at}-${crypto.randomUUID().slice(0, 8)}`;
    await store.setJSON(id, { id, name, att, guests, note: String(b.note || "").trim().slice(0, 300), at });
    return json({ ok: true });
  }

  if (req.method === "DELETE") {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return json({ error: "id" }, 400);
    await store.delete(id);
    return json({ ok: true });
  }
  return json({ error: "method" }, 405);
};

export const config = { path: "/api/admin" };
