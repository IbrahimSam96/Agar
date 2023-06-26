'use client'

import { useEffect, useRef, useState } from "react";
import { Slider, TextField } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
// Prime React 
import { FileUpload } from 'primereact/fileupload';
import { useAuth } from "../utils/Authenticator";
import { firebasedb } from "../utils/InitFirebase";

// Helper tools. 
// import { uid } from 'uid/secure';

const Sell = ({ Governorates, docID }) => {

    const user = useAuth();

    const [open, setOpen] = useState(true);

    // Sell Modal State
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
    const [unitDescription, setUnitDescription] = useState('');


    // Latitude / Longitude
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);

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



    return (
        <>
            {open &&
                <div className={`justify-self-start self-center row-start-2 row-end-3 col-start-1 col-end-8 grid grid-rows-[auto] max-h-[85vh] min-w-[520px] overflow-y-auto bg-[#FFFFFF] z-[100] ease-in-out duration-300 `} >

                    <span className={`self-center flex py-2 mx-2 `}>

                        <ClearOutlinedIcon onClick={() => {
                            setOpen(!open)
                        }} className={`ml-auto hover:text-[red] text-[#07364B] cursor-pointer `} />

                    </span>

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
                            autoComplete={false}
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
                            autoComplete={false}
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
                            // error={!area}
                            type='number'
                            required
                            sx={{ marginRight: "10px" }}
                            id="outlined-basic"
                            helperText="Total Area (sqft)"
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
                            className={`group mb-auto hover:cursor-pointer border-[1px] border-[grey] p-2 rounded`}>

                            <span className={`flex items-center w-[200px]`}>
                                <p className={`text-[#263238] text-base  inline mr-auto ml-1 ease-in-out duration-300`}> {city} </p>
                                <svg className={`inline ${cityPopup ? 'rotate-0 ' : 'rotate-180'} ease-in-out	duration-300 text-black ml-auto mr-1`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" color="inherit"><path fillRule="evenodd" clipRule="evenodd" d="m12 16.333-6-6L7.333 9 12 13.667 16.667 9 18 10.333l-6 6Z"
                                    fill="currentColor"></path>
                                </svg>
                            </span>

                            <span className={` ${cityPopup ? 'grid' : 'hidden'} z-50 ml-[-10px] bg-[#FFFFFF] absolute grid-cols-[220px] max-h-[150px] overflow-y-auto shadow shadow-[#07364B] `}>
                                {Governorates.map((governorate) => {
                                    return (
                                        <>
                                            {city !== governorate &&
                                                <span onClick={() => {
                                                    setCity(governorate)
                                                }} className={`hover:opacity-80 p-3 border-b-[1px] border-slate-300`}>
                                                    <p className={` whitespace-nowrap text-sm text-[#263238]`}>  {governorate} </p>
                                                </span>
                                            }
                                        </>
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
                            value={latitude}
                            error={geoLocationError && !latitude}
                            required
                            sx={{ marginRight: "10px" }}
                            id="outlined-basic"
                            helperText="Latitude"
                            variant="outlined"
                            size="small"
                            onChange={(e) => {
                                setLatitude(e.target.value)
                            }}
                        />

                        <TextField
                            value={longitude}
                            error={geoLocationError && !longitude}
                            required
                            sx={{}}
                            id="outlined-basic"
                            helperText="Longitude"
                            variant="outlined"
                            size="small"
                            onChange={(e) => {
                                setLongitude(e.target.value)
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
                                Media Upload
                            </p>
                        </span>

                    </span>

                    <span className={`self-center flex py-2 mx-2`}>
                        <FileUpload
                            className={`w-full`}
                            name="demo[]"
                            customUpload={true}
                            uploadHandler={async (e) => {
                                console.log(e)
                                console.log(user.user.uid)
                                console.log(docID)

                                const docRef = doc(firebasedb, "Listings", docID);

                                await updateDoc(docRef, {
                                    address: `${address},${address2},${city},${postalCode}`,
                                    name: `${firstName} ${lastName}`,
                                    phone: phone,
                                },
                                );

                            }}
                            onUpload={(e) => {
                                console.log('upload completed Ibra');

                            }}
                            multiple accept="image/*"
                            maxFileSize={1000000000}
                            emptyTemplate={
                                <p className="mx-auto ">
                                    Drag and drop files to here to upload.
                                </p>
                            }
                        />
                    </span>
                </div>
            }

        </>
    )
}

export default Sell; 