import { Bus, Mail, MessageSquare, MapPin, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle form submission
    alert('Mensagem enviada! Entraremos em contato em breve.');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Bus className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Contato</h1>
                <p className="text-white/90 text-sm">Entre em contato conosco</p>
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
        {/* Contact Info */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Fale Conosco</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Tem alguma dúvida, sugestão ou problema? Estamos aqui para ajudar! 
              Entre em contato através dos canais abaixo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Envie-nos um email e responderemos em até 24 horas.
                </CardDescription>
                <a 
                  href="mailto:contato@bhonibus.com" 
                  className="text-primary hover:underline font-medium"
                >
                  contato@bhonibus.com
                </a>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Suporte</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Precisa de ajuda técnica ou tem alguma dúvida?
                </CardDescription>
                <a 
                  href="mailto:suporte@bhonibus.com" 
                  className="text-primary hover:underline font-medium"
                >
                  suporte@bhonibus.com
                </a>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Horário</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Respondemos de segunda a sexta-feira.
                </CardDescription>
                <div className="font-medium text-foreground">
                  8h às 18h
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Form */}
        <section className="mb-16">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Envie sua Mensagem</CardTitle>
                <CardDescription className="text-center">
                  Preencha o formulário abaixo e entraremos em contato o mais breve possível.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input 
                        id="name" 
                        placeholder="Seu nome completo" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="seu@email.com" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto *</Label>
                    <Input 
                      id="subject" 
                      placeholder="Qual o motivo do seu contato?" 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea 
                      id="message"
                      placeholder="Descreva sua dúvida, sugestão ou problema..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    * Campos obrigatórios
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <Mail className="w-5 h-5 mr-2" />
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Os horários são atualizados?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sim! Nosso sistema atualiza automaticamente os horários das linhas 
                  de ônibus para garantir informações precisas e atuais.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">O serviço é gratuito?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Completamente gratuito! Não cobramos nada pelo acesso às informações 
                  de horários de ônibus.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como posso sugerir melhorias?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Use o formulário acima ou envie um email para contato@bhonibus.com 
                  com suas sugestões. Valorizamos muito o feedback dos usuários!
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cobrem toda a região metropolitana?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sim, cobrimos as principais linhas de ônibus da Região Metropolitana 
                  de Belo Horizonte (RMBH).
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Location */}
        <section className="text-center bg-gradient-secondary rounded-2xl p-12">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Nossa Localização</h2>
            <p className="text-muted-foreground mb-6">
              Operamos digitalmente servindo toda a Região Metropolitana de Belo Horizonte, 
              Minas Gerais, Brasil.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>🌐 Serviço Online 24/7</p>
              <p>📍 Cobertura: RMBH completa</p>
              <p>🚌 500+ linhas de ônibus</p>
            </div>
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
              <a href="/privacidade" className="text-muted-foreground hover:text-foreground">Privacidade</a>
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

export default Contact;