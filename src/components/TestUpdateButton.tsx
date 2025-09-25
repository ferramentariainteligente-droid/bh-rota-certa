import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const TestUpdateButton = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateResult, setLastUpdateResult] = useState<any>(null);
  const { toast } = useToast();

  const runQuickUpdate = async () => {
    setIsUpdating(true);
    
    try {
      toast({
        title: "🔍 Verificando atualizações",
        description: "Executando uma verificação rápida...",
      });

      // Test the edge function directly
      const { data, error } = await supabase.functions.invoke('test-scrape', {
        body: { 
          test: true,
          quick_check: true 
        }
      });

      if (error) {
        throw error;
      }

      setLastUpdateResult(data);
      
      toast({
        title: "✅ Verificação concluída",
        description: "Sistema de atualização funcionando normalmente.",
      });

      // Try a quick scraping update
      setTimeout(async () => {
        try {
          const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('scrape-bus-schedules', {
            body: { 
              enhanced: true,
              maxUrls: 5 // Just test a few URLs
            }
          });

          if (!scrapeError) {
            toast({
              title: "🚀 Atualização de teste iniciada",
              description: "Processando algumas linhas para verificar o sistema...",
            });
          }
        } catch (err) {
          console.log('Quick scrape test failed:', err);
        }
      }, 1000);

    } catch (error) {
      console.error('Update test failed:', error);
      toast({
        title: "❌ Erro na verificação",
        description: "Não foi possível verificar atualizações: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button
      onClick={runQuickUpdate}
      disabled={isUpdating}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {isUpdating ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : lastUpdateResult ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      {isUpdating ? 'Verificando...' : 'Verificar Atualizações'}
    </Button>
  );
};