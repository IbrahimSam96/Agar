// Local Conmponents 
import ListingClientPage from "../Component/PageComponent";

// Firebase
import { collection, doc, getDoc, getDocFromServer, getDocs, increment, setDoc, updateDoc } from "firebase/firestore";
import { firebasedb } from "../../utils/InitFirebase";

// export async function generateMetadata({ params, searchParams }) {
//   // read route params
//   const id = params.id

//   // fetch data
//   // const product = await fetch(`https://.../${id}`).then((res) => res.json())


//   // return {
//   //   // title: product.title,
//   // openGraph: {
//   //   // images: ['/some-specific-page-image.jpg', ...previousImages],
//   //   // title: 'Acme',
//   //   // description: 'Acme is a...',

//   // },
//   // }

// }

export const dynamicParams = false // true | false,

export async function generateStaticParams({ params: { lang } }) {
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


      // console.log(JSON.parse(listing.features[0].properties.urls))
      active_Lisitings.push(listing);
    });
    // setLoading(false)

    return active_Lisitings
  }

  const Listings = await getlistings();
  // return Listings

  return await Listings[0].features.map((feature) => ({
    id: feature.id,
  }))
}

export default async function Page({ params, searchParams }) {


  const getlistings = async () => {
    // setLoading(true)
    const colRef = collection(firebasedb, "Listings");
    const querySnapshot = await getDocs(colRef);
    let active_Lisitings = [];

    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      // console.log(doc.id, " => ", doc.data());

      let listing = {}
      listing = doc.data();


      // console.log(JSON.parse(listing.features[0].properties.urls))
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

  const pageListing = await Listings[0].features.filter((feature) => feature.id == params.id);

  const getListingViews = async () => {
    let views;

    const listingRef = doc(firebasedb, "Views", `${params.id}`);
    // Atomically increment the population of the city by 50.
    await getDoc(listingRef).then((res) => {
      views = res.data().views
      console.log(res.data().views)
    }).catch((err) => {
      console.log(err)
    })

    return views
  }

  const views = await getListingViews();


  return (

    <div className={`w-full h-full min-h-screen grid grid-cols-7 grid-rows-[60px,auto,auto,auto]`} >

      <ListingClientPage Listings={JSON.parse(JSON.stringify(Listings))} feature={JSON.parse(JSON.stringify(pageListing[0]))} params={params} views={views} />

    </div>
  )

}
