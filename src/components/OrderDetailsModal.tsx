import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";

interface OrderDetailsModalProps {
  orderId: string;
  onClose: () => void;
}

export function OrderDetailsModal({ orderId, onClose }: OrderDetailsModalProps) {
  const [notes, setNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  
  const order = useQuery(api.serviceOrders.getOrderDetails, { orderId: orderId as any });
  const activeCompany = useQuery(api.companies.getActiveCompany);
  const updateOrderStatus = useMutation(api.serviceOrders.updateOrderStatus);
  // Partner assignment functionality will be added later

  if (!order || !activeCompany) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    
    try {
      await updateOrderStatus({
        orderId: orderId as any,
        status: newStatus as any,
        notes: notes || undefined,
      });
      toast.success("Status atualizado com sucesso");
      onClose();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  // Partner assignment functionality will be added later

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("pt-BR");
  };

  const statusConfig = {
    aberta: { title: "Aberta", color: "bg-gray-100 text-gray-700" },
    despachada: { title: "Despachada", color: "bg-blue-100 text-blue-700" },
    aceita: { title: "Aceita", color: "bg-yellow-100 text-yellow-700" },
    em_execucao: { title: "Em Execução", color: "bg-orange-100 text-orange-700" },
    aguardando_validacao: { title: "Aguardando Validação", color: "bg-purple-100 text-purple-700" },
    aprovada: { title: "Aprovada", color: "bg-green-100 text-green-700" },
    reprovada: { title: "Reprovada", color: "bg-red-100 text-red-700" },
    finalizada: { title: "Finalizada", color: "bg-emerald-100 text-emerald-700" },
    cancelada: { title: "Cancelada", color: "bg-slate-100 text-slate-700" },
  };

  const priorityColors = {
    baixa: "text-green-600",
    media: "text-yellow-600",
    alta: "text-orange-600",
    urgente: "text-red-600",
  };

  const canManageOrder = ["admin", "gestor", "atendente"].includes(activeCompany.role);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Detalhes da OS - {order.orderNumber}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Status and Priority */}
            <div className="flex gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[order.status as keyof typeof statusConfig]?.color}`}>
                {statusConfig[order.status as keyof typeof statusConfig]?.title}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gray-100 ${priorityColors[order.priority as keyof typeof priorityColors]}`}>
                Prioridade: {order.priority}
              </span>
              {order.isOverdue && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                  ⚠️ Vencida
                </span>
              )}
            </div>

            {/* Client Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Informações do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome</label>
                  <p className="text-gray-900">{order.clientName}</p>
                </div>
                {order.clientPhone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Telefone</label>
                    <p className="text-gray-900">{order.clientPhone}</p>
                  </div>
                )}
                {order.clientEmail && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{order.clientEmail}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Endereço</label>
                  <p className="text-gray-900">{order.address}</p>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Informações do Serviço</h3>
              <div>
                <label className="text-sm font-medium text-gray-600">Descrição</label>
                <p className="text-gray-900 mt-1">{order.description}</p>
              </div>
            </div>

            {/* Timeline Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Criado em</label>
                  <p className="text-gray-900">{formatDate(order._creationTime)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">SLA</label>
                  <p className={`${order.isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatDate(order.slaDeadline)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Cliente</label>
                  <p className="text-gray-900">{order.clientName}</p>
                </div>
                {order.partner && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Parceiro</label>
                    <p className="text-gray-900">{order.partner}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Partner assignment functionality will be added later */}

            {/* Status Update */}
            {canManageOrder && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Atualizar Status</h3>
                <div className="space-y-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Selecionar novo status</option>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.title}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observações (opcional)"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                  <button
                    onClick={handleStatusUpdate}
                    disabled={!newStatus}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Atualizar Status
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
