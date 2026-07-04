import Navbar from "../components/Navbar/Navbar";
import Chatbot from "../components/Chatbot/Chatbot";
import { useAuth } from "../context/AuthContext";

const MainLayout = ({ children }) => {
    const { isAuthenticated } = useAuth();

    return (
        <>
            <Navbar />
            <main>
                {children}
            </main>
            {isAuthenticated && <Chatbot />}
        </>
    );
};

export default MainLayout;