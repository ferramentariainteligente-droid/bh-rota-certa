import { Clock, MapPin, ExternalLink, Calendar, Info } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusDataExtractor } from "@/services/BusDataExtractor";
import { ScheduleAlert } from "@/components/ScheduleAlert";

interface ExtractedSchedule {
  tipo: string;
  horarios: string[];
}

interface BusLine {
  url: string;
  linha: string;
  horarios: string[];
  schedulesDetailed?: ExtractedSchedule[];
  lastUpdated?: string;
}

interface BusLineCardProps {
  line: BusLine;
}

export const BusLineCard = ({ line }: BusLineCardProps) => {
  // Extract line number and route from the title
  const parseLineInfo = (linha: string) => {
    const match = linha.match(/^(\d+[A-Z]?)\s+(.+?)\s+–/);
    if (match) {
      return {
        number: match[1],
        route: match[2]
      };
    }
    return {
      number: linha.split(' ')[0] || 'N/A',
      route: linha
    };
  };

  const { number, route } = parseLineInfo(line.linha);

  // Group schedules by time periods
  const groupSchedules = (horarios: string[]) => {
    const periods = {
      madrugada: [] as string[],
      manha: [] as string[],
      tarde: [] as string[],
      noite: [] as string[]
    };

    horarios.forEach(horario => {
      const hour = parseInt(horario.split(':')[0]);
      if (hour >= 0 && hour < 6) periods.madrugada.push(horario);
      else if (hour >= 6 && hour < 12) periods.manha.push(horario);
      else if (hour >= 12 && hour < 18) periods.tarde.push(horario);
      else periods.noite.push(horario);
    });

    return periods;
  };

  const periodLabels = {
    madrugada: '🌙 Madrugada',
    manha: '🌅 Manhã',
    tarde: '☀️ Tarde',
    noite: '🌆 Noite'
  };

  // Get current schedule type to determine default tab
  const currentScheduleType = BusDataExtractor.getCurrentScheduleType();
  
  // Render schedule periods
  const renderSchedulePeriods = (horarios: string[]) => {
    const scheduleGroups = groupSchedules(horarios);
    const nextDeparture = horarios.find(horario => {
      const now = new Date();
      const [hour, minute] = horario.split(':').map(Number);
      const departureTime = new Date();
      departureTime.setHours(hour, minute, 0, 0);
      return departureTime > now;
    });

    return (
      <div className="space-y-3">
        {Object.entries(scheduleGroups).map(([period, times]) => {
          if (times.length === 0) return null;
          
          return (
            <div key={period}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {periodLabels[period as keyof typeof periodLabels]}
                </span>
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs text-muted-foreground">
                  {times.length} horários
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {times.map((horario, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded text-sm font-mono transition-smooth ${
                      horario === nextDeparture
                        ? "bg-success/10 text-success border border-success/20"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    }`}
                  >
                    {horario}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Determine default tab based on current day
  let defaultTab = "dias_uteis";
  if (line.schedulesDetailed) {
    const relevantSchedule = BusDataExtractor.getRelevantSchedule(line.schedulesDetailed);
    if (relevantSchedule) {
      defaultTab = relevantSchedule.tipo;
    }
  }

  return (
    <Card className="hover:shadow-soft transition-smooth group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                {number}
              </Badge>
              {line.schedulesDetailed ? (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  <Calendar className="h-3 w-3 mr-1" />
                  {line.schedulesDetailed.length} tipos de horário
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                  <Info className="h-3 w-3 mr-1" />
                  Horário geral
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-smooth">
              {route}
            </h3>
          </div>
          <a
            href={line.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-primary transition-smooth"
            title="Ver no site oficial"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Schedule Display */}
        {line.schedulesDetailed && line.schedulesDetailed.length > 0 ? (
          <>
            <ScheduleAlert 
              type="detailed" 
              scheduleCount={line.schedulesDetailed.length}
              lastUpdated={line.lastUpdated}
            />
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                {line.schedulesDetailed.map((schedule) => (
                  <TabsTrigger 
                    key={schedule.tipo} 
                    value={schedule.tipo}
                    className="text-xs"
                  >
                    {BusDataExtractor.getScheduleTypeLabel(schedule.tipo)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {line.schedulesDetailed.map((schedule) => (
                <TabsContent key={schedule.tipo} value={schedule.tipo} className="mt-0">
                  <div className="mb-3 p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">
                        {BusDataExtractor.getScheduleTypeLabel(schedule.tipo)}
                      </span>
                      {schedule.tipo === currentScheduleType && (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                          Hoje
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {schedule.horarios.length} horários disponíveis
                    </p>
                  </div>
                  {renderSchedulePeriods(schedule.horarios)}
                </TabsContent>
              ))}
            </Tabs>
          </>
        ) : (
          <div>
            <ScheduleAlert type="general" />
            {renderSchedulePeriods(line.horarios)}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>Move Metropolitano</span>
          </div>
          {line.lastUpdated && (
            <div className="text-xs text-muted-foreground">
              Atualizado em {new Date(line.lastUpdated).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};