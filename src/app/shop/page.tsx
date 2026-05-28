import { redirect } from "next/navigation";
import { getShopData } from "@/lib/shop/actions";
import { ShopClient } from "./client";

export default async function ShopPage() {
  const data = await getShopData();

  if (!data) {
    redirect("/login");
  }

  return <ShopClient data={data} />;
}
