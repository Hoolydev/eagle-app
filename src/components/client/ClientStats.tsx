import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function ClientStats() {
  const recentOrders = useQuery(api.serviceOrders.getClientOrders, { limit: 10 });

  if (!recentOrders) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

  const serviceTypeConfig = {
    vistoria: { title: "Vistoria", icon: "🔍" },
    laudo: { title: "Laudo", icon: "📄" },
    sos_pneu: { title: "SOS Pneu", icon: "🛞" },
    sos_combustivel: { title: "SOS Combustível", icon: "⛽" },
    sos_bateria: { title: "SOS Bateria", icon: "🔋" },
    sos_reboque: { title: "SOS Reboque", icon: "🚛" },
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimos Serviços</h2>
        
        {recentOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum serviço encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Você ainda não possui nenhum chamado de serviço.
            </p>
            <p className="text-sm text-gray-500">
              Use as abas acima para solicitar vistorias, laudos ou serviços SOS.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo de Serviço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Endereço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SLA
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2">
                            {serviceTypeConfig[order.serviceType as keyof typeof serviceTypeConfig]?.icon}
                          </span>
                          <span className="text-sm text-gray-900">
                            {serviceTypeConfig[order.serviceType as keyof typeof serviceTypeConfig]?.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          statusConfig[order.status as keyof typeof statusConfig]?.color
                        }`}>
                          {statusConfig[order.status as keyof typeof statusConfig]?.title}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {order.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order._creationTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${
                          order.isOverdue ? "text-red-600 font-medium" : "text-gray-900"
                        }`}>
                          {formatDate(order.slaDeadline)}
                          {order.isOverdue && " ⚠️"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
