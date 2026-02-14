import Header from "./Header";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import FloatingChat from "./FloatingChat";
import { AuthProvider } from "../context/AuthContext";

function MainLayout() {
    return (
        <AuthProvider>
            <Header />
            <Outlet />
            <Footer />
            <FloatingChat />
        </AuthProvider>
    )
}
export default MainLayout;
