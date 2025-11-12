import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/MainLayout.js";
import Home from "./components/mainPageComponents/home.js";
import SearchCars from "./components/mainPageComponents/SearchCars.js";
import Login from "./components/mainPageComponents/login.js";
import SignUp from "./components/mainPageComponents/SignUp.js";
import AboutUs from "./components/mainPageComponents/AboutUs.js";
const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                path: '/',
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
            ,
            {
                path: "/signup",
                element: <SignUp />
            },
            {
                path: "/about",
                element: <AboutUs />
            }
        ]
    }
]);
export default router;
