import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Clock, Trash2 } from 'lucide-react';
import { useSearchHistory } from '@/hooks/useSearchHistory';

interface SearchHistoryDropdownProps {
  onSelectSearch: (searchTerm: string) => void;
}

export const SearchHistoryDropdown = ({ onSelectSearch }: SearchHistoryDropdownProps) => {
  const { history, clearHistory } = useSearchHistory();
  const [open, setOpen] = useState(false);

  if (history.length === 0) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Clock className="h-4 w-4" />
          Histórico
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Buscas recentes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {history.slice(0, 10).map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => {
              onSelectSearch(item.search_term);
              setOpen(false);
            }}
            className="flex items-center justify-between"
          >
            <span className="truncate">{item.search_term}</span>
            <span className="text-xs text-muted-foreground ml-2">
              {item.results_count} resultados
            </span>
          </DropdownMenuItem>
        ))}
        {history.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                clearHistory();
                setOpen(false);
              }}
              className="text-destructive gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Limpar histórico
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};