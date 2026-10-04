import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="font-display text-2xl text-ink mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate mb-8">Last updated: 4 October 2026</p>

      <p className="text-ink mb-4">
        USEK Tutors is an independent, student-run platform that connects
        senior USEK students who offer tutoring with newer students who need
        help. It is not an official service of USEK. This page explains what
        personal information we collect, why, who can see it, and what choices
        you have.
      </p>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">
        What we collect
      </h2>
      <p className="text-ink mb-2">
        <strong>Everyone with an account:</strong>
      </p>
      <ul className="list-disc pl-6 text-ink mb-4 flex flex-col gap-1">
        <li>Your first and last name and your email address.</li>
        <li>
          Your password, which we never see. It is stored in a scrambled form
          by our login provider.
        </li>
        <li>
          Which tutors you contacted through the site, and when. Reviews you
          write: your name, star rating and optional comment.
        </li>
      </ul>
      <p className="text-ink mb-2">
        <strong>Tutors, when applying:</strong>
      </p>
      <ul className="list-disc pl-6 text-ink mb-4 flex flex-col gap-1">
        <li>
          Your faculty, major, year, the courses you can tutor, your price per
          session and your bio.
        </li>
        <li>Your phone / WhatsApp number.</li>
        <li>Your GPA.</li>
        <li>
          Your transcript file, which shows your GPA and your USEK student ID.
        </li>
        <li>Optionally, a profile picture.</li>
        <li>
          Your listing dates and payment status (for example, “listed until 3
          November”).
        </li>
      </ul>
      <p className="text-ink mb-4">
        <strong>Automatically:</strong> to keep you logged in we use cookies,
        and our bot check (see below) looks at basic browser and connection
        details to tell people from automated programs.
      </p>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">
        Who can see what
      </h2>
      <ul className="list-disc pl-6 text-ink mb-4 flex flex-col gap-2">
        <li>
          <strong>Your transcript and GPA</strong> can be seen only by you and
          the site administrators, who use them to check your application.
          They are never shown to other students.
        </li>
        <li>
          <strong>Your phone number</strong> is not shown on your listing. It
          is given to a logged-in student only when they press “Contact on
          WhatsApp” on your profile. Each such contact is recorded.
        </li>
        <li>
          <strong>Your listing</strong> (name, photo, faculty, major, year,
          courses, price, bio, reviews and average rating) can be seen by
          users of the site while your listing is active.
        </li>
        <li>
          <strong>Reviews</strong> show the reviewer’s name, rating and comment
          on the tutor’s profile.
        </li>
        <li>
          <strong>Administrators</strong> can see account and application
          details so they can run the site.
        </li>
      </ul>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">
        How we use your information
      </h2>
      <p className="text-ink mb-4">
        To create and protect accounts, to review and approve tutor
        applications, to let students find and contact tutors, to show
        reviews, to take and record listing payments, to send emails about your
        account (such as confirming your email address or resetting your
        password), and to prevent abuse. We do not sell your information and we
        do not show advertising.
      </p>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">
        Services that help us run the site
      </h2>
      <p className="text-ink mb-2">
        We share information only with the providers needed to operate the
        platform:
      </p>
      <ul className="list-disc pl-6 text-ink mb-4 flex flex-col gap-1">
        <li>
          <strong>Supabase</strong> stores our accounts, database and uploaded
          files. Our data is hosted in Frankfurt, Germany.
        </li>
        <li>
          <strong>Cloudflare Turnstile</strong> runs the bot check on log in,
          sign up and password reset.
        </li>
        <li>
          <strong>Our website hosting provider</strong> serves the site to
          your browser.
        </li>
        <li>
          <strong>An email service</strong> sends account emails.
        </li>
        <li>
          <strong>Payment providers</strong> (Whish Money and a card payment
          provider) process tutors’ listing payments. We never see or store
          your card number. We only record whether and when a payment was
          made.
        </li>
      </ul>
      <p className="text-ink mb-4">
        We may also share information if the law requires it, or to protect the
        safety of our users.
      </p>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">Cookies</h2>
      <p className="text-ink mb-4">
        We use only the cookies needed to keep you logged in. We do not use
        advertising or tracking cookies.
      </p>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">
        How long we keep it
      </h2>
      <ul className="list-disc pl-6 text-ink mb-4 flex flex-col gap-1">
        <li>Your account details stay until you ask us to delete your account.</li>
        <li>
          Your transcript is kept while your application is under review and
          while your listing is active. When an administrator removes your
          listing, your transcript and photo are deleted with it. You can also
          ask us at any time to delete your transcript (for example after a
          rejected application).
        </li>
        <li>
          If your account is deleted, your listing, contact records and
          reviews are deleted with it.
        </li>
      </ul>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">Your choices</h2>
      <ul className="list-disc pl-6 text-ink mb-4 flex flex-col gap-1">
        <li>
          Tutors can edit their price, courses, bio, year, phone number and
          photo at any time from their tutor card.
        </li>
        <li>You can delete any review you wrote.</li>
        <li>
          You can ask us to show you the information we hold about you, to
          correct it (including your name, faculty, major or GPA), or to delete
          your account and data, by contacting us (see below).
        </li>
      </ul>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">Security</h2>
      <p className="text-ink mb-4">
        Transcripts are stored privately and can be opened only by you and the
        administrators, using short-lived links. Access to the database is
        restricted by rules that limit each person to the information they are
        allowed to see. No online service can be made perfectly secure, so
        please use a strong password you don’t use elsewhere.
      </p>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">Changes</h2>
      <p className="text-ink mb-4">
        We may update this policy as the platform develops. When we make
        important changes we will update the date at the top of this page.
      </p>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">Contact</h2>
      <p className="text-ink">
        Questions or requests about your information? Reach us through the{" "}
        <Link href="/contact" className="text-brass underline">
          Contact page
        </Link>
        . You can also read our{" "}
        <Link href="/terms" className="text-brass underline">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
