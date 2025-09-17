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
    console.log('Test scrape function called');

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
    const executionId = crypto.randomUUID();
    
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
        message: 'Test completed successfully',
        execution_id: executionId,
        sources_found: sources?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in test-scrape function:', error);
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