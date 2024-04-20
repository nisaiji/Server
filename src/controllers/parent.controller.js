import generateAccessToken from "../services/accessToken.service.js";
import { checkParentExist, createParent, findParentByUsername } from "../services/parent.services.js";
import { checkPasswordMatch, hashPassword } from "../services/password.service.js";
import { error, success } from "../utills/responseWrapper.js";

export async function registerParentController(req,res){
    try {
        const{username, firstname, lastname,phone,email,password,address} = req.body;        
        const existingParent = await checkParentExist(username , email);
        if(existingParent && existingParent.username===username){
            return res.send(error(400 , "username already exists"));
        }
        if(existingParent && existingParent.email===email){
            return res.send(error(400 , "email already exists"));
        }
        const hashedPassword = await hashPassword(password);
        const parent = await createParent(username, firstname, lastname,phone,email,hashPassword,address);
        return res.send(success(201 , "parent registered successfully!"));
    } catch (err) {
        return res.send(error(500,err.message));      
    }
}


export async function loginParentController(req,res){
    try {
        const {username , password} = req.body;
        const parent = await findParentByUsername(username);
        if(!parent){
            return res.send(error(404 , "parent is not registered"));
        }
        const matchPassword = await checkPasswordMatch(password , parent.password);
        if(!matchPassword){
            return res.send(error(404,"incorrect password"));
        }
        const accessToken = generateAccessToken({parentId:parent["_id"]});
        return res.send(success(200, {accessToken}));
    } catch (err) {
        return res.send(error(500, err.message));    
    }
}