import { Bus, Clock, MapPin, Sparkles } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { BusLineCard } from "@/components/BusLineCard";
import { AdSpace } from "@/components/AdSpace";
import { BusDataUpdater } from "@/components/BusDataUpdater";
import { useState } from "react";
import { useBusSearch } from "@/hooks/useBusSearch";
import busLinesData from "@/data/bus-lines.json";

interface ExtractedSchedule {
  tipo: string;
  horarios: string[];
}

interface BusLine {
  url: string;
  linha: string;
  horarios: string[];
  schedulesDetailed?: ExtractedSchedule[];
  lastUpdated?: string;
}

const Index = () => {
  const [busLines, setBusLines] = useState(busLinesData as BusLine[]);
  
  const {
    searchTerm,
    setSearchTerm,
    selectedHour,
    setSelectedHour,
    filteredBusLines,
    clearFilters,
    hasFilters
  } = useBusSearch(busLines);

  const handleUpdateComplete = (updatedLines: any[]) => {
    setBusLines(updatedLines);
  };

  const popularHours = ["05", "06", "07", "08", "17", "18", "19", "22"];

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
          
          <SearchBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Busque sua linha ou destino..."
          />
        </div>
      </header>

      {/* Quick Hour Filters */}
        <section className="bg-white shadow-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Horários populares:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {popularHours.map((hour) => {
                const isSelected = selectedHour === hour;
                
                return (
                  <button
                    key={hour}
                    onClick={() => setSelectedHour(isSelected ? null : hour)}
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

      {/* Ad Space - Top */}
      <AdSpace position="top" />

      <main className="container mx-auto px-4 py-6">
        {/* Results Section */}
        <>
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                {filteredBusLines.length} linhas encontradas
              </h2>
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
              >
                Limpar filtros
              </button>
            )}
          </div>

          {/* Bus Lines Grid */}
          <div className="grid gap-4 md:gap-6">
            {filteredBusLines.length > 0 ? (
              filteredBusLines.map((line, index) => (
                <div key={line.url}>
                  <BusLineCard line={line} />
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
        </>

      </main>

      {/* Data Updater Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              🔄 Atualizar Dados das Linhas
            </h2>
            <p className="text-muted-foreground">
              Capture horários detalhados por dia da semana dos sites oficiais
            </p>
          </div>
          <BusDataUpdater 
            busLines={busLines}
            onUpdateComplete={handleUpdateComplete}
          />
        </div>
      </section>

      {/* Ad Space - Bottom */}
      <AdSpace position="bottom" />

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