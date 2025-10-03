import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

export function RequestInspection() {
  const [formData, setFormData] = useState({
    // Dados da Vistoria
    description: "",
    
    // Dados do Veículo
    vehicleModel: "",
    vehiclePlate: "",
    vehicleYear: "",
    
    // Dados do Proprietário
    ownerName: "",
    ownerCpfCnpj: "",
    contactPhone: "",
    
    // Localização
    address: "",
    googleMapsLink: "",
    
    // Data Preferencial
    preferredDate: "",
  });

  const createServiceOrder = useMutation(api.serviceOrders.createServiceOrder);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!formData.vehicleModel || !formData.vehiclePlate || !formData.ownerName || 
        !formData.ownerCpfCnpj || !formData.contactPhone || !formData.address) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createServiceOrder({
        serviceType: "vistoria",
        description: formData.description || "Solicitação de vistoria veicular",
        address: formData.address,
        vehicleInfo: {
          brand: "", // Será extraído do modelo
          model: formData.vehicleModel,
          year: formData.vehicleYear,
          plate: formData.vehiclePlate,
          color: "", // Opcional
        },
        emergencyContact: formData.contactPhone,
      });
      
      toast.success("Solicitação de vistoria enviada com sucesso");
      
      // Reset do formulário
      setFormData({
        description: "",
        vehicleModel: "",
        vehiclePlate: "",
        vehicleYear: "",
        ownerName: "",
        ownerCpfCnpj: "",
        contactPhone: "",
        address: "",
        googleMapsLink: "",
        preferredDate: "",
      });
    } catch (error) {
      toast.error("Erro ao enviar solicitação");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            🔍 Solicitação de Vistoria
          </h2>
          <p className="text-gray-600">
            Preencha os dados abaixo para solicitar uma nova vistoria veicular
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dados da Vistoria */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              📋 Dados da Vistoria
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Informe os dados necessários para solicitar uma nova vistoria veicular
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo do Veículo *
                </label>
                <input
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Honda Civic, Toyota Corolla"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placa do Veículo *
                </label>
                <input
                  type="text"
                  value={formData.vehiclePlate}
                  onChange={(e) => handleInputChange('vehiclePlate', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: ABC-1234"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ano do Veículo
                </label>
                <input
                  type="text"
                  value={formData.vehicleYear}
                  onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 2020"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Preferencial
                </label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Proprietário *
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome completo do proprietário"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF/CNPJ do Proprietário *
                </label>
                <input
                  type="text"
                  value={formData.ownerCpfCnpj}
                  onChange={(e) => handleInputChange('ownerCpfCnpj', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000.000.000-00 ou 00.000.000/0001-00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone de Contato *
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço da Vistoria *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Endereço completo onde será realizada a vistoria"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link do Google Maps (Localização)
                </label>
                <input
                  type="url"
                  value={formData.googleMapsLink}
                  onChange={(e) => handleInputChange('googleMapsLink', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Cole aqui o link do Google Maps com a localização do segurado"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Para obter o link: abra o Google Maps, encontre o local, clique em "Compartilhar" e copie o link
                </p>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Informações adicionais sobre a vistoria (opcional)"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enviar Solicitação
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  description: "",
                  vehicleModel: "",
                  vehiclePlate: "",
                  vehicleYear: "",
                  ownerName: "",
                  ownerCpfCnpj: "",
                  contactPhone: "",
                  address: "",
                  googleMapsLink: "",
                  preferredDate: "",
                });
              }}
              className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
