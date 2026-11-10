import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBrochureConfig } from "@/lib/brochure.server";
import { BrochureAdmin } from "@/components/admin/brochure/BrochureAdmin";

export const metadata = {
  title: "E-Brochure & Collateral | Beetrix360 Studio",
};

export default async function BrochureAdminPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }

  const initialConfig = await getBrochureConfig();

  return <BrochureAdmin initialConfig={initialConfig} />;
}

