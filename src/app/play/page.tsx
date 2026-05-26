import { redirect } from "next/navigation";
import { getPlayData } from "@/lib/play/actions";
import { PlayClient } from "./client";

export default async function PlayPage() {
  const data = await getPlayData();

  if (!data) {
    redirect("/login");
  }

  return <PlayClient data={data} />;
}
