import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AdminStats } from "./AdminStats";
import { ClientManagement } from "./ClientManagement";
import { OrderManagement } from "./OrderManagement";
import { BillingManagement } from "./BillingManagement";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const activeCompany = useQuery(api.companies.getActiveCompany);

  if (!activeCompany) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "orders", label: "Chamados", icon: "📋" },
    { id: "clients", label: "Clientes", icon: "👥" },
    { id: "billing", label: "Cobrança", icon: "💰" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Painel Administrativo - {activeCompany.name}
        </h1>
        <p className="text-gray-600">
          Gerencie todos os aspectos do seu negócio
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "dashboard" && <AdminStats companyId={activeCompany._id} />}
        {activeTab === "orders" && <OrderManagement companyId={activeCompany._id} />}
        {activeTab === "clients" && <ClientManagement companyId={activeCompany._id} />}
        {activeTab === "billing" && <BillingManagement companyId={activeCompany._id} />}
      </div>
    </div>
  );
}
