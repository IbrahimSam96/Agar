
// local Components
import Sidebar from './Components/Sidebar';
import Map from './Components/map';
import NavBar from './Components/NavBar';
import Sell from './Components/Sell';
// Firebase
import { collection, getDocs } from "firebase/firestore";
import { firebasedb } from './utils/InitFirebase';

import AppClientPage from './Components/appClientPage';

export default async function Home() {

  let docID;

  const getlistings = async () => {
    // setLoading(true)
    const colRef = collection(firebasedb, "Listings");
    const querySnapshot = await getDocs(colRef);
    let active_Lisitings = [];

    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      // console.log(doc.id, " => ", doc.data());
      docID = doc.id;

      let listing = {}
      listing = doc.data();

      active_Lisitings.push(listing);
    });

    // console.log('ActiveListings:',active_Lisitings)

    // active_Orders.sort((a, b) => a.deliveryDate - b.deliveryDate);
    // past_Orders.sort((a, b) => a.deliveryDate - b.deliveryDate);

    // setActiveOrders(active_Orders);
    // setLoading(false)

    return active_Lisitings
  }

  const Listings = await getlistings();


  return (

    <div className={`w-full h-full min-h-full grid grid-cols-7 grid-rows-[60px,1fr,auto] `} >

      <AppClientPage docID={docID} Listings={Listings} />

    </div>
  )
}


