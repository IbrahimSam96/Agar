'use client'
// Nextjs
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

// React
import React, { useRef, useEffect, useState } from 'react';

// Local Components
import { useAuth } from '@/app/utils/Authenticator';
// Firebase
import { firebasedb, storage } from "../utils/InitFirebase";
// db
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
// storage
import { getStorage, ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

// MUI Components
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import TuneIcon from '@mui/icons-material/Tune';
import Slider from '@mui/material/Slider';
import FilterListIcon from '@mui/icons-material/FilterList';

const Sidebar = ({ Listings, open, setOpen }) => {

    // category Popup 
    const [categoryPopup, setCategoryPopup] = useState(false);
    const categoryPopupRef = useRef(null);
    // Price Popup 
    const [pricePopup, setPricePopup] = useState(false);
    const pricePopupRef = useRef(null);
    // More Filters 
    const [moreFilters, setMoreFilters] = useState(false);


    useEffect(() => {
        // Pricepopup and categoryPopup closer 
        const handleClickOutside = (event) => {
            if (
                pricePopup &&
                pricePopupRef.current &&
                !pricePopupRef.current.contains(event.target)
            ) {
                setPricePopup(false);
            }
            if (
                categoryPopup &&
                categoryPopupRef.current &&
                !categoryPopupRef.current.contains(event.target)
            ) {
                setCategoryPopup(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [pricePopup, categoryPopup]);
    // Category
    const [category, setCategory] = useState('For Rent')

    // Price
    const [value, setValue] = React.useState([0, 100]);
    const [min, setMin] = React.useState(0);
    const [max, setMax] = React.useState(100);

    const handleChange = (event, newValue) => {
        console.log(newValue)
        setValue(newValue);
        let min = newValue[0];
        let max = newValue[1];

        setMin(min)
        setMax(max)
    };
    function valuetext(value) {
        return `$ ${value} /Month `;
    }

    const handlePriceformat = () => {
        if (min == 0 && max == 100) {
            return 'Price'
        }
        if (value[0] == 0 && value[1] != 100) {
            let value = new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD', minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(max * 50)
            return `Under ${value}`
        }
        if (value[0] > 0 && value[1] == 100) {
            let value = new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD', minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(min * 50)
            return `Over ${value}`
        }
        if (value[0] > 0 && value[1] < 100) {
            let valueMin = new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD', minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                // notation: 'compact',
            }).format(min * 50)
            let valueMax = new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD', minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                // notation: 'compact',
            }).format(max * 50)

            return ` ${valueMin} to ${valueMax}`
        }
    }

    const handleMinMaxformat = (type) => {
        if (type == 'max') {

            let value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'JOD', }).format(max * 50)
            if (max == 100) {
                value = 'Unlimited'
            }
            return value
        }
        if (type == 'min') {
            let value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'JOD', }).format(min * 50)
            return value
        }
    }

    const user = useAuth();
    const router = useRouter();


    return (
        <>
            {open ?
                <div className={`row-start-2 row-end-3 col-start-1 col-end-8 max-w-[80px] grid grid-rows-[60px,10px,50px,auto] bg-[#FFFFFF] z-[100]  ease-in-out duration-300 ${open ? "translate-x-0 " : "translate-x-[250%]"} `} >

                    <span onClick={() => {
                        setOpen(!open)
                    }} className={`self-center justify-self-center hover:cursor-pointer `}>
                        <ArrowForwardIosIcon sx={{ color: '#0097A7', fontSize: '35px' }}

                            className={`rounded-[50%] p-2 hover:bg-[lightgrey] `} />
                    </span>

                    <span className={`border-b-[1px] border-[grey]`}>

                    </span>

                    <span className={`self-center justify-self-center `}>
                        <span className={`grid hover:cursor-pointer`}>
                            <TuneIcon
                                sx={{ color: 'rgb(38, 50, 56)', fontSize: '35px' }}
                                className={`rounded-[50%] p-2`}
                            />
                            <p className={`text-sm text-[grey] font-['Montserrat',sans-serif]  `}>Filter</p>
                        </span>
                    </span>

                </div>
                :
                <div className={`row-start-2 row-end-3 col-start-1 col-end-8 max-w-[520px] max-h-[85vh] overflow-y-scroll grid grid-rows-[60px,120px,50px,65px,auto,50px] bg-[#FFFFFF] z-[100] ease-in-out duration-300`}>


                    <span className={`flex self-center mx-2 sticky top-0 bg-[#FFFFFF] z-[100]`}>

                        <span className={` mr-auto my-auto ml-4`}>
                            <p className={`text-[#263238] font-[600] font-['Montserrat',sans-serif] text-xl `}> Amman Units For Rent </p>
                        </span>

                        <span onClick={() => {
                            setOpen(!open)
                        }} className={`hover:cursor-pointer ml-auto my-auto `}>
                            <ArrowBackIosIcon sx={{ color: '#0097A7', fontSize: '35px', }}
                                className={`rounded-[50%] p-2 hover:bg-[lightgrey] border-[grey] border-[1px]`} />
                        </span>

                    </span>


                    <span className={`border-t-[3px] border-grey grid sticky top-0 bg-[#FFFFFF] z-[100]`}>

                        <span className={`flex self-center mx-2`}>

                            <span
                                id="categoryPopup"
                                ref={categoryPopupRef}
                                onClick={() => { setCategoryPopup(!categoryPopup) }}
                                className={`group ml-2 mr-auto hover:cursor-pointer border-[1px] border-[grey] p-2`}>

                                <span className={`flex items-center w-[200px]`}>

                                    <p className={`text-[#263238] text-base  inline mr-auto ml-1 ease-in-out duration-300`}> {category} </p>
                                    <svg className={`inline ${categoryPopup ? 'rotate-0 ' : 'rotate-180'} ease-in-out	duration-300 text-black ml-auto mr-1`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" color="inherit"><path fillRule="evenodd" clipRule="evenodd" d="m12 16.333-6-6L7.333 9 12 13.667 16.667 9 18 10.333l-6 6Z"
                                        fill="currentColor"></path>
                                    </svg>

                                </span>

                                <span className={`${categoryPopup ? 'grid' : 'hidden'} z-50 ml-[-10px] bg-[#FFFFFF] absolute grid-cols-[220px] shadow shadow-[#07364B] `}>

                                    {category !== 'For Rent' &&
                                        <span onClick={() => {
                                            setCategory('For Rent')
                                        }} className={`hover:opacity-80 p-3 border-b-[1px] border-slate-300`}>
                                            <p className={` whitespace-nowrap text-sm text-[#263238]`}>  For Rent </p>
                                        </span>
                                    }
                                    {category !== 'For Sale' &&

                                        <span onClick={() => {
                                            setCategory('For Sale')
                                        }} className={`hover:opacity-80 p-3 border-b-[1px] border-slate-300`}>
                                            <p className={` whitespace-nowrap text-sm text-[#263238]`}>  For Sale </p>
                                        </span>
                                    }
                                    {category !== 'Rented' &&

                                        <span onClick={() => {
                                            setCategory('Rented')
                                        }} className={`hover:opacity-80 p-3 flex`}>
                                            <p className={`whitespace-nowrap text-sm text-[#263238]`}> Rented  </p>
                                        </span>
                                    }
                                    {category !== 'Sold' &&

                                        <span onClick={() => {
                                            setCategory('Sold')
                                        }} className={`hover:opacity-80 p-3 flex`}>
                                            <p className={` whitespace-nowrap text-sm text-[#263238]`}>  Sold </p>
                                        </span>
                                    }
                                </span>
                            </span>

                            <span
                                id="pricePopup"
                                ref={pricePopupRef}
                                className={`group ml-auto mr-2  border-[1px] border-[grey] p-2`}>

                                <span onClick={() => { setPricePopup(!pricePopup) }}
                                    className={`flex items-center w-[200px] hover:cursor-pointer`}>

                                    <p className={`text-[#263238] text-base  inline mr-auto ml-1`}> {handlePriceformat()} </p>
                                    <svg className={`inline ${pricePopup ? 'rotate-0 ' : 'rotate-180'} ease-in-out	duration-300 text-black ml-auto mr-1`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" color="inherit"><path fillRule="evenodd" clipRule="evenodd" d="m12 16.333-6-6L7.333 9 12 13.667 16.667 9 18 10.333l-6 6Z"
                                        fill="currentColor"></path>
                                    </svg>

                                </span>

                                <span className={`${pricePopup ? 'grid' : 'hidden'} z-50 ml-[-280px] bg-[#FFFFFF] absolute grid-cols-[500px] shadow shadow-[#07364B] `}>

                                    <span className={`p-3 border-b-[1px] border-slate-300 mx-2`}>
                                        <Slider
                                            getAriaLabel={() => 'Price range'}
                                            disableSwap
                                            value={value}
                                            onChange={handleChange}
                                            valueLabelDisplay="off"
                                            getAriaValueText={valuetext}
                                            sx={{ color: '#07364B' }}
                                        />
                                    </span>

                                    <span className={`p-4 flex self-center`}>

                                        <span className={`flex p-4 border-[1px] border-[#07364B] ml-2 mr-auto w-[150px]`}>
                                            <p className={`m-auto inline text-base text-[#263238]`}>{handleMinMaxformat('min')}  </p>
                                        </span>

                                        <span className={`flex p-2 mx-auto`}>
                                            <p className={`m-auto inline text-xl text-[#0A2532]`}> -  </p>
                                        </span>


                                        <span className={`flex p-4 border-[1px] border-[#07364B] ml-auto mr-2 w-[150px]`}>
                                            <p className={`m-auto text-base text-[#263238]`}> {handleMinMaxformat('max')}  </p>
                                        </span>
                                    </span>

                                    <span className={`p-4 flex self-center`}>

                                        <span className={`flex p-2 ml-2 mr-auto w-[150px]`}>
                                            <p onClick={() => {
                                                setValue([0, 100])
                                                setMin(0)
                                                setMax(100)

                                                setPricePopup(false)
                                            }} className={`m-auto inline text-sm text-[#263238] hover:cursor-pointer`}> Cancel </p>

                                        </span>

                                        <span className={`flex p-2 ml-auto mr-2 w-[150px] `}>
                                            <p onClick={() => {
                                                setPricePopup(false)
                                            }} className={`m-auto text-sm text-[#0097A7] hover:cursor-pointer`}> Apply  </p>
                                        </span>
                                    </span>

                                </span>
                            </span>

                        </span>

                        <span className={`flex self-center mx-2 `}>

                            <span
                                onClick={() => { setMoreFilters(!moreFilters) }}
                                className={`group mr-auto ml-2 hover:cursor-pointer border-[1px] border-[grey] p-2 ${moreFilters ? 'bg-[#07364B] hover:opacity-80' : 'bg-transparent'} ease-in-out	duration-300  `}>

                                <span className={`flex items-center w-[200px]`}>

                                    <p className={`${moreFilters ? 'text-[white]' : 'text-[#263238]'}  text-base  inline mr-auto ml-1`}> {moreFilters ? 'Close Filters' : ' More Filters'} </p>

                                    <svg className={`${moreFilters ? 'hidden' : 'inline'} ease-in-out	duration-300 text-black ml-auto mr-1 `} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" color="inherit"><path fillRule="evenodd" clipRule="evenodd" d="m12 16.333-6-6L7.333 9 12 13.667 16.667 9 18 10.333l-6 6Z"
                                        fill="currentColor"></path>
                                    </svg>

                                </span>

                            </span>


                        </span>

                    </span>

                    <span className={`bg-[#E3EFF1]`} >

                    </span>

                    <span className={`flex self-center `}>

                        <span className={`ml-2 mr-auto border-[1px] border-[grey] border-b-2 border-b-[#0097A7] p-2 w-[150px] `}>

                            <span className={`flex mx-auto`}>
                                <p className={`text-sm mx-auto `}>
                                    Listings
                                </p>
                                <p className={`text-sm font-bold mx-auto `}>
                                    {Listings[0].features.length}
                                </p>
                            </span>

                        </span>

                        <span className={`mr-2 ml-auto p-2 `}>

                            <span className={`flex mx-auto hover:cursor-pointer`}>
                                <FilterListIcon sx={{ color: '#0097A7' }} className={`mr-2`} />
                                <p className={`text-sm font-bold mx-auto text-[#0097A7] `}>
                                    Sort
                                </p>
                            </span>

                        </span>


                    </span>

                    <span className={`grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] `}>

                        {Listings[0].features.map((feature) => {

                            // const listRef = ref(storage, `${feature.id}/`);
                            // feature.listingImages = [];
                            // // Find all images for listing.
                            // listAll(listRef)
                            //     .then((res) => {
                            //         res.items.forEach((itemRef) => {
                            //             getDownloadURL(itemRef).then((url) => {
                            //                 feature.listingImages.push(url)
                            //             })
                            //         });

                            //     }).catch((error) => {
                            //         console.log(error)
                            //         // Uh-oh, an error occurred!
                            //     });
                            // console.log(feature)
                            // console.log(feature.listingImages)

                            return (
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

                                        {[0, 0, 0].map((url) => {
                                            console.log('dsadsasaa')
                                            return (
                                                <SwiperSlide>
                                                    <Image
                                                        src={'/Building.jpg'}
                                                        width={220}
                                                        height={160}
                                                        className={`m-2 rounded select-none`}
                                                    />
                                                </SwiperSlide>
                                            )
                                        }
                                        )}
                                    </Swiper>

                                    <span className={`flex m-2`}>
                                        <p className={`text-[#263238] text-base font-[600] font-['Montserrat',sans-serif] inline mr-auto ml-1 `}> {feature.properties.price} </p>
                                    </span>

                                    <span className={`flex mx-2`}>
                                        <p className={`text-[#263238] text-xs inline mr-auto ml-1 `}> {feature.properties.description} </p>
                                    </span>

                                    <span className={`flex m-2`}>
                                        <p className={`text-[#263238] text-xs font-['Montserrat',sans-serif] inline mr-auto ml-1 `}> 1BD | 1BA | 0 Parking  </p>
                                        <p className={`text-[#263238] font-['Montserrat',sans-serif] text-xs font-[600] inline mr-auto ml-1 `}>  276 sqft  </p>
                                    </span>

                                    <span className={`flex m-2 `}>
                                        <p className={`text-[#707070] font-[500] font-['Montserrat',sans-serif] text-xs inline mr-auto ml-1 `}>Listing ID: #4543534  </p>
                                    </span>

                                    <span className={`flex m-2`}>
                                        <p className={`text-[#707070] font-[500] font-['Montserrat',sans-serif] text-xs inline mr-auto ml-1 `}>Brokerage: Samara Bros </p>
                                    </span>

                                </div>
                            )


                        })}
                        {/* <div className={`m-2 shadow-md shadow-slate-200 border-[1px] border-[#E3EFF1] w-[240px] h-[auto] rounded`}>
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
                                <SwiperSlide>
                                    <Image
                                        src="/Building.jpg"
                                        alt="Building"
                                        width={220}
                                        height={160}
                                        className={`m-2 rounded select-none`}
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <Image
                                        src="/Building.jpg"
                                        alt="Building"
                                        width={220}
                                        height={160}
                                        className={`m-2 rounded select-none`}
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <Image
                                        src="/Building.jpg"
                                        alt="Building"
                                        width={220}
                                        height={160}
                                        className={`m-2 rounded select-none`}
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <Image
                                        src="/Building.jpg"
                                        alt="Building"
                                        width={220}
                                        height={160}
                                        className={`m-2 rounded select-none`}
                                    />
                                </SwiperSlide>
                            </Swiper>

                            <span className={`flex m-2`}>
                                <p className={`text-[#263238] text-base font-[600] font-['Montserrat',sans-serif] inline mr-auto ml-1 `}> $2,300 </p>
                            </span>

                            <span className={`flex mx-2`}>
                                <p className={`text-[#263238] text-xs inline mr-auto ml-1 `}> 14B - Hekmat Daragmeh St. </p>
                            </span>

                            <span className={`flex m-2`}>
                                <p className={`text-[#263238] text-xs font-['Montserrat',sans-serif] inline mr-auto ml-1 `}> 1BD | 1BA | 0 Parking  </p>
                                <p className={`text-[#263238] font-['Montserrat',sans-serif] text-xs font-[600] inline mr-auto ml-1 `}>  276 sqft  </p>
                            </span>

                            <span className={`flex m-2 `}>
                                <p className={`text-[#707070] font-[500] font-['Montserrat',sans-serif] text-xs inline mr-auto ml-1 `}>Listing ID: #4543534  </p>
                            </span>

                            <span className={`flex m-2`}>
                                <p className={`text-[#707070] font-[500] font-['Montserrat',sans-serif] text-xs inline mr-auto ml-1 `}>Brokerage: Samara Bros </p>
                            </span>

                        </div>

                        <div className={`m-2 shadow-md shadow-slate-200 border-[1px] border-[#E3EFF1] w-[240px] h-[auto] rounded`}>
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
                                <SwiperSlide>
                                    <Image
                                        src="/Building.jpg"
                                        alt="Building"
                                        width={220}
                                        height={160}
                                        className={`m-2 rounded select-none`}
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <Image
                                        src="/Building.jpg"
                                        alt="Building"
                                        width={220}
                                        height={160}
                                        className={`m-2 rounded select-none`}
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <Image
                                        src="/Building.jpg"
                                        alt="Building"
                                        width={220}
                                        height={160}
                                        className={`m-2 rounded select-none`}
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <Image
                                        src="/Building.jpg"
                                        alt="Building"
                                        width={220}
                                        height={160}
                                        className={`m-2 rounded select-none`}
                                    />
                                </SwiperSlide>
                            </Swiper>

                            <span className={`flex m-2`}>
                                <p className={`text-[#263238] text-base font-[600] font-['Montserrat',sans-serif] inline mr-auto ml-1 `}> $2,300 </p>
                            </span>

                            <span className={`flex mx-2`}>
                                <p className={`text-[#263238] text-xs inline mr-auto ml-1 `}> 14B - Hekmat Daragmeh St. </p>
                            </span>

                            <span className={`flex m-2`}>
                                <p className={`text-[#263238] text-xs font-['Montserrat',sans-serif] inline mr-auto ml-1 `}> 1BD | 1BA | 0 Parking  </p>
                                <p className={`text-[#263238] font-['Montserrat',sans-serif] text-xs font-[600] inline mr-auto ml-1 `}>  276 sqft  </p>
                            </span>

                            <span className={`flex m-2 `}>
                                <p className={`text-[#707070] font-[500] font-['Montserrat',sans-serif] text-xs inline mr-auto ml-1 `}>Listing ID: #4543534  </p>
                            </span>

                            <span className={`flex m-2`}>
                                <p className={`text-[#707070] font-[500] font-['Montserrat',sans-serif] text-xs inline mr-auto ml-1 `}>Brokerage: Samara Bros </p>
                            </span>

                        </div>

                        <div className={`m-2 shadow-md shadow-slate-200 border-[1px] border-[#E3EFF1] w-[240px] h-[auto] rounded`}>
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
                                <SwiperSlide>
                                    <Image
                                        src="/Building.jpg"
                                        alt="Building"
                                        width={220}
                                        height={160}
                                        className={`m-2 rounded select-none`}
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <Image
                                        src="/Building.jpg"
                                        alt="Building"
                                        width={220}
                                        height={160}
                                        className={`m-2 rounded select-none`}
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <Image
                                        src="/Building.jpg"
                                        alt="Building"
                                        width={220}
                                        height={160}
                                        className={`m-2 rounded select-none`}
                                    />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <Image
                                        src="/Building.jpg"
                                        alt="Building"
                                        width={220}
                                        height={160}
                                        className={`m-2 rounded select-none`}
                                    />
                                </SwiperSlide>
                            </Swiper>

                            <span className={`flex m-2`}>
                                <p className={`text-[#263238] text-base font-[600] font-['Montserrat',sans-serif] inline mr-auto ml-1 `}> $2,300 </p>
                            </span>

                            <span className={`flex mx-2`}>
                                <p className={`text-[#263238] text-xs inline mr-auto ml-1 `}> 14B - Hekmat Daragmeh St. </p>
                            </span>

                            <span className={`flex m-2`}>
                                <p className={`text-[#263238] text-xs font-['Montserrat',sans-serif] inline mr-auto ml-1 `}> 1BD | 1BA | 0 Parking  </p>
                                <p className={`text-[#263238] font-['Montserrat',sans-serif] text-xs font-[600] inline mr-auto ml-1 `}>  276 sqft  </p>
                            </span>

                            <span className={`flex m-2 `}>
                                <p className={`text-[#707070] font-[500] font-['Montserrat',sans-serif] text-xs inline mr-auto ml-1 `}>Listing ID: #4543534  </p>
                            </span>

                            <span className={`flex m-2`}>
                                <p className={`text-[#707070] font-[500] font-['Montserrat',sans-serif] text-xs inline mr-auto ml-1 `}>Brokerage: Samara Bros </p>
                            </span>

                        </div> */}

                    </span >

                    <span className={`bg-[#E3EFF1]`} >

                    </span>
                </div >
            }
        </>
    )
}

export default Sidebar;