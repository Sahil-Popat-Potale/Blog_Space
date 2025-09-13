import React from 'react'; 
import App from './App'; 
import { createRoot } from 'react-dom/client'; 
import { BrowserRouter } from 'react-router-dom'; 
import { AuthProvider } from './AuthContext';
//import './styles.css';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App/>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
