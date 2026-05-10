import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Show, UserButton } from "@clerk/tanstack-react-start";
import { SignInDialog } from "@/components/sign-in-dialog";
import { ListingDetailDialog } from "@/components/listing-detail-dialog";
import { getListings, formatRange, type Listing } from "@/lib/api";
import {
  ShieldCheck,
  Sparkles,
  FileText,
  CheckCircle2,
  Lock,
  GraduationCap,
  ArrowRight,
  BadgeCheck,
  MapPin,
  Bed,
  Bath,
  User,
} from "lucide-react";
import heroImg from "@/assets/hero-apartment.jpg";
import listing1 from "@/assets/listing-1.jpg";
import listing2 from "@/assets/listing-2.jpg";
import listing3 from "@/assets/listing-3.jpg";
import listing4 from "@/assets/listing-4.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SubletSafe — Verified UC Davis Sublease Marketplace" },
      {
        name: "description",
        content:
          "Verified UC Davis sublets with AI-powered lease summaries, escrow-protected deposits, and rent discounts. The safer way to sublease in Davis.",
      },
      { property: "og:title", content: "SubletSafe — UC Davis Sublease Marketplace" },
      {
        property: "og:description",
        content: "AI lease summaries. Verified Aggies. Escrow-protected. Built for Davis summer subleases.",
      },
    ],
  }),
});

const listings = [
  {
    img: listing1,
    title: "Sunny 1BR near the Quad",
    address: "8th & B St · 0.4 mi to campus",
    price: 1450,
    discount: 200,
    beds: 1,
    baths: 1,
    dates: "Jun 15 – Sep 1",
  },
  {
    img: listing2,
    title: "Private Room in 3BR House",
    address: "Russell Park · 1.1 mi to campus",
    price: 875,
    discount: 150,
    beds: 1,
    baths: 1,
    dates: "Jun 20 – Aug 25",
  },
  {
    img: listing3,
    title: "Modern Studio with Pool",
    address: "The Drake · 0.8 mi to campus",
    price: 1620,
    discount: 0,
    beds: 1,
    baths: 1,
    dates: "Jul 1 – Sep 15",
  },
  {
    img: listing4,
    title: "Cozy Room, Bike-Ready",
    address: "Sycamore Lane · on the bike path",
    price: 720,
    discount: 100,
    beds: 1,
    baths: 1.5,
    dates: "Jun 10 – Aug 30",
  },
];

