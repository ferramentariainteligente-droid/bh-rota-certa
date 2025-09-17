import { Bus, FileText, AlertTriangle, Scale, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Scale className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Termos de Uso</h1>
                <p className="text-white/90 text-sm">Condições de utilização</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href="/" className="text-white hover:bg-white/20">
                ← Voltar ao Início
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Introduction */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Termos de Uso</h2>
              <p className="text-lg text-muted-foreground">
                Última atualização: 17 de setembro de 2024
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Acordo de Utilização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bem-vindo ao BH Ônibus! Estes Termos de Uso estabelecem as condições 
                  para utilização de nosso site e serviços. Ao acessar e usar nossa 
                  plataforma, você concorda com todos os termos descritos abaixo.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Acceptance */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">1. Aceitação dos Termos</h2>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Ao utilizar o site bhonibus.com e seus serviços, você declara ter 
                    lido, compreendido e concordado com estes Termos de Uso e nossa 
                    Política de Privacidade.
                  </p>
                  <p>
                    Se você não concorda com qualquer parte destes termos, recomendamos 
                    que não utilize nossos serviços.
                  </p>
                  <p>
                    Estes termos podem ser atualizados periodicamente, e é sua responsabilidade 
                    verificar eventuais mudanças.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Services Description */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">2. Descrição dos Serviços</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="h-5 w-5 text-primary" />
                    O que Oferecemos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Consulta de horários de ônibus</li>
                    <li>• Informações sobre rotas</li>
                    <li>• Dados de origem e destino</li>
                    <li>• Busca por linhas específicas</li>
                    <li>• Interface responsiva</li>
                    <li>• Acesso gratuito</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    Limitações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Informações sujeitas a alterações</li>
                    <li>• Dependemos de fontes externas</li>
                    <li>• Não garantimos 100% de precisão</li>
                    <li>• Serviço pode estar indisponível temporariamente</li>
                    <li>• Não somos responsáveis por atrasos reais</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* User Responsibilities */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">3. Responsabilidades do Usuário</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Uso Adequado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Você se compromete a:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Usar o serviço apenas para fins legais</li>
                      <li>• Não tentar hackear ou interferir no sistema</li>
                      <li>• Não sobrecarregar nossos servidores</li>
                      <li>• Fornecer informações verdadeiras nos formulários</li>
                      <li>• Respeitar direitos autorais e propriedade intelectual</li>
                      <li>• Não usar o serviço para spam ou atividades maliciosas</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">É proibido:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Reproduzir ou distribuir nosso conteúdo sem autorização</li>
                      <li>• Usar robots, scrapers ou ferramentas automatizadas</li>
                      <li>• Tentar obter acesso não autorizado ao sistema</li>
                      <li>• Prejudicar o funcionamento do site</li>
                      <li>• Violar leis locais, estaduais ou federais</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">4. Isenção de Responsabilidade</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Limitações de Responsabilidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <strong>Informações de Terceiros:</strong> Os horários e informações 
                    de ônibus são coletados de fontes públicas e podem não refletir 
                    mudanças em tempo real ou alterações temporárias.
                  </p>
                  <p>
                    <strong>Disponibilidade:</strong> Não garantimos que o serviço estará 
                    sempre disponível ou livre de erros. Podemos interromper o serviço 
                    para manutenção ou atualizações.
                  </p>
                  <p>
                    <strong>Danos:</strong> Em nenhuma circunstância seremos responsáveis 
                    por danos diretos, indiretos, incidentais ou consequenciais resultantes 
                    do uso de nossos serviços.
                  </p>
                  <p>
                    <strong>Decisões de Viagem:</strong> Recomendamos sempre confirmar 
                    horários diretamente com as empresas de transporte antes de viajar.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">5. Propriedade Intelectual</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Nossos Direitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Design e layout do site</li>
                    <li>• Código-fonte e algoritmos</li>
                    <li>• Marca "BH Ônibus"</li>
                    <li>• Textos e conteúdo original</li>
                    <li>• Interface e experiência do usuário</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dados Públicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Os horários de ônibus são informações públicas obtidas de:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Sites oficiais de transporte</li>
                    <li>• Órgãos públicos competentes</li>
                    <li>• Empresas de transporte público</li>
                    <li>• Fontes governamentais</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">6. Privacidade</h2>
            
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  O tratamento de seus dados pessoais é regido por nossa 
                  <a href="/privacidade" className="text-primary hover:underline mx-1">
                    Política de Privacidade
                  </a>, 
                  que faz parte integrante destes Termos de Uso.
                </p>
                <p className="text-muted-foreground">
                  Ao utilizar nossos serviços, você também concorda com os termos 
                  de nossa Política de Privacidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Advertising */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">7. Publicidade</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Google AdSense</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Utilizamos o Google AdSense para exibir anúncios que nos ajudam 
                    a manter o serviço gratuito. Estes anúncios podem ser personalizados 
                    com base em seus interesses.
                  </p>
                  <p>
                    Você pode gerenciar suas preferências de anúncios nas 
                    <a href="https://www.google.com/settings/ads" className="text-primary hover:underline ml-1">
                      Configurações de Anúncios do Google
                    </a>.
                  </p>
                  <p>
                    Não somos responsáveis pelo conteúdo dos anúncios exibidos, 
                    que são gerenciados pelo Google AdSense.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Termination */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">8. Suspensão e Rescisão</h2>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Reservamos o direito de suspender ou encerrar o acesso de usuários 
                    que violem estes Termos de Uso, sem aviso prévio.
                  </p>
                  <p>
                    Podemos também descontinuar ou modificar nossos serviços a qualquer 
                    momento, com ou sem aviso prévio.
                  </p>
                  <p>
                    Em caso de violação grave, poderemos tomar medidas legais apropriadas 
                    para proteger nossos interesses e os de outros usuários.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Applicable Law */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">9. Lei Aplicável</h2>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Estes Termos de Uso são regidos pelas leis brasileiras, 
                    especialmente pelo Marco Civil da Internet (Lei 12.965/2014) 
                    e pela Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
                  </p>
                  <p>
                    Quaisquer disputas serão resolvidas no foro da comarca de 
                    Belo Horizonte, Minas Gerais.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">10. Contato</h2>
            
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  Para dúvidas sobre estes Termos de Uso ou questões legais, 
                  entre em contato:
                </p>
                <div className="space-y-2">
                  <p><strong>Email:</strong> legal@bhonibus.com</p>
                  <p><strong>Contato Geral:</strong> contato@bhonibus.com</p>
                  <p><strong>Formulário:</strong> <a href="/contato" className="text-primary hover:underline">bhonibus.com/contato</a></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Updates */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-secondary">
              <CardHeader>
                <CardTitle>Atualizações dos Termos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Estes Termos de Uso podem ser atualizados periodicamente para 
                  refletir mudanças em nossos serviços ou na legislação. 
                  Recomendamos que você verifique esta página regularmente. 
                  O uso continuado de nossos serviços após as alterações constitui 
                  aceitação dos novos termos.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Bus className="h-5 w-5 text-primary" />
              <span className="font-semibold">BH Ônibus</span>
            </div>
            <div className="flex justify-center gap-6 text-sm">
              <a href="/" className="text-muted-foreground hover:text-foreground">Início</a>
              <a href="/sobre" className="text-muted-foreground hover:text-foreground">Sobre</a>
              <a href="/contato" className="text-muted-foreground hover:text-foreground">Contato</a>
              <a href="/privacidade" className="text-muted-foreground hover:text-foreground">Privacidade</a>
            </div>
            <div className="border-t mt-6 pt-6 text-sm text-muted-foreground">
              <p>© 2024 BH Ônibus - Todos os direitos reservados</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Terms;