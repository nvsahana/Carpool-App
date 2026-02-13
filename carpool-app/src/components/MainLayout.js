import Header from "./Header";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import { AuthProvider } from "../context/AuthContext";

function MainLayout() {
    return (
        <AuthProvider>
            <Header />
            <Outlet />
            <Footer />
        </AuthProvider>
    )
}
export default MainLayout;
