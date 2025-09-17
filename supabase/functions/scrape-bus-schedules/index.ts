import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Enhanced scraping function to extract structured schedule data
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
    console.log(`Fetched HTML, length: ${html.length} chars`);
    
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
      console.log('No schedule container found');
      return { success: false, schedules: [], error: 'Schedule container not found' };
    }

    const schedulesHtml = schedulesMatch[1];
    
    // Extract each schedule type section (diasemana divs)
    const scheduleTypeRegex = /<div class="diasemana[^"]*">([\s\S]*?)<\/div>/g;
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
      console.log('No schedules extracted');
      return { success: false, schedules: [], error: 'No schedule data found' };
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
    console.log('Enhanced scraping function called');
    const { source_ids = [], force_refresh = false, test_url } = await req.json().catch(() => ({}));
    const executionId = crypto.randomUUID();

    console.log(`Starting enhanced bus schedule scraping - Execution ID: ${executionId}`);

    // If test_url is provided, just test that URL
    if (test_url) {
      console.log(`Testing single URL: ${test_url}`);
      const result = await scrapeBusSchedules(test_url);
      
      return new Response(
        JSON.stringify({
          success: result.success,
          execution_id: executionId,
          test_result: result,
          message: result.success ? 
            `Successfully scraped ${result.schedules.length} schedule types` : 
            `Failed to scrape: ${result.error}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: result.success ? 200 : 400
        }
      );
    }

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
      console.error('Sources error:', sourcesError);
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

    console.log(`Found ${sources.length} active sources`);

    // Log start of execution
    const { error: startLogError } = await supabase.from('scraping_logs').insert({
      source_id: null, 
      execution_id: executionId,
      status: 'started',
      execution_details: {
        sources_to_process: sources.map(s => ({ id: s.id, name: s.name })),
        force_refresh,
        started_at: new Date().toISOString()
      }
    });

    if (startLogError) {
      console.error('Start log error:', startLogError);
    }

    // Get bus lines to scrape from our JSON data
    const busLinesToScrape = [
      "https://movemetropolitano.com.br/4211-terminal-sao-benedito-circular-conjunto-cristina",
      "https://movemetropolitano.com.br/5889-vila-maria-terminal-vilarinho",
      "https://movemetropolitano.com.br/402h-terminal-sao-gabriel-hospitais"
    ];

    let totalProcessed = 0;
    let totalLines = 0;
    let totalSuccessful = 0;
    let totalFailed = 0;

    // Process each bus line URL
    for (const url of busLinesToScrape.slice(0, 3)) { // Limit for testing
      console.log(`Processing URL: ${url}`);
      
      try {
        const result = await scrapeBusSchedules(url);
        
        if (result.success && result.schedules.length > 0) {
          // Extract line info from URL
          const pathParts = new URL(url).pathname.split('-');
          const lineCode = pathParts[0].replace('/', '');
          const lineName = pathParts.slice(1).join(' ').replace(/-/g, ' ');
          
          // Save to database
          const { error: lineError } = await supabase.from('scraped_bus_lines').upsert({
            source_id: sources[0].id, // Use first source for now
            line_code: lineCode,
            line_name: lineName,
            line_url: url,
            route_description: lineName,
            last_scraped_at: new Date().toISOString(),
            scraping_status: 'success',
            schedule_data: { schedules: result.schedules },
            metadata: {
              schedules_count: result.schedules.length,
              total_times: result.schedules.reduce((acc, s) => acc + s.horarios.length, 0),
              scraping_method: 'enhanced_html_parser'
            }
          }, {
            onConflict: 'line_url'
          });

          if (lineError) {
            console.error('Line insert error:', lineError);
            totalFailed++;
          } else {
            totalSuccessful++;
            console.log(`Successfully saved ${lineCode} with ${result.schedules.length} schedule types`);
          }
        } else {
          console.log(`Failed to scrape ${url}: ${result.error}`);
          totalFailed++;
        }
        
        totalProcessed++;
        totalLines++;
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Error processing ${url}:`, error);
        totalFailed++;
        totalProcessed++;
      }
    }

    // Log completion
    const { error: completeLogError } = await supabase.from('scraping_logs').insert({
      source_id: sources[0].id,
      execution_id: executionId,
      status: 'completed',
      lines_found: totalLines,
      lines_processed: totalProcessed,
      lines_updated: totalSuccessful,
      lines_failed: totalFailed,
      completed_at: new Date().toISOString(),
      execution_details: {
        enhanced_scraping: true,
        processing_summary: {
          total_urls_processed: totalProcessed,
          successful_scrapes: totalSuccessful,
          failed_scrapes: totalFailed
        }
      }
    });

    if (completeLogError) {
      console.error('Complete log error:', completeLogError);
    }

    // Update source timestamps
    for (const source of sources) {
      await supabase
        .from('scraping_sources')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', source.id);
    }

    console.log(`Enhanced scraping completed - ID: ${executionId}, processed ${totalProcessed} URLs, ${totalSuccessful} successful`);

    return new Response(
      JSON.stringify({
        success: true,
        execution_id: executionId,
        sources_processed: sources.length,
        statistics: {
          total_lines_found: totalLines,
          total_lines_processed: totalProcessed,
          total_lines_updated: totalSuccessful,
          total_lines_failed: totalFailed
        },
        message: `Successfully processed ${totalProcessed} URLs with ${totalSuccessful} successful scrapes`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in enhanced scrape-bus-schedules function:', error);
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