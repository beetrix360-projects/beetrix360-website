import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getChatWidgetConfig } from "@/lib/chat-widget.server";
import { ChatWidgetAdmin } from "@/components/admin/chat/ChatWidgetAdmin";

export const metadata = {
  title: "WhatsApp & Chat Widget | Beetrix360 Studio",
};

export default async function ChatWidgetAdminPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }

  const initialConfig = await getChatWidgetConfig();

  return <ChatWidgetAdmin initialConfig={initialConfig} />;
}

