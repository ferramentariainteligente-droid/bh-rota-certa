import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, RefreshCw, AlertCircle, Pause, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BusLine {
  url: string;
  linha: string;
  horarios: string[];
  schedulesDetailed?: any[];
  lastUpdated?: string;
}

interface BusDataUpdaterProps {
  busLines: BusLine[];
  onUpdateComplete?: (updatedLines: BusLine[]) => void;
}

export const BusDataUpdater = ({ busLines, onUpdateComplete }: BusDataUpdaterProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLine, setCurrentLine] = useState('');
  const [completedLines, setCompletedLines] = useState(0);
  const [failedLines, setFailedLines] = useState(0);
  const [batchSize] = useState(5); // Process 5 lines simultaneously
  const { toast } = useToast();

  const extractScheduleFromContent = (content: string, url: string) => {
    try {
      const schedules: any[] = [];
      const lines = content.split('\n');
      
      const schedulePatterns = [
        { pattern: /Dias Úteis(?!\s*[–-]\s*(?:Atípico|Férias))/i, tipo: 'dias_uteis' },
        { pattern: /Dias Úteis\s*[–-]\s*Férias/i, tipo: 'dias_uteis_ferias' },
        { pattern: /Sábado(?!\s*[–-]\s*Férias)/i, tipo: 'sabado' },
        { pattern: /Sábado\s*[–-]\s*Férias/i, tipo: 'sabado_ferias' },
        { pattern: /Domingos?\s*e\s*Feriados/i, tipo: 'domingo_feriado' }
      ];

      let currentType = '';
      let currentHorarios: string[] = [];

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Check for schedule type
        const matchedPattern = schedulePatterns.find(p => p.pattern.test(trimmedLine));
        if (matchedPattern) {
          // Save previous schedule
          if (currentType && currentHorarios.length > 0) {
            schedules.push({
              tipo: currentType,
              horarios: [...currentHorarios].sort()
            });
          }
          currentType = matchedPattern.tipo;
          currentHorarios = [];
          continue;
        }

        // Extract time
        if (currentType) {
          const timeMatch = trimmedLine.match(/^(\d{1,2}:\d{2})/);
          if (timeMatch && !currentHorarios.includes(timeMatch[1])) {
            currentHorarios.push(timeMatch[1]);
          }
        }
      }

      // Save last schedule
      if (currentType && currentHorarios.length > 0) {
        schedules.push({
          tipo: currentType,
          horarios: [...currentHorarios].sort()
        });
      }

      return schedules.length > 0 ? schedules : null;
    } catch (error) {
      console.error('Error extracting schedule:', error);
      return null;
    }
  };

  const processBatch = async (batch: BusLine[], batchIndex: number) => {
    const results = await Promise.allSettled(
      batch.map(async (line) => {
        try {
          // Skip invalid URLs
          if (!line.url || line.url.trim() === '' || (!line.url.startsWith('http') && !line.url.startsWith('www'))) {
            return line;
          }

          // Fix URLs that start with www but don't have protocol
          let processUrl = line.url;
          if (line.url.startsWith('www')) {
            processUrl = 'https://' + line.url;
          }

          const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(processUrl)}`);
          const data = await response.json();
          
          if (data.contents) {
            const schedules = extractScheduleFromContent(data.contents, line.url);
            if (schedules && schedules.length > 0) {
              return {
                ...line,
                schedulesDetailed: schedules,
                lastUpdated: new Date().toISOString()
              };
            }
          }
          return line;
        } catch (error) {
          console.error(`Error processing ${line.url}:`, error);
          return line;
        }
      })
    );

    return results.map(result => result.status === 'fulfilled' ? result.value : null);
  };

  const handleFullUpdate = async () => {
    if (isPaused) {
      setIsPaused(false);
      return;
    }

    setIsUpdating(true);
    setIsPaused(false);
    setProgress(0);
    setCompletedLines(0);
    setFailedLines(0);
    
    try {
      setCurrentLine('Enviando dados para processamento no servidor...');
      
      const response = await fetch('/functions/v1/process-bus-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          busLines: busLines,
          batchSize: batchSize
        })
      });

      const result = await response.json();

      if (result.success) {
        setProgress(100);
        setCompletedLines(result.stats.completed);
        setFailedLines(result.stats.failed);
        
        toast({
          title: "✅ Atualização Concluída (Servidor)",
          description: `${result.stats.completed} linhas atualizadas, ${result.stats.failed} falharam.`,
        });
        
        onUpdateComplete?.(result.data);
      } else {
        throw new Error(result.error || 'Erro no servidor');
      }

    } catch (error) {
      console.error('Error during backend update:', error);
      toast({
        title: "❌ Erro na Atualização",
        description: "Erro no processamento do servidor. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
      setProgress(0);
      setCurrentLine('');
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    setIsUpdating(false);
  };

  const downloadData = () => {
    const dataStr = JSON.stringify(busLines, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bus-lines-updated-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const validLines = busLines.filter(line => 
    line.url && 
    line.url.trim() !== '' &&
    (line.url.startsWith('http') || line.url.startsWith('www'))
  ).length;

  const linesWithSchedules = busLines.filter(line => line.schedulesDetailed?.length).length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Processamento Automático de {validLines} Linhas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Sistema irá processar <strong>{validLines} linhas válidas</strong> automaticamente em lotes de {batchSize}.
            <br />📊 Status: {linesWithSchedules} linhas já têm horários detalhados
          </AlertDescription>
        </Alert>

        {isUpdating && (
          <div className="space-y-3">
            <Progress value={progress} className="w-full h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{currentLine}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">{completedLines}</div>
                <div className="text-xs text-green-600">Atualizadas</div>
              </div>
              <div className="p-2 bg-red-50 rounded">
                <div className="text-lg font-bold text-red-600">{failedLines}</div>
                <div className="text-xs text-red-600">Falharam</div>
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-600">{completedLines + failedLines}</div>
                <div className="text-xs text-blue-600">Processadas</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!isUpdating ? (
            <Button 
              onClick={handleFullUpdate} 
              className="flex-1"
              size="lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Processar no Servidor ({validLines} linhas)
            </Button>
          ) : (
            <Button 
              onClick={handlePause}
              variant="outline" 
              className="flex-1"
              size="lg"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pausar Processamento
            </Button>
          )}
          
          <Button 
            variant="outline"
            onClick={downloadData}
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar JSON
          </Button>
        </div>

          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
            <p><strong>🚀 Processamento no Servidor:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Processa {validLines} linhas válidas no backend</li>
              <li>Extrai horários para Dias Úteis, Sábados, Domingos/Feriados</li>
              <li>Processamento otimizado e mais rápido</li>
              <li>Não sobrecarrega o navegador do usuário</li>
              <li>Download automático do JSON atualizado</li>
            </ul>
          </div>
      </CardContent>
    </Card>
  );
};