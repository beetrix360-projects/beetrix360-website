import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  CATEGORY_LABELS,
  getAllPageMediaGroups,
} from "@/lib/media-placements";
import {
  MediaPlacementsManager,
  type CategorySummary,
} from "@/components/admin/media/MediaPlacementsManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Media & SEO Placements | Beetrix360 Admin Studio",
};

export default async function AdminMediaPlacementsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }

  const groups = await getAllPageMediaGroups();

  const categories: CategorySummary[] = Object.entries(CATEGORY_LABELS).map(
    ([id, label]) => {
      const catGroups = groups.filter((g) => g.category === id);
      const configuredSlots = catGroups.reduce(
        (acc, g) => acc + g.configuredCount,
        0
      );
      const totalSlots = catGroups.reduce((acc, g) => acc + g.totalCount, 0);
      return {
        id,
        label,
        pageCount: catGroups.length,
        configuredSlots,
        totalSlots,
      };
    }
  );

  return (
    <div className="min-h-screen">
      <MediaPlacementsManager
        initialCategories={categories}
        initialGroups={groups}
      />
    </div>
  );
}

