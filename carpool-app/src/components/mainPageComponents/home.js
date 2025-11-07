import {Link} from "react-router-dom";

function Home() {
    //change the function later to display the home page with good ui
    return (
        <>
            <div style={{textAlign:"center"}}>
            <h1>Welcome to Carpool Application</h1>
            <p> This is Home Page</p>
            <p> Here, you can find people going to the same office as you! </p>
            <p> Enter your location, look for people going to the same building/road as you</p>
            <p> You can also search for cars going to your destination and book a ride!</p>
            <p> Enjoy your ride! </p>
            <Link to = "/login"> Start Now! </Link>
            </div>
        </>
    )
}
export default Home;