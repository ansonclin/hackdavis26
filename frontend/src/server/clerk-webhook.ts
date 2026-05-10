import { verifyWebhook } from "@clerk/tanstack-react-start/webhooks";
import type { WebhookEvent } from "@clerk/tanstack-react-start/server";

export const clerkWebhook = async (request: Request) => {
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!signingSecret) {
    return new Response("Missing webhook secret", { status: 500 });
  }

  let event: WebhookEvent;

  try {
    event = await verifyWebhook(request, {
      signingSecret,
    });
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "user.created") {
    const email =
      event.data.email_addresses?.[0]?.email_address || "";

    if (!email.endsWith("@ucdavis.edu")) {
      console.log("Blocked user:", email);
    }
  }

  return new Response("OK", { status: 200 });
};