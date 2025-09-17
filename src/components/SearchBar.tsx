import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ searchTerm, onSearchChange, placeholder }: SearchBarProps) => {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="text"
        placeholder={placeholder || "Buscar linha ou destino..."}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 pr-10 h-12 bg-white/95 backdrop-blur-sm border-white/20 placeholder:text-muted-foreground/70 focus:bg-white transition-smooth"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange("")}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};