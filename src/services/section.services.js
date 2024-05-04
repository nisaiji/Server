import sectionModel from "../models/section.model.js";

export async function checkSectionExist(name){
    try {
        const section = await sectionModel.findOne({name});       
        return section;
    } catch (error) {
        return error;        
    }
}

export async function createSection(name, classTeacher,admin){
    try {
        const section = await sectionModel.create({name, classTeacher,admin});
        return section;
    } catch (error) {
        return error;
    }
}

export async function findSectionById(_id){
    try {
        const section = await sectionModel.findById({_id});
        return section;
    } catch (error){
        return error;       
    }
}

export function checkStudentExistInSection(students , student){
    return students.includes(student);
}

export async function getAllSection(){
    try {
        // console.log("get section list called")
        const sections = await sectionModel.find({}).populate('students').populate("coordinator");
        // console.log(sections);
        return sections;
    } catch (error) {
        return error;        
    }
}

export async function findSectionByClassTeacherId(id){
    try {
        // console.log(id);
        const section = await sectionModel.findOne({classTeacher:id});
        // console.log(section);
        return section;
    } catch (error) {
        return error;        
    }
}