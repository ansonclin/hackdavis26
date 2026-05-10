import { verifyWebhook } from "@clerk/tanstack-react-start/webhooks";
import { clerkClient } from "@clerk/tanstack-react-start/server";
import { ALLOWED_EMAIL_DOMAIN } from "./auth-check";

export async function handleClerkWebhook(request: Request): Promise<Response> {
  let event;
  try {
    event = await verifyWebhook(request);
  } catch (err) {
    console.error("Clerk webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "user.created") {
    const userId = event.data.id;
    const emails = event.data.email_addresses ?? [];
    const primaryId = event.data.primary_email_address_id;
    const primary =
      emails.find((e) => e.id === primaryId) ?? emails[0];
    const email = primary?.email_address?.toLowerCase() ?? "";

    if (!email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
      try {
        await clerkClient().users.deleteUser(userId);
        console.log(
          `Deleted non-${ALLOWED_EMAIL_DOMAIN} user ${userId} (${email})`,
        );
      } catch (err) {
        // 404 = user already gone (e.g. dashboard test events use a fake ID).
        // Treat that as success — the desired end state is "user not present."
        const status =
          err && typeof err === "object" && "status" in err
            ? (err as { status: unknown }).status
            : undefined;
        if (status === 404) {
          console.log(
            `User ${userId} not found (probably a test event) — treating as deleted`,
          );
        } else {
          console.error(`Failed to delete user ${userId}:`, err);
          return new Response("Failed to delete user", { status: 500 });
        }
      }
    }
  }

  return new Response("ok", { status: 200 });
}
