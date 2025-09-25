import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateStats {
  lastUpdate: string | null;
  totalLines: number;
  successfulLines: number;
  failedLines: number;
  isUpdating: boolean;
}

export const UpdateManager = () => {
  const [stats, setStats] = useState<UpdateStats>({
    lastUpdate: null,
    totalLines: 0,
    successfulLines: 0,
    failedLines: 0,
    isUpdating: false
  });
  const { toast } = useToast();

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get update statistics
      const { data: scrapedData } = await supabase
        .from('scraped_bus_lines')
        .select('scraping_status, last_scraped_at')
        .order('last_scraped_at', { ascending: false });

      if (scrapedData) {
        const successful = scrapedData.filter(line => line.scraping_status === 'success').length;
        const failed = scrapedData.filter(line => line.scraping_status === 'failed').length;
        const lastUpdate = scrapedData[0]?.last_scraped_at || null;

        setStats({
          lastUpdate,
          totalLines: scrapedData.length,
          successfulLines: successful,
          failedLines: failed,
          isUpdating: false
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const runUpdate = async () => {
    try {
      setStats(prev => ({ ...prev, isUpdating: true }));
      
      toast({
        title: "🔄 Iniciando atualização",
        description: "Buscando novas linhas e horários...",
      });

      // Call the edge function to process all lines
      const { data, error } = await supabase.functions.invoke('process-all-lines', {
        body: { 
          forceRefresh: true,
          batchSize: 10 
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Atualização iniciada",
        description: "O sistema está processando as atualizações em segundo plano.",
      });

      // Reload stats after a short delay
      setTimeout(() => {
        loadStats();
      }, 2000);

    } catch (error) {
      console.error('Error running update:', error);
      toast({
        title: "❌ Erro na atualização",
        description: "Não foi possível iniciar a atualização. Tente novamente.",
        variant: "destructive"
      });
      setStats(prev => ({ ...prev, isUpdating: false }));
    }
  };

  const runQuickScrape = async () => {
    try {
      setStats(prev => ({ ...prev, isUpdating: true }));
      
      toast({
        title: "🚀 Executando scraping rápido",
        description: "Atualizando horários das linhas principais...",
      });

      // Call the scraping function
      const { data, error } = await supabase.functions.invoke('scrape-bus-schedules', {
        body: { 
          enhanced: true,
          maxUrls: 20 
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Scraping iniciado",
        description: "Horários sendo atualizados em segundo plano.",
      });

      setTimeout(() => {
        loadStats();
      }, 3000);

    } catch (error) {
      console.error('Error running scrape:', error);
      toast({
        title: "❌ Erro no scraping",
        description: "Não foi possível executar o scraping. Tente novamente.",
        variant: "destructive"
      });
      setStats(prev => ({ ...prev, isUpdating: false }));
    }
  };

  const formatLastUpdate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Há menos de 1 hora';
    if (diffInHours < 24) return `Há ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Há 1 dia';
    if (diffInDays < 7) return `Há ${diffInDays} dias`;
    
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sistema de Atualização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">
              {stats.totalLines}
            </div>
            <div className="text-sm text-muted-foreground">
              Total de Linhas
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950">
            <div className="text-2xl font-bold text-green-600">
              {stats.successfulLines}
            </div>
            <div className="text-sm text-muted-foreground">
              Atualizadas
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950">
            <div className="text-2xl font-bold text-red-600">
              {stats.failedLines}
            </div>
            <div className="text-sm text-muted-foreground">
              Com Erro
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="text-sm font-medium text-blue-600 mb-1">
              Última Atualização
            </div>
            <div className="text-sm text-muted-foreground">
              {formatLastUpdate(stats.lastUpdate)}
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {stats.isUpdating && (
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Atualizando...
            </Badge>
          )}
          
          {stats.successfulLines > 0 && (
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <CheckCircle className="w-3 h-3 mr-1" />
              {stats.successfulLines} linhas OK
            </Badge>
          )}
          
          {stats.failedLines > 0 && (
            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
              <AlertCircle className="w-3 h-3 mr-1" />
              {stats.failedLines} com erro
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={runUpdate}
            disabled={stats.isUpdating}
            className="flex-1 min-w-0"
          >
            {stats.isUpdating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Database className="w-4 h-4 mr-2" />
            )}
            Atualização Completa
          </Button>
          
          <Button
            onClick={runQuickScrape}
            disabled={stats.isUpdating}
            variant="outline"
            className="flex-1 min-w-0"
          >
            {stats.isUpdating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Clock className="w-4 h-4 mr-2" />
            )}
            Scraping Rápido
          </Button>
          
          <Button
            onClick={loadStats}
            variant="ghost"
            size="sm"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Information */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Atualização Completa:</strong> Busca novas linhas e atualiza todas as informações.
            <br />
            <strong>Scraping Rápido:</strong> Atualiza apenas os horários das linhas existentes.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};