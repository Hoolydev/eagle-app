import { useState } from "react";

interface FilterControlsProps {
  onFilterChange: (filters: {
    priority?: string;
    search?: string;
    showOverdue?: boolean;
  }) => void;
}

export function FilterControls({ onFilterChange }: FilterControlsProps) {
  const [priority, setPriority] = useState("");
  const [search, setSearch] = useState("");
  const [showOverdue, setShowOverdue] = useState(false);

  const handleFilterChange = () => {
    onFilterChange({
      priority: priority || undefined,
      search: search || undefined,
      showOverdue,
    });
  };

  const clearFilters = () => {
    setPriority("");
    setSearch("");
    setShowOverdue(false);
    onFilterChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Buscar por cliente, endereço ou número da OS..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setTimeout(handleFilterChange, 300); // Debounce
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            handleFilterChange();
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as prioridades</option>
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOverdue}
            onChange={(e) => {
              setShowOverdue(e.target.checked);
              handleFilterChange();
            }}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Apenas vencidas</span>
        </label>

        <button
          onClick={clearFilters}
          className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
}
