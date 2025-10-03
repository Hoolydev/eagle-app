interface BillingManagementProps {
  companyId: string;
}

export function BillingManagement({ companyId }: BillingManagementProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestão de Cobrança</h2>
        <p className="text-gray-600 mb-6">
          Gerencie a cobrança e faturamento dos serviços
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-6xl mb-4">💰</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Módulo de Cobrança
        </h3>
        <p className="text-gray-600 mb-4">
          Este módulo está em desenvolvimento e será disponibilizado em breve.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            Funcionalidades planejadas:
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>• Geração automática de faturas</li>
            <li>• Controle de pagamentos</li>
            <li>• Relatórios financeiros</li>
            <li>• Integração com gateways de pagamento</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
