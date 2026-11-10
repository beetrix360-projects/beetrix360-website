import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLeadInquiries } from "@/lib/email-service";
import { InquiriesAdmin } from "@/components/admin/inquiries/InquiriesAdmin";

export const metadata = {
  title: "Lead Inquiries & Attribution | Beetrix360 Studio",
};

export default async function InquiriesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }

  const initialInquiries = await getLeadInquiries();

  return <InquiriesAdmin initialInquiries={initialInquiries} />;
}

