import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { useState } from "react";

const statusConfig = {
  aberta: { title: "Abertas", color: "bg-gray-100 border-gray-300", textColor: "text-gray-700" },
  despachada: { title: "Despachadas", color: "bg-blue-100 border-blue-300", textColor: "text-blue-700" },
  aceita: { title: "Aceitas", color: "bg-yellow-100 border-yellow-300", textColor: "text-yellow-700" },
  em_execucao: { title: "Em Execução", color: "bg-orange-100 border-orange-300", textColor: "text-orange-700" },
  aguardando_validacao: { title: "Aguardando Validação", color: "bg-purple-100 border-purple-300", textColor: "text-purple-700" },
  aprovada: { title: "Aprovadas", color: "bg-green-100 border-green-300", textColor: "text-green-700" },
  reprovada: { title: "Reprovadas", color: "bg-red-100 border-red-300", textColor: "text-red-700" },
  finalizada: { title: "Finalizadas", color: "bg-emerald-100 border-emerald-300", textColor: "text-emerald-700" },
  cancelada: { title: "Canceladas", color: "bg-slate-100 border-slate-300", textColor: "text-slate-700" },
};

const priorityColors = {
  baixa: "border-l-green-400",
  media: "border-l-yellow-400",
  alta: "border-l-orange-400",
  urgente: "border-l-red-400",
};

interface KanbanBoardProps {
  ordersByStatus: any;
  userRole: string;
}

export function KanbanBoard({ ordersByStatus, userRole }: KanbanBoardProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const updateOrderStatus = useMutation(api.serviceOrders.updateOrderStatus);

  const handleStatusChange = async (orderId: any, newStatus: any) => {
    try {
      await updateOrderStatus({ orderId, status: newStatus });
      toast.success("Status atualizado com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canChangeStatus = (currentStatus: string, userRole: string) => {
    const rolePermissions: Record<string, boolean> = {
      gestor: true,
      atendente: ["aberta", "despachada", "cancelada"].includes(currentStatus),
      qualidade: ["aguardando_validacao"].includes(currentStatus),
      parceiro: ["despachada", "aceita", "em_execucao"].includes(currentStatus),
    };
    return rolePermissions[userRole] || false;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 h-[calc(100vh-200px)] overflow-auto">
      {Object.entries(statusConfig).map(([status, config]) => {
        const orders = ordersByStatus[status] || [];
        
        return (
          <div key={status} className="flex flex-col">
            <div className={`${config.color} ${config.textColor} p-3 rounded-t-lg border-2 border-b-0`}>
              <h3 className="font-semibold text-sm">
                {config.title} ({orders.length})
              </h3>
            </div>
            
            <div className={`${config.color} border-2 border-t-0 rounded-b-lg flex-1 p-2 space-y-2 overflow-y-auto`}>
              {orders.map((order: any) => (
                <div
                  key={order._id}
                  className={`bg-white p-3 rounded-lg shadow-sm border-l-4 ${priorityColors[order.priority as keyof typeof priorityColors]} hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => setSelectedOrderId(order._id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm text-gray-900">
                      {order.orderNumber}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.isOverdue ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {order.priority}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2 font-medium">
                    {order.clientName}
                  </p>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {order.address}
                  </p>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>SLA: {formatDate(order.slaDeadline)}</div>
                    {order.partner && (
                      <div>Parceiro: {order.partner}</div>
                    )}
                    <div>Criado por: {order.creator}</div>
                  </div>

                  {canChangeStatus(status, userRole) && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="w-full text-xs p-1 border border-gray-300 rounded"
                      >
                        {Object.entries(statusConfig).map(([statusKey, statusConfig]) => (
                          <option key={statusKey} value={statusKey}>
                            {statusConfig.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {order.isOverdue && (
                    <div className="mt-2 text-xs text-red-600 font-medium">
                      ⚠️ Vencida
                    </div>
                  )}
                </div>
              ))}
              
              {orders.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">
                  Nenhuma OS neste status
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}
