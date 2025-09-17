import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Database, CheckCircle, AlertCircle } from "lucide-react";
import { useBusLinesFromDb } from "@/hooks/useBusLinesFromDb";
import busLinesData from "@/data/bus-lines.json";
import { useToast } from "@/hooks/use-toast";

interface DataImporterProps {
  onDataImported?: () => void;
}

export const DataImporter = ({ onDataImported }: DataImporterProps) => {
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { importJsonData } = useBusLinesFromDb();
  const { toast } = useToast();

  const handleImport = async () => {
    try {
      setImporting(true);
      setImportStatus('idle');

      const result = await importJsonData(busLinesData);
      
      setImportStatus('success');
      toast({
        title: "Importação concluída!",
        description: result.message || "Dados importados com sucesso",
      });

      if (onDataImported) {
        onDataImported();
      }
    } catch (error) {
      setImportStatus('error');
      toast({
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Importar Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Importe os dados das linhas de ônibus do arquivo JSON para o banco de dados Supabase.
        </p>
        
        <Button 
          onClick={handleImport} 
          disabled={importing}
          className="w-full"
        >
          {importing ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Importar Dados JSON
            </>
          )}
        </Button>

        {importStatus === 'success' && (
          <div className="flex items-center gap-2 text-success text-sm">
            <CheckCircle className="h-4 w-4" />
            Dados importados com sucesso!
          </div>
        )}

        {importStatus === 'error' && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            Erro na importação. Verifique o console.
          </div>
        )}
      </CardContent>
    </Card>
  );
};