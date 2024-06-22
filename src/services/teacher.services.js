import sectionModel from "../models/section.model.js";
import teacherModel from "../models/teacher.model.js";

export async function checkPhoneExists({ phone }) {
  try {
    const teacher = await teacherModel.findOne({ phone });
    return teacher;
  } catch (error) {
    throw error;
  }
}
export async function findTeacher({ user }) {
  try {
    const teacher = await teacherModel.findOne({
      $or: [{ username: user }, { phone: user }, { email: user }]
    });
    return teacher;
  } catch (error) {
    throw error;
  }
}
export async function checkTeacherExist(username, email) {
  try {
    const teacher = await teacherModel.findOne({
      $or: [{ username }, { email }]
    });
    return teacher;
  } catch (err) {
    return err;
  }
}

export async function createTeacher({
  firstname,
  lastname,
  hashedPassword,
  phone,
  adminId
}) {
  try {
    const teacher = await teacherModel.create({
      firstname,
      lastname,
      password: hashedPassword,
      phone,
      admin: adminId
    });
    return teacher;
  } catch (error) {
    throw error;
  }
}

export async function findClassTeacherByUsername(username) {
  try {
    const classTeacher = await teacherModel.findOne({ username });
    return classTeacher;
  } catch (err) {
    return err;
  }
}
export async function findClassTeacherByEmail(email) {
  try {
    const classTeacher = await teacherModel.findOne({ email });
    return classTeacher;
  } catch (err) {
    throw err;
  }
}

export async function findTeacherById(id) {
  try {
    const teacher = await teacherModel.findById(id);
    return teacher;
  } catch (error) {
    return error;
  }
}

export async function updateAuthTeacher({id,username,email,password}){
  try {
    const teacher = await teacherModel.findByIdAndUpdate(id , {username,email,password});
    return teacher;
  } catch (error) {
    throw error;
  }
}

//firstname, lastname,phone, dob,bloodGroup,gender,university,degree
export async function updateProfileTeacher({id,firstname,lastname,phone,dob,bloodGroup,gender,university,degree}){
  try {
    const teacher = await teacherModel.findByIdAndUpdate(id , {firstname,lastname,phone,dob,bloodGroup,gender,university,degree});
    return teacher;
  } catch (error) {
    throw error;
  }
}

export async function findClassTeacherById(id) {
  try {
    const classTeacher = await teacherModel.findById(id);
    return classTeacher;
  } catch (error) {
    return error;
  }
}
export async function updateClassTeacherById({
  id,
  firstname,
  lastname,
  dob,
  phone,
  bloodGroup,
  gender,
  university,
  degree
}) {
  try {
    const teacher = await teacherModel.findByIdAndUpdate(id, {
      firstname,
      lastname,
      dob,
      phone,
      bloodGroup,
      gender,
      university,
      degree
    });
    return teacher;
  } catch (error) {
    throw error;
  }
}

export async function deleteTeacher(id) {
  try {
    const teacher = await teacherModel.findByIdAndDelete(id);
    await sectionModel.updateMany(
      { classTeacher: id },
      { $unset: { classTeacher: 1 } }
    );
    return teacher;
  } catch (error) {
    return error;
  }
}

export async function getAllTeachers(adminId) {
  try {
    const teacherlist = await teacherModel.find({ admin: adminId });
    console.log(teacherlist);
    return teacherlist;
  } catch (error) {
    return error;
  }
}

export async function getNonClassTeachers(adminId) {
  try {
    const teachers = await teacherModel.aggregate([
      {
        $lookup: {
          from: "sections",
          localField: "_id",
          foreignField: "classTeacher",
          as: "sections"
        }
      },
      {
        $match: {
          sections: { $size: 0 }
        }
      },
      {
        $project: {
          sections: 0
        }
      }
    ]);
    // console.log(teachers);
    return teachers;
  } catch (error) {
    throw error;
  }
}

export async function getAllClassTeachers(adminId) {
  try {
    console.log({ adminId });
    const cordinatorlist = await teacherModel.find({ admin: adminId });
    console.log(cordinatorlist);
    return cordinatorlist;
  } catch (error) {
    return error;
  }
}

export async function getTeacherList({ adminId }) {
  try {
    const teachers = await teacherModel.find({ admin: adminId });
    return teachers;
  } catch (error) {
    return error;
  }
}

export async function getTeacherCount({ adminId }) {
  try {
    const teacherCount = await teacherModel.countDocuments({ admin: adminId });
    return teacherCount;
  } catch (error) {
    return error;
  }
}

export async function updateTeacherById(
  teacherId,
  {
    username,
    firstname,
    lastname,
    email,
    phone,
    bloodGroup,
    gender,
    university,
    degree,
    dob
  }
) {
  try {
    const updatedTeacher = await teacherModel.findByIdAndUpdate(teacherId, {
      username,
      firstname,
      lastname,
      email,
      phone,
      bloodGroup,
      gender,
      university,
      degree,
      dob
    });
    return updatedTeacher;
  } catch (error) {
    throw error;
  }
}
