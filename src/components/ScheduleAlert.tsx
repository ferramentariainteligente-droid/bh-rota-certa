import { AlertTriangle, Info, CheckCircle, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface ScheduleAlertProps {
  type: 'general' | 'detailed' | 'processing';
  scheduleCount?: number;
  lastUpdated?: string;
}

export const ScheduleAlert = ({ type, scheduleCount = 0, lastUpdated }: ScheduleAlertProps) => {
  if (type === 'detailed') {
    return (
      <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="font-medium text-sm text-green-800">
            Horários Categorizados Disponíveis
          </span>
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-100 text-xs">
            {scheduleCount} tipos
          </Badge>
        </div>
        <p className="text-xs text-green-700 mt-1">
          Horários específicos para dias úteis, sábados, domingos e feriados
        </p>
        {lastUpdated && (
          <p className="text-xs text-green-600 mt-1">
            Última atualização: {new Date(lastUpdated).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>
    );
  }

  if (type === 'processing') {
    return (
      <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-sm text-blue-800">
            Processando Horários Detalhados
          </span>
          <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-100 text-xs">
            Em breve
          </Badge>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          Estamos coletando horários específicos para esta linha
        </p>
      </div>
    );
  }

  // Default: general schedule warning
  return (
    <div className="mb-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-amber-800">
              Horários Gerais (Limitação Atual)
            </span>
            <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-100 text-xs">
              Não categorizado
            </Badge>
          </div>
          <div className="text-xs text-amber-700 space-y-1">
            <p className="font-medium">⚠️ Importante: Estes horários podem variar conforme o dia:</p>
            <ul className="ml-2 space-y-0.5">
              <li>• <strong>Dias Úteis</strong> (Segunda a Sexta): Horários mais frequentes</li>
              <li>• <strong>Sábados</strong>: Frequência reduzida</li>
              <li>• <strong>Domingos e Feriados</strong>: Horários especiais</li>
            </ul>
            <p className="mt-2 text-amber-600 font-medium">
              💡 Em breve teremos horários específicos para cada dia da semana
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};