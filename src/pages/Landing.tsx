import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Search, MapPin, Smartphone, CheckCircle, Star, Map } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* SEO optimized header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">BH Ônibus</span>
          </div>
          <div className="flex gap-2">
            <Link to="/mapa">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Map className="h-4 w-4 mr-2" />
                Mapa
              </Button>
            </Link>
            <Link to="/horarios">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                Acessar Sistema
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section - SEO Optimized */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              🚌 Horários Atualizados em Tempo Real
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Horários de Ônibus da Região Metropolitana de BH
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Consulte horários de ônibus de toda a região metropolitana de Belo Horizonte. 
              Cobertura completa para BH, Contagem, Betim, Nova Lima, Ribeirão das Neves e demais cidades da RMBH.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/horarios">
                <Button size="lg" className="w-full sm:w-auto">
                  <Search className="mr-2 h-4 w-4" />
                  Consultar Horários Agora
                </Button>
              </Link>
              <Link to="/mapa">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Map className="mr-2 h-4 w-4" />
                  Ver Mapa Interativo
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Dados oficiais da BHTrans</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Atualizado diariamente</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Disponível 24/7</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Por que escolher o BH Ônibus?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A forma mais rápida e confiável de consultar horários de ônibus em Belo Horizonte
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Busca Inteligente</h3>
                  <p className="text-muted-foreground">
                    Encontre rapidamente a linha que você precisa digitando o número ou destino
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Horários Atualizados</h3>
                  <p className="text-muted-foreground">
                    Informações sempre atualizadas direto da fonte oficial da BHTrans
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Cobertura Completa</h3>
                  <p className="text-muted-foreground">
                    Todas as linhas de ônibus da RMBH: BH, Contagem, Betim, Nova Lima, Ribeirão das Neves e mais
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Map className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Mapa Interativo</h3>
                  <p className="text-muted-foreground">
                    Visualize rotas e pontos de parada em um mapa interativo com sua localização
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">
                Horários de Ônibus RMBH - Região Metropolitana de Belo Horizonte
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Como funciona?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold">1</div>
                      <p className="text-muted-foreground">Digite o número da linha ou destino desejado</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold">2</div>
                      <p className="text-muted-foreground">Visualize todos os horários disponíveis</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold">3</div>
                      <p className="text-muted-foreground">Planeje sua viagem com antecedência</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Principais linhas consultadas</h3>
                  <div className="space-y-2">
                    <Badge variant="outline">Linha 5104 - Pampulha/Centro</Badge>
                    <Badge variant="outline">Linha 9202 - Venda Nova/Centro</Badge>
                    <Badge variant="outline">Linha 1303 - Betim/BH</Badge>
                    <Badge variant="outline">Linha 6001 - Contagem/BH</Badge>
                    <Badge variant="outline">Linha 3001 - Nova Lima/BH</Badge>
                    <Badge variant="outline">E centenas de outras linhas da RMBH...</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Economize tempo e nunca mais perca o ônibus
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Com o BH Ônibus, você tem acesso instantâneo aos horários de todas as linhas 
                  de ônibus da região metropolitana de BH. Consulte de forma gratuita e sem cadastro.
                </p>
                <Link to="/horarios">
                  <Button size="lg">
                    Começar a usar agora - É grátis!
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <Clock className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="font-semibold">BH Ônibus</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Consulte horários de ônibus da região metropolitana de BH de forma rápida e gratuita
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <Link to="/mapa" className="text-muted-foreground hover:text-primary">Mapa</Link>
              <Link to="/sobre" className="text-muted-foreground hover:text-primary">Sobre</Link>
              <Link to="/contato" className="text-muted-foreground hover:text-primary">Contato</Link>
              <Link to="/privacidade" className="text-muted-foreground hover:text-primary">Privacidade</Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2024 BH Ônibus. Horários de ônibus da RMBH atualizados diariamente.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;