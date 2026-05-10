import { useState } from "react";
import { Sparkles, Upload, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BACKEND_URL = "http://127.0.0.1:8000";
const SOL_PRICE_USD = 93.41;

type Result = {
  id: string;
  lease_summary: string;
  escrow_wallet: string;
  incentive_amount: number;
  total_incentive: number;
  solana_explorer: string;
};

function monthsBetween(start: string, end: string): number | null {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) return null;
  return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
}

export function ListSubletForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [incentiveAmount, setIncentiveAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("payment_method", "solana");
      formData.set("venmo_handle", "N/A");
      formData.set("total_incentive", String(totalIncentive ?? 0));
      const res = await fetch(`${BACKEND_URL}/listings`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as Result;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const months = monthsBetween(startDate, endDate);
  const perMonth = parseFloat(incentiveAmount) || 0;
  const totalIncentive = months && perMonth ? perMonth * months : null;
  const solEquivalent = totalIncentive ? (totalIncentive / SOL_PRICE_USD).toFixed(3) : null;

  if (result) return <LeaseSummary result={result} onReset={() => setResult(null)} />;

  return (
    <Card className="p-8 border-border/60 shadow-elegant max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="tenant_name">Your name</Label>
          <Input id="tenant_name" name="tenant_name" required placeholder="Aggie Adams" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" required placeholder="123 8th St, Davis, CA" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rent">Monthly rent ($)</Label>
          <Input id="rent" name="rent" type="number" min="0" step="1" required placeholder="1450" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start date</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">End date</Label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="incentive_amount">
            Monthly incentive ($ / month)
          </Label>
          <Input
            id="incentive_amount"
            name="incentive_amount"
            type="number"
            min="0"
            step="1"
            required
            placeholder="200"
            value={incentiveAmount}
            onChange={(e) => setIncentiveAmount(e.target.value)}
          />
          {totalIncentive && months ? (
            <p className="text-xs text-muted-foreground">
              ${perMonth} × {months} months = <span className="font-semibold text-foreground">${totalIncentive.toLocaleString()}</span>
              {solEquivalent && <span className="ml-1">(≈ {solEquivalent} SOL)</span>} locked in escrow.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Set your start and end dates to see the total incentive.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lease_file">Lease (PDF)</Label>
          <Input
            id="lease_file"
            name="lease_file"
            type="file"
            accept="application/pdf"
            required
            className="file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-accent file:text-accent-foreground file:cursor-pointer"
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Upload className="w-3 h-3" /> We'll auto-summarize it with AI.
          </p>
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" size="lg" disabled={submitting} className="w-full rounded-full">
          {submitting ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              Analyzing lease…
            </>
          ) : (
            "List my sublet"
          )}
        </Button>
      </form>
    </Card>
  );
}

function LeaseSummary({ result, onReset }: { result: Result; onReset: () => void }) {
  const solEquivalent = (result.total_incentive / SOL_PRICE_USD).toFixed(3);

  return (
    <Card className="p-8 border-border/60 shadow-elegant max-w-2xl mx-auto">
      <div className="flex items-center gap-3 pb-5 mb-5 border-b border-border/60">
        <div className="w-11 h-11 rounded-xl bg-gradient-gold grid place-items-center">
          <CheckCircle2 className="w-5 h-5 text-accent-gold-foreground" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold">Listing created</h2>
          <p className="text-xs text-muted-foreground font-mono">id: {result.id}</p>
        </div>
      </div>

      <div className="space-y-3 pb-5 mb-5 border-b border-border/60">
        <h3 className="font-semibold">Solana escrow</h3>
        <div className="bg-accent/40 border border-accent rounded-lg p-4 space-y-2">
          <p className="text-sm">
            <span className="font-semibold">${result.total_incentive.toLocaleString()}</span>
            <span className="text-muted-foreground ml-1">(≈ {solEquivalent} SOL)</span> locked in escrow.
          </p>
          <p className="text-xs font-mono text-muted-foreground break-all">{result.escrow_wallet}</p>
          <a
            href={result.solana_explorer}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary underline"
          >
            View on Solana Explorer <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">AI lease summary</h3>
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap bg-accent/40 border border-accent rounded-lg p-4">
          {result.lease_summary}
        </div>
      </div>

      <Button variant="outline" onClick={onReset} className="w-full mt-6 rounded-full">
        List another
      </Button>
    </Card>
  );
}
