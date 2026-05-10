export const BACKEND_URL = "http://127.0.0.1:8000";

export type Listing = {
  id: string;
  tenant_name: string;
  address: string;
  rent: number;
  start_date: string;
  end_date: string;
  venmo_handle: string;
  lease_summary: string;
};

export async function getListings(): Promise<Listing[]> {
  const res = await fetch(`${BACKEND_URL}/listings`);
  if (!res.ok) throw new Error(`Failed to load listings: ${res.status}`);
  return res.json();
}

export function formatRange(start: string, end: string): string {
  const fmt = (s: string) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  return `${fmt(start)} – ${fmt(end)}`;
}
