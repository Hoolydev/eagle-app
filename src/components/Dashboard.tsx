import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { KanbanBoard } from "./KanbanBoard";
// CreateOrderModal is deprecated - orders are created by clients
import { StatsCards } from "./StatsCards";
import { FilterControls } from "./FilterControls";
import { useState, useMemo } from "react";

export function Dashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<{
    priority?: string;
    search?: string;
    showOverdue?: boolean;
  }>({});
  const activeCompany = useQuery(api.companies.getActiveCompany);
  const allOrdersByStatus = useQuery(
    api.serviceOrders.getOrdersByStatus,
    activeCompany ? { companyId: activeCompany._id } : "skip"
  );

  // Apply filters to orders
  const ordersByStatus = useMemo(() => {
    if (!allOrdersByStatus) return null;
    const filtered: Record<string, any[]> = {};
    Object.entries(allOrdersByStatus).forEach(([status, orders]) => {
      filtered[status] = orders.filter((order: any) => {
        if (filters.priority && order.priority !== filters.priority) return false;
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const searchableText = [order.clientName, order.address, order.orderNumber].join(' ').toLowerCase();
          if (!searchableText.includes(searchTerm)) return false;
        }
        if (filters.showOverdue && !order.isOverdue) return false;
        return true;
      });
    });
    return filtered;
  }, [allOrdersByStatus, filters]);

  if (!activeCompany || !ordersByStatus) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const canCreateOrder = ["admin", "gestor", "atendente"].includes(activeCompany.role);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard - {activeCompany.name}
          </h1>
          <p className="text-gray-600 capitalize">
            Perfil: {activeCompany.role}
          </p>
        </div>
        
        {canCreateOrder && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova OS
          </button>
        )}
      </div>

      <StatsCards ordersByStatus={ordersByStatus || {}} />

      <FilterControls onFilterChange={setFilters} />

      <KanbanBoard ordersByStatus={ordersByStatus || {}} userRole={activeCompany.role} />

      {/* Order creation is now handled by clients through their dashboard */}
    </div>
  );
}
