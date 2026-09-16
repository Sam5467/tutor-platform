import { cookies } from "next/headers";
import { HeaderShell } from "@/components/header-shell";

export async function Header() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("usek_logged_in")?.value === "true";

  return <HeaderShell isLoggedIn={isLoggedIn} />;
}
