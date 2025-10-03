import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

export function SOSServices() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    address: "",
    coordinates: { lat: 0, lng: 0 },
    hasCoordinates: false,
    vehicleInfo: {
      brand: "",
      model: "",
      year: "",
      plate: "",
      color: "",
    },
    emergencyContact: "",
  });

  const createServiceOrder = useMutation(api.serviceOrders.createServiceOrder);

  const sosServices = [
    {
      id: "sos_pneu",
      title: "SOS Pneu",
      icon: "🛞",
      description: "Troca de pneu furado ou danificado",
      color: "bg-red-500",
    },
    {
      id: "sos_combustivel",
      title: "SOS Combustível",
      icon: "⛽",
      description: "Abastecimento de emergência",
      color: "bg-orange-500",
    },
    {
      id: "sos_bateria",
      title: "SOS Bateria",
      icon: "🔋",
      description: "Chupeta ou troca de bateria",
      color: "bg-yellow-500",
    },
    {
      id: "sos_reboque",
      title: "SOS Reboque",
      icon: "🚛",
      description: "Reboque para oficina ou destino",
      color: "bg-blue-500",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !formData.description || !formData.address) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createServiceOrder({
        serviceType: selectedService as any,
        description: formData.description,
        address: formData.address,
        coordinates: formData.hasCoordinates ? formData.coordinates : undefined,
        priority: "urgente",
        vehicleInfo: formData.vehicleInfo.brand ? formData.vehicleInfo : undefined,
        emergencyContact: formData.emergencyContact || undefined,
      });
      toast.success("Solicitação SOS enviada com sucesso");
      setSelectedService(null);
      setFormData({
        description: "",
        address: "",
        coordinates: { lat: 0, lng: 0 },
        hasCoordinates: false,
        vehicleInfo: {
          brand: "",
          model: "",
          year: "",
          plate: "",
          color: "",
        },
        emergencyContact: "",
      });
    } catch (error) {
      toast.error("Erro ao enviar solicitação");
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            hasCoordinates: true,
          });
          toast.success("Localização obtida com sucesso");
        },
        (error) => {
          toast.error("Erro ao obter localização");
        }
      );
    } else {
      toast.error("Geolocalização não suportada pelo navegador");
    }
  };

  if (!selectedService) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            🚨 Serviços SOS
          </h2>
          <p className="text-gray-600">
            Selecione o tipo de emergência que você precisa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sosServices.map((service) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service.id)}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-red-200"
            >
              <div className="flex items-center mb-4">
                <div className={`${service.color} rounded-lg p-3 mr-4`}>
                  <span className="text-3xl">{service.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  ⚡ Atendimento de emergência - 2 horas
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">🚨</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Emergência Real?
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Se você está em uma situação de perigo real, ligue imediatamente para:
                </p>
                <p className="font-bold mt-1">
                  🚓 Polícia: 190 | 🚑 SAMU: 192 | 🚒 Bombeiros: 193
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentService = sosServices.find(s => s.id === selectedService)!;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => setSelectedService(null)}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center">
              <div className={`${currentService.color} rounded-lg p-2 mr-3`}>
                <span className="text-2xl">{currentService.icon}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {currentService.title}
                </h2>
                <p className="text-gray-600">{currentService.description}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição da Emergência *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Descreva detalhadamente o problema..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Localização Atual *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Endereço ou ponto de referência onde você está..."
              required
            />
            <div className="mt-2">
              <button
                type="button"
                onClick={handleGetLocation}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                📍 Obter Localização GPS
              </button>
              {formData.hasCoordinates && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Localização GPS obtida
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              🚗 Informações do Veículo (Opcional)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Marca</label>
                <input
                  type="text"
                  value={formData.vehicleInfo.brand}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicleInfo: { ...formData.vehicleInfo, brand: e.target.value }
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Ex: Toyota"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Modelo</label>
                <input
                  type="text"
                  value={formData.vehicleInfo.model}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicleInfo: { ...formData.vehicleInfo, model: e.target.value }
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Ex: Corolla"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Placa</label>
                <input
                  type="text"
                  value={formData.vehicleInfo.plate}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicleInfo: { ...formData.vehicleInfo, plate: e.target.value }
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="ABC-1234"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cor</label>
                <input
                  type="text"
                  value={formData.vehicleInfo.color}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicleInfo: { ...formData.vehicleInfo, color: e.target.value }
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Ex: Branco"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contato de Emergência (Opcional)
            </label>
            <input
              type="tel"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Telefone de alguém para contato"
            />
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              ⚡ Atendimento de Emergência
            </h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Tempo de resposta: até 2 horas</li>
              <li>• Atendimento 24 horas por dia</li>
              <li>• Você receberá atualizações por SMS</li>
              <li>• Mantenha o telefone ligado</li>
            </ul>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            🚨 Solicitar Atendimento de Emergência
          </button>
        </form>
      </div>
    </div>
  );
}
