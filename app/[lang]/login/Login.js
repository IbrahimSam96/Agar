"use client"
// Next
import Image from 'next/image'
import { useRouter } from 'next/navigation';
// React
import { useEffect, useState } from 'react';
// Local Components
import { useAuth } from '@/app/[lang]/utils/Authenticator';

// Client Firebase SDK
import { firebaseauth, firebasedb } from '@/app/[lang]/utils/InitFirebase'
import {
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signOut, signInWithPopup, GoogleAuthProvider
} from "firebase/auth";


// MUI
import TextField from '@mui/material/TextField';
import Link from 'next/link';
import { Checkbox, FormControlLabel, IconButton, InputAdornment, OutlinedInput } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';



import GoogleButton from 'react-google-button'
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';

const Login = () => {

    const user = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log(user.user)
        // if user is connected route to '/'
        if (user.user) {
            router.push('/')
        }
    }, [user.user])

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [action, setAction] = useState("SignIn");

    const provider = new GoogleAuthProvider();

    const SignUp = (e) => {
        e.preventDefault();
        createUserWithEmailAndPassword(firebaseauth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;

                const docRef = doc(firebasedb, "Customers", user.uid);

                setDoc(docRef, {
                    uid: user.uid,
                    Favourites: []
                }, { merge: true }).then((res) => {
                    console.log(res)
                    console.log("Success")
                    // ...
                    window.location = '/';
                }).catch((err) => {
                    console.log(err)
                })
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // ..
                console.log(error)

            });

    }

    const SignIn = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(firebaseauth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                // ...
                const docRef = doc(firebasedb, "Customers", user.uid);

                setDoc(docRef, {
                    uid: user.uid,
                    Favourites: []
                }, { merge: true }).then((res) => {
                    console.log(res)
                    console.log("Success")
                    // ...
                    window.location = '/';
                }).catch((err) => {
                    console.log(err)
                })
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(error)
                if (error == 'FirebaseError: Firebase: Error (auth/wrong-password).') {
                    SignInWithGoogle()
                }
            });

    }

    const SignInWithGoogle = () => {
        signInWithPopup(firebaseauth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                const docRef = doc(firebasedb, "Customers", user.uid);

                setDoc(docRef, {
                    uid: user.uid,
                }, { merge: true }).then((res) => {
                    console.log(res)
                    console.log("Success")
                    // ...
                    window.location = '/';
                }).catch((err) => {
                    console.log(err)
                })

                // IdP data available using getAdditionalUserInfo(result)
                // ...

            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
                console.log(error)
            });
    }

    const SignOut = () => {
        signOut(firebaseauth).then(() => {
            // Sign-out successful.
            console.log("success")
        }).catch((error) => {
            console.log(error)
            // An error happened.
        });

    }

    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };



    return (
        <>
            {action == "SignIn" ?
                <div className={`max-w-[450px] mx-4 col-start-1 sm:col-start-2 col-end-8 row-start-2 self-center justify-self-start grid bg-[#FFFFFF] border-[1px] border-slate-200 rounded`}>

                    <p className={` text-xl sm:text-3xl justify-self-center p-2`}>
                        Log In
                    </p>

                    <TextField
                        autoComplete="email"
                        required
                        sx={{ margin: "10px" }}
                        id="outlined-basic"
                        label="Email"
                        variant="outlined"
                        onChange={(v) => {
                            console.log(v.target.value)
                            setEmail(v.target.value)
                        }}
                    />
                    <OutlinedInput
                        required
                        sx={{ margin: "10px" }}
                        label="Password"
                        autoComplete="current-password"
                        onChange={(v) => {
                            console.log(v.target.value)
                            setPassword(v.target.value)
                        }}

                        id="outlined-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                    <span className={`flex mx-2 p-4`}>
                        <FormControlLabel defaultChecked control={<Checkbox defaultChecked />} label="Keep me signed in" />
                        <Link className={`ml-auto `} href={'/login'}>
                            <p className={`my-3 text-[0.8em] font-medium font-serif text-[#263238] underline whitespace-nowrap `}>
                                Forgot Password?
                            </p>
                        </Link>
                    </span>

                    <span onClick={(e) => SignIn(e)} className={`text-center p-2 mx-3 self-center border-[1px] border-[#0097A7] bg-[#07364B] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                        <p className={`text-[white] text-sm font-bold`}>
                            Log In
                        </p>
                    </span>

                    <span className={`flex p-4 `} >
                        <svg width="100%" height="30" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 10 10 L 300 10" stroke="#000" />
                        </svg>

                        <p className={`text-xs mx-2 text-[#263238]`}>or</p>

                        <svg width="100%" height="30" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 10 10 L 300 10" stroke="#000" />
                        </svg>
                    </span>
                    <span className={`justify-self-center `}>
                        <GoogleButton
                            onClick={() => { SignInWithGoogle() }}
                        />

                    </span>

                    <span className={`flex justify-self-center`}>
                        <p className={` text-[0.8em] font-medium font-serif text-[#263238] p-2 justify-self-center `}>
                            {`Don't have an account?`}
                        </p>
                        <p onClick={() => {
                            setAction('SignUp');
                            setEmail("")
                            setPassword("")
                        }} className={`text-[0.8em] font-medium font-serif text-[#0097A7] p-2 underline hover:cursor-pointer`}>
                            Sign up
                        </p>
                    </span>


                </div>
                :
                <div className={`max-w-[450px] mx-4 col-start-1 sm:col-start-2 col-end-8 row-start-2 self-center justify-self-start grid bg-[#FFFFFF] border-[1px] border-slate-200 rounded`}>
                    <p className={` text-3xl justify-self-center p-2`}>
                        Create an account
                    </p>

                    <TextField
                        value={email}
                        required
                        sx={{ margin: "10px", width: "400px" }}
                        color="success"
                        id="outlined-basic"
                        label="Email"
                        variant="outlined"
                        onChange={(v) => {
                            console.log(v)
                            setEmail(v.target.value)
                        }}
                    />

                    <OutlinedInput
                        value={password}
                        required
                        sx={{ margin: "10px", width: "400px" }}
                        color="success"
                        label="Choose a password"
                        autoComplete="current-password"
                        onChange={(v) => {
                            console.log(v.target.value)
                            setPassword(v.target.value)
                        }}

                        id="outlined-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />

                    <p className={`m-3 text-[0.8em] font-medium font-serif whitespace-nowrap `}>
                        Password should be a minimum of 5 characters
                    </p>

                    <span className={`flex mx-2 p-4`}>
                        <FormControlLabel className={`mr-0`} defaultChecked control={<Checkbox defaultChecked />} />
                        <p className={`my-3 text-[0.8em] font-medium font-serif whitespace-nowrap `}>
                            Keep me signed in
                        </p>

                    </span>

                    <span onClick={(e) => { SignUp(e) }} className={`text-center p-2 mx-3 self-center border-[1px] border-[#0097A7] bg-[#07364B] hover:cursor-pointer hover:opacity-100 opacity-80`}>
                        <p className={`text-[white] text-sm font-bold`}>
                            Continue
                        </p>
                    </span>

                    <p onClick={() => {
                        setAction('SignIn');
                        setEmail("")
                        setPassword("")
                    }} className={`my-3 text-[0.8em] font-medium font-serif text-[#0097A7] underline whitespace-nowrap text-center hover:cursor-pointer `}>
                        Go back
                    </p>
                </div>
            }
        </>
    )
}

export default Login;