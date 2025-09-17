import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Send, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportErrorFormProps {
  lineUrl: string;
  lineName: string;
  onClose: () => void;
}

const reportTypes = [
  { value: 'horario_incorreto', label: 'Horário Incorreto' },
  { value: 'linha_nao_funciona', label: 'Linha Não Funciona' },
  { value: 'horario_em_falta', label: 'Horário em Falta' },
  { value: 'informacao_desatualizada', label: 'Informação Desatualizada' },
  { value: 'outro', label: 'Outro' }
];

export const ReportErrorForm: React.FC<ReportErrorFormProps> = ({
  lineUrl,
  lineName,
  onClose
}) => {
  const [reportType, setReportType] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [suggestedCorrection, setSuggestedCorrection] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userContact, setUserContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportType || !userMessage.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione o tipo de problema e descreva a situação.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert report into database
      const { data: report, error: insertError } = await supabase
        .from('bus_reports')
        .insert({
          line_url: lineUrl,
          line_name: lineName,
          report_type: reportType as any,
          user_message: userMessage.trim(),
          suggested_correction: suggestedCorrection.trim() || null,
          user_email: userEmail.trim() || null,
          user_contact: userContact.trim() || null
        })
        .select()
        .maybeSingle();

      if (insertError) {
        throw new Error(insertError.message);
      }

      if (!report) {
        throw new Error('Falha ao criar o relatório');
      }

      // Send notification email
      const { error: emailError } = await supabase.functions.invoke('send-report-notification', {
        body: {
          reportId: report.id,
          lineName,
          lineUrl,
          reportType,
          userMessage: userMessage.trim(),
          suggestedCorrection: suggestedCorrection.trim() || undefined,
          userEmail: userEmail.trim() || undefined,
          userContact: userContact.trim() || undefined
        }
      });

      if (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't throw error - report was created successfully
      }

      toast({
        title: "Relatório enviado com sucesso!",
        description: "Obrigado pelo seu feedback. Analisaremos sua sugestão em breve."
      });

      onClose();
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast({
        title: "Erro ao enviar relatório",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle>Reportar Erro</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Encontrou um problema com os horários da linha <strong>{lineName}</strong>?
            Nos ajude a melhorar!
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Tipo de Problema *</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de problema" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userMessage">Descrição do Problema *</Label>
              <Textarea
                id="userMessage"
                placeholder="Descreva detalhadamente o problema encontrado..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestedCorrection">Correção Sugerida (opcional)</Label>
              <Textarea
                id="suggestedCorrection"
                placeholder="Se souber a informação correta, nos informe..."
                value={suggestedCorrection}
                onChange={(e) => setSuggestedCorrection(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userEmail">Seu Email (opcional)</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="Para recebermos sua resposta..."
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userContact">Contato Alternativo (opcional)</Label>
              <Input
                id="userContact"
                placeholder="WhatsApp, Telegram, etc..."
                value={userContact}
                onChange={(e) => setUserContact(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};