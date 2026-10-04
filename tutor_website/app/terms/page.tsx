import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="font-display text-2xl text-ink mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-slate mb-8">Last updated: 4 October 2026</p>

      <p className="text-ink mb-4">
        By creating an account or using USEK Tutors, you agree to these terms
        and to our{" "}
        <Link href="/privacy" className="text-brass underline">
          Privacy Policy
        </Link>
        . If you don’t agree, please don’t use the site.
      </p>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">
        1. What USEK Tutors is
      </h2>
      <p className="text-ink mb-4">
        USEK Tutors is an independent, student-run platform that helps senior
        USEK students who offer tutoring connect with newer students. We are
        not a party to any arrangement made between a tutor and a student.
        Sessions, scheduling and any payment for sessions happen directly
        between them. We do not guarantee the quality of any tutoring or any
        academic result.
      </p>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">
        2. Accounts
      </h2>
      <ul className="list-disc pl-6 text-ink mb-4 flex flex-col gap-1">
        <li>Give accurate information, and keep your password private.</li>
        <li>Each person may have one account.</li>
        <li>
          You are responsible for what happens under your account. Tell us if
          you think someone else has access to it.
        </li>
        <li>
          We may suspend or close accounts that break these terms or put other
          users at risk.
        </li>
      </ul>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">
        3. For students
      </h2>
      <p className="text-ink mb-4">
        Searching for tutors, contacting them and leaving reviews is free for
        students. There are no fees or commissions.
      </p>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">
        4. For tutors
      </h2>
      <ul className="list-disc pl-6 text-ink mb-4 flex flex-col gap-2">
        <li>
          To apply you must submit your GPA and a transcript that clearly shows
          both your GPA and your USEK student ID. You must only list courses
          you have really passed. Information you give must be true.
        </li>
        <li>
          Every application is reviewed manually. We may approve, reject or
          remove a listing at our discretion, for example if information is
          false or the tutor behaves badly.
        </li>
        <li>
          Your name, faculty and major can be changed only by an
          administrator. You can edit your price, courses, bio, year, phone
          number and photo yourself.
        </li>
        <li>
          Your phone number is given to students who press “Contact on
          WhatsApp” on your profile. By applying, you agree to be contacted
          this way.
        </li>
        <li>
          You set one flat price per session. Tutors and students agree on the
          session itself directly.
        </li>
      </ul>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">
        5. Listing fee for tutors
      </h2>
      <ul className="list-disc pl-6 text-ink mb-4 flex flex-col gap-2">
        <li>
          Applying and being approved is free. A listing is shown to students
          only while its listing period is active.
        </li>
        <li>
          When the site opens to students, all tutors share one free period of
          30 days. It ends on the same date for everyone. A tutor who is
          approved later receives only what remains of that period, or none if
          it has already ended.
        </li>
        <li>
          After the free period, staying listed costs 10 US dollars for each
          30-day listing period. Each successful payment adds 30 days to your
          listing. You can renew once your current period has ended.
        </li>
        <li>
          You can pay on the website with Whish Money or by card. Payments are
          handled by those providers; we do not see or store your card details.
        </li>
        <li>
          If your listing period ends without renewal, your listing is hidden
          from students until you renew. Your account and reviews are kept.
        </li>
        <li>
          A listing period starts as soon as it is paid, so fees are not
          refundable once the period has started, unless we decide otherwise
          or the law requires it.
        </li>
        <li>
          We may change the fee in the future. We will announce any change on
          the site before it applies to you.
        </li>
      </ul>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">6. Reviews</h2>
      <ul className="list-disc pl-6 text-ink mb-4 flex flex-col gap-1">
        <li>
          Only students who contacted a tutor through the site can review that
          tutor, once each.
        </li>
        <li>
          Reviews must be honest and about your own experience, with no abuse,
          threats, personal details or advertising.
        </li>
        <li>
          You can delete your own review at any time. We may remove any review
          that breaks these rules. Tutors cannot remove reviews about
          themselves.
        </li>
      </ul>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">
        7. Staying safe
      </h2>
      <p className="text-ink mb-4">
        We check each tutor’s GPA and transcript, but we do not carry out
        background checks. Use common sense: prefer public places or online
        sessions, don’t share sensitive personal details, and tell us if
        anyone makes you uncomfortable.
      </p>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">
        8. Acceptable use
      </h2>
      <p className="text-ink mb-4">You agree not to:</p>
      <ul className="list-disc pl-6 text-ink mb-4 flex flex-col gap-1">
        <li>give false information or pretend to be someone else;</li>
        <li>harass, threaten or spam other users;</li>
        <li>
          collect other people’s contact details in bulk, or try to get around
          limits such as the daily contact limit;
        </li>
        <li>
          try to break, overload or gain unauthorised access to the site, or
          use bots or scripts on it;
        </li>
        <li>post anything unlawful or offensive.</li>
      </ul>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">
        9. Your content
      </h2>
      <p className="text-ink mb-4">
        You keep ownership of what you post (such as your bio, photo and
        reviews). By posting it you allow us to display it on the platform for
        as long as it is there.
      </p>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">
        10. Our responsibility
      </h2>
      <p className="text-ink mb-4">
        The site is provided “as is”. We work to keep it available and
        accurate but cannot promise it will always be free of errors or
        interruptions. To the extent the law allows, we are not responsible for
        what happens between tutors and students, for lost opportunities, or
        for indirect losses arising from using the site.
      </p>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">
        11. Ending your use
      </h2>
      <p className="text-ink mb-4">
        You can stop using the site at any time, and you can ask us to delete
        your account. We may suspend or end access if these terms are broken.
      </p>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">
        12. Changes to these terms
      </h2>
      <p className="text-ink mb-4">
        These terms may be updated as the platform develops. We will change the
        date at the top when we do. Continued use of the platform after a
        change means you accept the updated terms.
      </p>

      <h2 className="font-display text-lg text-ink mt-8 mb-3">13. Contact</h2>
      <p className="text-ink">
        Questions about these terms? Use the{" "}
        <Link href="/contact" className="text-brass underline">
          Contact page
        </Link>
        .
      </p>
    </div>
  );
}
