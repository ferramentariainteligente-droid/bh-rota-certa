import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Enhanced scraping function to test specific URLs
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
    const schedules: Array<{ tipo: string; horarios: string[] }> = [];
    let metadata = {
      html_length: html.length,
      schedule_container_found: false,
      sections_found: 0
    };
    
    // Find the horarios container
    const horariosMatch = html.match(/<div class="horarios">([\s\S]*?)(?=<div class="pub"|<\/div>\s*<\/div>|$)/);
    if (!horariosMatch) {
      console.log('No horarios container found');
      return { 
        success: false, 
        schedules: [], 
        error: 'Horarios container not found',
        metadata
      };
    }

    metadata.schedule_container_found = true;
    const horariosHtml = horariosMatch[1];
    console.log(`Found horarios container with ${horariosHtml.length} chars`);
    
    // Extract each diasemana div with better regex that handles nested structure
    const sections = [];
    let currentPos = 0;
    
    // Find all div diasemana starting positions
    const diasemanaStart = /<div class="diasemana[^"]*"[^>]*>/g;
    let startMatch;
    
    while ((startMatch = diasemanaStart.exec(horariosHtml)) !== null) {
      const startPos = startMatch.index;
      const startTag = startMatch[0];
      
      // Find the matching closing div by counting nested divs
      let divCount = 1;
      let endPos = startPos + startTag.length;
      
      while (divCount > 0 && endPos < horariosHtml.length) {
        const nextDiv = horariosHtml.substring(endPos).match(/<\/?div[^>]*>/);
        if (!nextDiv) break;
        
        endPos += nextDiv.index! + nextDiv[0].length;
        if (nextDiv[0].startsWith('</div>')) {
          divCount--;
        } else if (nextDiv[0].startsWith('<div')) {
          divCount++;
        }
      }
      
      if (divCount === 0) {
        const sectionContent = horariosHtml.substring(startPos, endPos - 6); // Remove </div>
        sections.push(sectionContent);
      }
    }
    
    console.log(`Found ${sections.length} diasemana sections`);
    
    for (const sectionHtml of sections) {
      metadata.sections_found++;
      
      // Extract the schedule type name from div-semana
      const typeMatch = sectionHtml.match(/<div class="div-semana">([^<]+)<\/div>/);
      if (!typeMatch) {
        console.log('No type match found in section');
        continue;
      }
      
      const scheduleType = typeMatch[1].trim();
      console.log(`Processing schedule type: "${scheduleType}"`);
      
      // Extract all times from div-hora elements, handling <sup> tags
      const timeRegex = /<div class="div-hora">([^<]+)(?:<sup>[^<]*<\/sup>)?<\/div>/g;
      const horarios: string[] = [];
      let timeMatch;
      
      while ((timeMatch = timeRegex.exec(sectionHtml)) !== null) {
        let time = timeMatch[1].trim();
        console.log(`Found raw time: "${time}"`);
        
        // Clean up time format (keep only digits and colon)
        const cleanTime = time.replace(/[^\d:]/g, '');
        if (/^\d{1,2}:\d{2}$/.test(cleanTime)) {
          horarios.push(cleanTime);
          console.log(`Added clean time: "${cleanTime}"`);
        }
      }
      
      if (horarios.length > 0) {
        // Map schedule types to standardized names
        const tipo = mapScheduleType(scheduleType);
        schedules.push({ tipo, horarios });
        console.log(`Extracted "${scheduleType}" -> "${tipo}": [${horarios.join(', ')}]`);
      } else {
        console.log(`No valid times found for "${scheduleType}"`);
      }
    }
    
    if (schedules.length === 0) {
      console.log('No schedules extracted');
      return { 
        success: false, 
        schedules: [], 
        error: 'No schedule data found in HTML structure',
        metadata
      };
    }
    
    console.log(`Successfully extracted ${schedules.length} schedule types`);
    return { success: true, schedules, metadata };
    
  } catch (error) {
    console.error('Error extracting schedule data:', error);
    return { 
      success: false, 
      schedules: [], 
      error: error.message,
      metadata: { parsing_error: true }
    };
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
  if (normalized.includes('domingos e feriados') && normalized.includes('atípico')) {
    return 'domingo_feriado_atipico';
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
    console.log('Enhanced test scrape function called');
    
    const { test_url } = await req.json().catch(() => ({}));
    const executionId = crypto.randomUUID();

    if (!test_url) {
      // Test database connection
      const { data: sources, error } = await supabase
        .from('scraping_sources')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Sources found:', sources?.length || 0);

      // Simple test - just insert a test log
      const { error: logError } = await supabase.from('scraping_logs').insert({
        source_id: null,
        execution_id: executionId,
        status: 'completed',
        lines_found: 0,
        lines_processed: 0,
        lines_updated: 0,
        lines_failed: 0,
        execution_details: { test: true, timestamp: new Date().toISOString() }
      });

      if (logError) {
        console.error('Log insert error:', logError);
        throw logError;
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

    // Test specific URL scraping
    console.log(`Testing URL scraping: ${test_url}`);
    const result = await testScrapeBusSchedules(test_url);
    
    // If successful, also try to update the database with real data
    if (result.success && result.schedules.length > 0) {
      try {
        const pathParts = new URL(test_url).pathname.split('-');
        const lineCode = pathParts[0].replace('/', '');
        const lineName = pathParts.slice(1).join(' ').replace(/-/g, ' ');
        
        // Update or insert real scraped data
        const { error: updateError } = await supabase.from('scraped_bus_lines').upsert({
          source_id: null, // Will be updated later
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
          console.error('Error updating scraped data:', updateError);
        } else {
          console.log(`Successfully updated database with real scraped data for ${lineCode}`);
        }
      } catch (dbError) {
        console.error('Database update error:', dbError);
      }
    }
    
    // Log the test result
    const { error: logError } = await supabase.from('scraping_logs').insert({
      source_id: null,
      execution_id: executionId,
      status: result.success ? 'completed' : 'error',
      lines_found: result.schedules.length,
      lines_processed: result.schedules.length,
      lines_updated: result.success ? result.schedules.length : 0,
      lines_failed: result.success ? 0 : 1,
      error_message: result.error,
      execution_details: {
        test_url,
        scraping_test: true,
        metadata: result.metadata,
        timestamp: new Date().toISOString()
      }
    });

    if (logError) {
      console.error('Log insert error:', logError);
    }
    
    return new Response(
      JSON.stringify({
        success: result.success,
        message: result.success ? 
          `Successfully extracted ${result.schedules.length} schedule types from ${test_url}` : 
          `Failed to extract schedules: ${result.error}`,
        execution_id: executionId,
        test_result: {
          url: test_url,
          schedules_found: result.schedules.length,
          schedule_types: result.schedules.map(s => ({ type: s.tipo, times_count: s.horarios.length })),
          metadata: result.metadata,
          error: result.error
        },
        detailed_schedules: result.schedules
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 400
      }
    );

  } catch (error) {
    console.error('Error in enhanced test-scrape function:', error);
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
