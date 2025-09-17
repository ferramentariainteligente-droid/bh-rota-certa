import { Clock, MapPin, ExternalLink, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BusDataExtractor } from "@/services/BusDataExtractor";

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

  // Use detailed schedules if available, otherwise fall back to simple horarios
  const currentScheduleType = BusDataExtractor.getCurrentScheduleType();
  const currentSchedule = line.schedulesDetailed 
    ? BusDataExtractor.getRelevantSchedule(line.schedulesDetailed)
    : null;
  
  const displayHorarios = currentSchedule ? currentSchedule.horarios : line.horarios;
  const scheduleGroups = groupSchedules(displayHorarios);
  
  const nextDeparture = displayHorarios.find(horario => {
    const now = new Date();
    const [hour, minute] = horario.split(':').map(Number);
    const departureTime = new Date();
    departureTime.setHours(hour, minute, 0, 0);
    return departureTime > now;
  });

  const periodLabels = {
    madrugada: '🌙 Madrugada',
    manha: '🌅 Manhã',
    tarde: '☀️ Tarde',
    noite: '🌆 Noite'
  };

  return (
    <Card className="hover:shadow-soft transition-smooth group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                {number}
              </Badge>
              {nextDeparture && (
                <Badge variant="outline" className="text-success border-success/20 bg-success/5">
                  <Clock className="h-3 w-3 mr-1" />
                  Próximo: {nextDeparture}
                </Badge>
              )}
              {currentSchedule && (
                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                  <Calendar className="h-3 w-3 mr-1" />
                  {BusDataExtractor.getScheduleTypeLabel(currentSchedule.tipo)}
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

        <div className="space-y-4">
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

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>Move Metropolitano</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {displayHorarios.length} horários disponíveis
            {line.schedulesDetailed && (
              <span className="ml-2 text-xs text-primary">
                • {line.schedulesDetailed.length} tipos de dia
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};