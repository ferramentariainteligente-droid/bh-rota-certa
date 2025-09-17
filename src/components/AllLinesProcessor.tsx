import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Play, Pause, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProcessingStats {
  total_lines_processed: number;
  total_lines_updated: number;
  total_lines_failed: number;
  next_start_index: number;
}

export const AllLinesProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [stats, setStats] = useState<ProcessingStats>({
    total_lines_processed: 0,
    total_lines_updated: 0,
    total_lines_failed: 0,
    next_start_index: 0
  });
  const [progress, setProgress] = useState(0);
  const [executionId, setExecutionId] = useState<string>('');
  const { toast } = useToast();

  const processBatch = async (startIndex: number = 0, batchSize: number = 8) => {
    try {
      console.log(`Processing batch starting at index ${startIndex}`);
      
      const { data, error } = await supabase.functions.invoke('process-all-lines', {
        body: {
          batch_size: batchSize,
          start_index: startIndex
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to process batch');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Batch processing failed');
      }

      return data.statistics as ProcessingStats;
    } catch (error) {
      console.error('Error processing batch:', error);
      throw error;
    }
  };

  const processAllLines = async () => {
    setIsProcessing(true);
    setCurrentBatch(0);
    setStats({
      total_lines_processed: 0,
      total_lines_updated: 0,
      total_lines_failed: 0,
      next_start_index: 0
    });
    setProgress(0);

    try {
      const totalLinesToProcess = 8; // Total estimated lines
      const batchSize = 4; // Process 4 lines at a time
      let currentIndex = 0;
      let accumulatedStats = {
        total_lines_processed: 0,
        total_lines_updated: 0,
        total_lines_failed: 0,
        next_start_index: 0
      };

      toast({
        title: "Processamento Iniciado",
        description: "Iniciando categorização de todas as linhas de ônibus...",
      });

      while (currentIndex < totalLinesToProcess) {
        console.log(`Processing batch ${Math.floor(currentIndex / batchSize) + 1}`);
        setCurrentBatch(Math.floor(currentIndex / batchSize) + 1);

        const batchStats = await processBatch(currentIndex, batchSize);
        
        // Accumulate statistics
        accumulatedStats.total_lines_processed += batchStats.total_lines_processed;
        accumulatedStats.total_lines_updated += batchStats.total_lines_updated;
        accumulatedStats.total_lines_failed += batchStats.total_lines_failed;
        accumulatedStats.next_start_index = batchStats.next_start_index;
        
        setStats(accumulatedStats);
        
        // Update progress
        const progressPercentage = Math.min(
          (accumulatedStats.total_lines_processed / totalLinesToProcess) * 100,
          100
        );
        setProgress(progressPercentage);

        toast({
          title: `Lote ${Math.floor(currentIndex / batchSize) + 1} Concluído`,
          description: `Processadas ${batchStats.total_lines_processed} linhas. ${batchStats.total_lines_updated} sucessos, ${batchStats.total_lines_failed} falhas.`,
        });

        currentIndex = batchStats.next_start_index;
        
        // Break if we've processed all available lines
        if (batchStats.total_lines_processed < batchSize) {
          break;
        }

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      toast({
        title: "Processamento Concluído!",
        description: `Total: ${accumulatedStats.total_lines_updated} linhas categorizadas com sucesso.`,
      });

    } catch (error) {
      console.error('Error in processAllLines:', error);
      toast({
        title: "Erro no Processamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetProgress = () => {
    setCurrentBatch(0);
    setStats({
      total_lines_processed: 0,
      total_lines_updated: 0,
      total_lines_failed: 0,
      next_start_index: 0
    });
    setProgress(0);
    setExecutionId('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Categorização de Todas as Linhas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Processa todas as linhas de ônibus para extrair categorias de horários (dias úteis, sábado, domingo, feriados).
          Este processo pode levar alguns minutos.
        </div>

        {/* Progress Display */}
        {(isProcessing || stats.total_lines_processed > 0) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso Geral</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            
            {currentBatch > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                Processando lote {currentBatch}...
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        {stats.total_lines_processed > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total_lines_processed}
              </div>
              <div className="text-xs text-muted-foreground">Processadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.total_lines_updated}
              </div>
              <div className="text-xs text-muted-foreground">Sucessos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.total_lines_failed}
              </div>
              <div className="text-xs text-muted-foreground">Falhas</div>
            </div>
          </div>
        )}

        {/* Status Badges */}
        <div className="flex gap-2 flex-wrap">
          {isProcessing && (
            <Badge variant="default" className="bg-blue-500">
              <Play className="h-3 w-3 mr-1" />
              Processando...
            </Badge>
          )}
          {!isProcessing && stats.total_lines_updated > 0 && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Concluído
            </Badge>
          )}
          {stats.total_lines_failed > 0 && (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              {stats.total_lines_failed} falhas
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={processAllLines}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Processando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Iniciar Categorização
              </>
            )}
          </Button>
          
          {stats.total_lines_processed > 0 && !isProcessing && (
            <Button
              onClick={resetProgress}
              variant="outline"
              size="icon"
              title="Limpar progresso"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Info Alert */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm text-blue-800 dark:text-blue-200">
          <div className="font-medium mb-1">Como funciona:</div>
          <ul className="text-xs space-y-1">
            <li>• Processa linhas em lotes pequenos para evitar timeouts</li>
            <li>• Extrai categorias: dias úteis, sábados, domingos e feriados</li>
            <li>• Salva os dados categorizados no banco de dados</li>
            <li>• Atualiza automaticamente a interface de usuário</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};