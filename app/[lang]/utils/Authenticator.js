'use client'

import { useState, useContext, createContext, useEffect } from 'react'
import { firebaseauth } from '@/app/[lang]/utils/InitFirebase'
import nookies from "nookies";

// CTX 
const AuthContext = createContext({
    user: null
})

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState();


    useEffect(() => {

        if (typeof window !== "undefined") {
            window.nookies = nookies;
          }

        return firebaseauth.onIdTokenChanged(async (user) => {
            console.log(`token changed!`);
            if (!user) {
                console.log(`no token found...`);
                setUser(null);
                nookies.destroy(null, "token");
                nookies.set(null, "token", "", {path: '/'});
        
                return;
            }
            console.log(`updating token...`);
            const token = await user.getIdToken();
            setUser(user);
            nookies.destroy(null, "token");
            nookies.set(null, "token", token, {path: '/'});
        });
    }, []);

    // Fo rce refresh token every 10 mins 
    useEffect(() => {
        const handle = setInterval(async () => {
            console.log("refreshing token")
            const user = firebaseauth.currentUser;
            if (user) await user.getIdToken(true);

        }, 10 * 60 * 1000);

        return () => clearInterval(handle);

    }, [])

    return (
        <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
    )
    
}

export const useAuth = () => {
    return useContext(AuthContext);
  };