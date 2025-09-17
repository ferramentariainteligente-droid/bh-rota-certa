import { useState, useMemo } from "react";

interface BusLine {
  url: string;
  linha: string;
  horarios: string[];
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
      filtered = filtered.filter(line => 
        line.horarios.some(horario => horario.startsWith(selectedHour))
      );
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