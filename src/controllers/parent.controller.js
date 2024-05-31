import { generateAccessToken } from "../services/JWTToken.service.js";
import {
  checkChildExist,
  checkStudentAlreadyLinkedToParent,
  createParent,
  findParentById,
  findParentByPhoneNo,
  findParentByUsername,
} from "../services/parent.services.js";
import {
  checkPasswordMatch,
  hashPassword,
} from "../services/password.service.js";
import { findStudentById } from "../services/student.service.js";
import { error, success } from "../utills/responseWrapper.js";

export async function registerParentController(req, res) {
  try {
    const studentId = req.params.studentId;
    const student = await findStudentById(studentId);
    if (!student) {
      return res.send(error(400, "student doesn't exists"));
    }
    const existingParent = await findParentByPhoneNo(req.body.phone);
    if(!existingParent){
      const parent = await createParent(req.body);
      const hashedPassword = await hashPassword("password@123");
      parent["password"] = hashedPassword;
      parent["username"] = parent._id;
      student.parent = parent._id;
      await student.save();
      await parent.save();
    }else{
      student.parent = existingParent._id;
      await student.save();
    }
    return res.send(success(201, {message:"parent registered successfully!",classId:student.classId,sectionId:student.section}));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function adminRegisterParentController(req, res) {
  try {
    // const {username,firstname,lastname,email,password,phone,address} = req.body;
    const studentId = req.params.studentId;
    const student = await findStudentById(studentId);
    if (!student) {
      return res.send(error(400, "student doesn't exists"));
    }
    const existingParent = await findParentByPhoneNo(req.body.phone);
    if(!existingParent){
      const parent = await createParent(req.body);
      const hashedPassword = await hashPassword("password@123");
      // parent["password"] = hashedPassword;
      // parent["username"] = parent._id;
      student.parent = parent._id;
      await student.save();
      await parent.save();
    }else{
      student.parent = existingParent._id;
      await student.save();
    }
    return res.send(success(201, {message:"parent registered successfully!",classId:student.classId,sectionId:student.section}));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function loginParentController(req, res) {
  try {
    const { username, password } = req.body;
    const parent = await findParentByUsername(username);
    if (!parent) {
      return res.send(error(404, "parent is not registered"));
    }
    const matchPassword = await checkPasswordMatch(password, parent.password);
    if (!matchPassword) {
      return res.send(error(404, "incorrect password"));
    }
    const accessToken = generateAccessToken({
      role: "parent",
      parentId: parent["_id"],
      children: parent["child"],
    });
    return res.send(success(200, { accessToken }));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function registerExistingParentController(req, res) {
  try {
    const studentId = req.params.studentId;
    const { parentId } = req.body;
    const parent = await findParentById(parentId);
    if (!parent) {
      return res.send(error(400, "parent doesn't exists"));
    }
    const student = await findStudentById(studentId);
    if (!student) {
      return res.send(error(400, "student doesn't exists"));
    }
    const isChildExist = checkChildExist(parent.child, studentId);
    if (isChildExist) {
      return res.send(error(400, "child already linked with parent"));
    }
    const isChildLinkedToAnotherParent =
      await checkStudentAlreadyLinkedToParent(studentId);
    if (isChildLinkedToAnotherParent) {
      return res.send(
        error(400, "child is already linked with another parent")
      );
    }

    parent.child.push(studentId);
    student.parent = parentId;
    await parent.save();
    await student.save();
    return res.send(
      success(200, "student linked with existing parent successfully")
    );
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function updateParentController(req, res) {
  try {
    const parentId = req.parentId;
    const { username, firstname, lastname, phone, email, password, address } =
      req.body;
    const parent = await findParentById(parentId);
    if (!parent) {
      return res.send(error(400, "parent doesn't exist"));
    }
    // Update parent details with new values
    if (username) {
      parent.username = username;
    }
    if (firstname) {
      parent.firstname = firstname;
    }
    if (lastname) {
      parent.lastname = lastname;
    }
    if (phone) {
      parent.phone = phone;
    }
    if (email) {
      parent.email = email;
    }
    if (password) {
      const hashedPassword = await hashPassword(password);
      parent["password"] = hashedPassword;
    }
    if (address) {
      parent.address = address;
    }

    // Save the updated parent
    await parent.save();
    return res.send(success(200, "parent details updated successfully"));
  } catch (err) {
    return res.send(error(500, err.message));
  }
}

export async function adminGetParentController(req,res){
  try {
    const phone=req.params.phone;
    const parentExist=await findParentByPhoneNo(phone)
    if(!parentExist){
      return res.send(error(404,'parent not found'))
    }
    
   return res.send(success(200,parentExist))
  } catch (err) {
    res.send(error(500,err.message))
  }
}