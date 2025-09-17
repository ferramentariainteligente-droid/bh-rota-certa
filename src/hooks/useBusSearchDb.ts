import { useState, useMemo } from "react";
import { BusLine } from "./useBusLinesFromDb";

export const useBusSearchDb = (busLines: BusLine[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  const filteredBusLines = useMemo(() => {
    let filtered = busLines;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(line => 
        line.line_number.toLowerCase().includes(searchLower) ||
        line.route_name.toLowerCase().includes(searchLower) ||
        line.full_title.toLowerCase().includes(searchLower)
      );
    }

    if (selectedHour) {
      filtered = filtered.filter(line => 
        line.schedules.some(schedule => schedule.startsWith(selectedHour))
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