import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BusDataUpdater } from '@/components/BusDataUpdater';
import { ScrapingManager } from '@/components/ScrapingManager';
import { AllLinesProcessor } from '@/components/AllLinesProcessor';
import { Bus, LogOut, Settings, Database, Download, Upload, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useIntegratedBusData } from '@/hooks/useIntegratedBusData';
import { AdSenseManager } from '@/components/AdSenseManager';
import { ReportsManagement } from '@/components/ReportsManagement';
import busLinesData from '@/data/bus-lines.json';

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

const AdminPanel = () => {
  const { busLines, loading, error, refreshData, totalLines, linesWithSchedules, linesFromScraping } = useIntegratedBusData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const analytics = useAnalytics();

  // Calculate additional stats
  const processableLines = busLines.filter(line => 
    line.url && 
    line.url.trim() !== '' &&
    (line.url.startsWith('http') || line.url.startsWith('www'))
  ).length;
  
  const ignoredLines = totalLines - processableLines;

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth');
    if (!isAuthenticated) {
      navigate('/admin/login');
    } else {
      analytics.trackPageView('Admin Panel');
    }
  }, [navigate, analytics]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    analytics.trackLogout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do painel administrativo.",
    });
    navigate('/');
  };

  const handleUpdateComplete = (updatedLines: BusLine[]) => {
    // Refresh integrated data after update
    refreshData();
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            // Note: This would need additional logic to merge with Supabase data
            analytics.trackDataImport(data.length);
            toast({
              title: "✅ Dados importados",
              description: `${data.length} linhas importadas com sucesso.`,
            });
            refreshData(); // Refresh to show updated data
          } catch (error) {
            toast({
              title: "❌ Erro na importação",
              description: "Arquivo JSON inválido.",
              variant: "destructive"
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(busLines, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bus-lines-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    analytics.trackDataExport(busLines.length);
  };

  const linesWithDetailedSchedules = linesWithSchedules;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
                <p className="text-white/90 text-sm">Gestão do sistema BH Ônibus</p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dataset" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dataset" className="text-sm md:text-base">
              📊 Dataset Manual
            </TabsTrigger>
            <TabsTrigger value="scraping" className="text-sm md:text-base">
              🕷️ Scraping Automático
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-sm md:text-base">
              📝 Relatórios
            </TabsTrigger>
            <TabsTrigger value="adsense" className="text-sm md:text-base">
              💰 Google AdSense
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dataset" className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Bus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalLines}</p>
                  <p className="text-sm text-muted-foreground">Total de Linhas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Database className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {processableLines}
                  </p>
                  <p className="text-sm text-muted-foreground">Linhas Processáveis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{linesWithDetailedSchedules}</p>
                  <p className="text-sm text-muted-foreground">Com Horários Detalhados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Settings className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {ignoredLines}
                  </p>
                  <p className="text-sm text-muted-foreground">Linhas Ignoradas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Análise Detalhada do Dataset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Status das Linhas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total no sistema:</span>
                      <strong>{totalLines}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Com URLs válidas:</span>
                      <strong className="text-green-600">
                        {processableLines}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Sem URL ou inválida:</span>
                      <strong className="text-orange-600">
                        {ignoredLines}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Com horários detalhados:</span>
                      <strong className="text-blue-600">{linesWithDetailedSchedules}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Dados do Supabase:</span>
                      <strong className="text-purple-600">{linesFromScraping}</strong>
                    </div>
                  </div>
                </div>

              <div>
                <h4 className="font-medium mb-3">Taxa de Cobertura</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Processáveis</span>
                      <span>{Math.round((processableLines / totalLines) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{width: `${(processableLines / totalLines) * 100}%`}}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Com horários detalhados</span>
                      <span>{Math.round((linesWithDetailedSchedules / totalLines) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{width: `${(linesWithDetailedSchedules / totalLines) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="h-20 flex-col gap-2"
              >
                <Download className="h-6 w-6" />
                Exportar Backup
                <span className="text-xs text-muted-foreground">Baixar dados atuais</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleImportData}
                className="h-20 flex-col gap-2"
              >
                <Upload className="h-6 w-6" />
                Importar Dados
                <span className="text-xs text-muted-foreground">Restaurar backup</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading/Error States */}
        {loading && (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Carregando dados integrados...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao carregar dados integrados: {error}. Usando apenas dados locais.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Data Updater */}
        <BusDataUpdater 
          busLines={busLines}
          onUpdateComplete={handleUpdateComplete}
        />

        {/* All Lines Processor */}
        <AllLinesProcessor />

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Voltar ao site principal
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="scraping">
        <ScrapingManager />
      </TabsContent>

      <TabsContent value="reports">
        <ReportsManagement />
      </TabsContent>

      <TabsContent value="adsense">
        <AdSenseManager />
      </TabsContent>
    </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;