import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface BusLine {
  url: string;
  linha: string;
  horarios: string[];
}

interface FavoriteButtonProps {
  busLine: BusLine;
  className?: string;
}

export const FavoriteButton = ({ busLine, className }: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(busLine);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(busLine);
      }}
      className={cn("h-8 w-8 p-0", className)}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          favorite ? "fill-destructive text-destructive" : "text-muted-foreground"
        )}
      />
      <span className="sr-only">
        {favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      </span>
    </Button>
  );
};