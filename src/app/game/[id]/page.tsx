import { redirect } from "next/navigation";
import { getGameData } from "@/lib/play/actions";
import { GameClient } from "./client";

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getGameData(id);

  if (!data) {
    redirect("/play");
  }

  return <GameClient data={data} />;
}
