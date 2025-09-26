import { useState } from 'react';
import { Filter, X, Clock, MapPin, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterConfig) => void;
}

export interface FilterConfig {
  regions: string[];
  timeRanges: string[];
  lineTypes: string[];
  hasSchedules: boolean | null;
  sortBy: string;
}

const defaultFilters: FilterConfig = {
  regions: [],
  timeRanges: [],
  lineTypes: [],
  hasSchedules: null,
  sortBy: 'line_number'
};

export const AdvancedFilters = ({ onFiltersChange }: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterConfig>(defaultFilters);

  const regions = [
    { id: 'bh', name: 'Belo Horizonte', color: 'bg-blue-500' },
    { id: 'contagem', name: 'Contagem', color: 'bg-green-500' },
    { id: 'betim', name: 'Betim', color: 'bg-purple-500' },
    { id: 'nova_lima', name: 'Nova Lima', color: 'bg-yellow-500' },
    { id: 'ribeirao', name: 'Ribeirão das Neves', color: 'bg-red-500' },
    { id: 'sabara', name: 'Sabará', color: 'bg-pink-500' },
    { id: 'santa_luzia', name: 'Santa Luzia', color: 'bg-indigo-500' }
  ];

  const timeRanges = [
    { id: 'early', name: 'Madrugada (05:00-07:00)', icon: '🌙' },
    { id: 'morning', name: 'Manhã (07:00-12:00)', icon: '🌅' },
    { id: 'afternoon', name: 'Tarde (12:00-18:00)', icon: '☀️' },
    { id: 'evening', name: 'Noite (18:00-22:00)', icon: '🌆' },
    { id: 'late', name: 'Madrugada (22:00-05:00)', icon: '🌃' }
  ];

  const lineTypes = [
    { id: 'regular', name: 'Linhas Regulares', color: 'bg-blue-100 text-blue-800' },
    { id: 'express', name: 'Linhas Expressas', color: 'bg-red-100 text-red-800' },
    { id: 'feeder', name: 'Linhas Alimentadoras', color: 'bg-green-100 text-green-800' },
    { id: 'circular', name: 'Linhas Circulares', color: 'bg-purple-100 text-purple-800' }
  ];

  const updateFilters = (newFilters: Partial<FilterConfig>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = () => {
    return filters.regions.length > 0 || 
           filters.timeRanges.length > 0 || 
           filters.lineTypes.length > 0 || 
           filters.hasSchedules !== null ||
           filters.sortBy !== 'line_number';
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.regions.length > 0) count += filters.regions.length;
    if (filters.timeRanges.length > 0) count += filters.timeRanges.length;
    if (filters.lineTypes.length > 0) count += filters.lineTypes.length;
    if (filters.hasSchedules !== null) count += 1;
    if (filters.sortBy !== 'line_number') count += 1;
    return count;
  };

  const toggleArrayFilter = (filterKey: keyof FilterConfig, value: string) => {
    const currentArray = filters[filterKey] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilters({ [filterKey]: newArray });
  };

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filtros Avançados
        {hasActiveFilters() && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
          >
            {activeFilterCount()}
          </Badge>
        )}
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <Card className="absolute top-12 left-0 w-96 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros Avançados
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Clear Filters */}
            {hasActiveFilters() && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-auto p-0 text-red-600 hover:text-red-700"
                >
                  Limpar todos os filtros
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Sort Options */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Route className="w-4 h-4" />
                Ordenar por:
              </label>
              <Select 
                value={filters.sortBy} 
                onValueChange={(value) => updateFilters({ sortBy: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line_number">Número da Linha</SelectItem>
                  <SelectItem value="line_name">Nome da Linha</SelectItem>
                  <SelectItem value="recent">Mais Recentes</SelectItem>
                  <SelectItem value="popular">Mais Populares</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Schedule Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Disponibilidade de Horários:
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-schedules"
                    checked={filters.hasSchedules === true}
                    onCheckedChange={(checked) => 
                      updateFilters({ hasSchedules: checked ? true : null })
                    }
                  />
                  <label htmlFor="has-schedules" className="text-sm">
                    Somente com horários detalhados
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Region Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Regiões:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {regions.map((region) => (
                  <div key={region.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={region.id}
                      checked={filters.regions.includes(region.id)}
                      onCheckedChange={() => toggleArrayFilter('regions', region.id)}
                    />
                    <label htmlFor={region.id} className="text-sm flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${region.color}`} />
                      {region.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Time Range Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horários de Funcionamento:
              </label>
              <div className="space-y-2">
                {timeRanges.map((range) => (
                  <div key={range.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={range.id}
                      checked={filters.timeRanges.includes(range.id)}
                      onCheckedChange={() => toggleArrayFilter('timeRanges', range.id)}
                    />
                    <label htmlFor={range.id} className="text-sm">
                      {range.icon} {range.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Line Type Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Tipos de Linha:</label>
              <div className="space-y-2">
                {lineTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.id}
                      checked={filters.lineTypes.includes(type.id)}
                      onCheckedChange={() => toggleArrayFilter('lineTypes', type.id)}
                    />
                    <label htmlFor={type.id} className="text-sm">
                      <Badge variant="secondary" className={`text-xs ${type.color}`}>
                        {type.name}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};