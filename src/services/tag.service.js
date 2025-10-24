import tagModel from "../models/tag.model.js";


export async function getTagService(paramObj, projection={}) {
    try {
        const tag = await tagModel.findOne(paramObj);//.select(projection);
        return tag;
    }catch (error) {
        throw error;
    }
}

export async function createTagService(data){
    try {
        const tag = await tagModel.create(data);
        return tag;
    } catch (error) {
        throw error;
    }
}

export async function createTagsService(data)  {
    try{
        const tags = await tagModel.insertMany(data);
        return tags;
    } catch (error){
        throw error;
    }
}

export async function getTagsService(paramObj, projection={}, populateObj="") {
    try {
        const tags = await tagModel.find(paramObj).select(projection).populate(populateObj);
        return tags;
    } catch (error) {
        throw error;
    }
}

export async function deleteTagService(paramObj) {
    try {
        const tag = await tagModel.deleteOne(paramObj);
        return tag;
    } catch (error) {
        throw error;
    }
}

export async function updateTagService(filter, update) {
    try {
        const tag = await tagModel.findOneAndUpdate(filter, update);
        return tag;
    } catch (error) {
        throw error;
    }
}

export async function getTagsPipelineService(pipeline) {
    try {
        const tags = await tagModel.aggregate(pipeline).exec();
        return tags;
    } catch (error) {
        throw error;
    }
}
