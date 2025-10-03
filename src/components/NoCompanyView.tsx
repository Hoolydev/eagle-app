import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function NoCompanyView() {
  const companies = useQuery(api.companies.getUserCompanies) || [];
  const setupDemo = useMutation(api.demo.setupDemoData);
  const createAdmin = useMutation(api.demo.createAdminUser);

  const handleSetupDemo = async () => {
    try {
      await setupDemo({});
      toast.success("Dados de demonstração criados com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar dados de demonstração");
    }
  };

  const handleCreateAdmin = async () => {
    try {
      await createAdmin({});
      toast.success("Usuário administrador criado com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar usuário administrador");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {companies.length === 0 ? "Bem-vindo ao Eagle Vistoria!" : "Selecione uma empresa"}
        </h2>
        
        {companies.length === 0 ? (
          <div className="space-y-4">
            <p className="text-gray-600 mb-6">
              Para começar, você pode criar dados de demonstração ou configurar sua própria empresa.
            </p>
            
            <button
              onClick={handleCreateAdmin}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium mb-3"
            >
              👤 Criar Usuário Administrador
            </button>
            
            <button
              onClick={handleSetupDemo}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🚀 Criar Dados de Demonstração
            </button>
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>O usuário administrador permite acesso completo ao sistema.</p>
              <p>Os dados de demonstração criam uma empresa de exemplo com algumas ordens de serviço.</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">
            Escolha uma empresa no seletor acima para continuar
          </p>
        )}
      </div>
    </div>
  );
}
