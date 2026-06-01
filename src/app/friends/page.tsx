import { redirect } from "next/navigation";
import { getFriendsData } from "@/lib/friends/actions";
import { FriendsClient } from "./client";

export default async function FriendsPage() {
  const data = await getFriendsData();

  if (!data) {
    redirect("/login");
  }

  return <FriendsClient data={data} />;
}
