// Importa las funciones necesarias de Firebase
 // paquete extra necesario en v9
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDevgJj43PlfyICANclyB68lz8KqxVnAi8",
  authDomain: "blue-switch-a2166.firebaseapp.com",
  projectId: "blue-switch-a2166",
  storageBucket: "blue-switch-a2166.firebasestorage.app",
  messagingSenderId: "506651829446",
  appId: "1:506651829446:web:f1dffbfb866af8d2b223c7",
  measurementId: "G-KQXKX4DX6M"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios que usarás
const auth2 = getAuth(app);

export { app, auth2 };

