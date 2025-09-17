interface ExtractedSchedule {
  tipo: string;
  horarios: string[];
}

interface ExtractedBusData {
  url: string;
  linha: string;
  schedules: ExtractedSchedule[];
}

export class BusDataExtractor {
  
  static async fetchBusData(url: string): Promise<ExtractedBusData | null> {
    try {
      const response = await fetch(`/api/fetch-bus-data?url=${encodeURIComponent(url)}`);
      if (!response.ok) return null;
      
      const html = await response.text();
      return this.extractScheduleData(html, url);
    } catch (error) {
      console.error('Error fetching bus data:', error);
      return null;
    }
  }

  static extractScheduleData(content: string, url: string): ExtractedBusData | null {
    try {
      // Extract line title
      const titleMatch = content.match(/<h1[^>]*>(.*?)<\/\h1>/i) || 
                        content.match(/# (.*?) –/);
      const linha = titleMatch ? titleMatch[1].trim() : '';

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

      // Split content into sections and extract schedules
      const lines = content.split('\n');
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
          const timeMatch = line.match(/^(\d{1,2}:\d{2})/);
          if (timeMatch) {
            const time = timeMatch[1];
            if (!currentHorarios.includes(time)) {
              currentHorarios.push(time);
            }
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

      return {
        url,
        linha,
        schedules: schedules.filter(s => s.horarios.length > 0)
      };

    } catch (error) {
      console.error('Error extracting schedule data:', error);
      return null;
    }
  }

  static async updateBusLineData(busLines: any[]): Promise<any[]> {
    const updatedLines = [];
    
    for (const line of busLines.slice(0, 5)) { // Limit to first 5 for testing
      console.log(`Processing line: ${line.linha}`);
      
      try {
        // Use fetch website tool approach (simplified for this context)
        const extractedData = await this.extractFromUrl(line.url);
        
        if (extractedData && extractedData.schedules.length > 0) {
          updatedLines.push({
            ...line,
            schedulesDetailed: extractedData.schedules,
            lastUpdated: new Date().toISOString()
          });
        } else {
          // Keep original data if extraction fails
          updatedLines.push(line);
        }
      } catch (error) {
        console.error(`Error processing ${line.url}:`, error);
        updatedLines.push(line);
      }
    }
    
    return updatedLines;
  }

  private static async extractFromUrl(url: string): Promise<ExtractedBusData | null> {
    // This would need to be implemented with actual fetch capability
    // For now, return mock data structure
    return null;
  }

  static getScheduleTypeLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'dias_uteis': '📅 Dias Úteis (Seg-Sex)',
      'dias_uteis_atipico': '📅 Dias Úteis (Atípico)',
      'dias_uteis_ferias': '🏖️ Dias Úteis (Férias)',
      'sabado': '📅 Sábado',
      'sabado_ferias': '🏖️ Sábado (Férias)',
      'domingo_feriado': '🎉 Domingo e Feriados',
      'quarta_cinzas': '🎭 Quarta de Cinzas'
    };
    return labels[tipo] || tipo;
  }

  static getCurrentScheduleType(): string {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Simple logic - can be enhanced with holiday detection
    if (dayOfWeek === 0) return 'domingo_feriado'; // Sunday
    if (dayOfWeek === 6) return 'sabado'; // Saturday
    return 'dias_uteis'; // Monday-Friday
  }

  static getRelevantSchedule(schedules: ExtractedSchedule[]): ExtractedSchedule | null {
    const currentType = this.getCurrentScheduleType();
    
    // Try to find exact match
    let schedule = schedules.find(s => s.tipo === currentType);
    
    // Fallback logic
    if (!schedule) {
      if (currentType === 'dias_uteis') {
        schedule = schedules.find(s => s.tipo.startsWith('dias_uteis'));
      } else if (currentType === 'sabado') {
        schedule = schedules.find(s => s.tipo.startsWith('sabado'));
      }
    }
    
    // Final fallback to first schedule
    return schedule || schedules[0] || null;
  }
}
