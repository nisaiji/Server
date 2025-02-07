import Jwt from "jsonwebtoken";
import { config } from "../config/config.js";


const accessTokenSecretKey = config.accessTokenSecretKey || "ThisIsASecretKeyForJWTToken";
const refreshTokenSecretKey = config.refreshTokenSecretKey || "ThisIsASecretKeyForJWTToken";

export  function getAccessTokenService(data){
    try {
        const token = Jwt.sign(data, accessTokenSecretKey,{expiresIn:'4m'});
        return token;
    } catch (error) {
        return error;
    }
}

export function getRefreshTokenService(data){
    try {
        const token = Jwt.sign(data, refreshTokenSecretKey,{expiresIn:"1y"});
        return token;
    } catch (error) {
        return error;
    }
}
