
// Local Client Compinents
import Login from './Login';
import NavBar from './Navbar';



const Home = async () => {

    return (

        <div className={`h-full min-h-screen w-full grid grid-cols-[repeat(7,1fr)] grid-rows-[60px,550px,auto]`}>
            <NavBar />
            <Login />

        </div>
    )
}


export default Home;;