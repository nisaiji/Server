import sectionModel from "../models/section.model.js";

export async function checkSectionExist(name){
    try {
        const section = await sectionModel.findOne({name});       
        return section;
    } catch (error) {
        return error;        
    }
}

export async function createSection(name, cordinator){
    try {
        const section = await sectionModel.create({name, cordinator});
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