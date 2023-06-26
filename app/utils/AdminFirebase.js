import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore'

const privateKey = process.env["NEXT_PUBLIC_PRIVATE_KEY"];
const projectId = "shoqaq-b1097"
const clientEmail = "firebase-adminsdk-a38yp@shoqaq-b1097.iam.gserviceaccount.com"


let app;
const apps = getApps();

if (apps.length === 0) {
    app = initializeApp({
        credential: cert({
            privateKey: privateKey.replace(/\\n/g, '\n'),
            clientEmail,
            projectId,
        }),
    });
}


export const AdminAuth = getAuth(app)
export const AdminFireStore = getFirestore(app)
