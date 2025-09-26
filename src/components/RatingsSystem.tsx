import { useState, useEffect } from 'react';
import { Star, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRatings } from '@/hooks/useRatings';
import { useToast } from '@/hooks/use-toast';

interface RatingsSystemProps {
  busLineUrl: string;
  busLineNumber: string;
  busLineName: string;
}

export const RatingsSystem = ({ busLineUrl, busLineNumber, busLineName }: RatingsSystemProps) => {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [userRating, setUserRating] = useState<any>(null);
  const [ratingStats, setRatingStats] = useState<any>(null);

  const { user } = useAuth();
  const { submitRating, getRatingStats, getUserRating } = useRatings();
  const { toast } = useToast();

  useEffect(() => {
    loadRatingData();
  }, [busLineUrl, user]);

  const loadRatingData = async () => {
    try {
      // Load rating statistics
      const stats = await getRatingStats(busLineUrl);
      setRatingStats(stats);

      // Load user's rating if authenticated
      if (user) {
        const userRate = await getUserRating(busLineUrl);
        setUserRating(userRate);
        if (userRate) {
          setSelectedRating(userRate.rating);
          setComment(userRate.comment || '');
        }
      }
    } catch (error) {
      console.error('Error loading rating data:', error);
    }
  };

  const handleSubmitRating = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para avaliar esta linha.",
        variant: "destructive"
      });
      return;
    }

    if (selectedRating === 0) {
      toast({
        title: "Avaliação inválida", 
        description: "Selecione pelo menos 1 estrela.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitRating(busLineUrl, busLineNumber, selectedRating, comment);
      
      toast({
        title: "Avaliação enviada!",
        description: "Obrigado pelo seu feedback."
      });
      
      setShowRatingForm(false);
      await loadRatingData(); // Reload data
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Erro ao enviar avaliação",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, size: 'sm' | 'md' = 'md') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setSelectedRating(star)}
            className={`${starSize} ${
              interactive ? 'hover:scale-110 transition-transform cursor-pointer' : 'cursor-default'
            }`}
          >
            <Star
              className={`${starSize} ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!ratingStats) {
    return null; // Loading
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="w-5 h-5 text-yellow-400" />
          Avaliação da Linha
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Rating Summary */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{ratingStats.averageRating.toFixed(1)}</div>
            {renderStars(ratingStats.averageRating, false, 'sm')}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{ratingStats.totalRatings} avaliações</span>
          </div>

          {user && !userRating && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRatingForm(!showRatingForm)}
              className="ml-auto"
            >
              <Star className="w-4 h-4 mr-2" />
              Avaliar
            </Button>
          )}

          {userRating && (
            <Badge variant="secondary" className="ml-auto">
              Sua avaliação: {userRating.rating}⭐
            </Badge>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingStats.distribution[stars] || 0;
            const percentage = ratingStats.totalRatings > 0 
              ? (count / ratingStats.totalRatings) * 100 
              : 0;
              
            return (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="w-6 text-right">{stars}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Rating Form */}
        {showRatingForm && user && (
          <div className="border-t pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Sua avaliação:
              </label>
              {renderStars(selectedRating, true, 'md')}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Comentário (opcional):
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Compartilhe sua experiência com esta linha..."
                className="resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitRating}
                disabled={isSubmitting || selectedRating === 0}
                size="sm"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRatingForm(false);
                  setSelectedRating(userRating?.rating || 0);
                  setComment(userRating?.comment || '');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {!user && showRatingForm && (
          <div className="border-t pt-4">
            <div className="text-center py-4 bg-muted/30 rounded-lg">
              <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-2">Faça login para avaliar esta linha</p>
              <Button size="sm" variant="outline">
                Fazer Login
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};