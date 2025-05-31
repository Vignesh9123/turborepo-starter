import dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
dotenv.config();
import * as admin from "firebase-admin";

export const config = {
  PORT: Number(process.env.PORT || 5000),
  JWT_SECRET: String(process.env.JWT_SECRET || 'secret'),
  FIREBASE_PROJECT_ID: String(process.env.FIREBASE_PROJECT_ID ),
}

export const firebaseApp = admin.apps.length > 0 ? admin.apps[0] : admin.initializeApp({
    projectId: config.FIREBASE_PROJECT_ID,
});

export const setAndGetAccessToken = (res: Response, uid: string) => {
    const accessToken = jwt.sign({ id: uid }, config.JWT_SECRET);
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    return accessToken;
};