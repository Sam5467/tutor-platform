import { Suspense } from "react";

export const metadata = {
  title: "Sign up",
  description:
    "Create a free Passalong account to find a student tutor for your university course in Lebanon, or to become a tutor.",
};

// The page reads "?next=" from the address, which needs a Suspense boundary.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
