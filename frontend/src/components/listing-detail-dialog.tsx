import { useState, type ReactNode } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Wallet,
  Sparkles,
  User,
  Gift,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Listing, formatRange } from "@/lib/api";

export function ListingDetailDialog({
  listing,
  children,
}: {
  listing: Listing;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [contacted, setContacted] = useState(false);

  const months = (() => {
    const s = new Date(listing.start_date);
    const e = new Date(listing.end_date);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  })();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-success text-success-foreground rounded-full">
              <BadgeCheck className="w-3.5 h-3.5 mr-1" /> Verified Aggie
            </Badge>
          </div>
          <DialogTitle className="font-display text-2xl text-left">
            {listing.address}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/60">
          <DetailRow icon={Wallet} label="Monthly rent" value={`$${listing.rent.toLocaleString()}`} />
          <DetailRow icon={CalendarDays} label="Dates" value={formatRange(listing.start_date, listing.end_date)} />
          <DetailRow icon={User} label="Listed by" value={listing.tenant_name} />
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent grid place-items-center">
              <Gift className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold">Tenant incentive</h3>
          </div>
          <div className="bg-accent/40 border border-accent rounded-lg p-4 space-y-2">
            <p className="text-sm">
              <span className="font-semibold">${listing.incentive_amount?.toLocaleString()}</span>/mo offered to reduce your rent for {months} months.
            </p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Locked in Solana escrow wallet:</p>
              <p className="text-xs font-mono break-all">{listing.escrow_wallet}</p>
              <a
                href={`https://explorer.solana.com/address/${listing.escrow_wallet}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline"
              >
                View on Solana Explorer →
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold grid place-items-center">
              <Sparkles className="w-4 h-4 text-accent-gold-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold">AI lease summary</h3>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {listing.lease_summary.split("\n").filter(line => line.trim()).map((line, i) => {
              const colonIndex = line.indexOf(":");
              if (colonIndex !== -1) {
                const label = line.slice(0, colonIndex).trim();
                const content = line.slice(colonIndex + 1).trim();
                return (
                  <div key={i} className="bg-accent/40 border border-accent rounded-lg p-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">{label}</div>
                    <div className="text-sm leading-relaxed">{content}</div>
                  </div>
                );
              }
              return <p key={i} className="text-sm leading-relaxed text-muted-foreground">{line}</p>;
            })}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1 rounded-full" onClick={() => setOpen(false)}>
            Close
          </Button>
          {contacted ? (
            <div className="flex-1 text-center text-sm text-success font-medium py-2">
              We've emailed the tenant — they'll get back to you shortly!
            </div>
          ) : (
            <Button className="flex-1 rounded-full" onClick={() => setContacted(true)}>Contact Aggie</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-accent grid place-items-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
