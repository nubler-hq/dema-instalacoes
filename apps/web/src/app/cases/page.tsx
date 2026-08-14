import { CasesPageClient } from "./cases-page-client";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cases de Sucesso | Dema Instalações",
  description:
    "Portfólio de empreendimentos com instalações elétricas, hidráulicas e combate a incêndio executadas pela Dema Instalações em São Paulo — residenciais, comerciais e institucionais.",
  path: "/cases",
});

export default function CasesPage() {
  return <CasesPageClient />;
}
