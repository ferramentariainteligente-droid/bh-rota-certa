import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Bus lines data (static copy to avoid external dependency)
const BUS_LINES_SAMPLE = [
  {
    "url": "https://movemetropolitano.com.br/4211-terminal-sao-benedito-circular-conjunto-cristina",
    "linha": "4211 Terminal São Benedito / Circular Conjunto Cristina"
  },
  {
    "url": "https://movemetropolitano.com.br/5889-vila-maria-terminal-vilarinho", 
    "linha": "5889 Vila Maria / Terminal Vilarinho"
  },
  {
    "url": "https://movemetropolitano.com.br/402h-terminal-sao-gabriel-hospitais",
    "linha": "402H Terminal São Gabriel / Hospitais"
  },
  {
    "url": "https://movemetropolitano.com.br/1303-betim-bh-via-terezopolis",
    "linha": "1303 Betim / BH Via Terezópolis"
  },
  {
    "url": "https://movemetropolitano.com.br/5104-pampulha-centro-via-antonio-carlos", 
    "linha": "5104 Pampulha / Centro Via Antônio Carlos"
  },
  {
    "url": "https://movemetropolitano.com.br/9202-venda-nova-centro",
    "linha": "9202 Venda Nova / Centro"
  },
  {
    "url": "https://movemetropolitano.com.br/6001-contagem-centro-bh",
    "linha": "6001 Contagem / Centro BH"
  },
  {
    "url": "https://movemetropolitano.com.br/3001-nova-lima-centro-bh",
    "linha": "3001 Nova Lima / Centro BH"
  }
];

async function scrapeBusSchedules(url: string): Promise<{
  success: boolean;
  schedules: Array<{ tipo: string; horarios: string[] }>;
  error?: string;
}> {
  try {
    console.log(`Scraping URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Fetched HTML for ${url}, length: ${html.length} chars`);
    
    return extractScheduleData(html);
    
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return {
      success: false,
      schedules: [],
      error: error.message
    };
  }
}

