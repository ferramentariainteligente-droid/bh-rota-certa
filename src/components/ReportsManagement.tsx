import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Clock, CheckCircle, XCircle, MessageSquare, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BusReport {
  id: string;
  line_name: string;
  line_url: string;
  report_type: string;
  user_message: string;
  suggested_correction: string | null;
  user_email: string | null;
  user_contact: string | null;
  status: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

const statusLabels = {
  'pendente': 'Pendente',
  'analisando': 'Analisando',
  'resolvido': 'Resolvido',
  'rejeitado': 'Rejeitado'
};

const statusColors = {
  'pendente': 'bg-amber-100 text-amber-800',
  'analisando': 'bg-blue-100 text-blue-800',
  'resolvido': 'bg-green-100 text-green-800',
  'rejeitado': 'bg-red-100 text-red-800'
};

const statusIcons = {
  'pendente': Clock,
  'analisando': AlertTriangle,
  'resolvido': CheckCircle,
  'rejeitado': XCircle
};

const reportTypeLabels = {
  'horario_incorreto': 'Horário Incorreto',
  'linha_nao_funciona': 'Linha Não Funciona',
  'horario_em_falta': 'Horário em Falta',
  'informacao_desatualizada': 'Informação Desatualizada',
  'outro': 'Outro'
};

export const ReportsManagement: React.FC = () => {
  const [reports, setReports] = useState<BusReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<BusReport | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('bus_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Erro ao carregar relatórios",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async (reportId: string) => {
    if (!newStatus) return;

    setIsUpdating(true);
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (adminResponse.trim()) {
        updateData.admin_response = adminResponse.trim();
      }

      if (newStatus === 'resolvido' || newStatus === 'rejeitado') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('bus_reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Relatório atualizado",
        description: "As alterações foram salvas com sucesso."
      });

      // Refresh reports
      await fetchReports();
      setSelectedReport(null);
      setAdminResponse('');
      setNewStatus('');
    } catch (error: any) {
      console.error('Error updating report:', error);
      toast({
        title: "Erro ao atualizar relatório",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReportClick = (report: BusReport) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setAdminResponse(report.admin_response || '');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gerenciar Relatórios</h2>
        <p className="text-muted-foreground">
          Gerencie relatórios de erro enviados pelos usuários
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Reports List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Relatórios ({reports.length})</h3>
          
          {reports.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum relatório encontrado</p>
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => {
              const StatusIcon = statusIcons[report.status as keyof typeof statusIcons];
              
              return (
                <Card
                  key={report.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedReport?.id === report.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleReportClick(report)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{report.line_name}</CardTitle>
                      <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusLabels[report.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                    <CardDescription>
                      {reportTypeLabels[report.report_type as keyof typeof reportTypeLabels]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {report.user_message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.created_at).toLocaleString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Report Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Detalhes do Relatório</h3>
          
          {selectedReport ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedReport.line_name}</CardTitle>
                  <Badge className={statusColors[selectedReport.status as keyof typeof statusColors]}>
                    {statusLabels[selectedReport.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
                <CardDescription>
                  {reportTypeLabels[selectedReport.report_type as keyof typeof reportTypeLabels]}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Linha:</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{selectedReport.line_name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => window.open(selectedReport.line_url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Mensagem do Usuário:</h4>
                  <p className="text-sm bg-muted p-3 rounded">{selectedReport.user_message}</p>
                </div>

                {selectedReport.suggested_correction && (
                  <div>
                    <h4 className="font-medium mb-2">Correção Sugerida:</h4>
                    <p className="text-sm bg-muted p-3 rounded">{selectedReport.suggested_correction}</p>
                  </div>
                )}

                {(selectedReport.user_email || selectedReport.user_contact) && (
                  <div>
                    <h4 className="font-medium mb-2">Contato:</h4>
                    {selectedReport.user_email && (
                      <p className="text-sm">Email: {selectedReport.user_email}</p>
                    )}
                    {selectedReport.user_contact && (
                      <p className="text-sm">Contato: {selectedReport.user_contact}</p>
                    )}
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Status:</h4>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Resposta do Administrador:</h4>
                  <Textarea
                    placeholder="Digite sua resposta..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={() => updateReport(selectedReport.id)}
                  disabled={isUpdating || !newStatus}
                  className="w-full"
                >
                  {isUpdating ? 'Atualizando...' : 'Atualizar Relatório'}
                </Button>

                <div className="text-xs text-muted-foreground pt-2">
                  <p>Criado em: {new Date(selectedReport.created_at).toLocaleString('pt-BR')}</p>
                  <p>Atualizado em: {new Date(selectedReport.updated_at).toLocaleString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Selecione um relatório para ver os detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};