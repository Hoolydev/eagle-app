import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { KanbanBoard } from "../KanbanBoard";

interface OrderManagementProps {
  companyId: string;
}

export function OrderManagement({ companyId }: OrderManagementProps) {
  const ordersByStatus = useQuery(api.serviceOrders.getOrdersByStatus, { companyId: companyId as any });
  const activeCompany = useQuery(api.companies.getActiveCompany);

  if (!ordersByStatus || !activeCompany) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestão de Chamados</h2>
        <p className="text-gray-600 mb-6">
          Visualize e gerencie todos os chamados de serviço
        </p>
      </div>

      <KanbanBoard ordersByStatus={ordersByStatus} userRole={activeCompany.role} />
    </div>
  );
}
