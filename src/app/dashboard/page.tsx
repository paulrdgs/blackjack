import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/auth/actions";
import { DashboardClient } from "./client";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect("/login");
  }

  return <DashboardClient data={data} />;
}
