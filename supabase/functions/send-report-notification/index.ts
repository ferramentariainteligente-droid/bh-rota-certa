import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportNotificationRequest {
  reportId: string;
  lineName: string;
  lineUrl: string;
  reportType: string;
  userMessage: string;
  suggestedCorrection?: string;
  userEmail?: string;
  userContact?: string;
}

const reportTypeLabels = {
  'horario_incorreto': 'Horário Incorreto',
  'linha_nao_funciona': 'Linha Não Funciona', 
  'horario_em_falta': 'Horário em Falta',
  'informacao_desatualizada': 'Informação Desatualizada',
  'outro': 'Outro'
};

const handler = async (req: Request): Promise<Response> => {
  console.log('Report notification function called:', req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      reportId, 
      lineName, 
      lineUrl, 
      reportType, 
      userMessage, 
      suggestedCorrection, 
      userEmail, 
      userContact 
    }: ReportNotificationRequest = await req.json();

    console.log('Processing report notification:', reportId);

    const reportTypeLabel = reportTypeLabels[reportType as keyof typeof reportTypeLabels] || reportType;

    const emailHtml = `
      <h2>🚌 Novo Relatório de Erro - Horários de Ônibus</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📊 Detalhes do Relatório</h3>
        <p><strong>ID do Relatório:</strong> ${reportId}</p>
        <p><strong>Linha:</strong> ${lineName}</p>
        <p><strong>URL:</strong> <a href="${lineUrl}">${lineUrl}</a></p>
        <p><strong>Tipo de Problema:</strong> ${reportTypeLabel}</p>
      </div>

      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>💬 Mensagem do Usuário</h3>
        <p>${userMessage}</p>
        ${suggestedCorrection ? `
          <h4>🔧 Correção Sugerida</h4>
          <p>${suggestedCorrection}</p>
        ` : ''}
      </div>

      ${userEmail || userContact ? `
        <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>📞 Contato do Usuário</h3>
          ${userEmail ? `<p><strong>Email:</strong> ${userEmail}</p>` : ''}
          ${userContact ? `<p><strong>Contato:</strong> ${userContact}</p>` : ''}
        </div>
      ` : ''}

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>⏰ Reportado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p>Acesse o painel administrativo para responder a este relatório.</p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Horários de Ônibus <onboarding@resend.dev>",
      to: ["admin@horariosdeonibu.com"], // Configure o email do admin
      subject: `🚌 Novo Relatório: ${reportTypeLabel} - ${lineName}`,
      html: emailHtml,
    });

    console.log("Report notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-report-notification function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);