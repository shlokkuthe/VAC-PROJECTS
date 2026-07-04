import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    loginUser,
    signupUser,
    getCurrentUser,
    logoutUser
} from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const data = await getCurrentUser();
            setUser(data.user);
        } catch (error) {
            console.warn("Session load failed:", error.message);
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = async (credentials) => {
        const data = await loginUser(credentials);
        localStorage.setItem("token", data.accessToken);
        setUser(data.user);
        return data;
    };

    const signup = async (userData) => {
        const data = await signupUser(userData);
        localStorage.setItem("token", data.accessToken);
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        try {
            await logoutUser();
        } catch (err) {
            console.warn("Logout request failed on server:", err.message);
        }
        localStorage.removeItem("token");
        setUser(null);
    };

    const updateUserState = (updatedUserFields) => {
        setUser((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                ...updatedUserFields,
            };
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                signup,
                logout,
                updateUserState,
                isAuthenticated: !!user,
                isAdmin: user?.role === "admin",
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;