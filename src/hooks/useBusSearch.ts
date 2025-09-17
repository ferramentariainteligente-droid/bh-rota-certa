import { useState, useMemo } from "react";

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

export const useBusSearch = (busLines: BusLine[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  const filteredBusLines = useMemo(() => {
    let filtered = busLines;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(line => 
        line.linha.toLowerCase().includes(searchLower) ||
        line.url.toLowerCase().includes(searchLower)
      );
    }

    if (selectedHour) {
      filtered = filtered.filter(line => {
        // Check in main horarios
        const mainHorariosMatch = line.horarios.some(horario => horario.startsWith(selectedHour));
        
        // Also check in detailed schedules if available
        const detailedHorariosMatch = line.schedulesDetailed?.some(schedule =>
          schedule.horarios.some(horario => horario.startsWith(selectedHour))
        ) || false;
        
        return mainHorariosMatch || detailedHorariosMatch;
      });
    }

    return filtered;
  }, [searchTerm, selectedHour, busLines]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedHour(null);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedHour,
    setSelectedHour,
    filteredBusLines,
    clearFilters,
    hasFilters: searchTerm || selectedHour
  };
};