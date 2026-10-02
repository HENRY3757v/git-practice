import { createFileRoute } from "@tanstack/react-router";
import { ResearchListPage } from "@/components/research-list-page";
export const Route = createFileRoute("/history")({
  head: () => ({ meta: [
    { title: "Research History — DeepDive AI" }, { name: "description", content: "Browse sample past research briefs in DeepDive AI." },
    { property: "og:title", content: "Research History — DeepDive AI" }, { property: "og:description", content: "Browse sample past research briefs in DeepDive AI." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), component: () => <ResearchListPage mode="history" />,
});
