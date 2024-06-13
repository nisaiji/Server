import {
  checkClassExists,
  deleteClass,
  getClassList,
  registerClass,
} from "../services/class.sevices.js";
import { checkClassExistById } from "../services/section.services.js";
import { error, success } from "../utills/responseWrapper.js";

export async function registerClassController(req, res) {
  try {
    // console.log("register class controller called");
    const { name } = req.body;
    const adminId = req.adminId;
    const existClass = await checkClassExists({ name, adminId });
    if (existClass) {
      return res.send(error(400, "class already exists"));
    }

    const registeredClass = await registerClass({ name, adminId });

    if (registerClass instanceof Error) {
      return res.send(error(400, "can't register class"));
    }

    return res.send(success(200, "class registered successfully!"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function deleteClassController(req, res) {
  try {
    const classId = req.params.classId;
    const adminId = req.adminId;
    const existingClass =await checkClassExistById(classId);
    if (!existingClass) {
      return res.send(error(400, "class doesn't exists"));
    }

    if (existingClass["section"].length > 0) {
      return res.send(error(400, "can't delete class, there are sections."));
    }
    // console.log(existingClass);
    const deletedClass = await deleteClass(classId);
    // console.log(existingClass);
    return res.send(success(200, "class deleted successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function getClassListController(req, res) {
  try {
    const adminId = req.adminId;
    const classlist = await getClassList(adminId);
    if (classlist instanceof Error) {
      return res.send(error(400, "can't get list of class"));
    }
    // console.log(classlist);
    return res.send(success(200, classlist));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
