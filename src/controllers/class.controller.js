import { StatusCodes } from "http-status-codes";
import { deleteClassService,getClassWithSectionsService,getClassService, registerClassService,} from "../services/class.sevices.js";
import { checkClassExistById } from "../services/section.services.js";
import { error, success } from "../utills/responseWrapper.js";

export async function registerClassController(req, res) {
  try {
    const { name } = req.body;
    const admin = req.adminId;
    const classInfo = await getClassService({ name, admin });
    if (classInfo) {
      return res.status(StatusCodes.CONFLICT).send(error(409, "Class already exists"));
    }

    await registerClassService({ name, admin });
    return res.status(StatusCodes.OK).send(success(200, "Class registered successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function deleteClassController(req, res) {
  try {
    const classId = req.params.classId;
    const admin = req.adminId;
    const classInfo = await getClassService({_id:classId});
    if (!classInfo) {
      return res.status(StatusCodes.NOT_FOUND).send(error(400, "Class doesn't exists"));
    }

    if (classInfo["section"].length > 0) {
      return res.status(StatusCodes.NOT_ACCEPTABLE).send(error(406, "Class has sections."));
    }
    await deleteClassService({_id:classId});
    return res.status(StatusCodes.OK).send(success(200, "Class deleted successfully"));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}

export async function getClassListController(req, res) {
  try {
    const admin = req.adminId;
    const classList = await getClassWithSectionsService({ admin });
      return res.status(StatusCodes.OK).send(success(200, classList));
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
}
