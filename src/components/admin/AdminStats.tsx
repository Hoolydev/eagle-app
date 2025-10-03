import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface AdminStatsProps {
  companyId: string;
}

export function AdminStats({ companyId }: AdminStatsProps) {
  const stats = useQuery(api.serviceOrders.getDashboardStats, { companyId: companyId as any });

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total de Chamados",
      value: stats.totalOrders,
      icon: "📋",
      color: "bg-blue-500",
    },
    {
      title: "Clientes Ativos",
      value: stats.totalClients,
      icon: "👥",
      color: "bg-green-500",
    },
    {
      title: "Chamados Este Mês",
      value: stats.ordersThisMonth,
      icon: "📈",
      color: "bg-purple-500",
    },
    {
      title: "Chamados Vencidos",
      value: stats.overdueOrders,
      icon: "⚠️",
      color: "bg-red-500",
    },
    {
      title: "Vistorias",
      value: stats.vistoriaOrders,
      icon: "🔍",
      color: "bg-indigo-500",
    },
    {
      title: "Laudos",
      value: stats.laudoOrders,
      icon: "📄",
      color: "bg-yellow-500",
    },
    {
      title: "Serviços SOS",
      value: stats.sosOrders,
      icon: "🚨",
      color: "bg-orange-500",
    },
    {
      title: "Cobrança Pendente",
      value: `R$ ${stats.pendingBilling.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: "💰",
      color: "bg-teal-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas Gerais</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {stats.overdueOrders > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Atenção: Chamados Vencidos
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Você tem {stats.overdueOrders} chamado(s) que ultrapassaram o prazo de SLA.
                  Verifique a aba de Chamados para tomar as ações necessárias.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {stats.overdueBilling > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">💰</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Cobrança em Atraso
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Há R$ {stats.overdueBilling.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em cobranças vencidas.
                  Verifique a aba de Cobrança para regularizar.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
