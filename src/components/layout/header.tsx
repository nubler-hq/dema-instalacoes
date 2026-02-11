import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "/", text: "INÍCIO" },
  { href: "/obras", text: "OBRAS" },
  { href: "/galeria", text: "GALERIA" },
  { href: "/servicos", text: "SERVIÇOS" },
  { href: "/sobre-nos", text: "SOBRE-NÓS" },
  { href: "/contato", text: "CONTATO" },
];

export function Header() {
  return (
    <header className="w-full bg-background shadow-sm">
      {/* Top Bar: Logo, Contact Info, Action Buttons */}
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Dema Instalações Logo"
                width={180}
                height={40}
                priority
              />
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                (11)9479-41317
              </p>
              <span className="text-xs text-muted-foreground">Duvidas?</span>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm text-foreground">
                Jd. Paulistano - SP
              </p>
              <span className="text-xs text-muted-foreground">
                Nosso Escritório
              </span>
            </div>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold text-xs rounded-sm h-9 px-4"
              asChild
            >
              <Link href="/contato">FALE CONOSCO</Link>
            </Button>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold text-xs rounded-sm h-9 px-4"
              asChild
            >
              <a
                href="http://demainstalacoes.com.br/Portfolio_Dema.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                PORTFOLIO PDF
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="border-t border-b border-border/60">
        <div className="container mx-auto px-4">
          <NavigationMenu className="hidden lg:flex max-w-full justify-start">
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <Link href={link.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={`${navigationMenuTriggerStyle()} rounded-none bg-transparent py-3 text-xs font-bold tracking-wider text-foreground/70 hover:text-primary focus:text-primary data-[state=active]:text-primary data-[state=active]:shadow-none`}
                    >
                      {link.text}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          {/* A mobile menu trigger will be needed here for responsive design */}
        </div>
      </div>
    </header>
  );
}
