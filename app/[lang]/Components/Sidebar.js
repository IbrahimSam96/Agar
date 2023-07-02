'use client'
// Nextjs
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

// React
import React, { useRef, useEffect, useState, Fragment } from 'react';

// Local Components
import { useAuth } from '@/app/[lang]/utils/Authenticator';
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



const Sidebar = ({ Listings, open, setOpen, dictionary, lang }) => {

    // Helper Function
    const readCurrencyNumber = (number) => {
        return Number(number.replace(/[^0-9.-]+/g, ""))
    }

    const [filteredListings, setFilteredListings] = useState(Listings)
    const [sortedListings, setSortedListings] = useState(filteredListings)

    // category Popup 
    const [categoryPopup, setCategoryPopup] = useState(false);
    const categoryPopupRef = useRef(null);
    // Category State
    const [category, setCategory] = useState('For Rent')

    // Price Popup 
    const [pricePopup, setPricePopup] = useState(false);
    const pricePopupRef = useRef(null);
    // More Filters 
    const [moreFilters, setMoreFilters] = useState(false);
    const [numberOfFilters, setNumberOfFilters] = useState(0);

    // Filters
    const [numberOfBedrooms, setNumberOfBedrooms] = useState(0);
    const [numberOfBathrooms, setNumberOfBathrooms] = useState(0);
    const [parking, setParking] = useState(undefined);
    const [furnished, setFurnished] = useState(undefined);

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

    // Filtering Functionality 
    useEffect(() => {

        let FiltersApplied = 0;

        if (numberOfBedrooms !== 0) {
            FiltersApplied++
        }
        if (numberOfBathrooms !== 0) {
            FiltersApplied++
        }
        if (parking !== undefined) {
            FiltersApplied++
        }
        if (furnished !== undefined) {
            FiltersApplied++
        }
        if (value[0] !== 0 || value[1] !== 100) {
            console.log("pRICE fILTER DETECTED")
            FiltersApplied++
        }
        setNumberOfFilters(FiltersApplied);

        if (FiltersApplied !== 0) {

            let propertiesToFilter = {
                bedrooms: numberOfBedrooms !== 0,
                bathrooms: numberOfBathrooms !== 0,
                parking: parking !== undefined,
                furnished: furnished !== undefined,
                price: value[0] !== 0 || value[1] !== 100
            };
            let list;

            function filterBedroom(listing) {
                if (propertiesToFilter.bedrooms) {
                    return listing.properties.bedrooms == numberOfBedrooms;
                }
                return true;
            }
            function filterBathrooms(listing) {
                if (propertiesToFilter.bathrooms) {
                    return listing.properties.bathrooms == numberOfBathrooms;
                }
                return true;
            }
            function filterParking(listing) {
                if (propertiesToFilter.parking) {
                    return listing.properties.parking == parking;
                }
                return true;
            }
            function filterFurnished(listing) {
                if (propertiesToFilter.furnished) {
                    return listing.properties.furnished == furnished;
                }
                return true;
            }
            function filterPrice(listing) {

                if (propertiesToFilter.price) {

                    console.log("Filtering for price");
                    let modifiyer = category == 'For Rent' || category == 'Rented'? 50 : 15000;

                    if (min == 0 && max != 100) {
                        return readCurrencyNumber(listing.properties.price) <= (max * modifiyer);

                    }
                    if (min > 0 && max == 100) {
                        return readCurrencyNumber(listing.properties.price) >= (min * modifiyer);
                    }
                    if (min > 0 && max < 100) {
                        return readCurrencyNumber(listing.properties.price) >= (min * modifiyer) && readCurrencyNumber(listing.properties.price) <= max * modifiyer;
                    }
                }

                return true;
            }

            list = [...filteredListings].filter(listing => {
                return filterBedroom(listing) && filterBathrooms(listing) && filterParking(listing) && filterFurnished(listing) && filterPrice(listing)
            })

            console.log(list)
            setSortedListings(list)
        }

    }, [numberOfBedrooms, numberOfBathrooms, parking, furnished, max, min, value])

    const [sort, setSort] = useState(false)

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


    function valuetext(value) {
        return `$ ${value} /Month `;
    }

    const handlePriceformat = () => {

        let multiplier = category == 'For Rent' || category == 'Rented' ? 50 : 15000;

        if (min == 0 && max == 100) {
            return `${dictionary['Sidebar'].Price['Price']}`
        }
        if (value[0] == 0 && value[1] != 100) {
            let value = new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD', minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(max * multiplier)
            return `${dictionary['Sidebar'].Price['Under']} ${value}`
        }
        if (value[0] > 0 && value[1] == 100) {
            let value = new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD', minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(min * multiplier)
            return `${dictionary['Sidebar'].Price['Above']} ${value}`
        }
        if (value[0] > 0 && value[1] < 100) {
            let valueMin = new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD', minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                // notation: 'compact',
            }).format(min * multiplier)
            let valueMax = new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD', minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                // notation: 'compact',
            }).format(max * multiplier)

            return `${dictionary['Sidebar'].Price['from']} ${valueMin} ${dictionary['Sidebar'].Price['to']} ${valueMax}`
        }
    }

    const handleMinMaxformat = (type) => {
        let multiplier = category == 'For Rent' || category == 'Rented' ? 50 : 15000;

        if (type == 'max') {
            let value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'JOD' }).format(max * multiplier)
            if (max == 100) {
                value = `${dictionary['Sidebar'].Price['Unlimited']}`
            }
            return value
        }
        if (type == 'min') {
            let value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'JOD', }).format(min * multiplier)
            return value
        }
    }


    useEffect(() => {

        if (sort) {
            let list = [...sortedListings];
            list.sort((a, b) => readCurrencyNumber(b.properties.price) - readCurrencyNumber(a.properties.price));
            console.log("list", list)
            setSortedListings(list)
        } else {
            let list = [...sortedListings];
            list.sort((a, b) => readCurrencyNumber(a.properties.price) - readCurrencyNumber(b.properties.price));
            console.log("list", list)

            setSortedListings(list)
        }

    }, [sort])

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
                            <p className={`text-[#263238] font-[600] font-['Montserrat',sans-serif] text-xl `}> {dictionary['Sidebar'].Title[`${category}`]} </p>
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

                                    <p className={`text-[#263238] text-base  inline mr-auto ml-1 ease-in-out duration-300`}> {dictionary['Sidebar'].Category[`${category}`]} </p>
                                    <svg className={`inline ${categoryPopup ? 'rotate-0 ' : 'rotate-180'} ease-in-out	duration-300 text-black ml-auto mr-1`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" color="inherit"><path fillRule="evenodd" clipRule="evenodd" d="m12 16.333-6-6L7.333 9 12 13.667 16.667 9 18 10.333l-6 6Z"
                                        fill="currentColor"></path>
                                    </svg>

                                </span>

                                <span className={`${categoryPopup ? 'grid' : 'hidden'} z-50 ml-[-10px] bg-[#FFFFFF] absolute grid-cols-[220px] shadow shadow-[#07364B] `}>

                                    {category !== 'For Rent' &&
                                        <span onClick={() => {
                                            setCategory('For Rent')
                                        }} className={`hover:opacity-80 p-3 border-b-[1px] border-slate-300`}>
                                            <p className={` whitespace-nowrap text-sm text-[#263238]`}> {dictionary['Sidebar'].Category['For Rent']} </p>
                                        </span>
                                    }
                                    {category !== 'For Sale' &&

                                        <span onClick={() => {
                                            setCategory('For Sale')
                                        }} className={`hover:opacity-80 p-3 border-b-[1px] border-slate-300`}>
                                            <p className={` whitespace-nowrap text-sm text-[#263238]`}> {dictionary['Sidebar'].Category['For Sale']}  </p>
                                        </span>
                                    }
                                    {category !== 'Rented' &&

                                        <span onClick={() => {
                                            setCategory('Rented')
                                        }} className={`hover:opacity-80 p-3 flex`}>
                                            <p className={`whitespace-nowrap text-sm text-[#263238]`}> {dictionary['Sidebar'].Category['Rented']}   </p>
                                        </span>
                                    }
                                    {category !== 'Sold' &&

                                        <span onClick={() => {
                                            setCategory('Sold')
                                        }} className={`hover:opacity-80 p-3 flex`}>
                                            <p className={` whitespace-nowrap text-sm text-[#263238]`}> {dictionary['Sidebar'].Category['Sold']}  </p>
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

                                    <p className={`text-[#263238] text-base  inline mr-auto ml-1  whitespace-nowrap`}> {handlePriceformat()} </p>
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

                                    <p className={`${moreFilters ? 'text-[white]' : 'text-[#263238]'}  text-base  inline mr-auto`}> {moreFilters ? `${dictionary['Sidebar'].Filters[`Close Filters`]}` : dictionary['Sidebar'].Filters[`More Filters`]} </p>

                                    <span className={`${numberOfFilters !== 0 ? `mr-auto text-base ${moreFilters ? `text-[white]` : `text-[#0097A7]`} ` : 'hidden'}`}>
                                        |
                                    </span>

                                    <p className={`${moreFilters ? 'text-[white]' : 'text-[#0097A7]'}  text-base  inline mr-auto ml-1`}> {numberOfFilters !== 0 && numberOfFilters}</p>

                                    <svg className={`${moreFilters ? 'hidden' : 'inline'} ease-in-out	duration-300 text-black ml-auto mr-1 `} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" color="inherit"><path fillRule="evenodd" clipRule="evenodd" d="m12 16.333-6-6L7.333 9 12 13.667 16.667 9 18 10.333l-6 6Z"
                                        fill="currentColor"></path>
                                    </svg>

                                </span>

                            </span>


                        </span>


                    </span>

                    {!moreFilters &&
                        <Fragment>

                            <span className={`bg-[#E3EFF1]`} >

                            </span>

                            <span className={`flex self-center mx-2`}>

                                <span className={`ml-2 mr-auto border-[1px] border-[grey] border-b-2 border-b-[#0097A7] p-2 w-[150px] `}>

                                    <span className={`flex mx-auto`}>
                                        <p className={`text-sm mx-auto `}>
                                            {dictionary['Listings']}
                                        </p>
                                        <p className={`text-sm font-bold mx-auto `}>
                                            {sortedListings.length}
                                        </p>
                                    </span>

                                </span>

                                <span className={`mr-2 ml-auto p-2 `}>

                                    <span onClick={() => {

                                        setSort(!sort)


                                    }} className={`flex mx-auto hover:cursor-pointer`}>
                                        <FilterListIcon sx={{ color: '#07364B' }} className={`mr-1 ease-in-out duration-300 ${sort ? 'rotate-0' : 'rotate-180'}`} />
                                        <p className={`text-sm font-bold mx-auto text-[#0097A7] my-auto`}>
                                            {dictionary['Sort']}
                                        </p>
                                    </span>

                                </span>


                            </span>

                            <span className={`grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] `}>

                                {sortedListings.map((feature) => {
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

                                                {feature.properties.urls.map((url) => {
                                                    return (
                                                        <SwiperSlide key={url}>
                                                            <Image
                                                                priority
                                                                alt={url}
                                                                src={url}
                                                                width="0"
                                                                height="0"
                                                                sizes="100vw"
                                                                className="w-full h-auto m-2 rounded select-none max-h-[120px] max-w-[220px]"

                                                            // width={220}
                                                            // height={160}
                                                            // className={`m-2 rounded select-none max-h-[120px] max-w-[220px] w-auto h-auto`}
                                                            />
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

                                            <span className={`flex mx-2`}>
                                                <p className={`text-[#263238] text-xs inline mr-auto ml-1 `}> {feature.properties.streetName} - {feature.properties.buildingNumber} </p>
                                            </span>

                                            <span className={`flex m-2`}>
                                                <p className={`text-[#263238] text-xs font-['Montserrat',sans-serif] inline mr-auto ml-1 whitespace-nowrap`}>{dictionary['Numbers'][feature.properties.bedrooms]} {dictionary['Properties']['BD']}   | {dictionary['Numbers'][feature.properties.bathrooms]} {dictionary['Properties']['BA']} | {feature.properties.parking ? dictionary['Numbers']['1'] : dictionary['Numbers']['0']} {dictionary['Properties']['Parking']}  </p>
                                                <p className={`text-[#263238] font-['Montserrat',sans-serif] text-xs font-[600] inline mr-auto ml-1 `}>  {feature.properties.area} m2  </p>
                                            </span>

                                            <span className={`flex m-2 `}>
                                                <p className={`text-[#707070] font-[500] font-['Montserrat',sans-serif] text-xs inline mr-auto ml-1  whitespace-nowrap`}> {dictionary['Properties']['Listing ID']} : {feature.properties.id}  </p>
                                            </span>

                                            <span className={`flex m-2`}>
                                                <p className={`text-[#707070] font-[500] font-['Montserrat',sans-serif] text-xs inline mr-auto ml-1 whitespace-nowrap`}> {dictionary['Properties']['Agent']}:  </p>
                                            </span>

                                        </div>
                                    )

                                })}
                            </span >

                        </Fragment>
                    }

                    {moreFilters &&
                        <Fragment >


                            <span className={`self-center grid grid-rows-1 py-2 mx-2`}>

                                <span className={`self-center justify-self-start row-start-1 col-start-1 mx-2`}>
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[rgb(36,36,36)] inline`}>
                                        Number of Bedrooms
                                    </p>
                                </span>

                                <span className={`flex self-center justify-self-end row-start-1 col-start-2 `}>
                                    <span
                                        onClick={() => { setNumberOfBedrooms(1) }}
                                        className={`${numberOfBedrooms == 1 ? `z-[-2]` : `z-10`} py-2 px-[25px] sm:px-[35.8px] border-[1px] border-[#102C3A] hover:bg-[#E4FABF] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            1
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setNumberOfBedrooms(2) }}
                                        className={`${numberOfBedrooms == 2 ? `z-[-2]` : `z-10`}  py-2 px-[25px] sm:px-[35.8px] border-[1px] border-[#102C3A] hover:bg-[#E4FABF] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            2
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setNumberOfBedrooms(3) }}
                                        className={`${numberOfBedrooms == 3 ? `z-[-2]` : `z-10`}  py-2 px-[25px] sm:px-[35.8px] border-[1px] border-[#102C3A] hover:bg-[#E4FABF] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            3
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setNumberOfBedrooms(4) }}
                                        className={`${numberOfBedrooms == 4 ? `z-[-2]` : `z-10`}  py-2 px-[25px] sm:px-[35.8px] border-[1px] border-[#102C3A] hover:bg-[#E4FABF] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            4
                                        </p>
                                    </span>


                                </span>

                                <span className={`flex self-center justify-self-end row-start-1 col-start-2 `}>
                                    <span
                                        onClick={() => { setNumberOfBedrooms(0) }}
                                        className={`transition-[margin] py-2 px-[25.5px] sm:px-[36px] ${numberOfBedrooms == 0 ? 'hidden' : numberOfBedrooms == 1 ? `mr-[177px] sm:mr-[240px]` : numberOfBedrooms == 2 ? `mr-[120.4px] sm:mr-[160px] ` : numberOfBedrooms == 3 ? `mr-[58.4px] sm:mr-[80px]` : `mr-0`}  border-[1px] border-[#102C3A]  bg-[#07364B] `}>
                                        <p className={`text-[white] text-[0.7em] font-bold inline`}>
                                            {numberOfBedrooms}

                                        </p>
                                    </span>

                                </span>

                            </span>

                            <span className={`self-center grid grid-rows-1 py-2 mx-2`}>

                                <span className={`self-center justify-self-start row-start-1 col-start-1 mx-2`}>
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[rgb(36,36,36)] inline`}>
                                        Number of Bathrooms
                                    </p>
                                </span>

                                <span className={`flex self-center justify-self-end row-start-1 col-start-2 `}>
                                    <span
                                        onClick={() => { setNumberOfBathrooms(1) }}
                                        className={`${numberOfBathrooms == 1 ? `z-[-2]` : `z-10`} py-2 px-[25px] sm:px-[35.8px] border-[1px] border-[#102C3A] hover:bg-[#E4FABF] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            1
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setNumberOfBathrooms(2) }}
                                        className={`${numberOfBathrooms == 2 ? `z-[-2]` : `z-10`}  py-2 px-[25px] sm:px-[35.8px] border-[1px] border-[#102C3A] hover:bg-[#E4FABF] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            2
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setNumberOfBathrooms(3) }}
                                        className={`${numberOfBathrooms == 3 ? `z-[-2]` : `z-10`}  py-2 px-[25px] sm:px-[35.8px] border-[1px] border-[#102C3A] hover:bg-[#E4FABF] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            3
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setNumberOfBathrooms(4) }}
                                        className={`${numberOfBathrooms == 4 ? `z-[-2]` : `z-10`}  py-2 px-[25px] sm:px-[35.8px] border-[1px] border-[#102C3A] hover:bg-[#E4FABF] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            4
                                        </p>
                                    </span>


                                </span>

                                <span className={`flex self-center justify-self-end row-start-1 col-start-2 `}>
                                    <span
                                        onClick={() => { setNumberOfBathrooms(0) }}
                                        className={`transition-[margin] py-2 px-[25.5px] sm:px-[36px]  ${numberOfBathrooms == 0 ? 'hidden' : numberOfBathrooms == 1 ? `mr-[177px] sm:mr-[240px]` : numberOfBathrooms == 2 ? `mr-[120.4px] sm:mr-[160px] ` : numberOfBathrooms == 3 ? `mr-[58.4px] sm:mr-[80px] ` : `mr-0`}  border-[1px] border-[#102C3A]  bg-[#07364B] `}>
                                        <p className={`text-[white] text-[0.7em] font-bold inline`}>
                                            {numberOfBathrooms}
                                        </p>
                                    </span>

                                </span>

                            </span>

                            <span className={`self-center grid grid-rows-1 py-2 mx-2`}>

                                <span className={`self-center justify-self-start row-start-1 col-start-1 mx-2`}>
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#263238] inline `}>
                                        Parking
                                    </p>
                                </span>

                                <span className={`flex self-center justify-self-end row-start-1 col-start-2 `}>
                                    <span
                                        onClick={() => { setParking(false) }}
                                        className={`${parking == false ? `z-[-2]` : `z-10`} py-2 px-10 sm:px-14 border-[1px] border-[#102C3A] hover:bg-[#E4FABF] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            No
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setParking(true) }}
                                        className={`${parking == true ? `z-[-2]` : `z-10`}  py-2 px-10 sm:px-14 border-[1px] border-[#102C3A] hover:bg-[#E4FABF] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            Yes
                                        </p>
                                    </span>

                                </span>

                                <span className={`flex self-center justify-self-end row-start-1 col-start-2 `}>
                                    <span
                                        onClick={() => { setParking(undefined) }}
                                        className={`py-2 px-10 sm:px-14 transition-[margin]  ${parking == undefined ? 'hidden' : parking == false ? `mr-[102px] sm:mr-[133px]` : `mr-0`} border-[1px] border-[#102C3A]  bg-[#07364B] `}>
                                        <p className={`text-[white] text-[0.7em] font-bold inline`}>
                                            {parking == false ? 'No' : 'Yes'}

                                        </p>
                                    </span>

                                </span>

                            </span>

                            <span className={`self-center grid grid-rows-1 py-2 mx-2`}>

                                <span className={`self-center justify-self-start row-start-1 col-start-1 mx-2`}>
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#263238] inline `}>
                                        Furnished
                                    </p>
                                </span>

                                <span className={`flex self-center justify-self-end row-start-1 col-start-2 `}>
                                    <span
                                        onClick={() => { setFurnished(false) }}
                                        className={`${furnished == false ? `z-[-2]` : `z-10`} py-2 px-10 sm:px-14 border-[1px] border-[#102C3A] hover:bg-[#E4FABF] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            No
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setFurnished(true) }}
                                        className={`${furnished == true ? `z-[-2]` : `z-10`}  py-2 px-10 sm:px-14 border-[1px] border-[#102C3A] hover:bg-[#E4FABF] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            Yes
                                        </p>
                                    </span>

                                </span>

                                <span className={`flex self-center justify-self-end row-start-1 col-start-2 `}>
                                    <span
                                        onClick={() => { setFurnished(undefined) }}
                                        className={`py-2 px-10 sm:px-14 transition-[margin] ${furnished == undefined ? 'hidden' : furnished == false ? `mr-[102px] sm:mr-[133px]` : `mr-0`} border-[1px] border-[#102C3A]  bg-[#07364B] `}>
                                        <p className={`text-[white] text-[0.7em] font-bold inline`}>
                                            {furnished == false ? 'No' : 'Yes'}
                                        </p>
                                    </span>

                                </span>

                            </span>

                            <span className={`flex self-center mx-2 my-4 sticky`}>

                                <span
                                    className={`my-auto ml-auto mr-0 text-[#0097A7] text-center text-sm font-[500] underline hover:cursor-pointer`}
                                    onClick={() => {
                                        // Reset Full listings 
                                        setSortedListings([...filteredListings])
                                        // setMoreFilters(false)
                                        setNumberOfFilters(0)
                                        // Reset Filters
                                        setNumberOfBedrooms(0)
                                        setNumberOfBathrooms(0)
                                        setParking(undefined)
                                        setFurnished(undefined)
                                        setValue([0, 100])
                                        setMin(0)
                                        setMax(100)
                                    }} >
                                    Clear
                                </span>

                                <span
                                    onClick={() => {
                                        setMoreFilters(false);
                                    }}
                                    className={`flex px-10 py-3 my-auto ml-auto bg-[#0097A7] opacity-100 hover:opacity-[80] border-[1px] border-[#102C3A] text-white text-center hover:cursor-pointer`}>
                                    View {sortedListings.length} Listings
                                </span>

                            </span>

                        </Fragment>
                    }
                    <span className={`bg-[#E3EFF1]`} >

                    </span>


                </div >
            }
        </>
    )
}

export default Sidebar;