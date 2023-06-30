'use client'
// React
import { useEffect, useRef, useState, Fragment } from "react";
// Next 
import Image from "next/image";
// MUI 
import { Slider, TextField } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import ShowerOutlinedIcon from '@mui/icons-material/ShowerOutlined';
import CropFreeOutlinedIcon from '@mui/icons-material/CropFreeOutlined';
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined'; import LocalParkingOutlinedIcon from '@mui/icons-material/LocalParkingOutlined';
import LoopIcon from '@mui/icons-material/Loop';

// Prime React 
import { FileUpload } from 'primereact/fileupload';
// Firebase 
import { useAuth } from "../utils/Authenticator";
import { firebasedb, storage } from "../utils/InitFirebase";
// db
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, Timestamp } from "firebase/firestore";
// storage
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

// React Toastify
import { ToastContainer, toast } from 'react-toastify';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';


// Helper tools. 
import { uid } from 'uid/secure';

const Sell = ({ Governorates, docID, open, setOpen }) => {
    // Cluster Colors
    // '#07364B', // HOVER color
    // '#0097A7' // Normal color
    // '#102C3A' // HOVER HOVER color
    // Text
    // #263238 Header
    // Divider
    // #E3EFF1 

    const user = useAuth();
    // Listing type
    const [rent, setRent] = useState(true);
    // Price Slider
    const [value, setValue] = useState(0);

    const [streetName, setStreetName] = useState('');
    const [buildingNumber, setBuildingNumber] = useState('');
    const [area, setArea] = useState(0);


    // $ Price Display Setter / Formatter 
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    function valuetext(value) {
        return `$ ${value} / Month `;
    }

    const handlePriceformat = () => {
        let multiplier = rent ? 50 : 15000;

        if (value == 0) {
            return 'Price'
        }

        if (value != 0 && value != 100) {

            let Value = new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD', minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value * multiplier);


            return `${Value}`
        }
        if (value == 100) {
            let Value = new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD', minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value * multiplier);

            return `+ ${Value}`
        }
    }

    // city Popup 
    const [cityPopup, setCityPopup] = useState(false);
    const cityPopupRef = useRef(null);
    const [city, setCity] = useState(Governorates[0]);

    useEffect(() => {
        // cityPopup closer 
        const handleClickOutside = (event) => {

            if (
                cityPopup &&
                cityPopupRef.current &&
                !cityPopupRef.current.contains(event.target)
            ) {
                console.log('Clickk Out')
                setCityPopup(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [cityPopup]);

    // Unit Properties 
    const [numberOfBedrooms, setNumberOfBedrooms] = useState(1);
    const [numberOfBathrooms, setNumberOfBathrooms] = useState(1);
    const [parking, setParking] = useState(false);
    const [furnished, setFurnished] = useState(false);

    const [unitDescription, setUnitDescription] = useState('');


    // Longitude / Latitude 
    const [longitude, setLongitude] = useState('');
    const [latitude, setLatitude] = useState('');

    const [geoLocationError, setGeoLocationError] = useState(false);

    const getLocation = async () => {

        const successCallback = (position) => {
            console.log(position);
            setGeoLocationError(false)
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
        };

        const errorCallback = (error) => {
            console.log(error);
            setGeoLocationError(true);

        };


        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
        };

        navigator.geolocation.getCurrentPosition(
            successCallback,
            errorCallback,
            options
        );

    }
    // Listing Id
    const [id, setId] = useState('')
    // loader for creating listing.
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setId(uid())
    }, []);

    const fileUploadRef = useRef(null);
    // Media Uplaod
    const [mediaList, setMediaList] = useState([]);
    // Preview Listing before Creating 
    const [preview, setPreview] = useState(false);

    const toastId = useRef(null);

    useEffect(() => {

        if (fileUploadRef.current) {
            // console.log('MediaList:', mediaList)
            // console.log('fileUploadRef:', fileUploadRef.current)
            fileUploadRef.current.clear();

            fileUploadRef.current.setUploadedFiles(mediaList);
        }
    }, [mediaList, preview, open]);

    return (
        <>
            <ToastContainer />

            {open &&
                <div className={`justify-self-start self-center row-start-2 row-end-3 col-start-1 col-end-8 grid ${preview ? 'grid-rows-[50px,30px,auto,auto,auto,auto]' : 'grid-rows-[auto]'} ${preview ? 'min-h-[85vh]' : 'min-h-max'} max-h-[85vh] min-w-[520px] overflow-y-auto bg-[#FFFFFF] z-[100] ease-in-out duration-300 `} >

                    <span className={`self-center flex py-2 mx-2 `}>

                        <ClearOutlinedIcon onClick={() => {
                            setOpen(!open)
                            if (preview) {
                                setPreview(!preview)
                            }
                        }} className={`ml-auto hover:text-[red] text-[#07364B] cursor-pointer `} />

                    </span>

                    <span className={`self-center grid py-4 border-[#E3EFF1] border-t-2`} >

                    </span>

                    {!preview &&
                        <Fragment>
                            <span className={`self-center flex py-2 mx-2`}>
                                <span className={` ml-2 mr-auto flex`}>
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline font-[600] mr-auto `}>
                                        Unit Info
                                    </p>
                                </span>

                            </span>

                            <span className={`self-center grid grid-rows-1 py-2 mx-2`}>

                                <span className={`self-center justify-self-start row-start-1 col-start-1 mx-2`}>
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#263238] inline `}>
                                        Listing For
                                    </p>
                                </span>

                                <span className={`flex self-center justify-self-end row-start-1 col-start-2 `}>
                                    <span
                                        onClick={() => { setRent(true) }}
                                        className={`${rent ? `z-[-2]` : `z-10`} py-2 px-10 sm:px-14 border-[1px] border-[#102C3A] hover:bg-[#E4FABF] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            Rent
                                        </p>
                                    </span>

                                    <span
                                        onClick={() => { setRent(false) }}
                                        className={`${!rent ? `z-[-2]` : `z-10`}  py-2 px-10 sm:px-14 border-[1px] border-[#102C3A] hover:bg-[#E4FABF] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                                        <p className={`text-[#0097A7] text-[0.7em] font-bold inline`}>
                                            Sale
                                        </p>
                                    </span>

                                </span>


                                <span className={`flex self-center justify-self-end row-start-1 col-start-2 `}>
                                    <span
                                        onClick={() => { }}
                                        className={`py-2 px-10 sm:px-14 transition-[margin] 
                                ${rent ? `mr-[107px] sm:mr-[137px]` : `mr-0`}
                                border-[1px] border-[#102C3A]  bg-[#07364B] `}>
                                        <p className={`text-[white] text-[0.7em] font-bold inline`}>
                                            {rent ? 'Rent' : 'Sale'}
                                        </p>
                                    </span>

                                </span>
                            </span>

                            <span className={`self-center grid grid-rows-1 py-2 mx-2`}>

                                <span className={`self-center justify-self-start row-start-1 col-start-1 mx-2`}>
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#263238] inline `}>
                                        Price
                                    </p>
                                </span>

                                <span className={`self-center justify-self-end row-start-1 col-start-1 mr-4 `}>
                                    <Slider
                                        getAriaLabel={() => 'Price'}
                                        value={value}
                                        onChange={handleChange}
                                        valueLabelDisplay="off"
                                        getAriaValueText={valuetext}
                                        sx={{ color: '#07364B', width: '275px' }}
                                    />
                                </span>

                            </span>


                            <span className={`self-center justify-self-end mx-2 `}>
                                <p className={`text-[#263238] font-[600] font-['Montserrat',sans-serif] text-base inline `}>
                                    {handlePriceformat()}
                                </p>
                                <p className={`text-[#263238] font-['Montserrat',sans-serif] text-sm inline `}>
                                    {rent ? ` / Month` : ''}
                                </p>
                            </span>

                            <span className={`self-center grid py-4 border-[#E3EFF1] border-b-2`} >

                            </span>

                            <span className={`flex self-center py-2 mx-2`} >

                                <TextField
                                    value={streetName}
                                    // error={}
                                    autoComplete='false'
                                    required
                                    sx={{ marginRight: "10px" }}
                                    autoFocus={true}
                                    id="outlined-basic"
                                    helperText="Street Name"
                                    variant="outlined"
                                    size="small"
                                    onChange={(e) => {
                                        setStreetName(e.target.value)
                                    }}
                                />

                                <TextField
                                    value={buildingNumber}
                                    // error={}
                                    autoComplete='false'
                                    helperText='Building Number'
                                    required
                                    sx={{}}
                                    id="outlined-basic"
                                    variant="outlined"
                                    size="small"
                                    onChange={(e) => {
                                        setBuildingNumber(e.target.value)
                                    }}
                                />

                            </span>


                            <span className={`flex self-center py-2 mx-2`} >

                                <TextField
                                    value={area}
                                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}                                    // error={!area}
                                    type="number"
                                    required
                                    sx={{ marginRight: "10px" }}
                                    id="outlined-basic"
                                    helperText="Total Area (m2)"
                                    variant="outlined"
                                    size="small"
                                    onChange={(e) => {
                                        setArea(e.target.value)
                                    }}
                                />

                                <span
                                    id="cityPopup"
                                    ref={cityPopupRef}
                                    onClick={() => { setCityPopup(!cityPopup) }}
                                    className={`group mb-auto hover:cursor-not-allowed border-[1px] border-[grey] p-2 rounded opacity-25`}>

                                    <span className={`flex items-center w-[200px]`}>
                                        <p className={`text-[#263238] text-base  inline mr-auto ml-1 ease-in-out duration-300`}> {city} </p>
                                        <svg className={`inline ${cityPopup ? 'rotate-0 ' : 'rotate-180'} ease-in-out	duration-300 text-black ml-auto mr-1`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" color="inherit"><path fillRule="evenodd" clipRule="evenodd" d="m12 16.333-6-6L7.333 9 12 13.667 16.667 9 18 10.333l-6 6Z"
                                            fill="currentColor"></path>
                                        </svg>
                                    </span>

                                    <span className={` ${cityPopup ? 'grid' : 'hidden'} z-50 ml-[-10px] bg-[#FFFFFF] absolute grid-cols-[220px] max-h-[150px] overflow-y-auto shadow shadow-[#07364B] `}>
                                        {Governorates.map((governorate) => {
                                            return (
                                                <Fragment key={governorate}>
                                                    {city !== governorate &&
                                                        <span key={governorate} onClick={() => {
                                                            setCity(governorate)
                                                        }} className={`hover:opacity-80 p-3 border-b-[1px] border-slate-300`}>
                                                            <p className={` whitespace-nowrap text-sm text-[#263238]`}>  {governorate} </p>
                                                        </span>
                                                    }
                                                </Fragment>
                                            )
                                        })}
                                    </span>
                                </span>

                            </span>

                            <span className={`self-center justify-self-start grid py-2 mx-2`}>
                                <span onClick={() => {
                                    getLocation()
                                }} className={`self-center justify-self-start row-start-1 col-start-1 mx-2 flex hover:cursor-pointer`}>
                                    <LocationOnOutlinedIcon sx={{ color: '#0097A7' }} />
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline font-[600] ml-1 my-auto`}>
                                        Use Current Location
                                    </p>
                                    <p className={`${geoLocationError ? 'inline' : 'hidden'} text-[red] text-sm ml-2 my-auto cursor-default`}>
                                        Please check your browser permission
                                    </p>
                                </span>
                            </span>

                            <span className={`flex self-center py-2 mx-2`} >

                                <TextField
                                    value={longitude}
                                    error={geoLocationError && !longitude}
                                    autoComplete='false'
                                    required
                                    sx={{ marginRight: "10px" }}

                                    id="outlined-basic"
                                    helperText="Longitude"
                                    variant="outlined"
                                    size="small"
                                    onChange={(e) => {
                                        setLongitude(e.target.value)
                                    }}
                                />

                                <TextField
                                    value={latitude}
                                    error={geoLocationError && !latitude}
                                    autoComplete='false'
                                    required
                                    sx={{}}
                                    id="outlined-basic"
                                    helperText="Latitude"
                                    variant="outlined"
                                    size="small"
                                    onChange={(e) => {
                                        setLatitude(e.target.value)
                                    }}
                                />

                            </span>

                            <span className={`self-center grid py-4 bg-[#E3EFF1]`} >

                            </span>

                            <span className={`self-center grid grid-rows-1 py-2 mx-2`}>
                                <span className={`self-center justify-self-start row-start-1 col-start-1 mx-2`}>
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline font-[600] `}>
                                        Unit Properties
                                    </p>
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
                                        onClick={() => { }}
                                        className={`transition-[margin] py-2 px-[25.5px] sm:px-[36px] 
    ${numberOfBathrooms == 1 ? `mr-[177px] sm:mr-[240px]` : numberOfBathrooms == 2 ? `mr-[120.4px] sm:mr-[160px] ` : numberOfBathrooms == 3 ? `mr-[58.4px] sm:mr-[80px] ` : `mr-0`} 
    border-[1px] border-[#102C3A]  bg-[#07364B] `}>
                                        <p className={`text-[white] text-[0.7em] font-bold inline`}>
                                            {numberOfBathrooms}

                                        </p>
                                    </span>

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
                                        onClick={() => { }}
                                        className={`transition-[margin] py-2 px-[25.5px] sm:px-[36px] 
    ${numberOfBedrooms == 1 ? `mr-[177px] sm:mr-[240px]` : numberOfBedrooms == 2 ? `mr-[120.4px] sm:mr-[160px] ` : numberOfBedrooms == 3 ? `mr-[58.4px] sm:mr-[80px] ` : `mr-0`} 
    border-[1px] border-[#102C3A]  bg-[#07364B] `}>
                                        <p className={`text-[white] text-[0.7em] font-bold inline`}>
                                            {numberOfBedrooms}

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
                                        onClick={() => { }}
                                        className={`py-2 px-10 sm:px-14 transition-[margin] 
                                ${parking == false ? `mr-[102px] sm:mr-[133px]` : `mr-0`}
                                border-[1px] border-[#102C3A]  bg-[#07364B] `}>
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
                                        onClick={() => { }}
                                        className={`py-2 px-10 sm:px-14 transition-[margin] 
                                ${furnished == false ? `mr-[102px] sm:mr-[133px]` : `mr-0`}
                                border-[1px] border-[#102C3A]  bg-[#07364B] `}>
                                        <p className={`text-[white] text-[0.7em] font-bold inline`}>
                                            {furnished == false ? 'No' : 'Yes'}

                                        </p>
                                    </span>

                                </span>

                            </span>

                            <span className={`self-center grid grid-rows-1 py-2 mx-2`}>

                                <TextField
                                    value={unitDescription}
                                    // error={}
                                    // required
                                    multiline
                                    rows={4}
                                    sx={{}}
                                    id="outlined-basic"
                                    label='Description (recommended) '
                                    // helperText="Unit Description "
                                    variant="outlined"
                                    size="small"
                                    onChange={(e) => {
                                        setUnitDescription(e.target.value)
                                    }}
                                />
                            </span>


                            <span className={`self-center flex py-2 mx-2`}>
                                <span className={` ml-2 mr-auto flex`}>
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline font-[600] mr-auto `}>
                                        {`Media Upload (Minimum 3 files)`}
                                    </p>
                                </span>
                            </span>

                            <span className={`self-center flex py-2 mx-2`}>
                                <FileUpload
                                    ref={fileUploadRef}
                                    className={`w-full`}
                                    name="demo[]"
                                    customUpload={true}
                                    onRemove={async (event) => {
                                        const fileToRemove = event.file;
                                        const updatedFiles = mediaList.filter(
                                            (file) => file.name !== fileToRemove.name
                                        );
                                        setMediaList(updatedFiles);
                                    }}
                                    uploadHandler={async (e) => {
                                        console.log(e)
                                        // e.files.map((image) => {
                                        //     const storageRef = ref(storage, `${id}/${image.name}`);

                                        //     uploadBytes(storageRef, image).then((snapshot) => {
                                        //         console.log('Uploaded a blob or file!');
                                        //         setMediaList((prev) => [...prev, image]);
                                        //         console.log(snapshot);

                                        //     }).catch((err) => {
                                        //         console.log('Something happened with uploading an image', err)
                                        //     })
                                        // })

                                        e.files.map((image) => {
                                            setMediaList((prev) => [...prev, image]);
                                        });


                                    }}
                                    onUpload={async (e) => {
                                        console.log('upload completed Ibra');
                                    }}
                                    multiple accept="image/*"
                                    maxFileSize={1000000}
                                    emptyTemplate={
                                        <p className="mx-auto ">
                                            Drag and drop files to here to upload.
                                        </p>
                                    }
                                />
                            </span>

                            <span className={`self-center py-4 bg-[#E3EFF1] flex`} >
                                <span onClick={async (e) => {
                                    if (!user.user) {
                                        toastId.current = toast.error("Create an account or sign-in to continue", { autoClose: true });
                                    }
                                    else if (value == 0) {
                                        toastId.current = toast.error("Price invalid, drag slider to set a price", { autoClose: true });
                                    }
                                    else if (streetName == '') {
                                        toastId.current = toast.error("Street name cannot be empty", { autoClose: true });
                                    }
                                    else if (buildingNumber == '') {
                                        toastId.current = toast.error("Building number cannot be empty", { autoClose: true });
                                    }
                                    else if (area == 0) {
                                        toastId.current = toast.error("Area cannot be empty", { autoClose: true });
                                    }
                                    else if (longitude === undefined || longitude == '') {
                                        toastId.current = toast.error("Longitude cannot be empty", { autoClose: true });
                                    }
                                    else if (latitude === undefined || latitude == '') {
                                        toastId.current = toast.error("Latitude cannot be empty", { autoClose: true });
                                    }
                                    else if (unitDescription === '' || unitDescription.length < 10) {
                                        toastId.current = toast.error("Unit Description cannot be less than 10 characters or empty", { autoClose: true });
                                    }
                                    else if (mediaList.length == 0 || mediaList.length < 3) {
                                        toastId.current = toast.error("A minimum of 3 pictures is required to upload", { autoClose: true });
                                    }
                                    else {
                                        // Every Condition satisfied
                                        // Display Preview 
                                        setPreview(true);

                                    }
                                }} className={`w-full p-4 my-auto mx-4 bg-[#07364B] border-[1px] border-[#102C3A] text-white text-center hover:cursor-pointer`}>
                                    Preview Listing
                                </span>
                            </span>
                        </Fragment>
                    }
                    {preview &&
                        <span onClick={() => {
                            console.log('hey')
                        }} className={`self-start grid shadow-md shadow-slate-500 rounded-[10px] m-2 max-w-[500px]`}>

                            <span className={`flex`}>
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
                                        {mediaList.map((feature) => {
                                            return (
                                                <SwiperSlide key={feature.objectURL}>
                                                    <Image
                                                        src={feature.objectURL}
                                                        alt={feature.name}
                                                        width={220}
                                                        height={160}
                                                        className={`m-2 rounded select-none `}
                                                    />
                                                </SwiperSlide>

                                            )
                                        })}
                                    </Swiper>
                                </div>

                                <span className={`grid ml-2 self-center flex-1`}>

                                    <span className={`flex self-center `}>
                                        <p className={`text-[#263238] text-base font-[600] font-['Montserrat',sans-serif] mr-auto`}>
                                            {handlePriceformat()}

                                        </p>
                                        <p className={`text-[#707070] text-xs ml-auto mr-2`}>
                                            Just Now
                                        </p>
                                    </span>

                                    <span className={`flex py-1 self-center overflow-x-hidden whitespace-nowrap text-ellipsis mr-2`}>
                                        <p className={`text-[#707070] text-xs font-['Montserrat',sans-serif] inline `}>
                                            {streetName} - {buildingNumber}
                                        </p>
                                    </span>

                                    <span className={`flex py-1 self-center overflow-x-hidden whitespace-nowrap text-ellipsis `}>
                                        <p className={`text-[#707070] text-xs inline font-['Montserrat',sans-serif] mr-auto `}>
                                            {numberOfBedrooms}BD | {numberOfBathrooms}BA | {parking ? 1 : 0} Parking
                                        </p>
                                        <p className={`text-[#707070] text-xs inline font-[600] mr-auto ml-2`}>
                                            {area} sqft
                                        </p>
                                    </span>

                                </span>

                            </span>

                            <span className={`bg-[#F8F8F8] flex p-2 overflow-x-hidden whitespace-nowrap text-ellipsis`}>

                                <span className={`flex mx-auto `}>
                                    <p className={`text-[#0097A7] font-['Montserrat',sans-serif] `}>
                                        {streetName} - {buildingNumber}
                                    </p>
                                    <p className={`text-[grey] font-['Montserrat',sans-serif] ml-2`}>
                                        1 Unit {rent ? 'For Rent' : 'For Sale'}
                                    </p>
                                </span>

                            </span>

                        </span>
                    }

                    {preview &&
                        <span className={`grid grid-rows-[40px,auto] self-center mx-2`}>

                            <span className={` ml-2 mr-auto flex self-center`}>
                                <p className={` text-sm sm:text-base text-[#07364B] inline font-[600] mr-auto `}>
                                    Key Facts
                                </p>
                            </span>

                            <span className={`flex self-center mx-2 `}>
                                <span className={`grid mx-2`}>
                                    <BedOutlinedIcon className={`justify-self-center text-[#07364B] font-[600]`} />
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline  `}>
                                        {numberOfBedrooms} bed
                                    </p>
                                </span>
                                <span className={`grid mx-2`}>
                                    <ShowerOutlinedIcon className={`justify-self-center text-[#07364B] font-[600]`} />
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline `}>
                                        {numberOfBathrooms} bath
                                    </p>
                                </span>
                                <span className={`grid mx-2`}>
                                    <LocalParkingOutlinedIcon className={`justify-self-center text-[#07364B] font-[600] p-1 rounded-[50%] border-[1px] border-[#07364B]`} />
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline  `}>
                                        {parking ? 1 : 0} parking
                                    </p>
                                </span>
                                <span className={`grid mx-2`}>
                                    <CropFreeOutlinedIcon className={`justify-self-center text-[#07364B] font-[600]`} />
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline `}>
                                        {area} sqft
                                    </p>
                                </span>

                                <span className={`grid mx-2`}>
                                    <ChairOutlinedIcon className={`justify-self-center text-[#07364B] font-[600]`} />
                                    <p className={` text-[0.5em] sm:text-[0.8em] text-[#07364B] inline justify-self-center`}>
                                        {furnished ? 'Furnished' : 'Not Furnished'}
                                    </p>
                                </span>

                            </span>
                        </span>
                    }

                    {preview &&
                        <span className={`grid grid-rows-[50px,auto] self-center mx-2`}>

                            <span className={`flex self-center ml-2`}>
                                <p className={` text-sm sm:text-base text-[#07364B] inline font-[600] mr-auto `}>
                                    Description
                                </p>
                            </span>

                            <span className={` ml-2 mr-auto grid overflow-y-auto max-w-[520px] max-h-[150px]`}>
                                <pre className={` text-sm sm:text-base text-[#07364B] inline mr-auto whitespace-pre-wrap `}>
                                    {unitDescription}
                                </pre>
                            </span>
                        </span>
                    }


                    {preview &&
                        <span className={` self-center flex py-2 mx-2`}>

                            <span
                                className={`flex px-8 py-3 my-auto mr-auto border-[#102C3A] hover:bg-[#E4FABF]  border-[1px]  text-[#0097A7] text-center hover:cursor-pointer`}
                                onClick={() => {
                                    setPreview(false);
                                    setLoading(false)

                                }} >
                                Edit
                            </span>
                            <span
                                className={`flex px-8 py-3 my-auto ml-auto  bg-[#07364B] hover:bg-[#102C3A] border-[1px] border-[#102C3A] text-white text-center hover:cursor-pointer`}
                                onClick={async (e) => {
                                    try {
                                        // Every Condition satisfied
                                        e.preventDefault();
                                        setLoading(true)
                                        console.log(docID);
                                        // Upload mediaList to firebase storage AND then upload data

                                        let x = mediaList.map(async (image) => {

                                            const storageRef = ref(storage, `${id}/${image.name}`);
                                            const uploadTaskSnapshot = await uploadBytes(storageRef, image)
                                            const downloadUrl = await getDownloadURL(uploadTaskSnapshot.ref)

                                            return (downloadUrl)
                                        })


                                        Promise.all((x)).then(async (res) => {

                                            console.log('completed:', res)

                                            // Create Listing - Add it to features Array using arrayUnion
                                            const docRef = doc(firebasedb, "Listings", docID);

                                            await updateDoc(docRef, {
                                                features: arrayUnion({
                                                    id: id,
                                                    type: 'Feature',
                                                    geometry: {
                                                        id: id,
                                                        type: 'Point',
                                                        coordinates: [latitude, longitude],
                                                    },
                                                    properties: {
                                                        id: id,
                                                        rent: rent,
                                                        price: new Intl.NumberFormat('en-US', {
                                                            style: 'currency', currency: 'USD', minimumFractionDigits: 0,
                                                            maximumFractionDigits: 0,
                                                        }).format(rent ? value * 50 : value * 15000),
                                                        streetName: streetName,
                                                        buildingNumber: buildingNumber,
                                                        area: area,
                                                        city: city,
                                                        bedrooms: numberOfBedrooms,
                                                        bathrooms: numberOfBathrooms,
                                                        parking: parking,
                                                        description: unitDescription,
                                                        timeStamp: Timestamp.now(),
                                                        urls: res
                                                    },
                                                })
                                            }).then((res) => {
                                                console.log('Listing Created');
                                                setOpen(!open);
                                                setPreview(!preview);
                                                setLoading(false)

                                                toastId.current = toast.success("Listing Created", { autoClose: true });
                                                // Reset State
                                                setId(uid())
                                                setRent(true)
                                                setValue(0)
                                                setStreetName('')
                                                setBuildingNumber('')
                                                setArea(0)
                                                setNumberOfBedrooms(1)
                                                setNumberOfBathrooms(1)
                                                setParking(false)
                                                setFurnished(false)
                                                setUnitDescription('')
                                                setLongitude('')
                                                setLatitude('')
                                                setMediaList([])
                                                
                                            }).catch((err) => {
                                                setLoading(false)

                                                console.log('Something went wrong with uploading ', err)
                                                toastId.current = toast.error("Something went wrong with creating the Listing. Please refresh page.", { autoClose: true });
                                            });
                                        })

                                    }
                                    catch (err) {
                                        setLoading(false)
                                        console.log(err)
                                    }

                                }}
                            >
                                {loading ? <LoopIcon className={`animate-spin text-[white] text-2xl inline mx-2`} /> : 'Confirm'}
                            </span>
                        </span>
                    }
                </div >
            }

        </>
    )
}

export default Sell; 