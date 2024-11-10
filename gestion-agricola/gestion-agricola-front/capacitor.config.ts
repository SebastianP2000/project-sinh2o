import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'gestion-agricola',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    url: 'https://project-sinh2o.onrender.com/',  // Usa la URL HTTPS aquí también si es necesario
    cleartext: false  // Esto asegura que no se permita HTTP sin cifrado
  }
};

export default config;
