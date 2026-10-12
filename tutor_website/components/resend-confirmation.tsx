"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/errors";
import { Turnstile, TURNSTILE_ENABLED } from "@/components/turnstile";

type ResendConfirmationProps = {
  email: string;
  // Lets the person go back and fix a mistyped address.
  onChangeEmail: () => void;
};

const COOLDOWN_SECONDS = 60;

// "Didn't receive the email?" help shown after sign-up.
export function ResendConfirmation({
  email,
  onChangeEmail,
}: ResendConfirmationProps) {
  const [open, setOpen] = useState(false);
  // The first email was just sent, so start with a short wait.
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setMessage("");
    setIsError(false);

    if (TURNSTILE_ENABLED && !captchaToken) {
      setIsError(true);
      setMessage("Please complete the check below first.");
      return;
    }

    setSending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
        captchaToken: captchaToken ?? undefined,
      },
    });
    setSending(false);
    // Each check can only be used once, so ask for a fresh one.
    setCaptchaReset((c) => c + 1);

    if (error) {
      setIsError(true);
      setMessage(
        authErrorMessage(
          error,
          "We couldn’t send the email. Please try again in a few minutes."
        )
      );
      return;
    }

    setCooldown(COOLDOWN_SECONDS);
    setMessage(
      "We’ve sent a new link. Please check your inbox and your spam folder."
    );
  };

  return (
    <div className="mt-8 border-t border-stone pt-6">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm text-brass underline"
        >
          Didn’t receive the email?
        </button>
      ) : (
        <div className="text-left max-w-sm mx-auto">
          <p className="text-sm font-medium text-ink mb-2">
            Didn’t receive the email?
          </p>
          <ul className="list-disc pl-5 text-sm text-slate flex flex-col gap-1 mb-4">
            <li>Check your spam or junk folder.</li>
            <li>
              Make sure the address is correct:{" "}
              <span className="text-ink">{email}</span>.{" "}
              <button
                type="button"
                onClick={onChangeEmail}
                className="text-brass underline"
              >
                Use a different email
              </button>
            </li>
            <li>Wait a minute or two. Emails can be slow.</li>
          </ul>

          <Turnstile onToken={setCaptchaToken} resetCount={captchaReset} />

          <button
            type="button"
            onClick={handleResend}
            disabled={sending || cooldown > 0}
            className="mt-3 rounded-full border border-ink text-ink px-6 py-2 text-sm font-medium disabled:opacity-50"
          >
            {sending
              ? "Sending..."
              : cooldown > 0
              ? `Resend email (${cooldown}s)`
              : "Resend email"}
          </button>

          {message && (
            <p
              className={`text-sm mt-3 ${
                isError ? "text-red-600" : "text-green-700"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
