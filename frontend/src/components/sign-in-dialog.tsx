import { useState, type ReactNode } from "react";
import { GraduationCap, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ALLOWED_EMAIL_DOMAIN } from "@/lib/auth-check";

export function SignInDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
      setError(
        `Please use your @${ALLOWED_EMAIL_DOMAIN} email. SubletSafe is for verified UC Davis students only.`,
      );
      return;
    }
    setOpen(false);
    setEmail("");
    setError(null);
    window.location.href = `/sign-in?email=${encodeURIComponent(trimmed)}`;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-11 h-11 rounded-xl bg-gradient-hero grid place-items-center mb-2 shadow-glow">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <DialogTitle className="font-display text-2xl">
            Sign in with your UC Davis email
          </DialogTitle>
          <DialogDescription>
            SubletSafe is for verified Aggies. Use your{" "}
            <code className="font-mono text-foreground">@ucdavis.edu</code>{" "}
            address to continue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="signin-email">UC Davis email</Label>
            <Input
              id="signin-email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              placeholder="aggie@ucdavis.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
            />
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 text-sm text-destructive"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
          <Button type="submit" size="lg" className="w-full rounded-full">
            Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
