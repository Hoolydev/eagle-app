interface StatsCardsProps {
  ordersByStatus: Record<string, any[]>;
}

export function StatsCards({ ordersByStatus }: StatsCardsProps) {
  const totalOrders = Object.values(ordersByStatus).flat().length;
  const openOrders = ordersByStatus.aberta?.length || 0;
  const inProgressOrders = (ordersByStatus.aceita?.length || 0) + (ordersByStatus.em_execucao?.length || 0);
  const completedOrders = ordersByStatus.finalizada?.length || 0;
  const overdueOrders = Object.values(ordersByStatus)
    .flat()
    .filter((order: any) => order.isOverdue).length;

  const stats = [
    {
      title: "Total de OS",
      value: totalOrders,
      icon: "📋",
      color: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Abertas",
      value: openOrders,
      icon: "🆕",
      color: "bg-gray-50 text-gray-600",
      borderColor: "border-gray-200",
    },
    {
      title: "Em Andamento",
      value: inProgressOrders,
      icon: "⚡",
      color: "bg-orange-50 text-orange-600",
      borderColor: "border-orange-200",
    },
    {
      title: "Finalizadas",
      value: completedOrders,
      icon: "✅",
      color: "bg-green-50 text-green-600",
      borderColor: "border-green-200",
    },
    {
      title: "Vencidas",
      value: overdueOrders,
      icon: "⚠️",
      color: "bg-red-50 text-red-600",
      borderColor: "border-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className={`${stat.color} ${stat.borderColor} p-4 rounded-lg border-2`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-75">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div className="text-2xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
