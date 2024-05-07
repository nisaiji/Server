import { findParentById } from "../../services/parent.services.js";
import { error } from "../../utills/responseWrapper.js";

export async function parentAuthentication(req,res,next){
    try {
        const token = req.header("Authorization");
        if(!token){
            return res.send(error(404,"Authorization token is required"));
        }
        const parsedToken = token.split(" ")[1];
        const decoded = Jwt.verify(parsedToken, config.jwtSecret);
        const parent = await findParentById(decoded.parentId);
        if (!parent){
          return res.send(error(404, "parent doesn't exists"));
        }
        req.parentId = decoded.parentId;
        next();

    } catch (err) {
        return res.send(error(500,err.message));    
    }
}