import { useClerk } from "@clerk/tanstack-react-start";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function WrongEmailScreen({ email }: { email: string }) {
  const { signOut } = useClerk();
  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-soft px-6">
      <Card className="max-w-md w-full p-8 border-border/60 shadow-elegant text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-hero grid place-items-center mx-auto mb-5 shadow-glow">
          <ShieldAlert className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">
          UC Davis email required
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-1">
          SubletSafe is exclusively for verified UC Davis students.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          You signed in with{" "}
          <span className="font-medium text-foreground">{email}</span>, which
          isn't a <code className="font-mono">@ucdavis.edu</code> address.
        </p>
        <div className="flex items-center justify-center gap-2 mb-6 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-success" />
          Sign out and try again with your Aggie email.
        </div>
        <Button
          size="lg"
          className="w-full rounded-full"
          onClick={handleSignOut}
        >
          Sign out
        </Button>
      </Card>
    </div>
  );
}
