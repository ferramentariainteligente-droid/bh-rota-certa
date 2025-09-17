import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  RefreshCw, 
  Globe, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Activity,
  Download,
  Play,
  Pause,
  TestTube,
  ExternalLink
} from 'lucide-react';

interface ScrapingSource {
  id: string;
  name: string;
  base_url: string;
  site_type: string;
  is_active: boolean;
  last_scraped_at: string | null;
  scraping_config: any;
}

interface ScrapingLog {
  id: string;
  source_id: string;
  execution_id: string;
  status: string;
  lines_found: number;
  lines_processed: number;
  lines_updated: number;
  lines_failed: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  execution_details: any;
}

interface ScrapedBusLine {
  id: string;
  source_id: string;
  line_code: string;
  line_name: string;
  line_url: string;
  route_description: string;
  scraping_status: string;
  schedule_data: any;
  metadata: any;
  last_scraped_at: string | null;
}

export const ScrapingManager = () => {
  const { toast } = useToast();
  const [sources, setSources] = useState<ScrapingSource[]>([]);
  const [logs, setLogs] = useState<ScrapingLog[]>([]);
  const [scrapedLines, setScrapedLines] = useState<ScrapedBusLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('sources');
  const [testUrl, setTestUrl] = useState('https://movemetropolitano.com.br/4211-terminal-sao-benedito-circular-conjunto-cristina');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Load initial data
  useEffect(() => {
    loadSources();
    loadRecentLogs();
    loadScrapedLines();
  }, []);

  const loadSources = async () => {
    try {
      const { data, error } = await supabase
        .from('scraping_sources')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSources(data || []);
    } catch (error) {
      console.error('Error loading sources:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar fontes de scraping",
        variant: "destructive"
      });
    }
  };

  const loadRecentLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('scraping_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const loadScrapedLines = async () => {
    try {
      const { data, error } = await supabase
        .from('scraped_bus_lines')
        .select('*')
        .order('last_scraped_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setScrapedLines(data || []);
    } catch (error) {
      console.error('Error loading scraped lines:', error);
    }
  };

  const testConnection = async () => {
    try {
      console.log('Testing connection to edge functions...');
      
      const response = await supabase.functions.invoke('test-scrape', {
        body: { test: true }
      });

      console.log('Test response:', response);

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Teste de Conexão",
        description: "Conexão com Edge Functions funcionando! ✅",
        duration: 3000
      });

      // Reload logs to see the test entry
      setTimeout(() => {
        loadRecentLogs();
      }, 1000);

    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Erro no Teste",
        description: "Falha na conexão: " + error.message,
        variant: "destructive"
      });
    }
  };

  const testUrlScraping = async () => {
    if (!testUrl.trim()) {
      toast({
        title: "URL Necessária",
        description: "Por favor, insira uma URL para testar",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      console.log('Testing URL scraping:', testUrl);
      
      const response = await supabase.functions.invoke('test-scrape', {
        body: { test_url: testUrl }
      });

      console.log('Test scrape response:', response);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      setTestResult(result);

      if (result.success) {
        toast({
          title: "Teste Bem-sucedido! 🎉",
          description: `Extraídos ${result.test_result.schedules_found} tipos de horário`,
          duration: 5000
        });
      } else {
        toast({
          title: "Teste Falhou",
          description: result.message,
          variant: "destructive"
        });
      }

      // Reload logs to see the test entry
      setTimeout(() => {
        loadRecentLogs();
      }, 1000);

    } catch (error) {
      console.error('URL scraping test failed:', error);
      toast({
        title: "Erro no Teste",
        description: "Falha ao testar scraping: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const startScraping = async (selectedSourceIds: string[] = []) => {
    setIsLoading(true);
    setIsRunning(true);

    try {
      const response = await supabase.functions.invoke('scrape-bus-schedules', {
        body: { 
          source_ids: selectedSourceIds,
          force_refresh: true 
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      setCurrentExecution(result.execution_id);

      toast({
        title: "Scraping Iniciado",
        description: `Processando ${result.sources_processed} fontes. ID: ${result.execution_id}`,
        duration: 5000
      });

      // Reload data after a delay
      setTimeout(() => {
        loadRecentLogs();
        loadScrapedLines();
        loadSources();
      }, 3000);

    } catch (error) {
      console.error('Error starting scraping:', error);
      toast({
        title: "Erro",
        description: "Falha ao iniciar scraping: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRunning(false);
    }
  };

  const exportScrapedData = async () => {
    try {
      const { data, error } = await supabase
        .from('scraped_bus_lines')
        .select('*')
        .eq('scraping_status', 'success')
        .not('schedule_data', 'is', null);

      if (error) throw error;

        // Transform data for export
        const exportData = data.map(line => {
          const scheduleData = line.schedule_data as any;
          return {
            linha: `${line.line_code} - ${line.line_name}`,
            url: line.line_url,
            horarios: [], // Keep for compatibility
            schedulesDetailed: scheduleData?.schedules || [],
            lastUpdated: line.last_scraped_at,
            source: sources.find(s => s.id === line.source_id)?.name || 'Desconhecido',
            metadata: line.metadata
          };
        });

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bus-schedules-scraped-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportação Concluída",
        description: `${exportData.length} linhas exportadas com sucesso`
      });

    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Erro na Exportação",
        description: "Falha ao exportar dados: " + error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      success: { variant: "default" as const, icon: CheckCircle2, text: "Sucesso" },
      failed: { variant: "destructive" as const, icon: AlertCircle, text: "Falhou" },
      pending: { variant: "secondary" as const, icon: Clock, text: "Pendente" },
      processing: { variant: "secondary" as const, icon: RefreshCw, text: "Processando" },
      completed: { variant: "default" as const, icon: CheckCircle2, text: "Completo" },
      error: { variant: "destructive" as const, icon: AlertCircle, text: "Erro" }
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getSourceStats = () => {
    const activeCount = sources.filter(s => s.is_active).length;
    const totalScrapedLines = scrapedLines.length;
    const successfulLines = scrapedLines.filter(l => l.scraping_status === 'success').length;
    const linesWithSchedules = scrapedLines.filter(l => {
      const scheduleData = l.schedule_data as any;
      return scheduleData?.schedules && Array.isArray(scheduleData.schedules) && scheduleData.schedules.length > 0;
    }).length;

    return { activeCount, totalScrapedLines, successfulLines, linesWithSchedules };
  };

  const stats = getSourceStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Sistema de Scraping Automático
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-background/50 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-primary">{stats.activeCount}</div>
              <div className="text-sm text-muted-foreground">Fontes Ativas</div>
            </div>
            <div className="bg-background/50 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{stats.totalScrapedLines}</div>
              <div className="text-sm text-muted-foreground">Linhas Descobertas</div>
            </div>
            <div className="bg-background/50 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{stats.successfulLines}</div>
              <div className="text-sm text-muted-foreground">Processadas com Sucesso</div>
            </div>
            <div className="bg-background/50 p-4 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{stats.linesWithSchedules}</div>
              <div className="text-sm text-muted-foreground">Com Horários Detalhados</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => startScraping()}
              disabled={isLoading || isRunning}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isLoading ? 'Processando...' : 'Iniciar Scraping Completo'}
            </Button>

            <Button 
              onClick={testConnection}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Testar Conexão
            </Button>

            <Button 
              onClick={exportScrapedData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar Dados
            </Button>

            <Button 
              onClick={() => {
                loadSources();
                loadRecentLogs();
                loadScrapedLines();
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar Dados
            </Button>
          </div>

          {isRunning && currentExecution && (
            <Alert className="mt-4">
              <Activity className="h-4 w-4" />
              <AlertDescription>
                Execução em andamento - ID: {currentExecution}
                <Progress value={50} className="mt-2" />
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sources">Fontes de Scraping</TabsTrigger>
          <TabsTrigger value="test">Teste de URL</TabsTrigger>
          <TabsTrigger value="logs">Logs de Execução</TabsTrigger>
          <TabsTrigger value="results">Linhas Descobertas</TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Fontes Configuradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sources.map((source) => (
                  <div key={source.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{source.name}</h3>
                        <p className="text-sm text-muted-foreground">{source.base_url}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant={source.is_active ? "default" : "secondary"}>
                            {source.is_active ? "Ativa" : "Inativa"}
                          </Badge>
                          <Badge variant="outline">{source.site_type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Última execução: {formatDateTime(source.last_scraped_at)}
                          </span>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => startScraping([source.id])}
                        disabled={isLoading || !source.is_active}
                        className="flex items-center gap-2"
                      >
                        <Play className="w-3 h-3" />
                        Executar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Teste de Scraping de URL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-url">URL para Teste</Label>
                <div className="flex gap-2">
                  <Input
                    id="test-url"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder="https://movemetropolitano.com.br/..."
                    className="flex-1"
                  />
                  <Button
                    onClick={testUrlScraping}
                    disabled={isTesting || !testUrl.trim()}
                    className="flex items-center gap-2"
                  >
                    {isTesting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                    {isTesting ? 'Testando...' : 'Testar Scraping'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(testUrl, '_blank')}
                    disabled={!testUrl.trim()}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir
                  </Button>
                </div>
              </div>

              {testResult && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {testResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <h3 className="font-semibold">
                        {testResult.success ? 'Teste Bem-sucedido' : 'Teste Falhou'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-muted/30 p-3 rounded">
                        <div className="text-lg font-bold text-blue-600">
                          {testResult.test_result?.schedules_found || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Tipos de Horário</div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded">
                        <div className="text-lg font-bold text-purple-600">
                          {testResult.test_result?.schedule_types?.reduce((acc, type) => acc + type.times_count, 0) || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Total de Horários</div>
                      </div>
                      <div className="bg-muted/30 p-3 rounded">
                        <div className="text-lg font-bold text-green-600">
                          {testResult.test_result?.metadata?.sections_found || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Seções Encontradas</div>
                      </div>
                    </div>

                    {testResult.success && testResult.test_result?.schedule_types?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Tipos de Horário Detectados:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {testResult.test_result.schedule_types.map((type, index) => (
                            <div key={index} className="bg-background border rounded p-2 flex justify-between items-center">
                              <span className="text-sm font-medium">{type.type}</span>
                              <Badge variant="secondary">{type.times_count} horários</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {testResult.detailed_schedules && testResult.detailed_schedules.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h4 className="font-medium">Horários Completos:</h4>
                        <div className="max-h-96 overflow-y-auto space-y-3">
                          {testResult.detailed_schedules.map((schedule, index) => (
                            <div key={index} className="bg-background border rounded p-3">
                              <div className="font-medium mb-2">{schedule.tipo}</div>
                              <div className="flex flex-wrap gap-1">
                                {schedule.horarios.slice(0, 20).map((horario, hIndex) => (
                                  <span key={hIndex} className="px-2 py-1 bg-muted text-xs rounded">
                                    {horario}
                                  </span>
                                ))}
                                {schedule.horarios.length > 20 && (
                                  <span className="px-2 py-1 bg-muted text-xs rounded">
                                    +{schedule.horarios.length - 20} mais
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {testResult.test_result?.error && (
                      <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Erro:</strong> {testResult.test_result.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">💡 URLs de Exemplo para Teste:</h4>
                <div className="space-y-1 text-sm">
                  <div 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => setTestUrl('https://movemetropolitano.com.br/4211-terminal-sao-benedito-circular-conjunto-cristina')}
                  >
                    • https://movemetropolitano.com.br/4211-terminal-sao-benedito-circular-conjunto-cristina
                  </div>
                  <div 
                    className="cursor-pointer hover:text-primary"
                    onClick={() => setTestUrl('https://movemetropolitano.com.br/5889-vila-maria-terminal-vilarinho')}
                  >
                    • https://movemetropolitano.com.br/5889-vila-maria-terminal-vilarinho
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Execuções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.slice(0, 20).map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusBadge(log.status)}
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                            {log.execution_id}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Encontradas:</span>
                            <span className="ml-1 font-semibold">{log.lines_found || 0}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Processadas:</span>
                            <span className="ml-1 font-semibold">{log.lines_processed || 0}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Atualizadas:</span>
                            <span className="ml-1 font-semibold">{log.lines_updated || 0}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Falhas:</span>
                            <span className="ml-1 font-semibold">{log.lines_failed || 0}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {formatDateTime(log.started_at)}
                          {log.completed_at && ` - ${formatDateTime(log.completed_at)}`}
                        </div>
                        {log.error_message && (
                          <Alert className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              {log.error_message}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Linhas de Ônibus Descobertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {scrapedLines.slice(0, 50).map((line) => (
                  <div key={line.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{line.line_code} - {line.line_name}</h4>
                        <p className="text-xs text-muted-foreground">{line.route_description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {getStatusBadge(line.scraping_status)}
                          {(() => {
                            const scheduleData = line.schedule_data as any;
                            return scheduleData?.schedules && Array.isArray(scheduleData.schedules) && (
                              <Badge variant="outline">
                                {scheduleData.schedules.length} tipos de horário
                              </Badge>
                            );
                          })()}
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(line.last_scraped_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};