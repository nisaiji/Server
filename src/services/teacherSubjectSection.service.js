import teacherSubjectSectionModel from "../models/teacherSubjectSection.model.js";


export async function getTeacherSubjectSectionService(paramObj, projection={}){
    try {
        const teacherSubjectSection = await teacherSubjectSectionModel.findOne(paramObj);//.select(projection);
        return teacherSubjectSection;
    }catch (error) {
        throw error;
    }
}

export async function registerTeacherSubjectSectionService( data ){
    try {
        const teacherSubjectSection = await teacherSubjectSectionModel.create(data);
        return teacherSubjectSection;
    } catch (error) {
        throw error;
    }
}

export async function registerTeacherSubjectSectionsService(data)  {
    try{

        const teacherSubjectSections = await teacherSubjectSectionModel.insertMany(data)
        return teacherSubjectSections;
    } catch (error){
        throw error;
    }
}

export async function getTeacherSubjectSectionsService(paramObj, projection={}, populateObj=""){
    try {
        const teacherSubjectSections = await teacherSubjectSectionModel.find(paramObj).select(projection).populate(populateObj);
        return teacherSubjectSections;
    } catch (error) {
        throw error;
    }
}

export async function deleteTeacherSubjectSectionService(paramObj){
    try {
        const teacherSubjectSection = await teacherSubjectSectionModel.deleteOne(paramObj);
        return teacherSubjectSection;
    } catch (error) {
        throw error;
    }

}

export async function updateTeacherSubjectSectionService(filter, update){
    try {
        const teacherSubjectSection = await teacherSubjectSectionModel.findOneAndUpdate(filter, update);
        return teacherSubjectSection;
    } catch (error) {
        throw error;
    }
}

export async function getTeacherSubjectSectionPipelineService(pipeline){
    try {
        const teacherSubjectSections = await teacherSubjectSectionModel.aggregate(pipeline).exec();
        return teacherSubjectSections;
    } catch (error) {
        throw error;
    }
}
