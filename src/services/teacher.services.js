import teacherModel from "../models/teacher.model.js";

export async function getTeacherService(paramObj) {
  try {
    const teacher = await teacherModel.findOne(paramObj);
    return teacher;
  } catch (error) {
    throw error;
  }
}

export async function getTeachersService(paramObj){
  try {
    const teachers = await teacherModel.find(paramObj);
    return teachers;
  } catch (error) {
    throw error;
  }
}

export async function registerTeacherService(data) {
  try {
    const teacher = await teacherModel.create(data);
    return teacher;
  } catch (error) {
    throw error;
  }
}

export async function getAllTeacherOfAdminService(admin) {
  try {
    // populate vs aggregation lookup
    const teachers = await teacherModel.find({admin,isActive:true}).populate({path: "section", select: { name: 1 }, populate: {path: "classId",select: { name: 1 } }}).select({password:0,admin:0});
    return teachers;
  } catch (error) {
    return error;
  }
}

export async function updateTeacherService(data) {
  try {
    const{ id, username,firstname, lastname, dob, bloodGroup, email, gender, university, degree, phone, address, photo,  password } = data;
    const teacher = await teacherModel.findById(id);
    if(username){
      teacher["username"] = username;
    }
    if(firstname){
      teacher["firstname"] = firstname;
    }
    if(lastname){
      teacher["lastname"] = lastname;
    }
    if(dob){
      teacher["dob"] = dob;
    }
    if(bloodGroup){
      teacher["bloodGroup"] = bloodGroup;
    }
    if(email){
      teacher["email"] = email;
    }
    if(gender){
      teacher["gender"] = gender;
    }
    if(university){
      teacher["university"] = university;
    }
    if(degree){
      teacher["degree"] = degree;
    }
    if(password){
      teacher["password"] = password;
    }
    if(phone){
      teacher["phone"] = phone;
    }
    if(address){
      teacher["address"] = address;
    }
    if(photo){
      teacher["photo"] = photo;
    }
    await teacher.save();
    return teacher;
  } catch (error) {
    throw error;
  }
}
