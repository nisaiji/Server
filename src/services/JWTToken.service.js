import Jwt from "jsonwebtoken";
import { config } from "../config/config.js";


const secretKey = config.accessTokenSecretKey || "ThisIsASecretKeyForJWTToken";

export  function getAccessTokenService(data){
    try {
        const token = Jwt.sign(data, secretKey,{expiresIn:'1d'});
        return token;
    } catch (error) {
        return error;
    }
}

export function generateRefreshToken(data){
    try {
        const token = Jwt.sign(data, secretKey,{expiresIn:"1y"});
        return token;
    } catch (error) {
        return error;
    }
}
