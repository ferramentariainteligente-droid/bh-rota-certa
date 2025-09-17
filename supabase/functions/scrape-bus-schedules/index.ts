import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Scraping bus schedules function called');
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

    // Process each source (simplified version for now)
    let totalProcessed = 0;
    let totalLines = 0;

    for (const source of sources) {
      console.log(`Processing source: ${source.name}`);
      
      try {
        // Simulate processing - replace with actual scraping later
        const simulatedLines = Math.floor(Math.random() * 50) + 10; // 10-60 lines
        const processedLines = Math.floor(simulatedLines * 0.8); // 80% success rate
        const failedLines = simulatedLines - processedLines;
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate work
        
        // Insert some test data
        const testSchedules = [
          {
            tipo: 'dias_uteis',
            horarios: ['05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30']
          },
          {
            tipo: 'sabado', 
            horarios: ['06:00', '07:00', '08:00', '09:00', '10:00']
          },
          {
            tipo: 'domingo_feriado',
            horarios: ['07:00', '08:00', '09:00', '10:00']
          }
        ];

        // Create some sample scraped lines
        for (let i = 1; i <= 3; i++) {
          const { error: lineError } = await supabase.from('scraped_bus_lines').upsert({
            source_id: source.id,
            line_code: `${100 + i}`,
            line_name: `Linha Teste ${i}`,
            line_url: `${source.base_url}/linha-${100 + i}`,
            route_description: `Linha ${100 + i} - Rota de teste`,
            last_scraped_at: new Date().toISOString(),
            scraping_status: 'success',
            schedule_data: { schedules: testSchedules },
            metadata: {
              schedules_count: testSchedules.length,
              total_times: testSchedules.reduce((acc, s) => acc + s.horarios.length, 0)
            }
          }, {
            onConflict: 'source_id,line_url'
          });

          if (lineError) {
            console.error('Line insert error:', lineError);
          }
        }
        
        // Log completion for this source
        const { error: sourceLogError } = await supabase.from('scraping_logs').insert({
          source_id: source.id,
          execution_id: executionId,
          status: 'completed',
          lines_found: simulatedLines,
          lines_processed: simulatedLines,
          lines_updated: processedLines,
          lines_failed: failedLines,
          completed_at: new Date().toISOString(),
          execution_details: {
            source_name: source.name,
            processing_summary: {
              total_found: simulatedLines,
              successfully_processed: processedLines,
              failed: failedLines
            }
          }
        });

        if (sourceLogError) {
          console.error('Source log error:', sourceLogError);
        }

        totalProcessed++;
        totalLines += simulatedLines;

      } catch (sourceError) {
        console.error(`Error processing source ${source.name}:`, sourceError);
        
        // Log error for this source
        await supabase.from('scraping_logs').insert({
          source_id: source.id,
          execution_id: executionId,
          status: 'error',
          error_message: sourceError.message,
          completed_at: new Date().toISOString()
        });
      }
    }

    // Update source timestamps
    for (const source of sources) {
      await supabase
        .from('scraping_sources')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', source.id);
    }

    console.log(`Scraping execution completed - ID: ${executionId}, processed ${totalProcessed} sources, ${totalLines} total lines`);

    return new Response(
      JSON.stringify({
        success: true,
        execution_id: executionId,
        sources_processed: totalProcessed,
        statistics: {
          total_lines_found: totalLines,
          total_lines_processed: totalLines,
          total_lines_updated: Math.floor(totalLines * 0.8),
          total_lines_failed: Math.floor(totalLines * 0.2)
        },
        message: `Successfully processed ${totalProcessed} sources with ${totalLines} lines (demo data)`
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