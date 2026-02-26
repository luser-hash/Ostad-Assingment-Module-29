// create routing + auth scaffolding 

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { tokenStorage } from "../../services/api/tokenStorage";
import { http } from "../../services/api/http";

// create the context
const AuthContext = createContext(null);

export function AuthProvider({ children }){
    const [accessToken, setAccessToken] = useState(tokenStorage.getAccess());
    const [user, setUser] = useState(null);
    const [booting, setBooting] = useState(true);

    // is Authed, True if token exists else false
    const isAuthed = !!accessToken;

    // Boot effect ( run once on app start)
    // load profile if token exists
    useEffect(() => {
        let ignore = false;

        async function boot() {
            try {
                if (!tokenStorage.getAccess()) {
                    if (!ignore) setBooting(false);
                    return;
                }

                const { data } = await http.get("/me/");
                if (!ignore) setUser(data);
            } catch (e) {
                // if token is invalid, clear all
                tokenStorage.clear();
                setAccessToken(null);
                setUser(null);
            } finally {
                if (!ignore) setBooting(false);
            }
        }

        boot();
        return () => {
            ignore = true;
        };
    }, []);

    // login function. called after the api returns tokens
    const login = ({ access, refresh, user: userPayload}) => {
        tokenStorage.setTokens({ access, refresh }); // save tokens to storage
        setAccessToken(access); // update react state 
        setUser(userPayload ?? null); // set user if backend returns any
    }; 

    // logout function
    const logout = () => {
        tokenStorage.clear(); // deletes token
        setAccessToken(null); // reset state
        setUser(null); // set user null
    }

    // value object + useMemo
    // rerender only when auth data changes
    const value = useMemo(
        () => ({
            booting,
            isAuthed,
            user,
            accessToken,
            login,
            logout,
            setUser,
        }),
        [booting, isAuthed, user, accessToken]
    );

    // any component under AuthProvider can call useAuth() to get auth state
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Use Auth Hook
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
    return ctx;
}








