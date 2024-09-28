import attendanceModel from "../models/attendance.model.js";
import studentModel from "../models/student.model.js";


export async function getStudentService(paramObj, projection={}){
  try {
    const student = await studentModel.findOne(paramObj).select(projection);
    return student; 
  }catch (error) {
    throw error;    
  }
}

export async function registerStudentService( data ){
  try {
    const student = await studentModel.create(data);
    return student;
  } catch (error) {
    throw error;
  }
}
 
export async function getStudentsService(paramObj, projection={}, populateObj=""){
  try {
    const students = await studentModel.find(paramObj).select(projection).populate(populateObj);
    return students;
  } catch (error) {
    throw error;    
  }

}

export async function deleteStudentService(paramObj){
  try {
    const student = await studentModel.deleteOne(paramObj);
    return student;
  } catch (error) {
    throw error;    
  }

}

export async function updateStudentService(filter, update){
  try {
    const student = await studentModel.findOneAndUpdate(filter, update);
    return student;
  } catch (error) {
    throw error;    
  }
}

export async function getstudentsService(filter, sortingLogic, skipNumber, limitNumber,  projection={}) {
  try {
    const students = await studentModel.find(filter).limit(limitNumber).skip(skipNumber).select(projection).populate({path:"parent", select:{fullName:1, email:1, phone:1 }});
    return students;
  } catch (error) {
    throw error;
  }
}

export async function getStudentCountService(filter){
  try {
    const students = await studentModel.countDocuments(filter);
    return students;
  } catch (error) {
    throw error;  
  }
  }

// export async function searchStudentByName(data){
//   try {
//     const {name,sectionId} = data;
//     const regex = new RegExp(name, 'i'); 
//     const students = await studentModel.find({firstname: { $regex: regex },section:sectionId,isActive:true}).populate({path:"parent",select:"phone"}).populate({path:"section",select:{name:1}}).populate({path:"classId",select:{name:1}});    
//     return students;
//   } catch (error) {
//     throw error;    
//   }
// }

// export async function getStudentMonthlyAttendanceCount({studentId , regex}){
//   try {
//     const attendace = await attendanceModel.find({student:studentId,date:regex,teacherAttendance:"present"});
//     return attendace;
//   } catch (error) {
//     throw error;    
//   }
// }

// export async function searchStudentByNameForAdmin(data) {
//   try {
//     const { name, adminId } = data;
//     const regex = new RegExp(name, "i");
//     const students = await studentModel
//       .find({ firstname: { $regex: regex }, admin: adminId, isActive:true })
//       .populate("parent").populate({path:"section",select:{name:1}}).populate({path:"classId",select:{name:1}});
//     return students;
//   } catch (error) {
//     throw error;
//   }
// }

