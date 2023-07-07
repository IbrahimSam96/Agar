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
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, Timestamp, getDocs, collection } from "firebase/firestore";
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
import Slider from '@mui/material/Slider';
import FilterListIcon from '@mui/icons-material/FilterList';
import moment from 'moment';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import { ToastContainer, toast } from 'react-toastify';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';


const Sidebar = ({ allListings, setAllListings, SharedListings, setSharedListings, open, setOpen, dictionary, Governorates, setSellOpen, sellOpen, setFavouritesSideBar, favouritesSideBar, lang }) => {

    // type:'ListingsCollection',
    // features:[{...}]

    // Helper Function
    const readCurrencyNumber = (number) => {
        return Number(number.replace(/[^0-9.-]+/g, ""))
    }

    const [sortedListings, setSortedListings] = useState(allListings);

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
    const [agent, setAgent] = useState(undefined);

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
    const [sort, setSort] = useState(false)

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
        if (agent !== undefined) {
            FiltersApplied++
        }
        if (value[0] !== 0 || value[1] !== 100) {
            console.log("pRICE fILTER DETECTED")
            FiltersApplied++
        }
        setNumberOfFilters(FiltersApplied);


        let propertiesToFilter = {
            bedrooms: numberOfBedrooms !== 0,
            bathrooms: numberOfBathrooms !== 0,
            parking: parking !== undefined,
            furnished: furnished !== undefined,
            agent: agent !== undefined,
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
        function filterAgent(listing) {
            if (propertiesToFilter.agent) {
                return listing.properties.agent == agent;
            }
            return true;
        }
        function filterPrice(listing) {

            if (propertiesToFilter.price) {

                console.log("Filtering for price");
                let modifiyer = category == 'For Rent' || category == 'Rented' ? 50 : 15000;

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
        function filterCategory(listing) {
            if (category == 'For Rent') {
                return listing.properties.rent == true;
            }
            if (category == 'Rented') {
                return listing.properties.rent == true && listing.properties.propertyStatus == 'Rented';
            }
            if (category == 'For Sale') {
                return listing.properties.rent == false;
            }
            if (category == 'Sold') {
                return listing.properties.rent == false;
            }
            return false;
        }

        list = [...allListings.features].filter(listing => {
            return filterBedroom(listing) && filterBathrooms(listing) && filterParking(listing) && filterFurnished(listing) && filterAgent(listing) && filterPrice(listing) && filterCategory(listing)
        });

        if (sort) {
            list.sort((a, b) => readCurrencyNumber(b.properties.price) - readCurrencyNumber(a.properties.price));
        } else {
            list.sort((a, b) => readCurrencyNumber(a.properties.price) - readCurrencyNumber(b.properties.price));
        }


        console.log('SortedList ', { type: "ListingsCollection", features: list });
        setSortedListings({ type: "ListingsCollection", features: list });


        setSharedListings({ type: "ListingsCollection", features: list });

    }, [numberOfBedrooms, numberOfBathrooms, parking, furnished, max, min, value, category, sort]);


    // Closes Price Modal if clicked outside. 
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

    const user = useAuth();
    const router = useRouter();

    const [favourited, setFavourited] = useState([]);
    const [runagain, setRunAgain] = useState(false);

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

            setFavourited(UserProfile['Favourites']);
        }

        // if user is authed then fetch favourited listings
        if (user.user) {
            retreiveUserProfile();
        }

    }, [user.user, runagain]);


    const addListing = async (ID) => {

        if (user.user) {
            console.log("favourited before:", favourited);

            const docRef = doc(firebasedb, "Customers", user.user.uid);

            let newList = favourited;

            newList.push(ID)

            setFavourited(newList);

            // console.log("New List :", newlist);

            await updateDoc(docRef, {
                Favourites: newList
            }).then((res) => {
                console.log('Done')
                setRunAgain(!runagain)
            }).catch((err) => {
                console.log('Couldnt upload favourited listing', err)
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
            <ToastContainer />

            {open ?
                <div className={`row-start-2 row-end-3 col-start-1 col-end-8 max-w-[80px] min-h-[85vh] mt-4 grid grid-rows-[50px,10px,70px,70px,70px,auto] bg-[#FFFFFF] z-[100]  ease-in-out duration-300  shadow-md shadow-[#707070]  ${open ? "translate-x-0 " : "translate-x-[250%]"} `} >

                    <span onClick={() => {
                        setOpen(!open)
                        if (moreFilters) {
                            setMoreFilters(false)
                        }
                    }} className={`self-center justify-self-center hover:cursor-pointer `}>
                        <ArrowForwardIosIcon sx={{ color: '#0097A7', fontSize: '35px' }}

                            className={`rounded-[50%] p-2 bg-[#F8F8F8] `} />
                    </span>

                    <span className={`border-b-[1px] border-[grey]`}>

                    </span>

                    <span onClick={() => {
                        setOpen(!open)
                        setMoreFilters(!moreFilters)
                    }} className={`grid group hover:cursor-pointer hover:bg-[#07364B] `}>
                        <svg className={`select-none w-[25px] h-[25px] self-end justify-self-center fill-[#07364B] group-hover:fill-[white] text-base`}
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" id="filter">
                            <path d="M4 10h7.09a6 6 0 0 0 11.82 0H44a1 1 0 0 0 0-2H22.91A6 6 0 0 0 11.09 8H4a1 1 0 0 0 0 2zM17 5a4 4 0 1 1-4 4A4 4 0 0 1 17 5zM44 23H36.91a6 6 0 0 0-11.82 0H4a1 1 0 0 0 0 2H25.09a6 6 0 0 0 11.82 0H44a1 1 0 0 0 0-2zM31 28a4 4 0 1 1 4-4A4 4 0 0 1 31 28zM44 38H22.91a6 6 0 0 0-11.82 0H4a1 1 0 0 0 0 2h7.09a6 6 0 0 0 11.82 0H44a1 1 0 0 0 0-2zM17 43a4 4 0 1 1 4-4A4 4 0 0 1 17 43z" data-name="Layer 15">
                            </path></svg>
                        <p className={`text-sm text-[#263238] font-['Montserrat',sans-serif] self-center justify-self-center group-hover:text-[white]`}>Filter</p>
                    </span>

                    <span onClick={() => {
                        setFavouritesSideBar(!favouritesSideBar)
                    }} className={`grid group hover:cursor-pointer hover:bg-[#07364B] `}>

                        <svg className={`select-none w-[25px] h-[25px] self-end justify-self-center text-base`}
                            xmlns="http://www.w3.org/2000/svg" width="24" height="24" data-name="Favourite Outline" id="favourite">
                            <path fill="none" d="M0 0h24v24H0Z" opacity=".24">
                            </path>
                            <path className={`group-hover:fill-[white]`} fill="#EA0670" d="M11.994 20.696a1.407 1.407 0 0 1-.986-.41L4.08 13.359a5.712 5.712 0 0 1 7.926-8.226 5.715 5.715 0 0 1 7.918 8.241l-6.944 6.922a1.4 1.4 0 0 1-.986.4Zm-.284-1.68Zm-3.6-13.62a3.913 3.913 0 0 0-2.757 6.69L12 18.73l6.652-6.634a3.915 3.915 0 1 0-5.534-5.539l-1.112 1.116-1.12-1.12A3.9 3.9 0 0 0 8.11 5.396Z" data-name="Path 2729">
                            </path>
                        </svg>
                        <p className={`text-sm text-[#EA0670] font-['Montserrat',sans-serif] self-center justify-self-center group-hover:text-[white]`}>Favourites</p>
                    </span>

                    <span onClick={() => {
                        if (user.user) {
                            setSellOpen(!sellOpen)
                        }
                        else {
                            toastId.current = toast.error("Sign-in or create a new account to create new listings ", { autoClose: true });

                        }
                    }} className={`grid group hover:cursor-pointer hover:bg-[#07364B] `}>

                        <AddOutlinedIcon className={`select-none w-[25px] h-[25px] self-end justify-self-center text-[#0097A7] group-hover:text-[white] text-base`} />

                        <p className={`text-sm text-[#263238] font-['Montserrat',sans-serif] self-center justify-self-center group-hover:text-[white]`}> Create </p>
                    </span>
                </div>
                :
                <div className={`row-start-2 row-end-3 col-start-1 col-end-8 max-w-[520px] max-h-[85vh] overflow-y-scroll grid ${!moreFilters ? `grid-rows-[60px,120px,80px,65px,auto,50px]` : `grid-rows-[60px,120px,auto,auto,auto,auto,auto,auto,120px]`}  bg-[#FFFFFF] z-[100] ease-in-out duration-300 shadow-md shadow-[#707070]`}>


                    <span className={`flex self-center mx-2 sticky top-0 bg-[#FFFFFF] z-[100]`}>

                        <span className={` mr-auto my-auto ml-4`}>
                            <p className={`text-[#263238] font-[600] font-['Montserrat',sans-serif] text-xl `}> {dictionary['Sidebar'].Title[`${category}`]} </p>
                        </span>

                        <span onClick={() => {
                            setOpen(!open)
                        }} className={`hover:cursor-pointer ml-auto my-auto `}>
                            <ArrowBackIosIcon sx={{ color: '#0097A7', fontSize: '35px', }}
                                className={`rounded-[50%] p-2 hover:bg-[#F8F8F8] border-[#263238] border-[1px]`} />
                        </span>

                    </span>

                    <span className={`border-t-[3px] border-grey grid sticky top-0 bg-[#FFFFFF] z-[100] shadow-md shadow-[#707070]`}>

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

                                        <span className={`flex py-4 px-6 border-[1px] border-[#07364B] ml-2 mr-auto w-[175px]`}>
                                            <p className={`m-auto inline text-base text-[#263238]`}>{handleMinMaxformat('min')}  </p>
                                        </span>

                                        <span className={`flex p-2 mx-auto`}>
                                            <p className={`m-auto inline text-xl text-[#0A2532]`}> -  </p>
                                        </span>


                                        <span className={`flex py-4 px-6 border-[1px] border-[#07364B] ml-auto mr-2 w-[175px]`}>
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

                            <span className={`bg-[#E3EFF1] mt-2`} >

                            </span>

                            <span className={`flex self-center mx-2`}>

                                <span className={`ml-2 mr-auto border-[1px] border-[#F8F8F8] border-b-2 border-b-[#0097A7] shadow-md shadow-[#F8F8F8] p-2 w-[150px] `}>

                                    <span className={`flex mx-auto`}>
                                        <p className={`text-sm mx-auto `}>
                                            {dictionary['Listings']}
                                        </p>
                                        <p className={`text-sm font-bold mx-auto `}>
                                            {sortedListings.features.length}
                                        </p>
                                    </span>

                                </span>

                                <span className={`mr-2 ml-auto p-2 `}>

                                    <span onClick={() => {

                                        setSort(!sort)


                                    }} className={`flex mx-auto hover:cursor-pointer`}>
                                        <FilterListIcon sx={{ color: '#0097A7' }} className={` ease-in-out duration-300 ${sort ? 'rotate-0' : 'rotate-180'}`} />
                                        <p className={`text-sm font-bold mx-auto text-[#07364B] my-auto`}>
                                            {dictionary['Sort']}
                                        </p>
                                    </span>

                                </span>

                            </span>

                            <span className={`grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))]`}>

                                {sortedListings.features.length > 0 ? sortedListings.features.map((feature) => {

                                    const timeStamp = feature.properties.timeStamp;

                                    const timeObj = new Timestamp(timeStamp.seconds, timeStamp.nanoseconds);
                                    const when = moment(timeObj.toDate()).fromNow();

                                    const favouritedListing = favourited.includes(feature.id);

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
                                                                {user.user &&
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
                                                                }
                                                                {!user.user && index < 2 &&
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
                                                                }

                                                                {!user.user && index >= 2 && <p className="justify-self-center self-center rounded select-none text-xs text-[#263238] bg-[#F8F8F8] p-4 ">Sign-in to view more!</p>}
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
                                    )

                                }) :
                                    <span className={`flex self-center justify-self-center col-start-1 col-end-3 p-2`}>
                                        <span className={` mx-auto my-auto`}>
                                            <p className={`text-[#263238] font-['Montserrat',sans-serif] text-base overflow-hidden text-ellipsis whitespace-nowrap `}> Sorry We don't have any listings </p>
                                        </span>
                                    </span>
                                }
                            </span >

                        </Fragment>
                    }

                    {moreFilters &&
                        <Fragment >

                            <span className={`self-center grid mx-2`}>

                                <span className={`flex p-3 border-b-[1px] border-slate-300`}>
                                    <p className={`text-sm mr-auto ml-2 my-auto text-[rgb(36,36,36)] inline`}>
                                        Price
                                    </p>

                                    <Slider
                                        getAriaLabel={() => 'Price range'}
                                        disableSwap
                                        size='small'
                                        value={value}
                                        onChange={handleChange}
                                        valueLabelDisplay="off"
                                        getAriaValueText={valuetext}
                                        sx={{ color: '#07364B' }}
                                        className={`ml-8 mr-8 my-auto`}
                                    />
                                </span>

                                <span className={`flex self-center`}>

                                    <p className={`m-auto inline text-base text-[#263238]`}>{handleMinMaxformat('min')}  </p>

                                    <span className={`flex p-2 mx-auto`}>
                                        <p className={`m-auto inline text-xl text-[#0A2532]`}> -  </p>
                                    </span>

                                    <p className={`m-auto text-base text-[#263238]`}> {handleMinMaxformat('max')}  </p>
                                </span>

                            </span>
                            <span className={`self-center grid grid-rows-1 py-2 mx-2`}>

                                <span className={`self-center justify-self-start row-start-1 col-start-1 mx-2`}>
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[rgb(36,36,36)] inline`}>
                                        Number of Bedrooms
                                    </p>
                                </span>

                                <span className={`flex self-center justify-self-end row-start-1 col-start-2 `}>
                                    <span
                                        onClick={() => { setNumberOfBedrooms(1) }}
                                        className={`${numberOfBedrooms == 1 ? `z-[-2]` : `z-10`} py-2 px-[25px] sm:px-[35.8px] border-[1px] border-[#102C3A] hover:bg-[#F8F8F8] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            1
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setNumberOfBedrooms(2) }}
                                        className={`${numberOfBedrooms == 2 ? `z-[-2]` : `z-10`}  py-2 px-[25px] sm:px-[35.8px] border-[1px] border-[#102C3A] hover:bg-[#F8F8F8] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            2
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setNumberOfBedrooms(3) }}
                                        className={`${numberOfBedrooms == 3 ? `z-[-2]` : `z-10`}  py-2 px-[25px] sm:px-[35.8px] border-[1px] border-[#102C3A] hover:bg-[#F8F8F8] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            3
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setNumberOfBedrooms(4) }}
                                        className={`${numberOfBedrooms == 4 ? `z-[-2]` : `z-10`}  py-2 px-[25px] sm:px-[35.8px] border-[1px] border-[#102C3A] hover:bg-[#F8F8F8] hover:cursor-pointer hover:opacity-100 opacity-80`}>
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
                                        className={`${numberOfBathrooms == 1 ? `z-[-2]` : `z-10`} py-2 px-[25px] sm:px-[35.8px] border-[1px] border-[#102C3A] hover:bg-[#F8F8F8] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            1
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setNumberOfBathrooms(2) }}
                                        className={`${numberOfBathrooms == 2 ? `z-[-2]` : `z-10`}  py-2 px-[25px] sm:px-[35.8px] border-[1px] border-[#102C3A] hover:bg-[#F8F8F8] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            2
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setNumberOfBathrooms(3) }}
                                        className={`${numberOfBathrooms == 3 ? `z-[-2]` : `z-10`}  py-2 px-[25px] sm:px-[35.8px] border-[1px] border-[#102C3A] hover:bg-[#F8F8F8] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            3
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setNumberOfBathrooms(4) }}
                                        className={`${numberOfBathrooms == 4 ? `z-[-2]` : `z-10`}  py-2 px-[25px] sm:px-[35.8px] border-[1px] border-[#102C3A] hover:bg-[#F8F8F8] hover:cursor-pointer hover:opacity-100 opacity-80`}>
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
                                        className={`${parking == false ? `z-[-2]` : `z-10`} py-2 px-10 sm:px-14 border-[1px] border-[#102C3A] hover:bg-[#F8F8F8] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            No
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setParking(true) }}
                                        className={`${parking == true ? `z-[-2]` : `z-10`}  py-2 px-10 sm:px-14 border-[1px] border-[#102C3A] hover:bg-[#F8F8F8] hover:cursor-pointer hover:opacity-100 opacity-80`}>
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
                                        className={`${furnished == false ? `z-[-2]` : `z-10`} py-2 px-10 sm:px-14 border-[1px] border-[#102C3A] hover:bg-[#F8F8F8] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            No
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setFurnished(true) }}
                                        className={`${furnished == true ? `z-[-2]` : `z-10`}  py-2 px-10 sm:px-14 border-[1px] border-[#102C3A] hover:bg-[#F8F8F8] hover:cursor-pointer hover:opacity-100 opacity-80`}>
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

                            <span className={`self-center grid grid-rows-1 py-2 mx-2`}>

                                <span className={`self-center justify-self-start row-start-1 col-start-1 mx-2`}>
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#263238] inline `}>
                                        Agent
                                    </p>
                                </span>

                                <span className={`flex self-center justify-self-end row-start-1 col-start-2 `}>
                                    <span
                                        onClick={() => { setAgent(false) }}
                                        className={`${agent == false ? `z-[-2]` : `z-10`} py-2 px-10 sm:px-14 border-[1px] border-[#102C3A] hover:bg-[#F8F8F8] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            No
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setAgent(true) }}
                                        className={`${agent == true ? `z-[-2]` : `z-10`}  py-2 px-10 sm:px-14 border-[1px] border-[#102C3A] hover:bg-[#F8F8F8] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            Yes
                                        </p>
                                    </span>

                                </span>

                                <span className={`flex self-center justify-self-end row-start-1 col-start-2 `}>
                                    <span
                                        onClick={() => { setAgent(undefined) }}
                                        className={`py-2 px-10 sm:px-14 transition-[margin] ${agent == undefined ? 'hidden' : agent == false ? `mr-[102px] sm:mr-[133px]` : `mr-0`} border-[1px] border-[#102C3A]  bg-[#07364B] `}>
                                        <p className={`text-[white] text-[0.7em] font-bold inline`}>
                                            {agent == false ? 'No' : 'Yes'}
                                        </p>
                                    </span>

                                </span>

                            </span>

                            <span className={`flex self-center mx-2 my-4 sticky`}>

                                <span
                                    className={`my-auto ml-auto mr-0 text-[#0097A7] text-center text-sm font-[500] underline hover:cursor-pointer`}
                                    onClick={() => {
                                        // Reset Full listings 
                                        setSortedListings(allListings)
                                        // setMoreFilters(false)
                                        setNumberOfFilters(0)
                                        // Reset Filters
                                        setNumberOfBedrooms(0)
                                        setNumberOfBathrooms(0)
                                        setParking(undefined)
                                        setFurnished(undefined)
                                        setAgent(undefined)
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
                                    View {sortedListings.features.length} Listings
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