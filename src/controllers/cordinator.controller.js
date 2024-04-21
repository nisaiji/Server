import {  checkCordinatorExist,  createCordinator,  findCordinatorByUsername} from "../services/cordinator.services.js";
import generateAccessToken from "../services/accessToken.service.js";
import {  checkPasswordMatch,  hashPassword} from "../services/password.service.js";
import { error, success } from "../utills/responseWrapper.js";

export async function loginController(req, res) {
  try {
    const { username, password } = req.body;

    const cordinator = await findCordinatorByUsername(username);
    if (!cordinator) {
      return res.send(error(404, "cordinator is not registered"));
    }
    const matchPassword = await checkPasswordMatch(
      password,
      cordinator.password
    );
    console.log(matchPassword);
    if (!matchPassword) {
      return res.send(error(404, "incorrect password"));
    }
    const accessToken = generateAccessToken({
      cordinatorId: cordinator["_id"]
    });
    return res.send(success(200, { accessToken }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
