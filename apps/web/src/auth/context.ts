import { createContext, useContext } from "react";
import type { AuthState } from "./policy";

export const AuthContext = createContext<AuthState>({ isAuthenticated: false });

/** Authentication is read on the server before routing, then provided by the root component. */
export const useAuth = () => useContext(AuthContext);
