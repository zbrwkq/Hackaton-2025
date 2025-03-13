import { useState, useEffect } from 'react';

interface ServiceStatus {
  name: string;
  endpoint: string;
  status: 'online' | 'offline' | 'loading';
  statusCode?: number;
  response?: any;
}

export function MicroServiceDashboard() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Service de recherche', endpoint: 'http://localhost:3000/api/search/health', status: 'loading' },
    { name: 'Service utilisateurs', endpoint: 'http://localhost:3000/api/users/health', status: 'loading' },
    { name: 'Service tweets', endpoint: 'http://localhost:3000/api/tweets/health', status: 'loading' },
    { name: 'Service IA', endpoint: 'http://localhost:3000/api/ia/health', status: 'loading' },
    { name: 'Service notifications', endpoint: 'http://localhost:3000/api/notifications/health', status: 'loading' },
  ]);

  useEffect(() => {
    const checkServiceHealth = async () => {
      const updatedServices = await Promise.all(
        services.map(async (service) => {
          try {
            const response = await fetch(service.endpoint);
            const responseData = await response.text();
            console.log(`Réponse de ${service.name}:`, responseData);
            
            return {
              ...service,
              status: response.ok ? 'online' : 'offline',
              statusCode: response.status,
              response: responseData
            };
          } catch (error) {
            console.error(`Erreur lors de la vérification de ${service.name}:`, error);
            return {
              ...service,
              status: 'offline',
              response: error
            };
          }
        })
      );
      
      setServices(updatedServices);
    };

    checkServiceHealth();
    
    // Vérifier la santé des services toutes les 30 secondes
    const interval = setInterval(checkServiceHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: 'online' | 'offline' | 'loading') => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'loading': return 'bg-yellow-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">TweetAI</h1>
          <h2 className="text-2xl font-bold text-gray-700">Dashboard des Micro-Services</h2>
          <div></div> {/* Élément vide pour centrer le titre */}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{service.name}</h2>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(service.status)}`}></div>
                  <span className="text-sm">
                    {service.status === 'online' ? 'En ligne' : service.status === 'offline' ? 'Hors ligne' : 'Chargement...'}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-2">{service.endpoint}</div>
              {service.statusCode && (
                <div className="text-sm">
                  <span className="font-medium">Code d'état: </span>
                  <span className={service.status === 'online' ? 'text-green-600' : 'text-red-600'}>
                    {service.statusCode}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Journal de diagnostic</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg shadow overflow-auto max-h-96">
            {services.map((service, index) => (
              <div key={index} className="mb-4">
                <div className="font-mono text-sm">
                  <span className={`font-semibold ${service.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                    {service.name}:
                  </span> 
                  <span className="ml-2">
                    {service.status === 'online' ? 'OK' : 'Erreur'} {service.statusCode && `(${service.statusCode})`}
                  </span>
                </div>
                {service.response && (
                  <pre className="text-xs mt-1 overflow-x-auto">
                    {typeof service.response === 'object' 
                      ? JSON.stringify(service.response, null, 2) 
                      : service.response}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 