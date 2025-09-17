import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BusLine {
  id: string;
  line_number: string;
  route_name: string;
  full_title: string;
  official_url: string;
  schedules: string[];
}

export const useBusLinesFromDb = () => {
  const [busLines, setBusLines] = useState<BusLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusLines = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch bus lines with their schedules
      const { data: lines, error: linesError } = await supabase
        .from('bus_lines')
        .select(`
          id,
          line_number,
          route_name,
          full_title,
          official_url,
          bus_schedules (
            departure_time
          )
        `)
        .order('line_number');

      if (linesError) {
        throw new Error(linesError.message);
      }

      // Transform data to match the expected format
      const transformedLines: BusLine[] = (lines || []).map(line => ({
        id: line.id,
        line_number: line.line_number,
        route_name: line.route_name,
        full_title: line.full_title,
        official_url: line.official_url,
        schedules: (line.bus_schedules || [])
          .map(schedule => schedule.departure_time)
          .sort()
      }));

      setBusLines(transformedLines);
    } catch (err) {
      console.error('Error fetching bus lines:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const importJsonData = async (jsonData: any[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('import-bus-data', {
        body: { busData: jsonData }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Refresh the data after import
      await fetchBusLines();
      
      return data;
    } catch (err) {
      console.error('Error importing data:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchBusLines();
  }, []);

  return {
    busLines,
    loading,
    error,
    refetch: fetchBusLines,
    importJsonData
  };
};