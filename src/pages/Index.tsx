import { useState, useMemo } from "react";
import { Bus, Search, Clock, MapPin, Sparkles, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/SearchBar";
import { BusLineCard } from "@/components/BusLineCard";
import { BusLineCardDb } from "@/components/BusLineCardDb";
import { AdSpace } from "@/components/AdSpace";
import { DataImporter } from "@/components/DataImporter";
import { useBusLinesFromDb } from "@/hooks/useBusLinesFromDb";
import { useBusSearchDb } from "@/hooks/useBusSearchDb";
import busLinesData from "@/data/bus-lines.json";

interface BusLine {
  url: string;
  linha: string;
  horarios: string[];
}

const Index = () => {
  const [useDatabase, setUseDatabase] = useState(false);
  const { busLines: dbBusLines, loading, error } = useBusLinesFromDb();
  
  // Static JSON data state (original implementation)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  // Database search hook
  const {
    searchTerm: dbSearchTerm,
    setSearchTerm: setDbSearchTerm,
    selectedHour: dbSelectedHour,
    setSelectedHour: setDbSelectedHour,
    filteredBusLines: filteredDbBusLines,
    clearFilters: clearDbFilters,
    hasFilters: hasDbFilters
  } = useBusSearchDb(dbBusLines);

  const busLines: BusLine[] = busLinesData as BusLine[];

  const filteredBusLines = useMemo(() => {
    let filtered = busLines;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(line => 
        line.linha.toLowerCase().includes(searchLower) ||
        line.url.toLowerCase().includes(searchLower)
      );
    }

    if (selectedHour) {
      filtered = filtered.filter(line => 
        line.horarios.some(horario => horario.startsWith(selectedHour))
      );
    }

    return filtered;
  }, [searchTerm, selectedHour, busLines]);

  const popularHours = ["05", "06", "07", "08", "17", "18", "19", "22"];
  
  const handleDataImported = () => {
    setUseDatabase(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Bus className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">BH Ônibus</h1>
              <p className="text-white/90 text-sm">Horários de Belo Horizonte</p>
            </div>
          </div>
          
          {/* Database Toggle */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant={!useDatabase ? "secondary" : "outline"}
              onClick={() => setUseDatabase(false)}
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
            >
              Dados JSON
            </Button>
            <Button
              variant={useDatabase ? "secondary" : "outline"}
              onClick={() => setUseDatabase(true)}
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
            >
              <Database className="h-4 w-4 mr-2" />
              Banco de Dados
            </Button>
          </div>
          
          <SearchBar 
            searchTerm={useDatabase ? dbSearchTerm : searchTerm}
            onSearchChange={useDatabase ? setDbSearchTerm : setSearchTerm}
            placeholder="Busque sua linha ou destino..."
          />
        </div>
      </header>

      {/* Database Import Section */}
      {!useDatabase && dbBusLines.length === 0 && (
        <section className="bg-white shadow-card">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-md mx-auto">
              <DataImporter onDataImported={handleDataImported} />
            </div>
          </div>
        </section>
      )}

      {/* Quick Hour Filters */}
      {(useDatabase ? dbBusLines.length > 0 : true) && (
        <section className="bg-white shadow-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Horários populares:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {popularHours.map((hour) => {
                const isSelected = useDatabase ? dbSelectedHour === hour : selectedHour === hour;
                const onHourClick = useDatabase ? setDbSelectedHour : setSelectedHour;
                
                return (
                  <button
                    key={hour}
                    onClick={() => onHourClick(isSelected ? null : hour)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-smooth ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {hour}:00
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Ad Space - Top */}
      <AdSpace position="top" />

      <main className="container mx-auto px-4 py-6">
        {/* Results Section */}
        {(useDatabase ? dbBusLines.length > 0 : true) && (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">
                  {loading && useDatabase ? "Carregando..." : 
                    `${useDatabase ? filteredDbBusLines.length : filteredBusLines.length} linhas encontradas`
                  }
                  {useDatabase && <Badge variant="outline" className="ml-2">Banco de Dados</Badge>}
                </h2>
              </div>
              {(useDatabase ? hasDbFilters : (searchTerm || selectedHour)) && (
                <button
                  onClick={useDatabase ? clearDbFilters : () => {
                    setSearchTerm("");
                    setSelectedHour(null);
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Bus Lines Grid */}
            {loading && useDatabase ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground animate-spin" />
                </div>
                <h3 className="text-lg font-medium mb-2">Carregando dados do banco...</h3>
              </div>
            ) : error && useDatabase ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Erro ao carregar dados</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:gap-6">
                {(useDatabase ? filteredDbBusLines.length : filteredBusLines.length) > 0 ? (
                  (useDatabase ? filteredDbBusLines : filteredBusLines).map((line, index) => (
                    <div key={useDatabase ? line.id : line.url}>
                      {useDatabase ? 
                        <BusLineCardDb line={line} /> : 
                        <BusLineCard line={line} />
                      }
                      {/* Ad Space - Between Results */}
                      {(index + 1) % 5 === 0 && <AdSpace position="between" />}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Nenhuma linha encontrada</h3>
                    <p className="text-muted-foreground">
                      Tente buscar por outro termo ou remova os filtros
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Ad Space - Bottom */}
        <AdSpace position="bottom" />
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bus className="h-5 w-5 text-primary" />
                <span className="font-semibold">BH Ônibus</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Consulte horários de ônibus metropolitanos de Belo Horizonte de forma rápida e fácil.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3">Informações</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>📍 Região Metropolitana de BH</li>
                <li>🚌 {busLines.length} linhas disponíveis</li>
                <li>⏰ Horários atualizados diariamente</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-6 pt-6 text-center text-sm text-muted-foreground">
            <p>© 2024 BH Ônibus - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;