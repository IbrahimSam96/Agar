'use client'
// Nextjs React
import Image from "next/image";
import { Fragment, useState } from "react";
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

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';

import { Timestamp } from "firebase/firestore";
import moment from "moment";


import { useAuth } from "../../utils/Authenticator";

const ListingClientPage = ({ Listings, params, feature }) => {

    const user = useAuth();

    // Cluster Colors
    // '#07364B', // HOVER color
    // '#0097A7' // Normal color
    // '#102C3A' // HOVER HOVER color
    // '#E5F4F6' // LIGHT Normal Color
    // Text
    // #263238 Header
    // Divider
    // #E3EFF1 
    console.log(feature)
    const timeStamp = feature.properties.timeStamp;

    const timeObj = new Timestamp(timeStamp.seconds, timeStamp.nanoseconds);
    const when = moment(timeObj.toDate()).fromNow();

    const [show, setShow] = useState(true);


    return (
        <>
            <NavBar />

            <div className={`grid grid-rows-[100px,auto,100px] row-start-2 row-end-3 col-start-1 col-end-8 mx-12  min-h-[85vh]`}>

                <span className={`self-center grid`}>

                    <p className={`text-base text-[#263238] font-['Montserrat',sans-serif] self-center justify-self-start `}>{feature.properties.streetName} - {feature.properties.buildingNumber} </p>
                    <p className={`text-sm text-[#0097A7] underline font-['Montserrat',sans-serif] self-center justify-self-start `}> {feature.properties.city} </p>

                    {show && <p onClick={() => { setShow(!show) }} className={`text-base text-[white] self-center justify-self-end hover:cursor-pointer p-3 px-4 bg-[#102C3A] hover:bg-[#102C3A] rounded`}> Close </p>
                    }
                </span>

                {show ?
                    <div className={`m-2 shadow-md shadow-slate-200 border-[1px] border-[#E3EFF1] w-[85vw] h-[auto] rounded ease-in-out duration-300`}>

                        <Swiper modules={[Navigation, Pagination, Scrollbar, A11y]}
                            navigation={true}
                            pagination={{
                                type: "fraction",
                            }}
                            spaceBetween={50}
                            slidesPerView={1}
                            onSlideChange={() => console.log('slide change')}
                            onSwiper={(swiper) => console.log(swiper)}
                        >
                            {feature.properties.urls.map((url) => {
                                return (
                                    <SwiperSlide key={url}>
                                        <Image
                                            priority
                                            src={url}
                                            alt={url}
                                            width="0"
                                            height="0"
                                            sizes="100vw"
                                            className="w-full h-auto m-2 rounded select-none"
                                        />
                                    </SwiperSlide>

                                )
                            })}
                        </Swiper>
                    </div>
                    :
                    <span className={`flex `}>

                        <span className={`grid shadow-md shadow-[#E3EFF1]`}>

                            {feature.properties.urls.map((url, index) => {
                                return (
                                    <Fragment>
                                        {index == 0 && <Image
                                            // placeholder="blur"
                                            onClick={() => {
                                                console.log('Show on')
                                                if (user.user) {
                                                    setShow(!show)
                                                }
                                                else {

                                                }
                                            }}
                                            priority
                                            alt={url}
                                            src={url}
                                            width="0"
                                            height="0"
                                            sizes="100vw"
                                            className={`w-full h-auto m-2 select-none max-w-[650px] rounded-l`}

                                        // width={220}
                                        // height={160}
                                        // className={`m-2 rounded select-none max-h-[120px] max-w-[220px] w-auto h-auto`}
                                        />}
                                    </Fragment>
                                )
                            })}

                            <span className={`grid grid-rows-[auto,50px] self-center mx-2`}>

                                <span className={`flex self-center`}>
                                    <span className={`grid mx-2 my-auto`}>
                                        <Image className={`justify-self-center`} src={'/bed.svg'} width={30} height={30} alt="Bed" />
                                        <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline  self-center`}>
                                            {feature.properties.bedrooms} bed
                                        </p>
                                    </span>
                                    <span className={`grid mx-2 my-auto`}>
                                        <Image className={`justify-self-center`} src={'/bathtub.svg'} width={25} height={30} alt="Bathtub" />
                                        <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline self-center `}>
                                            {feature.properties.bathrooms} bath
                                        </p>
                                    </span>
                                    <span className={`grid mx-2 my-auto`}>
                                        <LocalParkingOutlinedIcon className={`justify-self-center text-[#07364B] p-1 rounded-[50%] border-[1px] border-[#07364B]`} />
                                        <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline  self-center`}>
                                            {feature.properties.parking ? 1 : 0} parking
                                        </p>
                                    </span>
                                    <span className={`grid mx-2 my-auto`}>
                                        <CropFreeOutlinedIcon className={`justify-self-center text-[#07364B] `} />
                                        <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline self-center`}>
                                            {feature.properties.area} m2
                                        </p>
                                    </span>

                                    <span className={`grid mx-2 my-auto`}>
                                        <Image className={`justify-self-center`} src={'/sofa.svg'} width={25} height={30} alt="Bathtub" />
                                        <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline justify-self-center`}>
                                            {feature.properties.furnished ? 'Furnished' : 'Not Furnished'}
                                        </p>
                                    </span>

                                </span>

                                <span className={`flex self-center `}>
                                    <p className={` text-xs text-[#07364B] bg-[#F8F8F8] p-2 inline rounded my-auto`}>
                                        {feature.properties.rent ? 'For Rent' : 'For Sale'}
                                    </p>

                                    <p className={` text-xs text-[#0097A7] bg-[#E5F4F6] inline rounded px-2 ml-4 my-auto`}>
                                        {when}
                                    </p>
                                </span>

                            </span>
                        </span>

                        <span className={`grid gap-[5px] shadow-md shadow-[#E3EFF1]`}>

                            {feature.properties.urls.map((url, index) => {
                                return (
                                    <Fragment>
                                        {index == 1 && <Image
                                            // placeholder="blur"	
                                            onClick={() => {
                                                console.log('Show on')
                                                if (user.user) {
                                                    setShow(!show)
                                                }
                                                else {

                                                }
                                            }}

                                            priority
                                            alt={url}
                                            src={url}
                                            width="0"
                                            height="0"
                                            sizes="100vw"
                                            className={`w-full h-auto m-2 rounded select-none max-w-[420px] max-h-[165px] rounded-r `}
                                        />}
                                        {index == 2 &&
                                            <span className={`grid grid-rows-1`}>
                                                <Image
                                                    // placeholder="blur"
                                                    onClick={() => {
                                                        console.log('Show on')
                                                        if (user.user) {
                                                            setShow(!show)
                                                        }
                                                        else {

                                                        }
                                                    }}

                                                    priority
                                                    alt={url}
                                                    src={url}
                                                    width="0"
                                                    height="0"
                                                    sizes="100vw"
                                                    className={`max-h-[165px] row-start-1 col-start-1 w-full h-auto m-2 rounded select-none max-w-[420px] rounded-r`}
                                                />
                                                <p className={`row-start-1 col-start-1 justify-self-end self-end text-sm text-[#F8F8F8] bg-[#000] p-2 inline rounded `}>
                                                    {feature.properties.urls.length} +
                                                </p>
                                            </span>
                                        }
                                    </Fragment>
                                )
                            })}

                            <span className={`flex self-center justify-self-end`}>
                                <p className={` text-2xl text-[#07364B] bg-[#F8F8F8] p-2 inline rounded my-auto`}>
                                    {feature.properties.price}
                                </p>
                            </span>
                        </span>

                    </span>
                }
            </div>
        </>

    )
}

export default ListingClientPage; 