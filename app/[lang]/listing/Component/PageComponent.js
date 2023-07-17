'use client'
// Nextjs React
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
// Local
import NavBar from "./NavBar";

// MUI 
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import ShowerOutlinedIcon from '@mui/icons-material/ShowerOutlined';
import CropFreeOutlinedIcon from '@mui/icons-material/CropFreeOutlined';
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined';
import LocalParkingOutlinedIcon from '@mui/icons-material/LocalParkingOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y, Thumbs, FreeMode, Zoom } from 'swiper';

import { Timestamp, collection, doc, getDoc, getDocs, increment, setDoc, updateDoc } from "firebase/firestore";
import moment from "moment";
// React Toastify
import { ToastContainer, toast } from 'react-toastify';

import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined';

import { useAuth } from "../../utils/Authenticator";
import { firebasedb } from "../../utils/InitFirebase";
import { useRouter } from "next/navigation";

const ListingClientPage = ({ Listings, params, feature, views }) => {
    // Cluster Colors
    // '#07364B', // HOVER color
    // '#0097A7' // Normal color
    // '#102C3A' // HOVER HOVER color
    // '#E5F4F6' // LIGHT Normal Color
    // Text
    // #263238 Header
    // Divider
    // #E3EFF1 
    // grey Background
    // #F8F8F8
    // DARK GREY
    // #ADB0B5
    // Red
    // #EA0670

    // // runs once on render - get listing views
    // useEffect(() => {

    //     const getListingViews = async () => {

    //         const listingRef = doc(firebasedb, "Views", `${params.id}`);
    //         // Atomically increment the population of the city by 50.
    //         await getDoc(listingRef).then((res) => {
    //             setViews(res.data().views)

    //         }).catch((err) => {
    //             console.log(err)
    //         })


    //     }

    //     getListingViews()

    // }, [])

    const toastId = useRef(null);

    const user = useAuth();
    const [favourited, setFavourited] = useState([]);

    const router = useRouter();

    useEffect(() => {

        const retreiveUserProfile = async () => {

            const getUserProfile = async () => {
                // setLoading(true)
                const colRef = collection(firebasedb, "Customers");
                const querySnapshot = await getDocs(colRef);

                let userProfile;

                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    // console.log(doc.id, " => ", doc.data());
                    let listing = {}
                    listing = doc.data();

                    if (doc.id == user.user.uid) {
                        userProfile = listing;
                    }
                });

                return userProfile
            }

            const UserProfile = await getUserProfile();
            console.log(UserProfile);

            setFavourited(UserProfile['Favourites']);
        }

        // if user is authed then fetch favourited listings
        if (user.user) {
            retreiveUserProfile();
        }

    }, [user.user]);


    // Increment listing views for each page visit. 
    useEffect(() => {

        const IncrementListingView = async () => {

            const listingRef = doc(firebasedb, "Views", `${params.id}`);

            // Atomically increment the population of the city by 50.
            await updateDoc(listingRef, {
                views: increment(1)
            }).then((res) => {
                console.log('Updated View Count');

            }).catch((err) => {
                console.log(err)
            })

        }

        IncrementListingView();

    }, [])

    const timeStamp = feature.properties.timeStamp;
    const timeObj = new Timestamp(timeStamp.seconds, timeStamp.nanoseconds);
    const when = moment(timeObj.toDate()).fromNow();
    const isFavourited = favourited.includes(feature.id)

    // const favourited = 
    const [show, setShow] = useState(false);

    const addListing = async (ID) => {

        const docRef = doc(firebasedb, "Customers", user.user.uid);

        const getUserProfile = async () => {
            // setLoading(true)
            const colRef = collection(firebasedb, "Customers");
            const querySnapshot = await getDocs(colRef);

            let userProfile;

            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                // console.log(doc.id, " => ", doc.data());
                let listing = {}
                listing = doc.data();

                if (doc.id == user.user.uid) {
                    userProfile = listing;
                }
            });

            return userProfile
        }

        const UserProfile = await getUserProfile();
        const favs = UserProfile['Favourites']


        let list = [...favs]
        list.push(ID)

        await updateDoc(docRef, {
            Favourites: list

        }).then((res2) => {
            console.log(res2)
            setFavourited(list);
            console.log("New List :", list);
        }).catch((err) => {
            console.log(err)
        })

    }

    const removeListing = async (ID) => {

        const docRef = doc(firebasedb, "Customers", user.user.uid);

        let list = favourited;

        var newList = list.filter((value) => value !== ID).map((id) => id);



        await updateDoc(docRef, {
            Favourites: newList
        }).then((res) => {
            console.log(res);
            setFavourited(newList);
        }).catch((err) => {
            console.log(err)
        })

    }

    const [thumbsSwiper, setThumbsSwiper] = useState(null);


    return (
        <>
            <NavBar />

            <ToastContainer />

            <div className={`grid grid-rows-[auto,auto,150px] row-start-2 row-end-3 col-start-1 col-end-8 mx-2 sm:mx-12 my-4 `}>

                <span className={`self-center grid p-2 mx-2 `}>

                    <span className={`flex self-center `}>
                        <p className={`text-base text-[#263238] font-[500] my-auto mr-auto `}>{feature.properties.streetName} - {feature.properties.buildingNumber} </p>


                        <span className={`flex ml ml-auto mr-2`}>

                            {isFavourited ?
                                <span onClick={() => {
                                    removeListing(feature.id);
                                }} className={`my-auto mr-2 p-3 flex border-[#E3EFF1] hover:bg-[#F8F8F8] hover:cursor-pointer border-[1px] rounded`}>
                                    <FavoriteOutlinedIcon className={`text-xl my-auto text-[#EA0670] z-10`} />
                                    <p className={`text-base text-[#EA0670] my-auto ml-2 rounded`}>Favourite </p>
                                </span>
                                :
                                <span onClick={() => {
                                    if (user.user) {
                                        addListing(feature.id)
                                    }
                                    else {
                                        toastId.current = toast.error("Create an account or sign-in to add to favourites", { autoClose: true });

                                    }
                                }} className={`my-auto mr-2 p-3 flex border-[#E3EFF1] hover:bg-[#F8F8F8] hover:cursor-pointer border-[1px] rounded`}>
                                    <svg className={`z-10  my-auto`}
                                        xmlns="http://www.w3.org/2000/svg" width="22" height="22" data-name="Favourite Outline" id="favourite">
                                        <path fill="#F8F8F8" d="M0 0h24v24H0Z" opacity=".24">
                                        </path>
                                        <path fill="#EA0670" d="M11.994 20.696a1.407 1.407 0 0 1-.986-.41L4.08 13.359a5.712 5.712 0 0 1 7.926-8.226 5.715 5.715 0 0 1 7.918 8.241l-6.944 6.922a1.4 1.4 0 0 1-.986.4Zm-.284-1.68Zm-3.6-13.62a3.913 3.913 0 0 0-2.757 6.69L12 18.73l6.652-6.634a3.915 3.915 0 1 0-5.534-5.539l-1.112 1.116-1.12-1.12A3.9 3.9 0 0 0 8.11 5.396Z" data-name="Path 2729">
                                        </path>
                                    </svg>
                                    <p className={`text-base text-[#EA0670] my-auto ml-2 rounded`}>Favourite </p>
                                </span>
                            }


                            <span onClick={() => {
                                navigator.clipboard.writeText(`https://shoqaq.jo.vercel.app/listing/${feature.id}`)
                                toastId.current = toast.success("Successfully copied link", { autoClose: true });

                            }} className={`my-auto mr-2 p-3 flex border-[#E3EFF1] hover:bg-[#F8F8F8] hover:cursor-pointer border-[1px] rounded group active:bg-[#07364B] active:text-white`}>
                                <IosShareOutlinedIcon className={`fill-[#07364B] group-active:fill-white`} />
                                <p className={`text-base text-[#07364B] group-active:text-white my-auto ml-2 rounded`}>Share </p>
                            </span>

                        </span>

                    </span>

                    <p className={`text-sm text-[#0097A7] underline font-['Montserrat',sans-serif] self-center  `}> {feature.properties.city} </p>

                </span>

                <span className={`grid self-center`}>

                    <span className={`grid grid-rows-[500px,120px] self-center justify-self-start shadow-md shadow-[#E3EFF1] max-w-[95vw]`}>
                        <>
                            <Swiper
                                style={{
                                    '--swiper-navigation-color': '#fff',
                                    '--swiper-pagination-color': '#fff',
                                }}
                                spaceBetween={10}
                                navigation={true}
                                thumbs={{ swiper: thumbsSwiper }}
                                modules={[FreeMode, Navigation, Thumbs, Zoom]}
                                className="mySwiper2"
                                zoom={true}

                            >
                                {feature.properties.urls.map((url, index) => {
                                    return (
                                        <Fragment key={url}>
                                            <SwiperSlide>
                                                <div className={`swiper-zoom-container`}>
                                                    <Image
                                                        priority
                                                        alt={url}
                                                        src={url}
                                                        width="0"
                                                        height="0"
                                                        sizes="100vw"
                                                        className={`w-full h-full m-2 select-none my-auto`}
                                                    />
                                                </div>
                                            </SwiperSlide>

                                        </Fragment>
                                    )
                                })}

                            </Swiper>

                            <Swiper
                                onSwiper={setThumbsSwiper}
                                spaceBetween={10}
                                slidesPerView={4}
                                freeMode={true}
                                watchSlidesProgress={true}
                                modules={[FreeMode, Navigation, Thumbs]}
                                className="mySwiper"
                            >
                                {feature.properties.urls.map((url, index) => {
                                    return (
                                        <Fragment key={url}>
                                            <SwiperSlide>
                                                <div className={`swiper-zoom-container`}>
                                                    <Image
                                                        priority
                                                        alt={url}
                                                        src={url}
                                                        width="0"
                                                        height="0"
                                                        sizes="100vw"
                                                        className={`w-full h-full object-cover mx-2 select-none rounded border-2 border-[#E3EFF1]`}
                                                    />
                                                </div>
                                            </SwiperSlide>

                                        </Fragment>
                                    )
                                })}

                            </Swiper>
                        </>
                    </span>

                    <span className={`self-center flex my-4`}>

                        <span className={`grid grid-rows-[auto,50px] my-auto mr-auto  `}>

                            <span className={`flex self-center`}>
                                <span className={`grid mx-2 my-auto`}>
                                    <Image className={`justify-self-center select-none`} src={'/bed.svg'} width={30} height={30} alt="Bed" />
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline  self-center`}>
                                        {feature.properties.bedrooms} bed
                                    </p>
                                </span>
                                <span className={`grid mx-2 my-auto`}>
                                    <Image className={`justify-self-center select-none`} src={'/bathtub.svg'} width={30} height={30} alt="Bathtub" />
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline self-center `}>
                                        {feature.properties.bathrooms} bath
                                    </p>
                                </span>
                                <span className={`grid mx-2 my-auto`}>
                                    <LocalParkingOutlinedIcon className={`justify-self-center text-[#07364B] p-1 rounded-[50%] border-[1px] border-[#07364B] select-none`} />
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline  self-center`}>
                                        {feature.properties.parking ? 1 : 0} parking
                                    </p>
                                </span>
                                <span className={`grid mx-2 my-auto`}>
                                    <CropFreeOutlinedIcon className={`justify-self-center text-[#07364B] select-none`} />
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline self-center`}>
                                        {feature.properties.area} m2
                                    </p>
                                </span>

                                <span className={`grid mx-2 my-auto`}>
                                    <Image className={`justify-self-center select-none`} src={'/sofa.svg'} width={25} height={30} alt="Bathtub" />
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline justify-self-center`}>
                                        {feature.properties.furnished ? 'Furnished' : 'Not Furnished'}
                                    </p>
                                </span>

                            </span>

                            <span className={`flex self-center mx-2`}>
                                <p className={` text-xs text-[#07364B] bg-[#F8F8F8] p-2 inline rounded my-auto`}>
                                    {feature.properties.rent ? 'For Rent' : 'For Sale'}
                                </p>

                                <p className={` text-xs text-[#0097A7] bg-[#E5F4F6] inline rounded px-2 ml-4 my-auto`}>
                                    {when}
                                </p>


                                <span className={`flex bg-[#F8F8F8] px-2 rounded ml-4`}>
                                    <VisibilityOutlinedIcon className={` text-base text-[#0097A7] inline  my-auto`} />
                                    <p className={` text-xs text-[#0097A7] inline rounded ml-2 my-auto`}>
                                        {views}
                                    </p>
                                </span>

                            </span>

                        </span>

                        <span className={`flex my-auto ml-auto mr-2`}>
                            <p className={` text-2xl text-[#07364B] bg-[#F8F8F8] p-2 inline rounded my-auto`}>
                                {feature.properties.price} {feature.properties.rent ? '/ Month ' : ''}
                            </p>
                        </span>

                    </span>
                    <span className={`self-center flex `}>

                        <span className={`flex my-auto ml-auto mr-2`}>

                            {feature.properties.phone &&
                                <>
                                    <p className={` text-base text-[#07364B] p-2 inline rounded my-auto`}>
                                        {feature.properties.agentt ? 'Contact Realtor' : 'Contact Owner'}
                                    </p>

                                    <span onClick={() => {

                                        if (!user.user) {
                                            router.push('/login')
                                        }

                                    }} className={`bg-[#F8F8F8] border-[1px] border-[#07364B] px-2 rounded flex min-w-[160px]`}>

                                        <p className={` text-xl text-[#07364B] font-[500] inline my-auto hover:blur-none blur-sm `}>
                                            {user.user ? feature.properties.phone : 'Sign in to view number'}
                                        </p>
                                    </span>

                                </>
                            }
                        </span>
                    </span>

                    <span className={`grid mx-2 `}>

                        <p className={`text-base text-[#263238] font-[500] self-center justify-self-start my-2`}> Proeprty Description </p>

                        <span className={`grid overflow-y-auto min-h-[200px] border-2 border-slate-300 px-2 max-h-[250px]`}>
                            <pre className={`text-sm sm:text-base text-[#07364B] inline mr-auto whitespace-pre-wrap `}>
                                {feature.properties.description}
                            </pre>
                        </span>

                    </span>



                </span>

            </div>


        </>

    )
}

export default ListingClientPage; 