import { getAdminService } from "../services/admin.services.js";
import { getParentService } from "../services/parent.services.js";
import { getSuperAdminService } from "../services/superAdmin.service.js";
import { getTeacherService } from "../services/teacher.services.js";

export async function getUser(modelType, id){
  const paramObj = {_id:id, isActive:true}
  
  switch (modelType){
    case "superAdmin":
      return await getSuperAdminService(paramObj);
    case "admin":
      return await getAdminService(paramObj);
    case "teacher":
      return await getTeacherService(paramObj);
    case "parent":
      return await getParentService(paramObj);
    default:
      return null;
  }
}

export function getReceiver(reqObj){
  switch(reqObj.role){
    case "superAdmin":
      return [ "superAdmin", reqObj.superAdminId ]
    case "admin":
      return [ "admin", reqObj.adminId ]
    case "teacher":
      return [ "tacher", reqObj.teacherId ]
    case "parent":
      return [ "parent", reqObj.parentId ]
    default:
      return [null, null]
  }
}

