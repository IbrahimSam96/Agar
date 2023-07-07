'use client'


import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../utils/Authenticator";
import { doc, updateDoc, Timestamp, collection, getDocs } from "firebase/firestore";
import { firebasedb } from "../utils/InitFirebase";
// React Toastify
import { ToastContainer, toast } from 'react-toastify';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';

import Image from 'next/image';
import moment from 'moment';


const Favourites = ({ open, setOpen, allListings, dictionary }) => {

    const user = useAuth();

    const [favourited, setFavourited] = useState([]);
    const toastId = useRef(null);


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
        if (user.user && favourited.length == 0) {
            retreiveUserProfile();
        }

    }, [user.user]);


    const addListing = async (ID) => {

        if (user.user) {
            const docRef = doc(firebasedb, "Customers", user.user.uid);

            setFavourited((prev) => [...prev, ID]);

            console.log("New List :", favourited);

            // console.log("New List :", newlist);

            await updateDoc(docRef, {
                Favourites: favourited
            }).then((res) => {
                console.log('Done')
            }).catch((err) => {
                console.log(err)
            })
        }
        else {
            toastId.current = toast.error("Sign-in or create a new account to add this listing to your favourites", { autoClose: true });

        }


    }

    const removeListing = async (ID) => {

        if (user.user) {
            const docRef = doc(firebasedb, "Customers", user.user.uid);

            let list = favourited;

            var newList = list.filter((value) => value !== ID).map((id) => id);


            setFavourited(newList);

            await updateDoc(docRef, {
                Favourites: newList
            }).then((res) => {
                console.log('Done')
            }).catch((err) => {
                console.log(err)
            })
        } else {

        }

    }


    return (

        <>
            {open &&
                <div className={`justify-self-start self-center row-start-2 row-end-3 col-start-1 col-end-8 grid grid-rows-[50px,30px,50px,auto] min-h-[85vh] max-h-[85vh] min-w-[520px] overflow-y-auto bg-[#FFFFFF] z-[100] ease-in-out duration-300 `} >

                    <span className={`self-center flex py-2 mx-2 `}>

                        <span className={` mr-auto my-auto ml-4`}>
                            <p className={`text-[#263238] font-[600] font-['Montserrat',sans-serif] text-xl `}> Favourited Listings </p>
                        </span>

                        <ClearOutlinedIcon onClick={() => {
                            setOpen(!open)
                        }} className={`ml-auto hover:text-[red] text-[#07364B] cursor-pointer `} />
                    </span>

                    <span className={`self-center grid py-4 border-[#E3EFF1] border-t-2`} >

                    </span>


                    <span className={`bg-[#E3EFF1] mt-2`} >

                    </span>

                    <span className={`grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))]`}>
                        {favourited.length > 0 ? allListings.features.map((feature) => {

                            const timeStamp = feature.properties.timeStamp;

                            const timeObj = new Timestamp(timeStamp.seconds, timeStamp.nanoseconds);
                            const when = moment(timeObj.toDate()).fromNow();

                            const favouritedListing = favourited.includes(feature.id);

                            return (
                                <>
                                    {favouritedListing &&
                                        <div key={feature.id} className={`m-2 shadow-md shadow-slate-200 border-[1px] border-[#E3EFF1] w-[240px] h-[auto] rounded`}>

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
                                                                {favouritedListing ?
                                                                    <FavoriteOutlinedIcon onClick={() => {
                                                                        removeListing(feature.id);
                                                                    }} className={`row-start-1 col-start-1 justify-self-end self-start m-2 text-[#EA0670] z-10 hover:cursor-pointer `} />
                                                                    :
                                                                    <svg onClick={() => {
                                                                        addListing(feature.id)
                                                                    }} className={`row-start-1 col-start-1 justify-self-end self-start m-2 z-10 rounded-[50%] hover:cursor-pointer`}
                                                                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" data-name="Favourite Outline" id="favourite">
                                                                        <path fill="none" d="M0 0h24v24H0Z" opacity=".24">
                                                                        </path>
                                                                        <path fill="#EA0670" d="M11.994 20.696a1.407 1.407 0 0 1-.986-.41L4.08 13.359a5.712 5.712 0 0 1 7.926-8.226 5.715 5.715 0 0 1 7.918 8.241l-6.944 6.922a1.4 1.4 0 0 1-.986.4Zm-.284-1.68Zm-3.6-13.62a3.913 3.913 0 0 0-2.757 6.69L12 18.73l6.652-6.634a3.915 3.915 0 1 0-5.534-5.539l-1.112 1.116-1.12-1.12A3.9 3.9 0 0 0 8.11 5.396Z" data-name="Path 2729">
                                                                        </path>
                                                                    </svg>
                                                                }
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
                                    }
                                </>
                            )

                        }) :
                            <span className={`flex self-center justify-self-center col-start-1 col-end-3 p-2`}>
                                <span className={` mx-auto my-auto`}>
                                    <p className={`text-[#263238] font-['Montserrat',sans-serif] text-base overflow-hidden text-ellipsis whitespace-nowrap `}> You don't have any favourites </p>
                                </span>
                            </span>
                        }
                    </span>

                </div>


            }
        </>
    )
}

export default Favourites; 