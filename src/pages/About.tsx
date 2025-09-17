import { Bus, Clock, MapPin, Users, Target, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
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
                <h1 className="text-3xl font-bold text-white">Sobre Nós</h1>
                <p className="text-white/90 text-sm">Conheça o BH Ônibus</p>
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
        {/* Mission Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Nossa Missão</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Facilitar o acesso à informação sobre transporte público em Belo Horizonte, 
              conectando pessoas aos horários de ônibus de forma rápida e confiável.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Acessibilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Tornar a informação de transporte público acessível para todos os cidadãos de Belo Horizonte.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Pontualidade</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Fornecer horários atualizados e precisos para que você possa planejar melhor suas viagens.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Comunidade</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Servir a comunidade metropolitana com uma ferramenta gratuita e fácil de usar.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* About Section */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">O que é o BH Ônibus?</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  O BH Ônibus é uma plataforma digital criada para facilitar o acesso aos horários 
                  de ônibus metropolitanos de Belo Horizonte. Nosso objetivo é tornar o transporte 
                  público mais acessível e eficiente para todos os usuários.
                </p>
                <p>
                  Através de tecnologia avançada de coleta e processamento de dados, mantemos 
                  uma base atualizada com informações precisas sobre horários, rotas e destinos 
                  das principais linhas de ônibus da região metropolitana.
                </p>
                <p>
                  Nossa plataforma oferece uma interface simples e intuitiva, permitindo que 
                  qualquer pessoa encontre rapidamente as informações que precisa para planejar 
                  sua viagem de forma eficiente.
                </p>
              </div>
            </div>
            <div className="bg-gradient-secondary rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">500+</div>
                  <div className="text-sm text-muted-foreground">Linhas de Ônibus</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">Disponibilidade</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">Gratuito</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">RMGH</div>
                  <div className="text-sm text-muted-foreground">Cobertura Total</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Recursos Disponíveis</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Bus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Busca Inteligente</h3>
                <p className="text-sm text-muted-foreground">
                  Encontre sua linha rapidamente digitando o número, destino ou ponto de referência.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Horários Detalhados</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize horários organizados por período do dia para melhor planejamento.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Informações Completas</h3>
                <p className="text-sm text-muted-foreground">
                  Acesse origem, destino e principais pontos de parada de cada linha.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Interface Amigável</h3>
                <p className="text-sm text-muted-foreground">
                  Design responsivo e intuitivo, funciona perfeitamente em qualquer dispositivo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Dados Atualizados</h3>
                <p className="text-sm text-muted-foreground">
                  Sistema automático de atualização mantém as informações sempre precisas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Totalmente Gratuito</h3>
                <p className="text-sm text-muted-foreground">
                  Serviço 100% gratuito, sem cadastros ou taxas, acessível para todos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-primary rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Experimente agora nossa plataforma e descubra como é fácil encontrar 
            os horários de ônibus em Belo Horizonte.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <a href="/">
              <Bus className="w-5 h-5 mr-2" />
              Buscar Horários
            </a>
          </Button>
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
              <a href="/contato" className="text-muted-foreground hover:text-foreground">Contato</a>
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

export default About;