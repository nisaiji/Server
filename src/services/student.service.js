import attendanceModel from "../models/attendance.model.js";
import studentModel from "../models/student.model.js";

export async function checkStudentExist({ firstname, parentId }) {
  try {
    const student = await studentModel.findOne({
      $or: [{ $and: [{ firstname }, { parent: parentId }] }]
    });
    return student;
  } catch (error) {
    throw error;
  }
}

export async function registerStudent({
  firstname,
  lastname,
  gender,
  adminId,
  parentId,
  sectionId,
  classId
}) {
  try {
    console.log({ classId });
    const student = await studentModel.create({
      firstname,
      lastname,
      gender,
      admin: adminId,
      parent: parentId,
      section: sectionId,
      classId
    });
    // console.log(student);
    return student;
  } catch (error) {
    throw error;
  }
}

export async function adminRegisterStudent({
  rollNumber,
  firstname,
  lastname,
  gender,
  age,
  phone,
  email,
  address,
  sectionId,
  classId,
  adminId
}) {
  try {
    const student = await studentModel.create({
      rollNumber,
      firstname,
      lastname,
      gender,
      age,
      phone,
      email,
      address,
      admin: adminId,
      section: sectionId,
      classId
    });
    return student;
  } catch (error) {
    throw error;
  }
}

export async function findStudentById(_id) {
  try {
    const student = await studentModel.findById({ _id });
    return student;
  } catch (error) {
    return error;
  }
}

export async function findStudentSiblings(parentId) {
  try {
    const siblings = await studentModel.find({ parent: parentId });
    return siblings;
  } catch (error) {
    throw error;
  }
}

export async function deleteStudentById(id) {
  try {
    const student = await studentModel.findByIdAndDelete(id);
    // console.log(student);
    return student;
  } catch (error) {
    return error;
  }
}

export async function getStudentList({ limit, page, sectionId }) {
  try {
    const students = await studentModel
      .find({ section: sectionId })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    return students;
  } catch (error) {
    return error;
  }
}

export async function getStudentListBySectionId({ sectionId }) {
  try {
    const students = await studentModel.find({ section: sectionId });
    return students;
  } catch (error) {
    return error;
  }
}

export async function getAllStudentList({ adminId, limit, page }) {
  try {
    const students = await studentModel
      .find({ admin: adminId })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    return students;
  } catch (error) {
    return error;
  }
}

export async function getStudentCount({ sectionId}) {
  try {
    const studentCount = await studentModel.countDocuments({
      section: sectionId,
    });
    // console.log({ studentCount });
    return studentCount;
  } catch (error) {
    return error;
  }
}

export async function getPresentStudentCount({ sectionId, currDate }) {
  try {
    // console.log({sectionId,currDate})
    const presentCount = await attendanceModel.countDocuments({
      $and: [{ section: sectionId }, { date: currDate }, { teacherAttendance: "present" }]
    });
    // console.log(presentCount)
    return presentCount;
  } catch (error) {
    throw error;
  }
}

export async function getAbsentStudentCount({ sectionId, currDate }) {
  try {
    // console.log({sectionId,currDate})
    const absentCount = await attendanceModel.countDocuments({
      $and: [{ section: sectionId }, { date: currDate }, { teacherAttendance: "absent" }]
    });
    // console.log(absentCount)
    return absentCount;
  } catch (error) {
    throw error;
  }
}

export async function getAllStudentCount(adminId) {
  try {
    const studentCount = await studentModel.countDocuments({ admin: adminId });
    return studentCount;
  } catch (error) {
    return error;
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
    return error;
  }
}

export async function updateStudent({studentId,firstname,lastname,gender}){
  try {
    const student = await studentModel.findByIdAndUpdate(studentId, {
      firstname,
      lastname,
      gender,
    });
    return student;
  } catch (error) {
    return error;
  }
}


export async function updateStudentByParent({studentId,bloodGroup,dob,address}){
  try {
    const student = await studentModel.findByIdAndUpdate(studentId,{bloodGroup,dob,address});
    return student;
  } catch (error) {
    throw error;
  }
}
// export async function getStudentCount({sectionId}){
//   try {
//     const count = await studentModel.aggregate([{
//       $match: {
//         section:ObjectId(sectionId)  // Replace "A" with your actual section ID
//       }
//     },
//     {
//       $group: {
//         _id: "$section",
//         count: { $sum: 1 }
//       }
//     }]);
//     return count;
//   } catch (error) {
//     throw error;
//   }
// }

export async function searchStudentByName({name,sectionId}){
  try {
    const regex = new RegExp(name, 'i'); 
    const students = await studentModel.find({firstname: { $regex: regex },section:sectionId});    
    return students;
  } catch (error) {
    throw error;    
  }
}
