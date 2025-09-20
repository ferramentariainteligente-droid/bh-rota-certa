import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useRatings } from '@/hooks/useRatings';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface BusLine {
  url: string;
  linha: string;
}

interface RatingDialogProps {
  busLine: BusLine;
  children: React.ReactNode;
}

export const RatingDialog = ({ busLine, children }: RatingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const { user } = useAuth();
  const { submitRating, getUserRating } = useRatings();

  useEffect(() => {
    if (open && user) {
      // Load existing rating
      getUserRating(busLine.url).then((existingRating) => {
        if (existingRating) {
          setRating(existingRating.rating);
          setComment(existingRating.comment || '');
        }
      });
    }
  }, [open, user, busLine.url]);

  const handleSubmit = async () => {
    if (rating === 0) return;

    await submitRating(
      busLine.url,
      busLine.linha.split(' ')[0],
      rating,
      comment
    );

    setOpen(false);
  };

  const handleRatingClick = (value: number) => {
    setRating(value === rating ? 0 : value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Avaliar Linha {busLine.linha}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!user && (
            <p className="text-sm text-muted-foreground">
              Faça login para avaliar esta linha de ônibus.
            </p>
          )}

          {user && (
            <>
              {/* Star Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sua avaliação</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={cn(
                          'h-6 w-6 transition-colors',
                          (hoveredRating >= star || rating >= star)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Comentário (opcional)</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte sua experiência com esta linha..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={rating === 0}
                  className="flex-1"
                >
                  Enviar Avaliação
                </Button>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};