import axios from 'axios'; 

const api = axios.create({ 
    baseURL: (import.meta.env.VITE_API_URL || "http://localhost:4000"), 
    withCredentials:false, // true allows cookies/jwt
}); 
    
export default api;
