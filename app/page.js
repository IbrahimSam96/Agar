
// local Components
import Sidebar from './Components/Sidebar';
import Map from './Components/map';
import NavBar from './Components/NavBar';
import Sell from './Components/Sell';
// Firebase
import { collection, getDocs } from "firebase/firestore";
import { firebasedb, storage } from './utils/InitFirebase';
// storage
import { getStorage, ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";

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

    // active_Lisitings[0].features.map((feature) => {
    //   console.log(feature)
    //   feature.listingImages = [];

    //   const listRef = ref(storage, `${feature.id}/`);
    //   // Find all images for listing.
    //   listAll(listRef)
    //     .then((res) => {
    //       res.items.forEach((itemRef) => {
    //         getDownloadURL(itemRef).then((url) => {
    //           console.log(url)
    //           feature.listingImages.push(url)
    //         })
    //       });
    //     }).catch((error) => {
    //       console.log(error)
    //       // Uh-oh, an error occurred!
    //     });


    // })
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

      {/* <NavBar />
      <Map Listings={Listings} Governorates={Governorates} JordanCoordinates={JordanCoordinates} ammanCoordinates={ammanCoordinates} />
      <Sidebar Listings={Listings} />
      <Sell Governorates={Governorates} docID={docID} /> */}

    </div>
  )
}


