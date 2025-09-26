import { Loader2, Bus, Clock, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStatesProps {
  type: 'bus-lines' | 'search' | 'update' | 'general';
  count?: number;
  message?: string;
}

export const LoadingStates = ({ type, count = 3, message }: LoadingStatesProps) => {
  const getIcon = () => {
    switch (type) {
      case 'bus-lines':
        return <Bus className="w-8 h-8 text-primary animate-pulse" />;
      case 'search':
        return <Search className="w-8 h-8 text-primary animate-pulse" />;
      case 'update':
        return <Clock className="w-8 h-8 text-primary animate-spin" />;
      default:
        return <Loader2 className="w-8 h-8 text-primary animate-spin" />;
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'bus-lines':
        return 'Carregando linhas de ônibus...';
      case 'search':
        return 'Pesquisando horários...';
      case 'update':
        return 'Atualizando dados...';
      default:
        return 'Carregando...';
    }
  };

  // Render skeleton cards for bus-lines loading
  if (type === 'bus-lines') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
              
              <Skeleton className="h-6 w-3/4 mb-4" />
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-px flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <Skeleton key={j} className="h-8 w-12" />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // General loading state
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
        {getIcon()}
      </div>
      
      <h3 className="text-lg font-medium mb-2 text-center">
        {getMessage()}
      </h3>
      
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {type === 'search' && 'Aguarde enquanto buscamos as melhores opções de horários para você.'}
        {type === 'update' && 'Verificando atualizações nos horários...'}
      </p>
    </div>
  );
};