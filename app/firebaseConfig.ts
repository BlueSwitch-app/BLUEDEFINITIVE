// Importa las funciones necesarias de Firebase
 // paquete extra necesario en v9
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDhLgEo1WFayV8Wa6dkawSnSvoezsRyzwk",
  authDomain: "experimento-583d1.firebaseapp.com",
  projectId: "experimento-583d1",
  storageBucket: "experimento-583d1.firebasestorage.app",
  messagingSenderId: "976831443659",
  appId: "1:976831443659:web:96f600de0dcb699923614e",
  measurementId: "G-8RS27Z6F2L"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios que usarás
const auth2 = getAuth(app);
const db = getFirestore(app);

export  { app, auth2 };

