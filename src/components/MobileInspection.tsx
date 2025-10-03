import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

interface CapturedItem {
  id: string;
  name: string;
  type: 'photo' | 'video';
  file?: File;
  preview?: string;
  required: boolean;
  category: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: string;
  address?: string;
}

export function MobileInspection() {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedItems, setCapturedItems] = useState<CapturedItem[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [damagePhotos, setDamagePhotos] = useState<File[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Itens obrigatórios da vistoria
  const requiredItems: Omit<CapturedItem, 'file' | 'preview'>[] = [
    // Vídeo e itens internos
    { id: 'video360', name: 'Vídeo 360° (com data, hora e nome)', type: 'video', required: true, category: 'Identificação' },
    { id: 'painel', name: 'Foto do Painel', type: 'photo', required: true, category: 'Interior' },
    { id: 'estepe', name: 'Foto do Estepe', type: 'photo', required: true, category: 'Equipamentos' },
    { id: 'macaco', name: 'Foto do Macaco de Roda', type: 'photo', required: true, category: 'Equipamentos' },
    { id: 'chave_roda', name: 'Foto da Chave de Roda', type: 'photo', required: true, category: 'Equipamentos' },
    
    // Documentos
    { id: 'documento_veiculo', name: 'Foto do Documento do Veículo', type: 'photo', required: true, category: 'Documentos' },
    { id: 'cnh', name: 'Foto da CNH do Associado', type: 'photo', required: true, category: 'Documentos' },
    { id: 'placa_pessoa', name: 'Foto da Placa com Pessoa', type: 'photo', required: true, category: 'Identificação' },
    
    // Fotos externas
    { id: 'frontal', name: 'Foto Frontal', type: 'photo', required: true, category: 'Exterior' },
    { id: 'lateral_direita', name: 'Foto Lateral Direita', type: 'photo', required: true, category: 'Exterior' },
    { id: 'frente_lateral_direita', name: 'Foto Frente/Lateral Direita', type: 'photo', required: true, category: 'Exterior' },
    { id: 'lateral_esquerda', name: 'Foto Lateral Esquerda', type: 'photo', required: true, category: 'Exterior' },
    { id: 'frente_lateral_esquerda', name: 'Foto Frente/Lateral Esquerda', type: 'photo', required: true, category: 'Exterior' },
    { id: 'traseira', name: 'Foto Traseira', type: 'photo', required: true, category: 'Exterior' },
    { id: 'traseira_lateral_direita', name: 'Foto Traseira/Lateral Direita', type: 'photo', required: true, category: 'Exterior' },
    { id: 'traseira_lateral_esquerda', name: 'Foto Traseira/Lateral Esquerda', type: 'photo', required: true, category: 'Exterior' },
  ];

  // Obter localização ao carregar
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
          };
          setLocation(locationData);
          
          // Tentar obter endereço (opcional)
          reverseGeocode(locationData.latitude, locationData.longitude);
        },
        (error) => {
          toast.error("Erro ao obter localização. Verifique as permissões.");
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Usar um serviço de geocodificação reversa (exemplo com OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        setLocation(prev => prev ? { ...prev, address: data.display_name } : null);
      }
    } catch (error) {
      console.log("Não foi possível obter o endereço");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Câmera traseira
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: requiredItems[currentStep]?.type === 'video'
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      toast.error("Erro ao acessar a câmera. Verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${requiredItems[currentStep].id}_${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        
        const preview = canvas.toDataURL('image/jpeg', 0.8);
        
        const newItem: CapturedItem = {
          ...requiredItems[currentStep],
          file,
          preview
        };
        
        setCapturedItems(prev => [...prev, newItem]);
        stopCamera();
        toast.success(`${requiredItems[currentStep].name} capturada com sucesso!`);
        
        if (currentStep < requiredItems.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }
    }, 'image/jpeg', 0.8);
  };

  const captureVideo = async () => {
    if (!videoRef.current) return;

    try {
      const stream = videoRef.current.srcObject as MediaStream;
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `${requiredItems[currentStep].id}_${Date.now()}.webm`, {
          type: 'video/webm'
        });
        
        const newItem: CapturedItem = {
          ...requiredItems[currentStep],
          file,
          preview: URL.createObjectURL(blob)
        };
        
        setCapturedItems(prev => [...prev, newItem]);
        stopCamera();
        toast.success(`${requiredItems[currentStep].name} capturado com sucesso!`);
        
        if (currentStep < requiredItems.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      };
      
      mediaRecorder.start();
      
      // Parar gravação após 30 segundos
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 30000);
      
      toast.info("Gravação iniciada. Fale seu nome completo, data e hora atual.");
      
    } catch (error) {
      toast.error("Erro ao iniciar gravação de vídeo");
    }
  };

  const addDamagePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDamagePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).slice(0, 3 - damagePhotos.length);
      setDamagePhotos(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} foto(s) de avaria adicionada(s)`);
    }
  };

  const submitInspection = async () => {
    if (capturedItems.length < requiredItems.length) {
      toast.error("Complete todos os itens obrigatórios antes de enviar");
      return;
    }

    if (!location) {
      toast.error("Localização não disponível. Tente novamente.");
      return;
    }

    try {
      // Aqui você implementaria o envio para o servidor
      // const formData = new FormData();
      // capturedItems.forEach(item => {
      //   if (item.file) formData.append(item.id, item.file);
      // });
      // formData.append('location', JSON.stringify(location));
      
      toast.success("Vistoria enviada com sucesso! Obrigado pela colaboração.");
    } catch (error) {
      toast.error("Erro ao enviar vistoria. Tente novamente.");
    }
  };

  const currentItem = requiredItems[currentStep];
  const isCompleted = capturedItems.length === requiredItems.length;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <h1 className="text-lg font-bold">🔍 Vistoria Remota</h1>
          <p className="text-sm opacity-90">Eagle Vistorias e Inspeções</p>
          {location && (
            <p className="text-xs mt-2 opacity-75">
              📍 {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm text-gray-600">{capturedItems.length}/{requiredItems.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(capturedItems.length / requiredItems.length) * 100}%` }}
            />
          </div>
        </div>

        {!isCompleted ? (
          <div className="p-4">
            {/* Current Item */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{currentItem?.name}</h2>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {currentItem?.category}
                </span>
              </div>
              
              {currentItem?.type === 'video' && (
                <div className="bg-yellow-50 p-3 rounded-md mb-4">
                  <p className="text-sm text-yellow-800">
                    📹 <strong>Instruções para o vídeo:</strong><br/>
                    • Grave por 10-30 segundos<br/>
                    • Fale claramente seu nome completo<br/>
                    • Mencione a data e hora atual<br/>
                    • Mostre o ambiente ao redor do veículo
                  </p>
                </div>
              )}
            </div>

            {/* Camera */}
            {isCapturing ? (
              <div className="mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted={currentItem?.type === 'photo'}
                  className="w-full rounded-lg bg-black"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="flex gap-2 mt-4">
                  {currentItem?.type === 'photo' ? (
                    <button
                      onClick={capturePhoto}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium"
                    >
                      📸 Capturar Foto
                    </button>
                  ) : (
                    <button
                      onClick={captureVideo}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium"
                    >
                      🎥 Iniciar Gravação
                    </button>
                  )}
                  <button
                    onClick={stopCamera}
                    className="px-4 bg-gray-300 text-gray-700 rounded-lg"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={startCamera}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium mb-4"
              >
                📱 Abrir Câmera
              </button>
            )}

            {/* Navigation */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                >
                  ← Anterior
                </button>
              )}
              {capturedItems.some(item => item.id === currentItem?.id) && currentStep < requiredItems.length - 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Próximo →
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Completion Screen */
          <div className="p-4">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-green-600 mb-2">
                Vistoria Concluída!
              </h2>
              <p className="text-gray-600">
                Todos os itens obrigatórios foram capturados com sucesso.
              </p>
            </div>

            {/* Optional Damage Photos */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">📸 Fotos de Avarias (Opcional)</h3>
              <p className="text-sm text-gray-600 mb-3">
                Se houver danos no veículo, adicione até 3 fotos:
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleDamagePhotoCapture}
                className="hidden"
              />
              
              {damagePhotos.length < 3 && (
                <button
                  onClick={addDamagePhoto}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium mb-3"
                >
                  📷 Adicionar Foto de Avaria ({damagePhotos.length}/3)
                </button>
              )}
              
              {damagePhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {damagePhotos.map((file, index) => (
                    <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Avaria ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={submitInspection}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg"
            >
              📤 Enviar Vistoria
            </button>
          </div>
        )}

        {/* Captured Items Summary */}
        {capturedItems.length > 0 && (
          <div className="p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">✅ Itens Capturados ({capturedItems.length})</h3>
            <div className="space-y-1">
              {capturedItems.map((item) => (
                <div key={item.id} className="flex items-center text-sm">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}