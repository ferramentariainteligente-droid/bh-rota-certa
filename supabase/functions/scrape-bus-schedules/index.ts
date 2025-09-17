import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ScrapingSource {
  id: string;
  name: string;
  base_url: string;
  site_type: string;
  scraping_config: any;
  is_active: boolean;
}

interface ExtractedSchedule {
  tipo: string;
  horarios: string[];
}

interface BusLineInfo {
  line_code: string;
  line_name: string;
  line_url: string;
  route_description?: string;
}

// Função para extrair links de linhas de ônibus do Move Metropolitano
async function extractMoveMetropolitanoLines(source: ScrapingSource): Promise<BusLineInfo[]> {
  console.log(`Extracting lines from Move Metropolitano: ${source.base_url}`);
  
  try {
    const response = await fetch(source.base_url);
    const html = await response.text();
    
    const lines: BusLineInfo[] = [];
    const linkPattern = /\[([^\]]+)\]\((https:\/\/movemetropolitano\.com\.br[^)]+)\)/g;
    
    let match;
    while ((match = linkPattern.exec(html)) !== null) {
      const [, linkText, url] = match;
      
      // Extract line code and name from link text
      const codeMatch = linkText.match(/^(\w+)\s+(.+)$/);
      if (codeMatch) {
        const [, code, name] = codeMatch;
        lines.push({
          line_code: code,
          line_name: name.trim(),
          line_url: url,
          route_description: linkText
        });
      }
    }
    
    console.log(`Found ${lines.length} lines from Move Metropolitano`);
    return lines;
  } catch (error) {
    console.error('Error extracting Move Metropolitano lines:', error);
    return [];
  }
}

// Função para extrair links de linhas do Expresso Unir
async function extractExpressoUnirLines(source: ScrapingSource): Promise<BusLineInfo[]> {
  console.log(`Extracting lines from Expresso Unir: ${source.base_url}`);
  
  try {
    const response = await fetch(source.base_url);
    const html = await response.text();
    
    const lines: BusLineInfo[] = [];
    const linkPattern = /\[([^\]]+)\]\((https:\/\/expressounir\.com\.br[^)]+)\)/g;
    
    let match;
    while ((match = linkPattern.exec(html)) !== null) {
      const [, linkText, url] = match;
      
      // Extract line code and name from link text
      const codeMatch = linkText.match(/^(\d+)[\s–-]+(.+)$/);
      if (codeMatch) {
        const [, code, name] = codeMatch;
        lines.push({
          line_code: code,
          line_name: name.trim(),
          line_url: url,
          route_description: linkText
        });
      }
    }
    
    console.log(`Found ${lines.length} lines from Expresso Unir`);
    return lines;
  } catch (error) {
    console.error('Error extracting Expresso Unir lines:', error);
    return [];
  }
}

// Função para extrair horários de uma linha do Move Metropolitano
async function extractMoveMetropolitanoSchedule(lineUrl: string): Promise<ExtractedSchedule[]> {
  try {
    const response = await fetch(lineUrl);
    const html = await response.text();
    
    const schedules: ExtractedSchedule[] = [];
    
    // Patterns to identify different schedule types
    const schedulePatterns = [
      { pattern: /Dias Úteis(?!–\s*(?:Atípico|Férias))/i, tipo: 'dias_uteis' },
      { pattern: /Dias Úteis\s*–\s*Atípico/i, tipo: 'dias_uteis_atipico' },
      { pattern: /Dias Úteis\s*–\s*Férias/i, tipo: 'dias_uteis_ferias' },
      { pattern: /Sábado(?!–\s*Férias)/i, tipo: 'sabado' },
      { pattern: /Sábado\s*–\s*Férias/i, tipo: 'sabado_ferias' },
      { pattern: /Domingos?\s*e\s*Feriados/i, tipo: 'domingo_feriado' },
      { pattern: /Quarta-feira\s*de\s*Cinzas/i, tipo: 'quarta_cinzas' }
    ];

    const lines = html.split('\n');
    let currentScheduleType = '';
    let currentHorarios: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if line matches any schedule pattern
      const matchedPattern = schedulePatterns.find(p => p.pattern.test(line));
      if (matchedPattern) {
        // Save previous schedule if exists
        if (currentScheduleType && currentHorarios.length > 0) {
          schedules.push({
            tipo: currentScheduleType,
            horarios: [...currentHorarios]
          });
        }
        
        currentScheduleType = matchedPattern.tipo;
        currentHorarios = [];
        continue;
      }

      // Extract time if we're in a schedule section
      if (currentScheduleType) {
        const timeMatch = line.match(/(\d{1,2}:\d{2})/g);
        if (timeMatch) {
          timeMatch.forEach(time => {
            if (!currentHorarios.includes(time)) {
              currentHorarios.push(time);
            }
          });
        }
      }
    }

    // Save last schedule
    if (currentScheduleType && currentHorarios.length > 0) {
      schedules.push({
        tipo: currentScheduleType,
        horarios: [...currentHorarios]
      });
    }

    // Sort schedules by time
    schedules.forEach(schedule => {
      schedule.horarios.sort((a, b) => {
        const [aHour, aMin] = a.split(':').map(Number);
        const [bHour, bMin] = b.split(':').map(Number);
        return (aHour * 60 + aMin) - (bHour * 60 + bMin);
      });
    });

    return schedules.filter(s => s.horarios.length > 0);
  } catch (error) {
    console.error(`Error extracting schedule from ${lineUrl}:`, error);
    return [];
  }
}

