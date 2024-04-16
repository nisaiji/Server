import {
  checkCordinatorExist,
  createCordinator,
  findCordinatorByUsername
} from "../services/cordinator.services.js";
import generateAccessToken from "../services/generateAccessToken.js";
import { error, success } from "../utills/responseWrapper.js";

export async function cordinatorRegister(req, res) {
  try {
    const { username, firstname, lastname, email, password, phone } = req.body;
    if (!username || !firstname || !lastname || !email || !password || !phone) {
      return res.send(error(400, "all fields are required!"));
    }
    const existingCordinator = await checkCordinatorExist(username, email);
    if (existingCordinator && existingCordinator?.username === username) {
      return res.send(error(400, "admin name already exist"));
    }
    if (existingCordinator && existingCordinator?.email === email) {
      return res.send(error(400, "email already exist"));
    }
    const hashedPassword = await bcrypt.hash(password, 11);

    const cordinator = await createCordinator(
      username,
      firstname,
      lastname,
      email,
      password,
      phone
    );
    return res.send(success(201, "cordinator registered successfully!"));
  } catch (err) {
    return error(500, err.message);
  }
}

export async function loginController(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.send(error(400, "all fields are required!"));
    }

    const cordinator = await findCordinatorByUsername(username);
    if (!cordinator) {
      return res.send(error(404, "cordinator is not registered"));
    }
    const matchPassword = await bcrypt.compare(password, cordinator.password);
    if (!matchPassword) {
      return res.send(error(404, "incorrect password"));
    }
    const accessToken = generateAccessToken({ ...cordinator });
    return res.send(success(200, { accessToken }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}
