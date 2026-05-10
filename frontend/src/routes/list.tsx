import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { ListSubletForm } from "@/components/list-sublet-form";

export const Route = createFileRoute("/list")({
  component: ListSubletPage,
  head: () => ({
    meta: [{ title: "List your sublet — SubletSafe" }],
  }),
});

function ListSubletPage() {
  return (
    <div className="min-h-screen bg-gradient-soft py-16 px-6">
      <div className="container mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <Badge variant="secondary" className="rounded-full mb-4">
            List your sublet
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-3">
            Upload your lease.{" "}
            <span className="italic text-primary">We'll do the rest.</span>
          </h1>
          <p className="text-muted-foreground">
            Tell us about your place, drop in your lease PDF, and we'll generate a
            verified AI summary in seconds.
          </p>
        </div>
        <ListSubletForm />
      </div>
    </div>
  );
}