// Função para extrair horários de uma linha do Expresso Unir
async function extractExpressoUnirSchedule(lineUrl: string): Promise<ExtractedSchedule[]> {
  try {
    const response = await fetch(lineUrl);
    const html = await response.text();
    
    const schedules: ExtractedSchedule[] = [];
    
    // Parse the markdown table format
    const tablePattern = /\|\s*(DIA ÚTIL|SÁBADO|DOMINGO)\s*\|(.*?)\n(?=\|)/gs;
    const timePattern = /(\d{1,2}:\d{2})/g;
    
    let match;
    while ((match = tablePattern.exec(html)) !== null) {
      const [, dayType, content] = match;
      const times = content.match(timePattern) || [];
      
      if (times.length > 0) {
        let tipo = '';
        switch (dayType.trim()) {
          case 'DIA ÚTIL':
            tipo = 'dias_uteis';
            break;
          case 'SÁBADO':
            tipo = 'sabado';
            break;
          case 'DOMINGO':
            tipo = 'domingo_feriado';
            break;
        }
        
        if (tipo) {
          schedules.push({
            tipo,
            horarios: times.sort((a, b) => {
              const [aHour, aMin] = a.split(':').map(Number);
              const [bHour, bMin] = b.split(':').map(Number);
              return (aHour * 60 + aMin) - (bHour * 60 + bMin);
            })
          });
        }
      }
    }
    
    return schedules;
  } catch (error) {
    console.error(`Error extracting Expresso Unir schedule from ${lineUrl}:`, error);
    return [];
  }
}

