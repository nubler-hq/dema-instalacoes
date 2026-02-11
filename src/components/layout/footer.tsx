import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <>
      {/* Infobox */}
      <div className="bg-primary py-5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-primary-foreground text-lg">
            Deixe o seu cadastro que entraremos em contato{" "}
            <Link href="/contato" className="underline font-semibold">
              area de cadastro
            </Link>
          </p>
        </div>
      </div>

      <footer className="bg-gray-800 text-gray-400 pt-16 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Sobre Nós */}
            <div className="lg:col-span-2">
              <h4 className="text-white font-bold mb-4 text-sm uppercase">
                SOBRE NÓS
              </h4>
              <p className="mb-4 text-sm leading-relaxed text-gray-400/80">
                A Dema Instalações, Elétrica, Hidráulica e Manutenções LTDA está
                no mercado desde 2006 e é especializada em instalações
                elétricas, hidraulicas e manutenções.
              </p>
              <Button
                variant="outline"
                className="bg-transparent border-white/50 text-white hover:bg-white hover:text-gray-800 rounded-sm text-xs font-bold"
                asChild
              >
                <a
                  href="https://api.whatsapp.com/send?phone=5511947941317&text=Ol%C3%A1%2C%20estou%20interessado%20na%20Dema%20Instala%C3%A7%C3%B5es.%20*Contato%20via%20site*."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contato via WhatsApp
                </a>
              </Button>
            </div>

            {/* Links Uteis */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase">
                LINKS UTEIS
              </h4>
              <ul className="space-y-2 text-sm text-gray-400/80">
                <li>
                  <Link href="/servicos" className="hover:text-white">
                    &gt; Serviços
                  </Link>
                </li>
                <li>
                  <Link href="/obras" className="hover:text-white">
                    &gt; Obras
                  </Link>
                </li>
                <li>
                  <Link href="/galeria" className="hover:text-white">
                    &gt; Depoimentos
                  </Link>
                </li>
                <li>
                  <Link href="/contato" className="hover:text-white">
                    &gt; Contato
                  </Link>
                </li>
              </ul>
            </div>

            {/* Entre em Contato */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase">
                ENTRE EM CONTATO
              </h4>
              <div className="text-sm text-gray-400/80">
                <p>Av. Brigadeiro Luís Antônio, 3097</p>
                <p>Jardim Paulista - SP, Brasil</p>
                <p className="mt-4">Telefone: (11)9479-41317</p>
                <p>contato@demainstalacoes.com.br</p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 mt-12 pt-6 text-center text-xs text-gray-500">
            <p>
              Dema Instalações ©{new Date().getFullYear()} - Todos os direitos
              reservados |{" "}
              <a
                href="http://nubler.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                Website e Tecnologia desenvolvido por Nubler
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
