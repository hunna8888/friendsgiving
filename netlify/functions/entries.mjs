import { randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";

const categories = ["Main dish", "Side dish", "Dessert", "Drinks", "Other"];
const clean = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : "";
const json = (body, status = 200, headers = {}) => Response.json(body, {
  status,
  headers: { "Cache-Control": "no-store", ...headers },
});

function validate(value) {
  const kind = clean(value?.kind, 12);
  const name = clean(value?.name, 70);
  const status = clean(value?.status, 20);
  const detail = clean(value?.detail, 250);
  const category = clean(value?.category, 30);
  if (!name) return null;

  if (kind === "rsvp" && ["Going", "Not going"].includes(status)) {
    return { kind, name, status, detail, category: "" };
  }
  if (kind === "food" && detail && categories.includes(category)) {
    return { kind, name, status: "", detail, category };
  }
  return null;
}

export default async function entries(request) {
  if (request.method === "GET") {
    try {
      const store = getStore({ name: "friendsgiving-entries", consistency: "strong" });
      const records = [];
      for await (const page of store.list({ paginate: true })) {
        // Limit the number of simultaneous reads for larger guest lists.
        for (let offset = 0; offset < page.blobs.length; offset += 25) {
          const batch = page.blobs.slice(offset, offset + 25);
          const values = await Promise.all(batch.map(({ key }) => store.get(key, { type: "json" })));
          records.push(...values.filter(Boolean));
        }
      }
      return json(records.sort((a, b) => b.created - a.created || a.id.localeCompare(b.id)));
    } catch (error) {
      console.error("Friendsgiving entries read failed", error.name);
      return json({ error: "Could not load the list. Please try again." }, 500);
    }
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405, { Allow: "GET, POST" });
  }

  let entry;
  try {
    const body = await request.text();
    if (body.length > 8192) return json({ error: "Submission is too large." }, 413);
    entry = validate(JSON.parse(body));
  } catch {
    return json({ error: "Invalid submission." }, 400);
  }
  if (!entry) return json({ error: "Please complete the required fields." }, 400);

  try {
    const store = getStore({ name: "friendsgiving-entries", consistency: "strong" });
    const record = { ...entry, id: randomUUID(), created: Date.now() };
    await store.setJSON(record.id, record);
    return json({ ok: true });
  } catch (error) {
    console.error("Friendsgiving entry write failed", error.name);
    return json({ error: "Your submission could not be saved. Please try again." }, 500);
  }
}
