import attendanceModel from "../models/attendance.model.js";
import studentModel from "../models/student.model.js";

export async function checkStudentExist(rollNumber, email, admin) {
  try {
    const student = await studentModel.findOne({
      $or: [{ $and: [{ rollNumber }, { admin }] }, { email }]
    });
    // const student = await studentModel.findOne({$and: [{ rollNumber }, { admin }],});
    return student;
  } catch (error) {
    return student;
  }
}

export async function registerStudent(
  rollNumber,
  firstname,
  lastname,
  gender,
  age,
  phone,
  email,
  address,
  admin
) {
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
      admin
    });
    return student;
  } catch (error) {
    return error;
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

export async function getAllStudentList({adminId, limit, page }) {
  try {
    const students = await studentModel
      .find({admin:adminId})
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    return students;
  } catch (error) {
    return error;
  }
}

export async function getStudentCount({ sectionId }) {
  try {
    const studentCount = await studentModel.countDocuments({
      section: sectionId
    });
    // console.log({ studentCount });
    return studentCount;
  } catch (error) {
    return error;
  }
}

export async function getPresentStudentCount({ sectionId,currDate}) {
  try {
    // console.log({sectionId,currDate})
    const presentCount = await attendanceModel.countDocuments({
      $and:[
        {section:sectionId},
        {date:currDate},
        {isPresent:true}
      ]
    })
    // console.log(presentCount)
    return presentCount;
  } catch (error) {
    throw error;
  }
}

export async function getAbsentStudentCount({ sectionId,currDate}) {
  try {
    // console.log({sectionId,currDate})
    const absentCount = await attendanceModel.countDocuments({
      $and:[
        {section:sectionId},
        {date:currDate},
        {isPresent:false}
      ]
    })
    // console.log(absentCount)
    return absentCount;
  } catch (error) {
    throw error;
  }
}

export async function getAllStudentCount(adminId) {
  try {
    const studentCount = await studentModel.countDocuments({admin:adminId});
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

export async function updateStudent({
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
    return student;
  } catch (error) {
    return error;
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
