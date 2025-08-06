import subjectModel from "../models/subject.model.js";


export async function getSubjectService(paramObj, projection={}){
    try {
        const subject = await subjectModel.findOne(paramObj);//.select(projection);
        return subject;
    }catch (error) {
        throw error;
    }
}

export async function registerSubjectService( data ){
    try {
        const subject = await subjectModel.create(data);
        return subject;
    } catch (error) {
        throw error;
    }
}

export async function registerSubjectsService(data)  {
    try{

        const subjects = await subjectModel.insertMany(data)
        return subjects;
    } catch (error){
        throw error;
    }
}

export async function getSubjectsService(paramObj, projection={}, populateObj=""){
    try {
        const subjects = await subjectModel.find(paramObj).select(projection).populate(populateObj);
        return subjects;
    } catch (error) {
        throw error;
    }
}

export async function deleteSubjectService(paramObj){
    try {
        const subject = await subjectModel.deleteOne(paramObj);
        return subject;
    } catch (error) {
        throw error;
    }

}

export async function updateSubjectService(filter, update){
    try {
        const subject = await subjectModel.findOneAndUpdate(filter, update);
        return subject;
    } catch (error) {
        throw error;
    }
}

export async function getSubjectsPipelineService(pipeline){
    try {
        const subjects = await subjectModel.aggregate(pipeline).exec();
        return subjects;
    } catch (error) {
        throw error;
    }
}
