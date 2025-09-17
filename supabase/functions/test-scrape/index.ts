import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testScrapeBusSchedules(url: string): Promise<{
  success: boolean;
  schedules: Array<{ tipo: string; horarios: string[] }>;
  error?: string;
  metadata?: any;
}> {
  try {
    console.log(`Testing URL: ${url}`);
    
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
    console.error(`Error testing ${url}:`, error);
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
  metadata?: any;
} {
  try {
    console.log('Starting schedule extraction...');
    const schedules: Array<{ tipo: string; horarios: string[] }> = [];
    let metadata = {
      html_length: html.length,
      schedule_container_found: false,
      sections_found: 0
    };
    
    // Check if HTML contains horarios div
    const hasHorariosDiv = html.includes('class="horarios"');
    console.log(`HTML contains horarios div: ${hasHorariosDiv}`);
    
    if (!hasHorariosDiv) {
      return {
        success: false,
        schedules: [],
        error: 'No horarios container found in HTML',
        metadata
      };
    }

    metadata.schedule_container_found = true;
    
    // Simple pattern matching for diasemana sections
    const diasemanaPattern = /<div class="diasemana[^>]*">(.*?)<\/div>/gs;
    const matches = [...html.matchAll(diasemanaPattern)];
    
    console.log(`Found ${matches.length} potential diasemana matches`);
    
    for (const match of matches) {
      const sectionHtml = match[1];
      console.log(`Processing section with ${sectionHtml.length} chars`);
      
      // Extract schedule type
      const typeMatch = sectionHtml.match(/<div class="div-semana">([^<]+)<\/div>/);
      if (!typeMatch) {
        console.log('No schedule type found in section');
        continue;
      }
      
      const scheduleType = typeMatch[1].trim();
      console.log(`Found schedule type: "${scheduleType}"`);
      
      // Extract times using simple pattern
      const timePattern = /<div class="div-hora">([^<]+)(?:<sup>[^<]*<\/sup>)?<\/div>/g;
      const horarios: string[] = [];
      let timeMatch;
      
      while ((timeMatch = timePattern.exec(sectionHtml)) !== null) {
        const rawTime = timeMatch[1].trim();
        console.log(`Raw time found: "${rawTime}"`);
        
        // Clean the time - keep only numbers and colon
        const cleanTime = rawTime.replace(/[^\d:]/g, '');
        if (/^\d{1,2}:\d{2}$/.test(cleanTime)) {
          horarios.push(cleanTime);
          console.log(`Added clean time: "${cleanTime}"`);
        } else {
          console.log(`Rejected invalid time format: "${cleanTime}"`);
        }
      }
      
      if (horarios.length > 0) {
        const tipo = mapScheduleType(scheduleType);
        schedules.push({ tipo, horarios });
        console.log(`Added schedule: ${tipo} with ${horarios.length} times`);
        metadata.sections_found++;
      } else {
        console.log(`No valid times found for "${scheduleType}"`);
      }
    }
    
    console.log(`Total schedules extracted: ${schedules.length}`);
    
    if (schedules.length === 0) {
      return { 
        success: false, 
        schedules: [], 
        error: 'No valid schedule data extracted',
        metadata
      };
    }
    
    return { success: true, schedules, metadata };
    
  } catch (error) {
    console.error('Error in extractScheduleData:', error);
    return { 
      success: false, 
      schedules: [], 
      error: `Extraction error: ${error.message}`,
      metadata: { parsing_error: true }
    };
  }
}

function mapScheduleType(rawType: string): string {
  const normalized = rawType.toLowerCase().trim();
  console.log(`Mapping schedule type: "${rawType}" -> normalized: "${normalized}"`);
  
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
  if (normalized.includes('domingos e feriados') && normalized.includes('atípico')) {
    return 'domingo_feriado_atipico';
  }
  if (normalized.includes('domingo') && normalized.includes('feriado')) {
    return 'domingo_feriado';
  }
  if (normalized.includes('quarta') && normalized.includes('cinzas')) {
    return 'quarta_cinzas';
  }
  
  const mapped = normalized.replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  console.log(`Final mapping: "${rawType}" -> "${mapped}"`);
  return mapped;
}

Deno.serve(async (req) => {
  console.log(`Request method: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Test scrape function called');
    
    const requestBody = await req.text();
    console.log(`Request body: ${requestBody}`);
    
    let parsedBody;
    try {
      parsedBody = requestBody ? JSON.parse(requestBody) : {};
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      parsedBody = {};
    }
    
    const { test_url } = parsedBody;
    console.log(`Test URL: ${test_url}`);
    
    const executionId = crypto.randomUUID();

    if (!test_url) {
      console.log('No test URL provided, running database test');
      
      const { data: sources, error } = await supabase
        .from('scraping_sources')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (error) {
        console.error('Database error:', error);
        return new Response(
          JSON.stringify({ success: false, error: `Database error: ${error.message}` }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Database test completed successfully',
          execution_id: executionId,
          sources_found: sources?.length || 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    console.log(`Starting scrape test for: ${test_url}`);
    const result = await testScrapeBusSchedules(test_url);
    console.log(`Scrape result: success=${result.success}, schedules=${result.schedules.length}`);
    
    if (result.success && result.schedules.length > 0) {
      console.log('Attempting to update database with scraped data');
      try {
        const pathParts = new URL(test_url).pathname.split('-');
        const lineCode = pathParts[0].replace('/', '');
        const lineName = pathParts.slice(1).join(' ').replace(/-/g, ' ');
        
        const { error: updateError } = await supabase.from('scraped_bus_lines').upsert({
          source_id: null,
          line_code: lineCode,
          line_name: lineName,
          line_url: test_url,
          route_description: `${lineCode} - ${lineName}`,
          last_scraped_at: new Date().toISOString(),
          scraping_status: 'success',
          schedule_data: { schedules: result.schedules },
          metadata: {
            schedules_count: result.schedules.length,
            total_times: result.schedules.reduce((acc, s) => acc + s.horarios.length, 0),
            scraping_method: 'real_time_test',
            test_timestamp: new Date().toISOString()
          }
        }, {
          onConflict: 'line_url'
        });

        if (updateError) {
          console.error('Database update error:', updateError);
        } else {
          console.log('Successfully updated database');
        }
      } catch (dbError) {
        console.error('Database operation error:', dbError);
      }
    }
    
    const responseData = {
      success: result.success,
      message: result.success ? 
        `Successfully extracted ${result.schedules.length} schedule types` : 
        `Failed: ${result.error}`,
      execution_id: executionId,
      test_result: {
        url: test_url,
        schedules_found: result.schedules.length,
        schedule_types: result.schedules.map(s => ({ type: s.tipo, times_count: s.horarios.length })),
        metadata: result.metadata,
        error: result.error
      },
      detailed_schedules: result.schedules
    };
    
    console.log('Sending response:', JSON.stringify(responseData, null, 2));
    
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200  // Always return 200 to avoid client-side errors
      }
    );

  } catch (error) {
    console.error('Top-level error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Server error: ${error.message}`,
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})
