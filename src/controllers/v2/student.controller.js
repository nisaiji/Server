import { StatusCodes } from "http-status-codes";
import { getStudentsPipelineService } from "../../services/student.service.js";
import { error, success } from "../../utills/responseWrapper.js";
import { convertToMongoId } from "../../services/mongoose.services.js";

export async function searchStudentsController(req, res){
try{
  let { search, page = 1, limit } = req.query;
  search = search.trim();
  const[searchFirstname, searchLastname] = search.split(" ");
  console.log({ search, searchFirstname, searchLastname });
  const adminId = req.adminId;

  const pageNum = parseInt(page);
  const limitNum = limit ? parseInt(limit) : "no limit";
  const skipNum = (pageNum - 1) * limitNum;
  let filter = {
    admin: convertToMongoId(adminId)
  };

  if(searchLastname){
    filter['$and'] = [
        { firstname: { $regex: new RegExp(searchFirstname, "i") } },
        { lastname: { $regex: new RegExp(searchLastname, "i") } }
      ]
  } else {
    filter['$or'] = [
      { firstname: { $regex: new RegExp(search, "i") } },
      { lastname: { $regex: new RegExp(search, "i") } },
      { "parentDetails.email": { $regex: new RegExp(search, "i") } },
      { "parentDetails.phone": { $regex: new RegExp(search, "i") } },
    ]
  }

  const pipeline = [
      // Join students with parents
      {
        $lookup: {
          from: "parents",
          localField: "parent",
          foreignField: "_id",
          as: "parentDetails",
          pipeline: [
            {
              $project: {
                password: 0,
                isActive: 0,
                isLoginAlready: 0,
                admin: 0,
              },
            },
          ],
        }
      },
      {
        $unwind: {
          path: "$parentDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $match: filter,
      },

      {
        $sort: { firstname: 1 },
      },
  ];

  if (limit) {
    pipeline.push(
      {
        $skip: skipNum,
      },
      {
        $limit: limitNum,
      }
    );
  }

  // include section info
  pipeline.push({
    $lookup: {
      from: "sections",
      localField: "section",
      foreignField: "_id",
      as: "sectionDetails",
      pipeline: [
        {
          $project: {
            name: 1,
            studentCount: 1,
          },
        },
      ],
    },
  });
  pipeline.push({
    $unwind: {
      path: "$sectionDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  // include class info
  pipeline.push({
    $lookup: {
      from: "classes",
      localField: "classId",
      foreignField: "_id",
      as: "classDetails",
      pipeline: [
        {
          $project: {
            name: 1,
            sectionCount: { $size: "$section" },
          },
        },
      ],
    },
  });
  pipeline.push({
    $unwind: {
      path: "$classDetails",
      preserveNullAndEmptyArrays: true,
    },
  });

  //remove other entity ids from student entity
  pipeline.push({
    $project: {
      isActive: 0,
      admin: 0,
      parent: 0,
      section: 0,
      classId: 0,
    },
  });

  const students = await getStudentsPipelineService(pipeline);
  const totalStudents = students.length;
  const totalPages = Math.ceil(totalStudents / limitNum);

  return res.status(StatusCodes.OK).send(
    success(200, {
      students,
      currentPage: pageNum,
      totalPages,
      totalStudents,
      pageSize: limitNum,
    })
  );
}  catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
  }
};