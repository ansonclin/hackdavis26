import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/tanstack-react-start";
import { z } from "zod";

const search = z.object({
  email: z.string().optional(),
});

export const Route = createFileRoute("/sign-in/$")({
  validateSearch: search,
  component: SignInPage,
  head: () => ({
    meta: [{ title: "Sign in — SubletSafe" }],
  }),
});

function SignInPage() {
  const { email } = Route.useSearch();

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-soft px-4 py-12">
      <SignIn
        routing="hash"
        forceRedirectUrl="/"
        initialValues={email ? { emailAddress: email } : undefined}
      />
    </div>
  );
}
