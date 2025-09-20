import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Share2, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface BusLine {
  url: string;
  linha: string;
  horarios: string[];
  schedulesDetailed?: any[];
}

interface ShareDialogProps {
  busLine: BusLine;
  children: React.ReactNode;
}

export const ShareDialog = ({ busLine, children }: ShareDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(`Horários - ${busLine.linha}`);
  const [description, setDescription] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('shared_schedules')
        .insert({
          bus_line_data: {
            url: busLine.url,
            linha: busLine.linha,
            horarios: busLine.horarios,
            schedulesDetailed: busLine.schedulesDetailed,
          },
          created_by: user?.id,
          title,
          description,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        })
        .select()
        .single();

      if (error) throw error;

      const url = `${window.location.origin}/share/${data.share_code}`;
      setShareUrl(url);

      toast({
        title: "Link criado!",
        description: "Seu link de compartilhamento foi gerado com sucesso.",
      });
    } catch (error) {
      console.error('Error creating share link:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o link de compartilhamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Link copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartilhar Horários
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!shareUrl ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título do compartilhamento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Adicione uma descrição..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleShare}
                disabled={loading || !title.trim()}
                className="w-full"
              >
                {loading ? 'Criando link...' : 'Criar Link de Compartilhamento'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Link de compartilhamento</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="icon"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                {navigator.share && (
                  <Button onClick={handleNativeShare} className="flex-1">
                    Compartilhar
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setShareUrl('');
                  }}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};