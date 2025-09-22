import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import busLinesData from '@/data/bus-lines.json';

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

interface ScrapedBusLine {
  id: string;
  source_id: string;
  line_code: string;
  line_name: string;
  line_url: string;
  schedule_data: any;
  scraping_status: string;
  last_scraped_at: string | null;
}

export const useIntegratedBusData = () => {
  const [busLines, setBusLines] = useState<BusLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIntegratedData();
  }, []);

  const loadIntegratedData = async () => {
    try {
      setLoading(true);
      
      // Load bus lines from database
      const { data: dbBusLines, error: dbError } = await supabase
        .from('bus_lines')
        .select('*');

      if (dbError) {
        console.error('Error loading bus lines from database:', dbError);
      }

      // Load scraped data from database
      const { data: scrapedData, error: scrapedError } = await supabase
        .from('scraped_bus_lines')
        .select('*')
        .eq('scraping_status', 'success');

      if (scrapedError) {
        console.error('Error loading scraped data:', scrapedError);
      }

      console.log('Database bus lines loaded:', dbBusLines);
      console.log('Scraped data loaded:', scrapedData);

      // Start with JSON data and add database lines
      const jsonLines = [...busLinesData] as BusLine[];
      
      // Add lines from database
      if (dbBusLines) {
        console.log(`Adding ${dbBusLines.length} lines from database`);
        dbBusLines.forEach(dbLine => {
          // Check if line already exists in JSON data
          const existsInJson = jsonLines.some(line => 
            line.linha.includes(dbLine.line_number) ||
            line.url === dbLine.official_url
          );

          if (!existsInJson) {
            // Convert database format to expected format
            const newLine = {
              url: dbLine.official_url,
              linha: `${dbLine.line_number} ${dbLine.route_name}`,
              horarios: [],
              lastUpdated: dbLine.updated_at
            };
            jsonLines.push(newLine);
            console.log(`Added line from database: ${newLine.linha}`);
          } else {
            console.log(`Line ${dbLine.line_number} already exists in JSON data`);
          }
        });
      }
      
      // Create a map of scraped data by line identifier
      const scrapedMap = new Map<string, ScrapedBusLine>();
      if (scrapedData) {
        scrapedData.forEach(scraped => {
          // Try multiple matching strategies
          const keys = [
            scraped.line_url,
            `${scraped.line_code}`,
            scraped.line_name.toLowerCase()
          ];
          
          console.log(`Creating map keys for ${scraped.line_code}:`, keys);
          
          keys.forEach(key => {
            if (key) {
              scrapedMap.set(key, scraped);
            }
          });
        });
      }

      console.log('Scraped map size:', scrapedMap.size);
      console.log('Scraped map keys:', Array.from(scrapedMap.keys()));

      // Merge JSON data with scraped data
      const integratedLines = jsonLines.map(jsonLine => {
        // Try to find matching scraped data
        let matchedScraped: ScrapedBusLine | undefined;
        
        // Strategy 1: Match by URL
        if (jsonLine.url && scrapedMap.has(jsonLine.url)) {
          matchedScraped = scrapedMap.get(jsonLine.url);
          console.log(`URL match found for ${jsonLine.url}`);
        }
        
        // Strategy 2: Match by line number extracted from title
        if (!matchedScraped) {
          const lineNumberMatch = jsonLine.linha.match(/^(\d+[A-Z]?)/);
          if (lineNumberMatch) {
            const lineNumber = lineNumberMatch[1];
            if (scrapedMap.has(lineNumber)) {
              matchedScraped = scrapedMap.get(lineNumber);
              console.log(`Line number match found for ${lineNumber}`);
            }
          }
        }
        
        // Strategy 3: Partial URL match
        if (!matchedScraped && jsonLine.url) {
          for (const [key, scraped] of scrapedMap.entries()) {
            if (key.includes(jsonLine.url.split('/').pop() || '') || 
                jsonLine.url.includes(scraped.line_url.split('/').pop() || '')) {
              matchedScraped = scraped;
              console.log(`Partial URL match found for ${jsonLine.url}`);
              break;
            }
          }
        }

        // If we found matching scraped data, use it
        if (matchedScraped) {
          const scheduleData = matchedScraped.schedule_data as any;
          if (scheduleData && scheduleData.schedules && Array.isArray(scheduleData.schedules)) {
            console.log(`Using scraped schedules for ${jsonLine.linha}:`, scheduleData.schedules);
            return {
              ...jsonLine,
              schedulesDetailed: scheduleData.schedules,
              lastUpdated: matchedScraped.last_scraped_at || undefined,
              horarios: jsonLine.horarios // Keep original as fallback
            };
          }
        }

        // Return original JSON data if no match
        return jsonLine;
      });

      // Add any scraped lines that don't exist in JSON
      if (scrapedData) {
        scrapedData.forEach(scraped => {
          const existsInJson = integratedLines.some(line => 
            line.url === scraped.line_url ||
            line.linha.includes(scraped.line_code)
          );

          if (!existsInJson) {
            const scheduleData = scraped.schedule_data as any;
            if (scheduleData && scheduleData.schedules && Array.isArray(scheduleData.schedules)) {
              integratedLines.push({
                url: scraped.line_url,
                linha: `${scraped.line_code} ${scraped.line_name}`,
                horarios: [], // Will be filled from schedulesDetailed
                schedulesDetailed: scheduleData.schedules,
                lastUpdated: scraped.last_scraped_at || undefined
              });
            }
          }
        });
      }

      setBusLines(integratedLines);
      console.log(`Integrated data: ${integratedLines.length} total lines, ${integratedLines.filter(l => l.schedulesDetailed?.length).length} with detailed schedules`);
      console.log('Lines containing 5142:', integratedLines.filter(line => line.linha.includes('5142')));
      console.log('All line codes found:', integratedLines.map(line => line.linha).slice(0, 10));
      console.log('5142 specific check:', integratedLines.find(line => line.linha.includes('5142')));

    } catch (err) {
      console.error('Error loading integrated bus data:', err);
      setError('Erro ao carregar dados dos ônibus');
      // Fallback to JSON data only
      setBusLines([...busLinesData] as BusLine[]);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadIntegratedData();
  };

  return {
    busLines,
    loading,
    error,
    refreshData,
    totalLines: busLines.length,
    linesWithSchedules: busLines.filter(l => l.schedulesDetailed?.length).length,
    linesFromScraping: busLines.filter(l => l.lastUpdated).length
  };
};