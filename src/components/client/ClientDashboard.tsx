import { useState } from "react";
import { ClientStats } from "./ClientStats";
import { RequestInspection } from "./RequestInspection";
import { RequestReport } from "./RequestReport";
import { SOSServices } from "./SOSServices";
import { RemoteInspection } from "./RemoteInspection";

export function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "inspection", label: "Solicitar Vistoria", icon: "🔍" },
    { id: "report", label: "Solicitar Laudo", icon: "📄" },
    { id: "remote", label: "Vistoria Remota", icon: "📱" },
    { id: "sos", label: "Serviços SOS", icon: "🚨" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Painel do Cliente
        </h1>
        <p className="text-gray-600">
          Solicite serviços e acompanhe seus chamados
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
        {activeTab === "dashboard" && <ClientStats />}
        {activeTab === "inspection" && <RequestInspection />}
        {activeTab === "report" && <RequestReport />}
        {activeTab === "remote" && <RemoteInspection />}
        {activeTab === "sos" && <SOSServices />}
      </div>
    </div>
  );
}
