import { Bus, Shield, Eye, Cookie, Lock, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Política de Privacidade</h1>
                <p className="text-white/90 text-sm">Sua privacidade é importante</p>
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
              <h2 className="text-4xl font-bold mb-4">Política de Privacidade</h2>
              <p className="text-lg text-muted-foreground">
                Última atualização: 17 de setembro de 2024
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Compromisso com sua Privacidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  O BH Ônibus está comprometido em proteger sua privacidade e dados pessoais. 
                  Esta Política de Privacidade explica como coletamos, usamos, armazenamos e 
                  protegemos suas informações quando você utiliza nosso site e serviços.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Information Collection */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">1. Informações que Coletamos</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Informações Automáticas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Endereço IP</li>
                    <li>• Tipo de navegador e versão</li>
                    <li>• Sistema operacional</li>
                    <li>• Páginas visitadas</li>
                    <li>• Horário de acesso</li>
                    <li>• Dados de navegação</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Informações Voluntárias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Nome (formulário de contato)</li>
                    <li>• Email (formulário de contato)</li>
                    <li>• Mensagem de contato</li>
                    <li>• Consultas de horários</li>
                    <li>• Preferências de pesquisa</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How We Use Information */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">2. Como Usamos suas Informações</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Finalidades do Uso</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Fornecer o serviço:</strong> Exibir horários de ônibus e informações de rotas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Melhorar a experiência:</strong> Otimizar funcionalidades e interface</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Comunicação:</strong> Responder dúvidas e solicitações via formulário de contato</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Análise:</strong> Compreender padrões de uso para melhorias</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Segurança:</strong> Proteger contra uso indevido e fraudes</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">3. Cookies e Tecnologias Similares</h2>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-primary" />
                  O que são Cookies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Cookies são pequenos arquivos de texto armazenados em seu dispositivo 
                  quando você visita nosso site. Utilizamos cookies para:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Lembrar suas preferências de pesquisa</li>
                  <li>• Melhorar o desempenho do site</li>
                  <li>• Analisar como o site é usado</li>
                  <li>• Exibir anúncios relevantes (Google AdSense)</li>
                  <li>• Manter a funcionalidade do site</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipos de Cookies Utilizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Cookies Essenciais</h4>
                    <p className="text-sm text-muted-foreground">
                      Necessários para o funcionamento básico do site.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Cookies de Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Google Analytics para entender o uso do site.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Cookies de Publicidade</h4>
                    <p className="text-sm text-muted-foreground">
                      Google AdSense para anúncios personalizados.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Cookies de Preferência</h4>
                    <p className="text-sm text-muted-foreground">
                      Salvam suas configurações e preferências.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Google AdSense */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">4. Google AdSense e Publicidade</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Anúncios Personalizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Utilizamos o Google AdSense para exibir anúncios em nosso site. 
                    O Google pode usar cookies para:
                  </p>
                  <ul className="space-y-2">
                    <li>• Exibir anúncios baseados em visitas anteriores</li>
                    <li>• Personalizar anúncios com base em interesses</li>
                    <li>• Medir a eficácia dos anúncios</li> 
                    <li>• Evitar anúncios repetitivos</li>
                  </ul>
                  <p>
                    Você pode optar por não receber anúncios personalizados visitando as 
                    <a href="https://www.google.com/settings/ads" className="text-primary hover:underline ml-1">
                      Configurações de Anúncios do Google
                    </a>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Data Protection */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">5. Proteção de Dados</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Medidas de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Criptografia HTTPS:</strong> Todas as comunicações são criptografadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Acesso restrito:</strong> Apenas pessoal autorizado tem acesso aos dados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Monitoramento:</strong> Sistemas de segurança 24/7</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Minimização:</strong> Coletamos apenas dados necessários</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Exclusão:</strong> Dados são removidos quando não são mais necessários</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">6. Seus Direitos</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Direitos LGPD</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Acesso aos seus dados</li>
                    <li>• Correção de dados incorretos</li>
                    <li>• Exclusão de dados</li>
                    <li>• Portabilidade de dados</li>
                    <li>• Oposição ao tratamento</li>
                    <li>• Revogação de consentimento</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Como Exercer seus Direitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Para exercer qualquer um de seus direitos, entre em contato conosco:
                  </p>
                  <div className="text-sm">
                    <p className="mb-2"><strong>Email:</strong> privacidade@bhonibus.com</p>
                    <p><strong>Formulário:</strong> <a href="/contato" className="text-primary hover:underline">Página de Contato</a></p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Third Party Services */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">7. Serviços de Terceiros</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Integrações Utilizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Google Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Para análise de tráfego e comportamento dos usuários. 
                      <a href="https://policies.google.com/privacy" className="text-primary hover:underline ml-1">
                        Política do Google
                      </a>
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Google AdSense</h4>
                    <p className="text-sm text-muted-foreground">
                      Para exibição de anúncios personalizados. 
                      <a href="https://policies.google.com/technologies/ads" className="text-primary hover:underline ml-1">
                        Política de Anúncios do Google
                      </a>
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Supabase</h4>
                    <p className="text-sm text-muted-foreground">
                      Para armazenamento de dados de horários de ônibus. 
                      <a href="https://supabase.com/privacy" className="text-primary hover:underline ml-1">
                        Política do Supabase
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">8. Contato</h2>
            
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  Se você tiver dúvidas sobre esta Política de Privacidade ou sobre 
                  como tratamos seus dados pessoais, entre em contato:
                </p>
                <div className="space-y-2">
                  <p><strong>Email:</strong> privacidade@bhonibus.com</p>
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
                <CardTitle>Atualizações desta Política</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Esta Política de Privacidade pode ser atualizada periodicamente. 
                  Quando houver mudanças significativas, notificaremos os usuários 
                  através do site. A data de última atualização será sempre indicada 
                  no topo desta página.
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
              <a href="/termos" className="text-muted-foreground hover:text-foreground">Termos</a>
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

export default Privacy;