function extractScheduleData(html: string): {
  success: boolean;
  schedules: Array<{ tipo: string; horarios: string[] }>;
  error?: string;  
} {
  try {
    const schedules: Array<{ tipo: string; horarios: string[] }> = [];
    
    // Parse HTML to extract structured schedule data
    // Look for the schedule container div
    const schedulesMatch = html.match(/<div class="horarios">([\s\S]*?)<\/div>/);
    if (!schedulesMatch) {
      console.log('No schedule container found, trying alternative patterns');
      
      // Try alternative patterns for schedule extraction
      const altPattern1 = html.match(/<div[^>]*class="[^"]*horario[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
      const altPattern2 = html.match(/<section[^>]*class="[^"]*schedule[^"]*"[^>]*>([\s\S]*?)<\/section>/i);
      
      if (!altPattern1 && !altPattern2) {
        return { success: false, schedules: [], error: 'Schedule container not found' };
      }
    }

    const schedulesHtml = schedulesMatch ? schedulesMatch[1] : html;
    
    // Extract each schedule type section (diasemana divs)
    const scheduleTypeRegex = /<div class="diasemana[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
    let match;
    
    while ((match = scheduleTypeRegex.exec(schedulesHtml)) !== null) {
      const sectionHtml = match[1];
      
      // Extract the schedule type name from div-semana
      const typeMatch = sectionHtml.match(/<div class="div-semana">([^<]+)<\/div>/);
      if (!typeMatch) continue;
      
      const scheduleType = typeMatch[1].trim();
      
      // Extract all times from div-hora elements
      const timeRegex = /<div class="div-hora">([^<]+)(?:<sup>[^<]*<\/sup>)?<\/div>/g;
      const horarios: string[] = [];
      let timeMatch;
      
      while ((timeMatch = timeRegex.exec(sectionHtml)) !== null) {
        const time = timeMatch[1].trim();
        // Clean up time format (remove any extra characters)
        const cleanTime = time.replace(/[^\d:]/g, '');
        if (/^\d{1,2}:\d{2}$/.test(cleanTime)) {
          horarios.push(cleanTime);
        }
      }
      
      if (horarios.length > 0) {
        // Map schedule types to standardized names
        const tipo = mapScheduleType(scheduleType);
        schedules.push({ tipo, horarios });
        console.log(`Extracted ${scheduleType} -> ${tipo}: ${horarios.length} times`);
      }
    }
    
    if (schedules.length === 0) {
      // If no detailed schedules found, try to extract any time patterns
      const timePatterns = html.match(/\b\d{1,2}:\d{2}\b/g);
      if (timePatterns && timePatterns.length > 0) {
        const uniqueTimes = [...new Set(timePatterns)].sort();
        schedules.push({ 
          tipo: 'geral', 
          horarios: uniqueTimes.slice(0, 50) // Limit to prevent too many results
        });
        console.log(`Extracted general schedule: ${uniqueTimes.length} times`);
      } else {
        console.log('No schedules extracted');
        return { success: false, schedules: [], error: 'No schedule data found' };
      }
    }
    
    console.log(`Successfully extracted ${schedules.length} schedule types`);
    return { success: true, schedules };
    
  } catch (error) {
    console.error('Error extracting schedule data:', error);
    return { success: false, schedules: [], error: error.message };
  }
}

function mapScheduleType(rawType: string): string {
  const normalized = rawType.toLowerCase().trim();
  
  // Map various schedule type formats to standardized names
  if (normalized.includes('dias úteis') && normalized.includes('atípico')) {
    return 'dias_uteis_atipico';
  }
  if (normalized.includes('dias úteis') && normalized.includes('férias')) {
    return 'dias_uteis_ferias';
  }
  if (normalized.includes('dias úteis')) {
    return 'dias_uteis';
  }
  if (normalized.includes('sábado') && normalized.includes('atípico')) {
    return 'sabado_atipico';
  }
  if (normalized.includes('sábado') && normalized.includes('férias')) {
    return 'sabado_ferias';
  }
  if (normalized.includes('sábado')) {
    return 'sabado';
  }
  if (normalized.includes('domingo') && normalized.includes('feriado')) {
    return 'domingo_feriado';
  }
  if (normalized.includes('quarta') && normalized.includes('cinzas')) {
    return 'quarta_cinzas';
  }
  
  // Fallback to a sanitized version
  return normalized.replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing all bus lines for schedule categorization');
    const { batch_size = 10, start_index = 0 } = await req.json().catch(() => ({}));
    const executionId = crypto.randomUUID();

    console.log(`Starting batch processing - Execution ID: ${executionId}, batch_size: ${batch_size}, start_index: ${start_index}`);

    // Get active scraping sources
    const { data: sources, error: sourcesError } = await supabase
      .from('scraping_sources')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (sourcesError || !sources || sources.length === 0) {
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
    const { error: startLogError } = await supabase.from('scraping_logs').insert({
      source_id: sources[0].id, 
      execution_id: executionId,
      status: 'started',
      execution_details: {
        batch_processing: true,
        batch_size,
        start_index,
        started_at: new Date().toISOString()
      }
    });

    if (startLogError) {
      console.error('Start log error:', startLogError);
    }

    // Process lines in batches
    const linesToProcess = BUS_LINES_SAMPLE.slice(start_index, start_index + batch_size);
    
    let totalProcessed = 0;
    let totalSuccessful = 0;
    let totalFailed = 0;

    console.log(`Processing ${linesToProcess.length} bus lines`);

    // Process each bus line URL
    for (const busLine of linesToProcess) {
      console.log(`Processing: ${busLine.linha}`);
      
      try {
        const result = await scrapeBusSchedules(busLine.url);
        
        if (result.success && result.schedules.length > 0) {
          // Extract line info from URL
          const pathParts = new URL(busLine.url).pathname.split('-');
          const lineCode = pathParts[0].replace('/', '');
          const lineName = busLine.linha;
          
          // Save to database
          const { error: lineError } = await supabase.from('scraped_bus_lines').upsert({
            source_id: sources[0].id,
            line_code: lineCode,
            line_name: lineName,
            line_url: busLine.url,
            route_description: lineName,
            last_scraped_at: new Date().toISOString(),
            scraping_status: 'success',
            schedule_data: { schedules: result.schedules },
            metadata: {
              schedules_count: result.schedules.length,
              total_times: result.schedules.reduce((acc, s) => acc + s.horarios.length, 0),
              scraping_method: 'enhanced_html_parser_v2',
              has_detailed_schedules: result.schedules.length > 1 || result.schedules[0]?.tipo !== 'geral'
            }
          }, {
            onConflict: 'line_url'
          });

          if (lineError) {
            console.error('Line insert error:', lineError);
            totalFailed++;
          } else {
            totalSuccessful++;
            console.log(`✅ Successfully saved ${lineCode} with ${result.schedules.length} schedule types`);
          }
        } else {
          console.log(`❌ Failed to scrape ${busLine.url}: ${result.error}`);
          
          // Still save the line but mark as failed
          const pathParts = new URL(busLine.url).pathname.split('-');
          const lineCode = pathParts[0].replace('/', ''); 
          
          await supabase.from('scraped_bus_lines').upsert({
            source_id: sources[0].id,
            line_code: lineCode,
            line_name: busLine.linha,
            line_url: busLine.url,
            route_description: busLine.linha,
            last_scraped_at: new Date().toISOString(),
            scraping_status: 'failed',
            schedule_data: { error: result.error },
            metadata: {
              scraping_method: 'enhanced_html_parser_v2',
              error_message: result.error
            }
          }, {
            onConflict: 'line_url'
          });
        
          totalFailed++;
        }
        
        totalProcessed++;
        
        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error(`Error processing ${busLine.url}:`, error);
        totalFailed++;
        totalProcessed++;
      }
    }

    // Log completion
    const { error: completeLogError } = await supabase.from('scraping_logs').insert({
      source_id: sources[0].id,
      execution_id: executionId,
      status: 'completed',
      lines_found: linesToProcess.length,
      lines_processed: totalProcessed,
      lines_updated: totalSuccessful,
      lines_failed: totalFailed,
      completed_at: new Date().toISOString(),
      execution_details: {
        batch_processing: true,
        processing_summary: {
          batch_size,
          start_index,
          total_processed: totalProcessed,
          successful_scrapes: totalSuccessful,
          failed_scrapes: totalFailed
        }
      }
    });

    if (completeLogError) {
      console.error('Complete log error:', completeLogError);
    }

    // Update source timestamp
    await supabase
      .from('scraping_sources')
      .update({ last_scraped_at: new Date().toISOString() })
      .eq('id', sources[0].id);

    console.log(`✅ Batch processing completed - ID: ${executionId}, processed ${totalProcessed} lines, ${totalSuccessful} successful`);

    return new Response(
      JSON.stringify({
        success: true,
        execution_id: executionId,
        statistics: {
          batch_size,
          start_index,
          total_lines_processed: totalProcessed,
          total_lines_updated: totalSuccessful,
          total_lines_failed: totalFailed,
          next_start_index: start_index + batch_size
        },
        message: `Successfully processed ${totalProcessed} lines with ${totalSuccessful} successful scrapes`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in process-all-lines function:', error);
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
});