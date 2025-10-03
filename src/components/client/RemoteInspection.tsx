import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

export function RemoteInspection() {
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [inspectionLink, setInspectionLink] = useState<string | null>(null);

  const generateInspectionLink = () => {
    setIsGeneratingLink(true);
    
    // Gerar um ID único para a vistoria
    const inspectionId = `vistoria_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // URL da aplicação mobile usando a nova estrutura de roteamento
    const mobileAppUrl = `${window.location.origin}/vistoria-mobile/${inspectionId}`;
    
    setTimeout(() => {
      setInspectionLink(mobileAppUrl);
      setIsGeneratingLink(false);
      toast.success("Link de vistoria remota gerado com sucesso!");
    }, 1000);
  };

  const copyToClipboard = async () => {
    if (inspectionLink) {
      try {
        await navigator.clipboard.writeText(inspectionLink);
        toast.success("Link copiado para a área de transferência!");
      } catch (error) {
        toast.error("Erro ao copiar link");
      }
    }
  };

  const shareLink = () => {
    if (inspectionLink && navigator.share) {
      navigator.share({
        title: 'Vistoria Remota - Eagle Vistorias',
        text: 'Acesse este link para realizar sua vistoria remota',
        url: inspectionLink,
      }).catch(() => {
        // Fallback para copiar se o compartilhamento falhar
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            📱 Vistoria Remota
          </h2>
          <p className="text-gray-600">
            Gere um link para que o segurado possa realizar a vistoria remotamente através do celular
          </p>
        </div>

        {/* Informações sobre a vistoria remota */}
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            📋 Como funciona a Vistoria Remota
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">📸 Itens Obrigatórios:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Vídeo 360° com data, hora e nome</li>
                <li>• Foto do painel</li>
                <li>• Foto do estepe</li>
                <li>• Foto do macaco de roda</li>
                <li>• Foto da chave de roda</li>
                <li>• Foto do documento do veículo</li>
                <li>• Foto da CNH do associado</li>
                <li>• Foto da placa com pessoa</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">🚗 Fotos Externas:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Foto frontal</li>
                <li>• Foto lateral direita</li>
                <li>• Foto frente/lateral direita</li>
                <li>• Foto lateral esquerda</li>
                <li>• Foto frente/lateral esquerda</li>
                <li>• Foto traseira</li>
                <li>• Foto traseira/lateral direita</li>
                <li>• Foto traseira/lateral esquerda</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-100 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Importante:</strong> Todas as fotos são capturadas diretamente pela câmera do celular. 
              Não é possível enviar fotos da galeria para garantir a autenticidade da vistoria.
            </p>
          </div>
        </div>

        {/* Geração do link */}
        <div className="space-y-6">
          {!inspectionLink ? (
            <div className="text-center">
              <button
                onClick={generateInspectionLink}
                disabled={isGeneratingLink}
                className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingLink ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Gerando Link...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🔗</span>
                    Gerar Link de Vistoria Remota
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Clique para gerar um link único para a vistoria remota
              </p>
            </div>
          ) : (
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-4">
                ✅ Link Gerado com Sucesso!
              </h3>
              
              <div className="bg-white p-4 rounded-md border border-green-200 mb-4">
                <p className="text-sm text-gray-600 mb-2">Link da Vistoria Remota:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inspectionLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                  >
                    📋 Copiar
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={shareLink}
                  className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  📤 Compartilhar Link
                </button>
                <button
                  onClick={() => window.open(inspectionLink, '_blank')}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  👁️ Visualizar
                </button>
                <button
                  onClick={() => {
                    setInspectionLink(null);
                    toast.info("Você pode gerar um novo link quando necessário");
                  }}
                  className="px-4 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
                >
                  🔄 Novo Link
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-blue-100 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>💡 Dica:</strong> Envie este link para o segurado via WhatsApp, SMS ou email. 
                  O link funcionará em qualquer celular com câmera e acesso à internet.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Instruções para o segurado */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📝 Instruções para o Segurado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">1️⃣ Preparação:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Tenha em mãos: CNH e documento do veículo</li>
                <li>• Certifique-se de ter boa iluminação</li>
                <li>• Verifique se a bateria do celular está carregada</li>
                <li>• Tenha acesso ao estepe, macaco e chave de roda</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">2️⃣ Durante a Vistoria:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Siga as instruções na tela do celular</li>
                <li>• Tire as fotos com boa qualidade</li>
                <li>• Certifique-se de que todos os itens estão visíveis</li>
                <li>• A localização será capturada automaticamente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}