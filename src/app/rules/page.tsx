import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/actions";
import { RulesClient } from "./client";

export default async function RulesPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return <RulesClient user={user} />;
}
