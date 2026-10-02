import { createFileRoute } from "@tanstack/react-router";
import { ResearchListPage } from "@/components/research-list-page";
export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [
    { title: "Saved Research — DeepDive AI" }, { name: "description", content: "Browse saved sample research briefs in DeepDive AI." },
    { property: "og:title", content: "Saved Research — DeepDive AI" }, { property: "og:description", content: "Browse saved sample research briefs in DeepDive AI." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), component: () => <ResearchListPage mode="saved" />,
});
