import { createServerFn } from "@tanstack/react-start";
import { auth, clerkClient } from "@clerk/tanstack-react-start/server";

export const ALLOWED_EMAIL_DOMAIN = "ucdavis.edu";

export type AuthStatus =
  | { signedIn: false }
  | { signedIn: true; email: string; isAllowed: boolean };

export const getAuthStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthStatus> => {
    const { userId } = await auth();
    if (!userId) return { signedIn: false };

    let user;
    try {
      user = await clerkClient().users.getUser(userId);
    } catch (err) {
      // User no longer exists (e.g. deleted by our user.created webhook) but
      // the browser still has a stale session JWT. Treat as signed-out — the
      // Clerk client SDK invalidates the cookie on its next sync.
      const status =
        err && typeof err === "object" && "status" in err
          ? (err as { status: unknown }).status
          : undefined;
      if (status === 404) return { signedIn: false };
      throw err;
    }

    const email =
      user.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

    return {
      signedIn: true,
      email,
      isAllowed: email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`),
    };
  },
);
