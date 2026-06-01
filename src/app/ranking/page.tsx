import { redirect } from "next/navigation";
import { getRankingData } from "@/lib/ranking/actions";
import { RankingClient } from "./client";

export default async function RankingPage() {
  const data = await getRankingData();

  if (!data) {
    redirect("/login");
  }

  return <RankingClient data={data} />;
}
