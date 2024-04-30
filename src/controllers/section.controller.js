import { checkSectionExist, getAllSection } from "../services/section.services";
import { error, success } from "../utills/responseWrapper";

export async function registerSectionController(req, res) {
    try{
      const { name, cordinatorId } = req.body;
      const existingSection = await checkSectionExist(name);
      if (existingSection) {
        return res.send(error(400, "section name already exist"));
      }
      const section = await createSection(name, cordinatorId);
      const cordinator = await findCordinatorById(cordinatorId);
      if (!cordinator) {
        return res.send(error(400, "cordinator doesn't exist"));
      }
      console.log(cordinator);
      cordinator?.section?.push(section["_id"]);
      await cordinator.save();
      return res.send(success(201, "section created successfully!"));
    } catch (err) {
      return res.send(error(500, err.message));
    }
  }

  export async function getAllSectionsController(req, res) {
    try {
      const sectionlist = await getAllSection();
      return res.send(success(200, sectionlist));
    } catch (err) {
      return res.send(error(500, err.message));
    }
  }
  