function Nav() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/75 border-b border-border/60">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <a href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-hero grid place-items-center shadow-glow">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">SubletSafe</span>
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#listings" className="hover:text-foreground transition">Browse</a>
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="#trust" className="hover:text-foreground transition">Trust & Safety</a>
        </div>
        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInDialog>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Log In
              </Button>
            </SignInDialog>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
          <Button size="sm" className="rounded-full" asChild>
            <Link to="/list">List your sublet</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-soft" />
      <div className="container mx-auto px-6 pt-16 pb-24 lg:pt-24 lg:pb-32 relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-7">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> Built for UC Davis Aggies
            </Badge>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.02]">
              Sublease in Davis.{" "}
              <span className="italic text-primary">Without the guesswork.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              AI reads the full lease and tells you exactly what you're signing — in plain English.
              Verified Aggies, escrow-held deposits, and real rent discounts on hard-to-fill places.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button size="lg" className="rounded-full h-12 px-7 text-base shadow-elegant" asChild>
                <a href="#listings">
                  Find a sublet <ArrowRight className="ml-1 w-4 h-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-12 px-7 text-base" asChild>
                <Link to="/list">List yours in 2 min</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-success" /> .ucdavis.edu verified</div>
              <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-success" /> Escrow protected</div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-elegant">
              <img
                src={heroImg}
                alt="Modern Davis student apartment at golden hour"
                width={1536}
                height={1024}
                className="w-full h-[460px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
            </div>
            {/* Floating AI summary card */}
            <Card className="absolute -bottom-8 -left-4 lg:-left-10 max-w-xs p-4 shadow-elegant border-0 bg-card/95 backdrop-blur">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-gold grid place-items-center">
                  <Sparkles className="w-3.5 h-3.5 text-accent-gold-foreground" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Lease Summary</span>
              </div>
              <p className="text-sm leading-relaxed">
                <span className="font-semibold">No pets allowed.</span> Utilities included up to $80/mo. Early
                termination requires landlord approval.
              </p>
            </Card>
            {/* Floating discount badge */}
            <div className="absolute -top-4 -right-2 lg:-right-6 bg-gradient-gold text-accent-gold-foreground rounded-2xl px-4 py-3 shadow-glow rotate-3">
              <div className="text-xs font-medium opacity-80">Tenant covers</div>
              <div className="font-display text-2xl font-bold">$200/mo</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: "Upload your lease",
      desc: "Drop your PDF. We never share it without your permission.",
    },
    {
      icon: Sparkles,
      title: "AI summarizes it",
      desc: "Plain-English breakdown of rent, rules, deposits, and gotchas — in seconds.",
    },
    {
      icon: ShieldCheck,
      title: "Match safely",
      desc: "Both sides verified by .ucdavis.edu. Deposits held in escrow until move-in.",
    },
  ];
  return (
    <section id="how" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="secondary" className="rounded-full mb-4">How it works</Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Subleasing, finally <span className="italic text-primary">honest.</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Three steps replace a week of Facebook DMs and screenshot lease photos.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <Card key={s.title} className="p-8 border-border/60 shadow-card hover:shadow-elegant transition-shadow group">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-hero grid place-items-center shadow-glow">
                  <s.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display text-3xl font-bold text-muted-foreground/40">0{i + 1}</span>
              </div>
              <h3 className="font-display text-2xl font-semibold mb-2">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ListingCard({ l }: { l: (typeof listings)[number] }) {
  return (
    <Card className="overflow-hidden border-border/60 shadow-card hover:shadow-elegant transition-all hover:-translate-y-1 group p-0">
      <div className="relative">
        <img
          src={l.img}
          alt={l.title}
          width={800}
          height={600}
          loading="lazy"
          className="w-full h-56 object-cover"
        />
        {l.discount > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-gold text-accent-gold-foreground rounded-full px-3 py-1.5 text-xs font-bold shadow-glow flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> ${l.discount}/mo off
          </div>
        )}
        <div className="absolute top-3 right-3 bg-card/95 backdrop-blur rounded-full px-2.5 py-1 text-xs font-semibold flex items-center gap-1">
          <BadgeCheck className="w-3.5 h-3.5 text-success" /> Verified
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold mb-1">{l.title}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="w-3.5 h-3.5" /> {l.address}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {l.beds} bed</span>
          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {l.baths} bath</span>
          <span>{l.dates}</span>
        </div>
        <div className="flex items-end justify-between pt-3 border-t border-border/60">
          <div>
            {l.discount > 0 ? (
              <>
                <div className="text-xs text-muted-foreground line-through">${l.price}/mo</div>
                <div className="font-display text-2xl font-bold text-primary">
                  ${l.price - l.discount}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
              </>
            ) : (
              <div className="font-display text-2xl font-bold text-primary">
                ${l.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
              </div>
            )}
          </div>
          <Button size="sm" variant="outline" className="rounded-full">View lease</Button>
        </div>
      </div>
    </Card>
  );
}

function RealListingCard({ listing }: { listing: Listing }) {
  return (
    <ListingDetailDialog listing={listing}>
      <Card className="overflow-hidden border-border/60 shadow-card hover:shadow-elegant transition-all hover:-translate-y-1 cursor-pointer group p-0">
        <div className="relative">
          <img
            src={listing1}
            alt={listing.address}
            width={800}
            height={600}
            loading="lazy"
            className="w-full h-56 object-cover"
          />
          <div className="absolute top-3 left-3 bg-gradient-gold text-accent-gold-foreground rounded-full px-3 py-1.5 text-xs font-bold shadow-glow flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI summary ready
          </div>
          <div className="absolute top-3 right-3 bg-card/95 backdrop-blur rounded-full px-2.5 py-1 text-xs font-semibold flex items-center gap-1">
            <BadgeCheck className="w-3.5 h-3.5 text-success" /> Verified
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg font-semibold mb-1 truncate">{listing.address}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <User className="w-3.5 h-3.5" /> {listing.tenant_name}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span>{formatRange(listing.start_date, listing.end_date)}</span>
          </div>
          <div className="flex items-end justify-between pt-3 border-t border-border/60">
            <div className="font-display text-2xl font-bold text-primary">
              ${listing.rent.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </div>
            <Button size="sm" variant="outline" className="rounded-full">View lease</Button>
          </div>
        </div>
      </Card>
    </ListingDetailDialog>
  );
}

function Listings() {
  const { data: realListings } = useQuery({
    queryKey: ["listings"],
    queryFn: getListings,
    staleTime: 0,
  });
  const mostRecent = realListings?.[0];
  // Show the most recent real listing first (if any), then fillers from the
  // hardcoded array. Total cards stays at 4.
  const fillers = mostRecent ? listings.slice(0, 3) : listings;

  return (
    <section id="listings" className="py-24">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <Badge variant="secondary" className="rounded-full mb-3">Featured listings</Badge>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Open this summer in Davis</h2>
          </div>
          <Button variant="ghost" className="rounded-full">View all <ArrowRight className="ml-1 w-4 h-4" /></Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mostRecent && <RealListingCard key={mostRecent.id} listing={mostRecent} />}
          {fillers.map((l) => <ListingCard key={l.title} l={l} />)}
        </div>
      </div>
    </section>
  );
}

function AISummaryShowcase() {
  const items = [
    { label: "Monthly rent", value: "$1,450 (utilities incl. up to $80)" },
    { label: "Lease term", value: "Aug 15, 2024 → Aug 14, 2025" },
    { label: "Security deposit", value: "$1,450 — refundable, held in escrow" },
    { label: "Pets", value: "Not allowed" },
    { label: "Subletting", value: "Permitted with written landlord consent" },
    { label: "Early termination", value: "60-day notice + 1 month penalty" },
  ];
  return (
    <section className="py-24 bg-gradient-soft">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <Badge variant="secondary" className="rounded-full mb-4">
            <Sparkles className="w-3 h-3 mr-1" /> AI Lease Transparency
          </Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-5">
            Read 40 pages in <span className="italic text-primary">40 seconds.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Every listing comes with an AI-generated lease summary so you know the rules, costs, and
            commitments before you commit. No more screenshots. No more surprises.
          </p>
          <ul className="space-y-3">
            {["Rent, fees, and what's actually included", "Deposit terms and refund timeline", "Subletting rules and landlord requirements", "Hidden penalties and end-of-lease gotchas"].map(
              (t) => (
                <li key={t} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                  <span>{t}</span>
                </li>
              )
            )}
          </ul>
        </div>

        <Card className="p-6 shadow-elegant border-border/60">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-gold grid place-items-center">
                <Sparkles className="w-4 h-4 text-accent-gold-foreground" />
              </div>
              <div>
                <div className="font-semibold text-sm">Lease_8thStreet.pdf</div>
                <div className="text-xs text-muted-foreground">Analyzed in 38s · 12 pages</div>
              </div>
            </div>
            <Badge className="bg-success text-success-foreground rounded-full">Verified</Badge>
          </div>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.label} className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-muted-foreground font-medium">{item.label}</div>
                <div className="col-span-2 font-medium">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-xl bg-accent/60 border border-accent">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5" />
              <p className="text-sm leading-relaxed">
                <span className="font-semibold">Heads up:</span> Lease requires written landlord
                consent for subletting. We'll help you submit the request.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function Trust() {
  const items = [
    { icon: GraduationCap, title: ".ucdavis.edu verified", desc: "Both tenant and subletter prove they're real Aggies before any money moves." },
    { icon: Lock, title: "Escrow-held deposits", desc: "Funds are held safely until you confirm move-in. No wires, no Venmo regret." },
    { icon: ShieldCheck, title: "Real lease, every time", desc: "Listings require an uploaded lease — no more fake photos or vague details." },
  ];
  return (
    <section id="trust" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="secondary" className="rounded-full mb-4">Trust & Safety</Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Built like Davis deserves.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((it) => (
            <Card key={it.title} className="p-7 border-border/60 shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-accent grid place-items-center mb-5">
                <it.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{it.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{it.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="pb-24">
      <div className="container mx-auto px-6">
        <div className="relative rounded-3xl bg-gradient-hero p-12 md:p-16 text-center shadow-elegant overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent-gold/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Ready to get out of your lease?
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
              List in two minutes. Add a rent discount to fill it faster. Get verified Aggie
              applicants — not strangers.
            </p>
            <Button size="lg" className="rounded-full bg-gradient-gold text-accent-gold-foreground hover:opacity-90 h-12 px-8 text-base shadow-glow border-0" asChild>
              <Link to="/list">List your sublet free</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="container mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-hero grid place-items-center">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground">SubletSafe</span>
          <span>· Made by Aggies, for Aggies.</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Listings />
        <AISummaryShowcase />
        <Trust />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
