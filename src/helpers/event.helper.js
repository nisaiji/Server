import { getAdminService } from "../services/admin.services.js";
import { getParentService } from "../services/parent.services.js";
import { getSuperAdminService } from "../services/superAdmin.service.js";
import { getTeacherService } from "../services/teacher.services.js";

export async function getUser(modelType, paramObj) {
  switch (modelType) {
    case "SUPERADMIN":
      return await getSuperAdminService(paramObj);
    case "ADMIN":
      return await getAdminService(paramObj);
    case "TEACHER":
      return await getTeacherService(paramObj);
    case "PARENT":
      return await getParentService(paramObj);
    default:
      return null;
  }
}

export function getReceiver(reqObj) {
  switch (reqObj.role) {
    case "SUPERADMIN":
      return ["SUPERADMIN", reqObj.superAdminId];
    case "ADMIN":
      return ["ADMIN", reqObj.adminId];
    case "TEACHER":
      return ["TEACHER", reqObj.teacherId];
    case "PARENT":
      return ["PARENT", reqObj.parentId];
    default:
      return [null, null];
  }
}
