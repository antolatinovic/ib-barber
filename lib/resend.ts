import { Resend } from "resend";

let resendClient: Resend | null = null;

// Lazy singleton: avoids crashing `next build`'s page-data collection when
// RESEND_API_KEY isn't set in the build environment (e.g. preview deploys).
export function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}
