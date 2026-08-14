import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Dema",
    description:
      "Instalações elétricas e hidráulicas para empreendimentos de alto padrão em São Paulo.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#cc6128",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    id: SITE_URL,
  };
}
