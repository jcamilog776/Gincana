// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCW1sIBHflNci-10O6Sf9kGfl9T9U0VVsg",
    authDomain: "descubriendo-el-patrimonio.firebaseapp.com",
    projectId: "descubriendo-el-patrimonio",
    storageBucket: "descubriendo-el-patrimonio.appspot.com",
    messagingSenderId: "841639998973",
    appId: "1:841639998973:web:ba4c6cdd0b88a078ea1594"
};

// Initialize Firebase and export db
let db;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    window.db = db; // Make db available globally
    console.log('Firebase inicializado correctamente');
} catch (error) {
    console.error('Error inicializando Firebase:', error);
    alert('Error al inicializar la base de datos. Por favor, recarga la página.');
}