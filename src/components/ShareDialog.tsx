import { useState } from 'react';
import { Share2, Copy, MessageCircle, Mail, Link, QrCode } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  busLine: {
    url: string;
    linha: string;
    horarios: string[];
  };
}

export const ShareDialog = ({ isOpen, onClose, busLine }: ShareDialogProps) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [shareDescription, setShareDescription] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const lineNumber = busLine.linha.split(' - ')[0];
  const lineName = busLine.linha.split(' - ')[1] || busLine.linha;

  const createShareableLink = async () => {
    setIsCreatingShare(true);
    
    try {
      const shareData = {
        bus_line_data: {
          url: busLine.url,
          linha: busLine.linha,
          horarios: busLine.horarios,
          lineNumber,
          lineName
        },
        title: shareTitle || `Horários da Linha ${lineNumber}`,
        description: shareDescription || `Confira os horários da linha ${lineNumber} - ${lineName}`,
        created_by: user?.id || null
      };

      const { data, error } = await supabase
        .from('shared_schedules')
        .insert(shareData)
        .select()
        .single();

      if (error) throw error;

      const url = `${window.location.origin}/compartilhado/${data.share_code}`;
      setShareUrl(url);
      
      toast({
        title: "Link criado!",
        description: "Agora você pode compartilhar este link."
      });
      
    } catch (error) {
      console.error('Error creating share:', error);
      toast({
        title: "Erro ao criar link",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingShare(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Link copiado para a área de transferência."
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive"
      });
    }
  };

  const shareViaWhatsApp = () => {
    const text = shareUrl 
      ? `Confira os horários da linha ${lineNumber}! ${shareUrl}`
      : `Confira os horários da linha ${lineNumber} - ${lineName} no BH Ônibus: ${window.location.origin}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Horários da Linha ${lineNumber} - ${lineName}`;
    const body = shareUrl 
      ? `Olá!\n\nConfira os horários da linha ${lineNumber} - ${lineName}:\n\n${shareUrl}\n\nAcesse pelo BH Ônibus`
      : `Olá!\n\nConfira os horários da linha ${lineNumber} - ${lineName} no site BH Ônibus:\n\n${window.location.origin}\n\nHorários: ${busLine.horarios.join(', ')}`;

    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const directShareUrl = `${window.location.origin}?linha=${encodeURIComponent(lineNumber)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartilhar Linha {lineNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Line Info */}
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge>{lineNumber}</Badge>
              <span className="font-medium text-sm">{lineName}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {busLine.horarios.length} horários disponíveis
            </div>
          </div>

          {/* Quick Share Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Compartilhar diretamente:</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={shareViaWhatsApp}
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareViaEmail}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                Email
              </Button>
            </div>
          </div>

          {/* Direct Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Link direto:</label>
            <div className="flex gap-2">
              <Input
                value={directShareUrl}
                readOnly
                className="text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(directShareUrl)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Create Custom Share */}
          {user && (
            <div className="border-t pt-4 space-y-3">
              <label className="text-sm font-medium">Criar link personalizado:</label>
              
              <Input
                placeholder="Título (opcional)"
                value={shareTitle}
                onChange={(e) => setShareTitle(e.target.value)}
              />
              
              <Textarea
                placeholder="Descrição (opcional)"
                value={shareDescription}
                onChange={(e) => setShareDescription(e.target.value)}
                rows={2}
              />

              {!shareUrl ? (
                <Button
                  onClick={createShareableLink}
                  disabled={isCreatingShare}
                  className="w-full"
                >
                  {isCreatingShare ? 'Criando...' : 'Criar Link Personalizado'}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(shareUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShareUrl('');
                      setShareTitle('');
                      setShareDescription('');
                    }}
                    className="w-full"
                  >
                    Criar Novo Link
                  </Button>
                </div>
              )}
            </div>
          )}

          {!user && (
            <div className="border-t pt-4">
              <div className="bg-muted/30 p-3 rounded-lg text-center">
                <Link className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Faça login para criar links personalizados
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};