import { ClientsSection } from "@/components/clients-section";
import { HeroSection } from "@/components/hero-section";
import { ProjectsSection } from "@/components/projects-section";
import { ServicesSection } from "@/components/services-section";
import { StagesSection } from "@/components/stages-section";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ServicesSection />
      <ProjectsSection />
      <StagesSection />
      <ClientsSection />
    </main>
  );
}
