import type { MetadataRoute } from "next";
import { allCases } from "@/content/cases";
import { SITE_URL } from "@/lib/seo";

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/servicos", priority: 0.9, changeFrequency: "monthly" },
  { path: "/cases", priority: 0.9, changeFrequency: "weekly" },
  { path: "/sobre-nos", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contato", priority: 0.8, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const caseEntries: MetadataRoute.Sitemap = allCases.map((caseItem) => ({
    url: `${SITE_URL}/cases/${caseItem.slug}`,
    lastModified,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticEntries, ...caseEntries];
}
