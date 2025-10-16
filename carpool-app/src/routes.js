import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/MainLayout.js";
import Home from "./components/mainPageComponents/home.js";
import SearchCars from "./components/mainPageComponents/SearchCars.js";
import Login from "./components/mainPageComponents/login.js";
const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                path: '/home',
                element: <Home />
            },
            {
                path:'/searchCars',
                element: <SearchCars />
            },
            {
                path: "/login",
                element: <Login />
            }
        ]
    }
]);
export default router;
