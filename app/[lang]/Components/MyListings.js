'use client'

import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LoopIcon from '@mui/icons-material/Loop';

import { useAuth } from '../utils/Authenticator';
import { Timestamp, arrayRemove, collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { firebasedb } from '../utils/InitFirebase';

import { useEffect, useRef, useState } from "react";

// React Toastify
import { ToastContainer, toast } from 'react-toastify';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';

import Image from 'next/image';
import moment from 'moment';


const Listing = ({ feature, myListings, setMyListings, dictionary, docID }) => {

    const [views, setViews] = useState(0);
    const [loading, setLoading] = useState(false);

    const timeStamp = feature.properties.timeStamp;

    const timeObj = new Timestamp(timeStamp.seconds, timeStamp.nanoseconds);
    const when = moment(timeObj.toDate()).fromNow();

    const listingRef = doc(firebasedb, "Views", `${feature.properties.id}`);

    // Atomically increment the population of the city by 50.
    getDoc(listingRef).then((res) => {
        console.log('got the number of views', res.data().views)
        setViews(res.data().views)
    }).catch((err) => {
        console.log(err)
    })

    const removeListing = async (feature) => {

        setLoading(!loading)

        const docRef = doc(firebasedb, "Listings", docID);

        let newMyListings = myListings;
        let final

        final = newMyListings.filter((listing) => listing.id !== feature.id).map((myfeature) => myfeature)

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

        let objectToRemove = active_Lisitings[0].features.filter((featureRemove) => featureRemove.id == feature.id)


        await updateDoc((docRef), {
            features: arrayRemove(objectToRemove[0])
        }).then((res) => {
            setLoading(!loading)
            setMyListings(final)
            console.log('Removed Successfully')
        }).catch((err) => {
            setLoading(!loading)
            console.log(err)
        });


    }


    return (
        <span key={feature.id} className={`flex`}>

            <div key={feature.id} className={`m-2 shadow-md shadow-slate-200 border-[1px] border-[#E3EFF1] w-[240px] h-min rounded`}>

                <Swiper modules={[Navigation, Pagination, Scrollbar, A11y]}
                    navigation={true}
                    pagination={{
                        type: "fraction",
                    }}
                    spaceBetween={50}
                    slidesPerView={1}
                    onSlideChange={() => {

                    }}
                    onSwiper={(swiper) => {

                    }}
                >

                    {feature.properties.urls.map((url, index) => {

                        return (
                            <SwiperSlide key={url}>

                                <span className={`grid grid-rows-1 grid-cols-1`}>
                                    <Image
                                        // placeholder="blur"	
                                        priority
                                        alt={url}
                                        src={url}
                                        width="0"
                                        height="0"
                                        sizes="100vw"
                                        className="row-start-1 col-start-1 w-full h-auto rounded select-none max-h-[160px] max-w-[240px]"
                                    />
                                </span>
                            </SwiperSlide>
                        )
                    }
                    )}
                </Swiper>

                <span className={`flex m-2`}>
                    <p className={`text-[#263238] text-base font-[600] font-['Montserrat',sans-serif] inline mr-auto ml-1 `}>
                        {feature.properties.price}
                    </p>
                </span>

                <span className={`flex mx-2 overflow-hidden text-ellipsis whitespace-nowrap`}>
                    <p className={`text-[#263238] text-xs inline mr-auto ml-1 `}> {feature.properties.streetName} - {feature.properties.buildingNumber} </p>
                </span>

                <span className={`flex m-2`}>
                    <p className={`text-[#263238] text-xs font-['Montserrat',sans-serif] inline mr-auto ml-1 whitespace-nowrap`}>
                        {dictionary['Numbers'][feature.properties.bedrooms]} {dictionary['Properties']['BD']}
                    </p>
                    <span className={`text-[#707070] text-xs`}>
                        |
                    </span>
                    <p className={`text-[#263238] text-xs font-['Montserrat',sans-serif] inline mr-auto ml-1 whitespace-nowrap`}>
                        {dictionary['Numbers'][feature.properties.bathrooms]} {dictionary['Properties']['BA']}
                    </p>
                    <span className={`text-[#707070] text-xs`}>
                        |
                    </span>
                    <p className={`text-[#263238] text-xs font-['Montserrat',sans-serif] inline mr-auto ml-1 whitespace-nowrap`}>
                        {feature.properties.parking ? dictionary['Numbers']['1'] : dictionary['Numbers']['0']} {dictionary['Properties']['Parking']}
                    </p>
                    <span className={`text-[#707070] text-xs`}>
                        |
                    </span>
                    <p className={`text-[#263238] font-['Montserrat',sans-serif] text-xs font-[600] inline mr-auto ml-1 `}>  {feature.properties.area} m2  </p>
                </span>

                <span className={`flex m-2 `}>
                    <p className={`text-[#707070] font-[500] font-['Montserrat',sans-serif] text-xs inline mr-auto ml-1  whitespace-nowrap`}> {dictionary['Properties']['Listing ID']}: {feature.properties.id}  </p>
                </span>

                <span className={`flex m-2`}>
                    <p className={`text-[#707070] font-[500] font-['Montserrat',sans-serif] text-xs inline mr-auto ml-1 whitespace-nowrap`}> {feature.properties.agent && dictionary['Properties']['Agent'] + ':'} {feature.properties.agent && feature.properties.agentName}  </p>
                </span>

                <span className={`flex border-[#f8f8f8] border-t-[1px] m-2 `}>
                </span>

                <span className={`flex m-2 `}>
                    <p className={`text-[#ADB0B5] font-[500] font-['Montserrat',sans-serif] text-xs inline ml-auto mr-2  whitespace-nowrap`}>
                        {when}
                    </p>
                </span>

            </div>


            <span className={`grid grid-rows-[50px,50px,50px,50px] grow my-2 mx-2`}>

                <span className={`flex bg-[#F8F8F8] p-2 rounded self-start`}>
                    <p className={` text-[#263238] text-base inline rounded my-auto mr-auto `}>
                        Listing Details
                    </p>

                    <span className={`flex bg-[#F8F8F8] px-2 rounded ml-auto mr-2`}>
                        <VisibilityOutlinedIcon className={` text-base text-[#0097A7] inline  my-auto`} />
                        <p className={` text-xs text-[#0097A7] inline rounded ml-2 my-auto`}>
                            {views && views}
                        </p>
                    </span>

                </span>

                <span className={`flex self-center`}>
                    <p className={`text-[#707070] text-sm `}> Listing:</p>

                    <p className={`flex text-[#707070] ml-2 text-sm font-[500]`}>
                        {feature.properties.propertyStatus}
                    </p>
                </span>

                <span className={`flex self-center`}>
                    <p className={`text-[#707070] text-sm `}> Status:</p>

                    <p className={`flex ${feature.properties.status == 'pending' ? 'text-yellow-400' : 'text-[green]'} ml-2 text-sm font-[500]`}>
                        {feature.properties.status}
                    </p>
                </span>

                <span onClick={() => {
                    removeListing(feature)
                }} className={` py-3 self-center bg-[#07364B] hover:bg-[#102C3A] border-[1px] border-[#102C3A] text-white text-center hover:cursor-pointer`}>
                    {loading ? <LoopIcon className={`animate-spin text-[white] text-2xl inline mx-2`} /> : 'Remove Listing'}
                </span>

            </span>

        </span>
    )



}
const MyListings = ({ open, setOpen, allListings, dictionary, docID }) => {

    const user = useAuth();

    const [myListings, setMyListings] = useState([]);

    useEffect(() => {

        if (user.user) {
            let FilteredListings;
            FilteredListings = allListings.features.filter((feature) => feature.properties.seller == user.user.uid).map((feature) => feature);
            console.log(FilteredListings, 'My FilteredListings')
            setMyListings(FilteredListings)
        }

    }, [user.user]);


    return (
        <>
            {open &&

                <div className={`justify-self-start self-center row-start-2 row-end-3 col-start-1 col-end-8 grid grid-rows-[50px,30px,50px,auto] min-h-[85vh] max-h-[85vh] min-w-[520px] overflow-y-auto bg-[#FFFFFF] z-[100] ease-in-out duration-300 `} >

                    <span className={`self-center flex py-2 mx-2 `}>

                        <span className={` mr-auto my-auto ml-4`}>
                            <p className={`text-[#263238] font-[600] font-['Montserrat',sans-serif] text-xl `}> My Listings </p>
                        </span>

                        <ClearOutlinedIcon onClick={() => {
                            setOpen(!open)
                        }} className={`ml-auto hover:text-[red] text-[#07364B] cursor-pointer `} />
                    </span>

                    <span className={`self-center grid py-4 border-[#E3EFF1] border-t-2`} >

                    </span>


                    <span className={`bg-[#E3EFF1] mt-2`} >

                    </span>

                    <span className={`grid grid-cols-[repeat(auto-fill,1fr)]`}>

                        {myListings.length !== 0 ? myListings.map((feature) => {

                            return (

                                <Listing feature={feature} setMyListings={setMyListings} myListings={myListings} dictionary={dictionary} docID={docID} />
                            )
                        })
                            :
                            <span className={`flex self-center justify-self-center col-start-1 col-end-3 p-2`}>
                                <span className={` mx-auto my-auto`}>
                                    <p className={`text-[#263238] font-['Montserrat',sans-serif] text-base overflow-hidden text-ellipsis whitespace-nowrap`}> You dont have any listings </p>
                                </span>
                            </span>
                        }


                    </span>

                </div >
            }

        </>
    )
}

export default MyListings; 