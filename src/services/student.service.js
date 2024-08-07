import mongoose from "mongoose";
import attendanceModel from "../models/attendance.model.js";
import parentModel from "../models/parent.model.js";
import studentModel from "../models/student.model.js";

export async function checkStudentExist(data) {
  try {
    const { firstname, parentId } = data;
    const student = await studentModel.findOne({$or: [{ $and: [{ firstname }, { parent: parentId }] }]});
    return student;
  } catch (error) {
    throw error;
  }
}

export async function registerStudent(data) {
  try {
    const{rollNumber,firstname,lastname,gender,adminId,parentId,sectionId,classId} = data;
    const student = await studentModel.create({rollNumber,firstname,lastname,gender,admin: adminId,parent: parentId,section: sectionId,classId});
    return student;
  } catch (error) {
    throw error;
  }
}

export async function adminRegisterStudent(data) {
  try {
    const {rollNumber,firstname,lastname,gender,age,phone,email,address,sectionId,classId,adminId} = data;
    const student = await studentModel.create({rollNumber,firstname,lastname,gender,age,phone,email,address,admin: adminId,section: sectionId,classId});
    return student;
  } catch (error){
    throw error;
  }
}

export async function findStudentById(data) {
  try {
    const {id} = data;
    const student = await studentModel.findOne({_id:id , isActive:true});
    return student;
  } catch (error) {
    throw error;
  }
}

export async function findStudentSiblings(data) {
  try {
    const{parentId} = data;
    const siblings = await studentModel.find({ parent: parentId,isActive:true });
    return siblings;
  } catch (error) {
    throw error;
  }
}

export async function diActivateStudentByIdService(data) {
  try {
    const {id} = data;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ID');
    }
    const student = await studentModel.findByIdAndUpdate(id,{isActive:false});
    return student;
  } catch (error) {
    throw error;
  }
}

export async function getStudentList(data) {
  try {
    const{ limit, page, sectionId } = data;
    const students = await studentModel.find({ section: sectionId,isActive:true }).limit(limit * 1).skip((page - 1) * limit).populate("parent").exec();
    return students;
  } catch (error) {
    throw error;
  }
}

export async function getStudentListBySectionId(data) {
  try {
    const { sectionId } = data;
    const students = await studentModel.find({ section: sectionId,isActive:true }).populate("parent").populate({path:"section",select:{name:1}}).populate({path:"classId",select:{name:1}});
    return students;
  } catch (error) {
    throw error;
  }
}

export async function getAllStudentList(data) {
  try {
    const { adminId, limit, page } = data;
    const students = await studentModel.find({ admin: adminId,isActive:true }).limit(limit * 1).skip((page - 1) * limit).populate({path:"parent",select:{isLoginAlready:0,password:0,admin:0}}).populate({path:"section",select:{name:1}}).populate({path:"classId",select:{name:1}}).exec();
    return students;
  } catch (error) {
    throw error;
  }
}

export async function studentCountOfSectionService(data) {
  try {
    const {sectionId} = data;
    const studentCount = await studentModel.countDocuments({section: sectionId,isActive:true});
    return studentCount;
  } catch (error) {
    throw error;
  }
}

export async function getPresentStudentCount({ sectionId, startOfDay,endOfDay}) {
  try {
    const presentCount = await attendanceModel.countDocuments({
      $and: [{ section: sectionId }, { date: {$gte:startOfDay,$lte:endOfDay} }, { teacherAttendance: "present" }]
    });
    console.log(presentCount)
    return presentCount;
  } catch (error) {
    throw error;
  }
}

export async function getAbsentStudentCount({ sectionId, startOfDay,endOfDay}) {
  try {
    const absentCount = await attendanceModel.countDocuments({
      $and: [{ section: sectionId }, { date: {$gte:startOfDay,$lte:endOfDay} }, { teacherAttendance: "absent" }]
    });
    console.log(absentCount)
    return absentCount;
  } catch (error) {
    throw error;
  }
}

export async function getAllStudentCount(data) {
  try {
    const {adminId} = data;
    const studentCount = await studentModel.countDocuments({ admin: adminId,isActive:true });
    return studentCount;
  } catch (error) {
    throw error;
  }
}

export async function adminUpdateStudent({
  studentId,
  rollNumber,
  firstname,
  lastname,
  gender,
  age,
  phone,
  email,
  address
}) {
  console.log(studentId);
  try {
    const student = await studentModel.findByIdAndUpdate(studentId, {
      rollNumber,
      firstname,
      lastname,
      gender,
      age,
      phone,
      email,
      address
    });
    // console.log(student);
    return student;
  } catch (error) {
    throw error;
  }
}

export async function updateStudent(data){
  try {
    const {studentId,firstname,lastname,gender} = data;
    const student = await studentModel.findByIdAndUpdate(studentId, {firstname,lastname,gender,});
    return student;
  } catch (error) {
    throw error;
  }
}

export async function updateStudentInfo(data){
  try {
    const {id,firstname,lastname,gender,bloodGroup,dob,address} = data;
    const student = await studentModel.findById(id);
    student["firstname"] = firstname;
    student["lastname"] = lastname;
    student["gender"] = gender;

    if(bloodGroup){
      student["bloodGroup"] = bloodGroup;  
    }
    if(dob){
      student["dob"] = dob;  
    }
    if(address){
      student["address"] = address;  
    }
    return student;
  } catch (error){
    throw error;    
  }
}

export async function updateStudentByParent(data){
  try {
    const {id,bloodGroup,dob,address} = data;
    const student = await studentModel.findByIdAndUpdate(id,{bloodGroup,dob,address});
    return student;
  } catch (error) {
    throw error;
  }
}

export async function searchStudentByName(data){
  try {
    const {name,sectionId} = data;
    const regex = new RegExp(name, 'i'); 
    const students = await studentModel.find({firstname: { $regex: regex },section:sectionId,isActive:true}).populate({path:"parent",select:"phone"}).populate({path:"section",select:{name:1}}).populate({path:"classId",select:{name:1}});    
    return students;
  } catch (error) {
    throw error;    
  }
}


export async function getStudentMonthlyAttendanceCount({studentId , regex}){
  try {
    console.log({regex})
    const attendace = await attendanceModel.find({student:studentId,date:regex,teacherAttendance:"present"});
    console.log({attendace})
    return attendace;
  } catch (error) {
    throw error;    
  }
}

export async function searchStudentByNameForAdmin(data) {
  try {
    const { name, adminId } = data;
    const regex = new RegExp(name, "i");
    const students = await studentModel
      .find({ firstname: { $regex: regex }, admin: adminId, isActive:true })
      .populate("parent").populate({path:"section",select:{name:1}}).populate({path:"classId",select:{name:1}});
    return students;
  } catch (error) {
    throw error;
  }
}

export async function uploadStudentPhoto({studentId,photo}){
  try {
    const student = studentModel.findByIdAndUpdate(studentId,{photo});
    return student;
  } catch (error) {
    throw error;    
  }
}

export async function checkPhoneAlreadyExists(data){
  try {
    const {parentId,phone} = data;
    const parent = await parentModel.findOne({phone, _id: { $ne: parentId },isActive:true});
    return parent;
  } catch (error) {
    throw error;    
  }
}