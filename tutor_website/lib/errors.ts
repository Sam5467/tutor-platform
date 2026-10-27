// Turns technical errors (from the login system or the database) into plain
// sentences for people. The original error is still written to the browser
// console, so it's available when debugging but never shown on the page.

type ErrorLike =
  | { code?: string; message?: string; status?: number; name?: string }
  | null
  | undefined;

export const GENERIC_ERROR = "Something went wrong. Please try again.";
const CONNECTION_ERROR =
  "We couldn't reach the server. Please check your connection and try again.";

export const ALREADY_REGISTERED_MESSAGE =
  "This email already has an account. You can't sign up with it again.";

const AUTH_MESSAGES: Record<string, string> = {
  user_already_exists: ALREADY_REGISTERED_MESSAGE,
  email_exists: ALREADY_REGISTERED_MESSAGE,
  weak_password:
    "That password is too weak. Please choose a longer one that isn't commonly used.",
  email_address_invalid:
    "That email address doesn't look valid. Please check it and try again.",
  validation_failed:
    "Some of the information you entered isn't valid. Please check it and try again.",
  over_email_send_rate_limit:
    "We've sent a lot of emails recently. Please wait a little while and try again.",
  over_request_rate_limit:
    "Too many attempts. Please wait a few minutes and try again.",
  captcha_failed: "The human check failed. Please try again.",
  same_password: "Your new password must be different from your old one.",
  signup_disabled: "Sign-ups are closed right now. Please try again later.",
  email_not_confirmed:
    "Please confirm your email first. We sent you a link when you signed up.",
  invalid_credentials: "Incorrect email or password.",
  email_address_not_authorized:
    "We can't send emails to that address right now. Please try again later.",
  session_not_found: "Your session has expired. Please log in again.",
  session_expired: "Your session has expired. Please log in again.",
  refresh_token_not_found: "Your session has expired. Please log in again.",
};

function looksLikeConnectionProblem(error: ErrorLike): boolean {
  const text = (error?.message ?? "").toLowerCase();
  return (
    error?.status === 0 ||
    text.includes("failed to fetch") ||
    text.includes("fetch failed") ||
    text.includes("networkerror") ||
    text.includes("network request failed")
  );
}

// For errors from the login system (sign up, log in, password reset, ...).
export function authErrorMessage(
  error: ErrorLike,
  fallback: string = GENERIC_ERROR
): string {
  if (!error) return fallback;

  if (error.code && AUTH_MESSAGES[error.code]) {
    return AUTH_MESSAGES[error.code];
  }
  if (error.name === "AuthSessionMissingError") {
    return AUTH_MESSAGES.session_not_found;
  }
  if (error.status === 429) {
    return AUTH_MESSAGES.over_request_rate_limit;
  }
  // The email service refused to send (usually the daily email limit). The
  // account exists, so they can use "Resend" later or log in once confirmed.
  if ((error.message ?? "").toLowerCase().includes("error sending")) {
    return "We couldn't send the email right now because a lot of people are signing up today. Your account is saved: in a few hours, log in and press \"Resend confirmation email\", or contact us at passalonglb@gmail.com if it's urgent.";
  }
  if (looksLikeConnectionProblem(error)) {
    return CONNECTION_ERROR;
  }

  console.error("Unhandled auth error:", error);
  return fallback;
}

// For errors from the database. Our own checks (like "Price must be between 1
// and 1000") use the error code P0001 and are already written in plain
// English, so those are passed through. Everything else gets a safe message.
export function dbErrorMessage(
  error: ErrorLike,
  overrides: Record<string, string> = {},
  fallback: string = GENERIC_ERROR
): string {
  if (!error) return fallback;

  if (error.code && overrides[error.code]) {
    return overrides[error.code];
  }
  if (error.code === "P0001" && error.message) {
    return error.message;
  }
  if (
    error.code === "42501" ||
    /row-level security|permission denied/i.test(error.message ?? "")
  ) {
    return "You don't have permission to do that.";
  }
  if (looksLikeConnectionProblem(error)) {
    return CONNECTION_ERROR;
  }

  console.error("Unhandled database error:", error);
  return fallback;
}
