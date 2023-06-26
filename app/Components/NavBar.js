"use client"
import React, { useRef, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import { useAuth } from '@/app/utils/Authenticator';
import { firebaseauth } from '@/app/utils/InitFirebase';
import { signOut } from "firebase/auth";


import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';

const NavBar = () => {


  const user = useAuth();
  const router = useRouter();

  const SignOut = () => {
    signOut(firebaseauth).then(() => {
      // Sign-out successful.
      console.log("success")
    }).catch((error) => {
      console.log(error)
      // An error happened.
    });

  }

  return (

    <div className={`col-start-1 col-end-8 bg-[#07364B] flex sticky top-0 z-[500]`}>

      <span className={`my-auto mr-auto ml-4 flex `}>
        <LocationCityOutlinedIcon className={`mx-2 text-[#0097A7] text-[40px] my-auto`} />
        <p className={`font-mono text-white text-[30px] inline my-auto `}>
          shoqaq.jo
        </p>
      </span>


      {user.user ?
        <span className={`my-auto ml-auto flex`}>
          
          <p className={`my-auto text-base inline text-[white] mr-2 font-['Montserrat',sans-serif]`}> Sell </p>

          <span className={`border-r-[2px] border-[#0097A7] mx-2`}>

          </span>

          <span className={`my-auto ml-auto mr-4 hover:cursor-pointer group`}>
            <PersonOutlinedIcon className={`text-white text-[25px]`} />
            <p className={` text-sm inline text-white font-['Montserrat',sans-serif]`}> My Account </p>
            <svg className={`inline rotate-0 group-hover:rotate-180 ease-in-out	duration-300 text-white `} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" color="inherit"><path fillRule="evenodd" clipRule="evenodd" d="m12 16.333-6-6L7.333 9 12 13.667 16.667 9 18 10.333l-6 6Z"
              fill="currentColor"></path>
            </svg>

            <span className={`hidden ml-[-10px] z-50 group-hover:grid bg-[#07364B] absolute grid-cols-[150px] border-t-[2px] border-[#0097A7] ease-in-out	duration-300`}>

              <span onClick={() => {
                router.push('/my-account')
              }} className={`hover:bg-[#102C3A] p-4 `}>
                <p className={` whitespace-nowrap text-sm	text-white font-['Montserrat',sans-serif] `}>  My Profile </p>
              </span>

              <span onClick={() => {
                SignOut()
              }} className={`hover:bg-[#102C3A] p-4 flex`}>
                <p className={` whitespace-nowrap text-sm	text-white font-['Montserrat',sans-serif]`}>  Logout </p>
              </span>

            </span>
          </span>
        </span>
        :
        <span onClick={() => router.push('/login')} className={`my-auto ml-auto mr-4 py-2 px-8 border-[1px] border-[#0097A7]  hover:border-[2px] hover:cursor-pointer group`}>
          <p className={`text-[white] text-sm font-['Montserrat',sans-serif]`}>
            Log In
          </p>
        </span>
      }



    </div>
  )
}

export default NavBar;