import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function CompanySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const companies = useQuery(api.companies.getUserCompanies) || [];
  const activeCompany = useQuery(api.companies.getActiveCompany);
  const setActiveCompany = useMutation(api.companies.setActiveCompany);

  const handleCompanySelect = async (companyId: any) => {
    try {
      await setActiveCompany({ companyId });
      setIsOpen(false);
      toast.success("Empresa selecionada com sucesso");
    } catch (error) {
      toast.error("Erro ao selecionar empresa");
    }
  };

  if (companies.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        Nenhuma empresa encontrada
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <div className="font-medium text-sm">
            {activeCompany?.name || "Selecionar empresa"}
          </div>
          {activeCompany && (
            <div className="text-xs text-gray-500 capitalize">
              {activeCompany.role}
            </div>
          )}
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {companies.map((company) => company && (
              <button
                key={company._id}
                onClick={() => handleCompanySelect(company._id)}
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors ${
                  activeCompany?._id === company._id ? "bg-blue-50 text-blue-600" : ""
                }`}
              >
                <div className="font-medium">{company.name}</div>
                <div className="text-sm text-gray-500 capitalize">
                  {company.role}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
