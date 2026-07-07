export const environment = {
  // Use relative URL so it works on any host/port
  apiUrl: typeof window !== 'undefined' && window.location.protocol === 'https:' 
    ? `https://${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`
    : `http://${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`
};
