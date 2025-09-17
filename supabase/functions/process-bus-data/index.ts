import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

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

// Extract schedule from HTML content
const extractScheduleFromContent = (content: string, url: string): ExtractedSchedule[] | null => {
  try {
    const schedules: ExtractedSchedule[] = [];
    const lines = content.split('\n');
    
    const schedulePatterns = [
      { pattern: /Dias Úteis(?!\s*[–-]\s*(?:Atípico|Férias))/i, tipo: 'dias_uteis' },
      { pattern: /Dias Úteis\s*[–-]\s*Férias/i, tipo: 'dias_uteis_ferias' },
      { pattern: /Sábado(?!\s*[–-]\s*Férias)/i, tipo: 'sabado' },
      { pattern: /Sábado\s*[–-]\s*Férias/i, tipo: 'sabado_ferias' },
      { pattern: /Domingos?\s*e\s*Feriados/i, tipo: 'domingo_feriado' }
    ];

    let currentType = '';
    let currentHorarios: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check for schedule type
      const matchedPattern = schedulePatterns.find(p => p.pattern.test(trimmedLine));
      if (matchedPattern) {
        // Save previous schedule
        if (currentType && currentHorarios.length > 0) {
          schedules.push({
            tipo: currentType,
            horarios: [...currentHorarios].sort()
          });
        }
        currentType = matchedPattern.tipo;
        currentHorarios = [];
        continue;
      }

      // Extract time
      if (currentType) {
        const timeMatch = trimmedLine.match(/^(\d{1,2}:\d{2})/);
        if (timeMatch && !currentHorarios.includes(timeMatch[1])) {
          currentHorarios.push(timeMatch[1]);
        }
      }
    }

    // Save last schedule
    if (currentType && currentHorarios.length > 0) {
      schedules.push({
        tipo: currentType,
        horarios: [...currentHorarios].sort()
      });
    }

    return schedules.length > 0 ? schedules : null;
  } catch (error) {
    console.error('Error extracting schedule:', error);
    return null;
  }
};

// Process a single bus line
const processBusLine = async (line: BusLine): Promise<BusLine> => {
  try {
    // Skip invalid URLs
    if (!line.url || line.url.trim() === '' || (!line.url.startsWith('http') && !line.url.startsWith('www'))) {
      return line;
    }

    // Fix URLs that start with www but don't have protocol
    let processUrl = line.url;
    if (line.url.startsWith('www')) {
      processUrl = 'https://' + line.url;
    }

    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(processUrl)}`);
    const data = await response.json();
    
    if (data.contents) {
      const schedules = extractScheduleFromContent(data.contents, line.url);
      if (schedules && schedules.length > 0) {
        return {
          ...line,
          schedulesDetailed: schedules,
          lastUpdated: new Date().toISOString()
        };
      }
    }
    return line;
  } catch (error) {
    console.error(`Error processing ${line.url}:`, error);
    return line;
  }
};

// Process batch of bus lines
const processBatch = async (batch: BusLine[]): Promise<BusLine[]> => {
  const results = await Promise.allSettled(
    batch.map(line => processBusLine(line))
  );

  return results.map(result => 
    result.status === 'fulfilled' ? result.value : null
  ).filter(Boolean) as BusLine[];
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { busLines, batchSize = 5 } = await req.json();

    if (!Array.isArray(busLines)) {
      throw new Error('busLines must be an array');
    }

    // Filter valid lines
    const validLines = busLines.filter(line => 
      line.url && 
      line.url.trim() !== '' &&
      (line.url.startsWith('http') || line.url.startsWith('www'))
    );

    console.log(`Processing ${validLines.length} valid lines out of ${busLines.length} total lines`);

    const updatedLines = [...busLines];
    let completedLines = 0;
    let failedLines = 0;

    // Process in batches
    for (let i = 0; i < validLines.length; i += batchSize) {
      const batch = validLines.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(validLines.length/batchSize)}`);
      
      const batchResults = await processBatch(batch);
      
      // Update the results
      batchResults.forEach((result, batchIndex) => {
        if (result) {
          const originalIndex = busLines.findIndex(line => line.url === batch[batchIndex].url);
          if (originalIndex !== -1) {
            updatedLines[originalIndex] = result;
            if (result.schedulesDetailed) {
              completedLines++;
            } else {
              failedLines++;
            }
          }
        }
      });

      // Small delay between batches to avoid overwhelming servers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: updatedLines,
        stats: {
          total: busLines.length,
          valid: validLines.length,
          completed: completedLines,
          failed: failedLines
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing bus data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});