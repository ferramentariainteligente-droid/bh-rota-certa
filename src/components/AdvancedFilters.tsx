import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  activeFilters: FilterState;
}

export interface FilterState {
  timeRange: {
    start: number;
    end: number;
  };
  hasSchedules: boolean;
  sortBy: 'name' | 'updated' | 'schedule_count';
  sortOrder: 'asc' | 'desc';
  onlyFavorites: boolean;
  minRating: number;
}

export const AdvancedFilters = ({ onFiltersChange, activeFilters }: AdvancedFiltersProps) => {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(activeFilters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: FilterState = {
      timeRange: { start: 0, end: 24 },
      hasSchedules: false,
      sortBy: 'name',
      sortOrder: 'asc',
      onlyFavorites: false,
      minRating: 0,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    setOpen(false);
  };

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const hasActiveFilters = () => {
    return (
      activeFilters.timeRange.start !== 0 ||
      activeFilters.timeRange.end !== 24 ||
      activeFilters.hasSchedules ||
      activeFilters.sortBy !== 'name' ||
      activeFilters.sortOrder !== 'asc' ||
      activeFilters.onlyFavorites ||
      activeFilters.minRating > 0
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters() && (
            <div className="w-2 h-2 bg-primary rounded-full absolute -top-1 -right-1" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filtros Avançados</h4>
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Time Range */}
          <div className="space-y-2">
            <Label>Horário ({formatTime(localFilters.timeRange.start)} - {formatTime(localFilters.timeRange.end)})</Label>
            <Slider
              value={[localFilters.timeRange.start, localFilters.timeRange.end]}
              onValueChange={([start, end]) =>
                setLocalFilters(prev => ({
                  ...prev,
                  timeRange: { start, end }
                }))
              }
              max={24}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <Label>Ordenar por</Label>
            <div className="flex gap-2">
              <Select
                value={localFilters.sortBy}
                onValueChange={(value: 'name' | 'updated' | 'schedule_count') =>
                  setLocalFilters(prev => ({ ...prev, sortBy: value }))
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="updated">Atualização</SelectItem>
                  <SelectItem value="schedule_count">Qtd. Horários</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={localFilters.sortOrder}
                onValueChange={(value: 'asc' | 'desc') =>
                  setLocalFilters(prev => ({ ...prev, sortOrder: value }))
                }
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">↑</SelectItem>
                  <SelectItem value="desc">↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasSchedules"
                checked={localFilters.hasSchedules}
                onCheckedChange={(checked) =>
                  setLocalFilters(prev => ({ ...prev, hasSchedules: !!checked }))
                }
              />
              <Label htmlFor="hasSchedules">Apenas com horários</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="onlyFavorites"
                checked={localFilters.onlyFavorites}
                onCheckedChange={(checked) =>
                  setLocalFilters(prev => ({ ...prev, onlyFavorites: !!checked }))
                }
              />
              <Label htmlFor="onlyFavorites">Apenas favoritos</Label>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <Label>Avaliação mínima: {localFilters.minRating} {localFilters.minRating > 0 && '⭐'}</Label>
            <Slider
              value={[localFilters.minRating]}
              onValueChange={([value]) =>
                setLocalFilters(prev => ({ ...prev, minRating: value }))
              }
              max={5}
              min={0}
              step={0.5}
              className="w-full"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleApplyFilters} className="flex-1">
              Aplicar
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};