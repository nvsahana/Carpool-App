import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/MainLayout.js";
import Home from "./components/mainPageComponents/home.js";
import SearchCars from "./components/mainPageComponents/SearchCars.js";
import Login from "./components/mainPageComponents/login.js";
import SignUp from "./components/mainPageComponents/SignUp.js";
import AboutUs from "./components/mainPageComponents/AboutUs.js";
import Profile from "./components/mainPageComponents/profile.js";
import Messages from './components/mainPageComponents/Messages';
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
            },
            {
                path: "/profile",
                element: <Profile />
            },
            {
                path: '/messages',
                element: <Messages />
            },
            {
                path: '/messages/:userId',
                element: <Messages />
            }
        ]
    }
]);
export default router;
