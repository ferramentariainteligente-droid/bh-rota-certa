import { Bus, Clock, MapPin, Sparkles, RefreshCw, Database } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { BusLineCard } from "@/components/BusLineCard";
import { AdSpace } from "@/components/AdSpace";
import { PWAPrompt } from "@/components/PWAPrompt";
import { LocationSuggestions } from "@/components/LocationSuggestions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingStates } from "@/components/LoadingStates";
import { useEffect, useState } from 'react';

import { useIntegratedBusData } from '@/hooks/useIntegratedBusData';
import { useBusSearch } from "@/hooks/useBusSearch";
import { useVisitorStats } from '@/hooks/useVisitorStats';
import { AuthButton } from '@/components/AuthButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationCenter } from '@/components/NotificationCenter';
import { UpdateManager } from '@/components/UpdateManager';
import { TestUpdateButton } from '@/components/TestUpdateButton';
import { AdvancedFilters, type FilterConfig } from '@/components/AdvancedFilters';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';

const Index = () => {
  const { trackPageView } = useVisitorStats();
  const [advancedFilters, setAdvancedFilters] = useState<FilterConfig>({
    regions: [],
    timeRanges: [],
    lineTypes: [],
    hasSchedules: null,
    sortBy: 'line_number'
  });
  
  useEffect(() => {
    trackPageView('/horarios');
  }, []); // Empty dependency array to avoid infinite loop
  const { 
    busLines, 
    loading, 
    error, 
    refreshData, 
    totalLines, 
    linesWithSchedules,
    linesFromScraping 
  } = useIntegratedBusData();
  
  const {
    searchTerm,
    setSearchTerm,
    selectedHour,
    setSelectedHour,
    filteredBusLines,
    clearFilters,
    hasFilters
  } = useBusSearch(busLines);

  const popularHours = ["05", "06", "07", "08", "17", "18", "19", "22"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Bus className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">BH Ônibus</h1>
                <p className="text-white/90 text-sm">Horários de Belo Horizonte e Região Metropolitana</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Status Badges */}
              <div className="hidden md:flex flex-col items-end gap-1">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                  {totalLines} linhas
                </Badge>
                {linesWithSchedules > 0 && (
                  <Badge variant="secondary" className="bg-green-500/20 text-white border-green-300/30 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {linesWithSchedules} categorizadas
                  </Badge>
                )}
                {linesFromScraping > 0 && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-white border-blue-300/30 text-xs">
                    <Database className="w-3 h-3 mr-1" />
                    {linesFromScraping} atualizadas
                  </Badge>
                )}
              </div>
              
              {/* User Actions */}
              <div className="flex items-center gap-2">
                <NotificationCenter />
                <ThemeToggle />
                <AuthButton />
              </div>
              
              {/* Update Manager Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    title="Sistema de atualização"
                  >
                    <Database className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogTitle>Sistema de Atualização</DialogTitle>
                  <UpdateManager />
                </DialogContent>
              </Dialog>
              
              {/* Refresh Button */}
              <Button
                onClick={refreshData}
                disabled={loading}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                title="Atualizar dados locais"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              
              {/* Admin Button */}
              <a 
                href="/admin/login" 
                className="inline-block px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-smooth font-medium text-sm"
              >
                🔐 Admin
              </a>
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

      {/* Location Suggestions */}
      <section className="container mx-auto px-4 py-6">
        <LocationSuggestions />
      </section>

      <main className="container mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && <LoadingStates type="bus-lines" count={5} />}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bus className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-red-700">Erro ao carregar dados</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* Results Section */}
        {!loading && !error && (
          <>
            {/* Results Summary and Filters */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">
                  {filteredBusLines.length} linhas encontradas
                </h2>
                {linesWithSchedules > 0 && (
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    {linesWithSchedules} com horários categorizados
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <AdvancedFilters
                  onFiltersChange={setAdvancedFilters}
                />
                <TestUpdateButton />
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    Limpar busca
                  </button>
                )}
              </div>
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
        )}
      </main>

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
              <div className="flex justify-center gap-6 text-sm">
                <a href="/" className="text-muted-foreground hover:text-foreground">Início</a>
                <a href="/sobre" className="text-muted-foreground hover:text-foreground">Sobre</a>
                <a href="/contato" className="text-muted-foreground hover:text-foreground">Contato</a>
                <a href="/privacidade" className="text-muted-foreground hover:text-foreground">Privacidade</a>
                <a href="/termos" className="text-muted-foreground hover:text-foreground">Termos</a>
              </div>
            </div>
          </div>
          <div className="border-t mt-6 pt-6 text-center text-sm text-muted-foreground">
            <p>© 2024 BH Ônibus - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
      
      <PWAPrompt />
    </div>
  );
};

export default Index;