// Função principal para fazer scraping de uma fonte
async function scrapeBusSource(source: ScrapingSource, executionId: string): Promise<void> {
  console.log(`Starting scraping for source: ${source.name}`);
  
  try {
    // Log início do processamento desta fonte
    await supabase.from('scraping_logs').insert({
      source_id: source.id,
      execution_id: executionId,
      status: 'processing',
      execution_details: { source_name: source.name, started_at: new Date().toISOString() }
    });

    let lines: BusLineInfo[] = [];
    
    // Extract lines based on site type
    switch (source.site_type) {
      case 'move_metropolitano':
        lines = await extractMoveMetropolitanoLines(source);
        break;
      case 'expresso_unir_municipal':
      case 'expresso_unir_intermunicipal':
        lines = await extractExpressoUnirLines(source);
        break;
      default:
        console.error(`Unknown site type: ${source.site_type}`);
        return;
    }

    console.log(`Found ${lines.length} lines for source ${source.name}`);

    let linesProcessed = 0;
    let linesUpdated = 0;
    let linesFailed = 0;

    // Process each line
    for (const line of lines) {
      try {
        console.log(`Processing line: ${line.line_code} - ${line.line_name}`);
        
        let schedules: ExtractedSchedule[] = [];
        
        // Extract schedules based on site type
        switch (source.site_type) {
          case 'move_metropolitano':
            schedules = await extractMoveMetropolitanoSchedule(line.line_url);
            break;
          case 'expresso_unir_municipal':
          case 'expresso_unir_intermunicipal':
            schedules = await extractExpressoUnirSchedule(line.line_url);
            break;
        }

        // Save or update the scraped line
        const { error: upsertError } = await supabase
          .from('scraped_bus_lines')
          .upsert({
            source_id: source.id,
            line_code: line.line_code,
            line_name: line.line_name,
            line_url: line.line_url,
            route_description: line.route_description,
            last_scraped_at: new Date().toISOString(),
            scraping_status: schedules.length > 0 ? 'success' : 'failed',
            schedule_data: { schedules },
            metadata: {
              schedules_count: schedules.length,
              total_times: schedules.reduce((acc, s) => acc + s.horarios.length, 0)
            }
          }, {
            onConflict: 'source_id,line_url'
          });

        if (upsertError) {
          console.error(`Error saving line ${line.line_code}:`, upsertError);
          linesFailed++;
        } else {
          linesProcessed++;
          if (schedules.length > 0) {
            linesUpdated++;
          }
        }

        // Small delay to avoid overwhelming the target servers
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Error processing line ${line.line_code}:`, error);
        linesFailed++;
      }
    }

    // Update source's last scraped timestamp
    await supabase
      .from('scraping_sources')
      .update({ last_scraped_at: new Date().toISOString() })
      .eq('id', source.id);

    // Log completion
    await supabase.from('scraping_logs').insert({
      source_id: source.id,
      execution_id: executionId,
      status: 'completed',
      lines_found: lines.length,
      lines_processed: linesProcessed,
      lines_updated: linesUpdated,
      lines_failed: linesFailed,
      completed_at: new Date().toISOString(),
      execution_details: {
        source_name: source.name,
        processing_summary: {
          total_found: lines.length,
          successfully_processed: linesProcessed,
          with_schedules: linesUpdated,
          failed: linesFailed
        }
      }
    });

    console.log(`Completed scraping for ${source.name}: ${linesProcessed}/${lines.length} lines processed, ${linesUpdated} with schedules`);

  } catch (error) {
    console.error(`Error scraping source ${source.name}:`, error);
    
    // Log error
    await supabase.from('scraping_logs').insert({
      source_id: source.id,
      execution_id: executionId,
      status: 'error',
      error_message: error.message,
      completed_at: new Date().toISOString()
    });
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { source_ids = [], force_refresh = false } = await req.json().catch(() => ({}));
    const executionId = crypto.randomUUID();

    console.log(`Starting bus schedule scraping - Execution ID: ${executionId}`);

    // Get active scraping sources
    let sourcesQuery = supabase
      .from('scraping_sources')
      .select('*')
      .eq('is_active', true);

    if (source_ids.length > 0) {
      sourcesQuery = sourcesQuery.in('id', source_ids);
    }

    const { data: sources, error: sourcesError } = await sourcesQuery;

    if (sourcesError) {
      throw new Error(`Error fetching sources: ${sourcesError.message}`);
    }

    if (!sources || sources.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No active scraping sources found' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Log start of execution
    await supabase.from('scraping_logs').insert({
      source_id: null, // Global log entry
      execution_id: executionId,
      status: 'started',
      execution_details: {
        sources_to_process: sources.map(s => ({ id: s.id, name: s.name })),
        force_refresh,
        started_at: new Date().toISOString()
      }
    });

    // Process all sources concurrently (with some limitation)
    const scrapingPromises = sources.map(source => 
      scrapeBusSource(source as ScrapingSource, executionId)
    );

    await Promise.allSettled(scrapingPromises);

    // Get final statistics
    const { data: logs } = await supabase
      .from('scraping_logs')
      .select('*')
      .eq('execution_id', executionId)
      .neq('source_id', null);

    const stats = logs?.reduce((acc, log) => ({
      total_lines_found: acc.total_lines_found + (log.lines_found || 0),
      total_lines_processed: acc.total_lines_processed + (log.lines_processed || 0),
      total_lines_updated: acc.total_lines_updated + (log.lines_updated || 0),
      total_lines_failed: acc.total_lines_failed + (log.lines_failed || 0)
    }), {
      total_lines_found: 0,
      total_lines_processed: 0,
      total_lines_updated: 0,
      total_lines_failed: 0
    });

    console.log(`Scraping execution completed - ID: ${executionId}`, stats);

    return new Response(
      JSON.stringify({
        success: true,
        execution_id: executionId,
        sources_processed: sources.length,
        statistics: stats,
        message: `Successfully processed ${sources.length} sources`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in scrape-bus-schedules function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})