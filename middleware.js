import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

//   Admin Firebase SDK
// import { AdminAuth } from './app/utils/AdminFirebase';

// This function can be marked `async` if using `await` inside
export async function middleware(request) {

    // const readAuthStatus = async () => {
    //     try {
    //         const Cookie = cookies().get('token');
    //         // console.log(JSON.stringify(Cookies, null, 2));

    //         const token = await AdminAuth.verifyIdToken(Cookie.value);
    //         const { uid, email } = token;

    //         console.log(uid, email);

    //         if (token) {
    //             return NextResponse.redirect(new URL('/', request.url))
    //         }
    //     } catch (error) {

    //     }
    // }

    // await readAuthStatus();

}

// See "Matching Paths" below to learn more
export const config = {
    matcher: '/login/',
}