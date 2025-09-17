import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { busData } = await req.json();
    
    if (!busData || !Array.isArray(busData)) {
      return new Response(
        JSON.stringify({ error: 'Invalid bus data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let importedLines = 0;
    let importedSchedules = 0;

    for (const line of busData) {
      // Parse line information from the title
      const parseLineInfo = (linha: string) => {
        const match = linha.match(/^(\d+[A-Z]?)\s+(.+?)\s+–/);
        if (match) {
          return {
            number: match[1],
            route: match[2]
          };
        }
        return {
          number: linha.split(' ')[0] || 'N/A',
          route: linha
        };
      };

      const { number, route } = parseLineInfo(line.linha);

      // Insert bus line
      const { data: busLine, error: lineError } = await supabase
        .from('bus_lines')
        .insert({
          line_number: number,
          route_name: route,
          full_title: line.linha,
          official_url: line.url
        })
        .select()
        .single();

      if (lineError) {
        console.error('Error inserting bus line:', lineError);
        continue;
      }

      importedLines++;

      // Insert schedules for this line
      if (line.horarios && line.horarios.length > 0) {
        const schedules = line.horarios.map((horario: string) => ({
          bus_line_id: busLine.id,
          departure_time: horario
        }));

        const { error: scheduleError } = await supabase
          .from('bus_schedules')
          .insert(schedules);

        if (scheduleError) {
          console.error('Error inserting schedules:', scheduleError);
        } else {
          importedSchedules += schedules.length;
        }
      }
    }

    console.log(`Import completed: ${importedLines} lines, ${importedSchedules} schedules`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully imported ${importedLines} bus lines with ${importedSchedules} schedules`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in import-bus-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});