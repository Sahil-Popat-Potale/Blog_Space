import React, { createContext, useState, useEffect } from 'react'; 

const AuthContext = createContext();

export function AuthProvider({children}){ 
    const [user,setUser]=useState(()=>{ 
        try{ 
            return JSON.parse(localStorage.getItem('user'))||null 
        }catch(e){ return null } 
    }); 
    
    const save=(u,tokens)=>{ 
        setUser(u); 
        localStorage.setItem('user',JSON.stringify(u)); 
        localStorage.setItem('tokens', JSON.stringify(tokens)); 
    } 
    
    const logout=()=>{ 
        setUser(null); 
        localStorage.removeItem('user'); 
        localStorage.removeItem('tokens'); 
    } 
    useEffect(()=>{},[]); 
    return <AuthContext.Provider value={{user,save,logout}}>{children}</AuthContext.Provider> }
export default AuthContext;
