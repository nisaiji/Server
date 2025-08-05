import {StatusCodes} from "http-status-codes";
import {error, success} from "../utills/responseWrapper.js";
import {
    createAnnouncementsReadStatusService,
    getAnnouncementsReadStatusService
} from "../services/announcementReadStatus.service.js";
import {getStudentService} from "../services/student.service.js";
import {convertToMongoId} from "../services/mongoose.services.js";


export async function markAnnouncementsAsReadForParentController(req, res) {
    try {
        const {announcementIds, studentId} = req.body;
        const student = await getStudentService({ _id: studentId, isActive: true });
        if (!student) {
            return res.status(StatusCodes.NOT_FOUND).send(error(404, "Student not found"));
        }
        const userId = req.parentId;
        const readAnnouncements = await getAnnouncementsReadStatusService({user: convertToMongoId(userId), userRole: 'parent', announcement: {$in: announcementIds}});
        const readAnnouncementIds = readAnnouncements.map((announcement) => announcement.announcement.toString());
        const unreadAnnouncementIds = announcementIds.filter(id => !readAnnouncementIds.includes(id));
        const announcementsMarkAsRead = unreadAnnouncementIds.map(announcementId => {
            return {
                user: userId,
                userRole: 'parent',
                announcement: announcementId,
                readAt: new Date()
            }
        });
        if(announcementsMarkAsRead.length > 0) {
            await createAnnouncementsReadStatusService(announcementsMarkAsRead);
        }
        return res.status(StatusCodes.CREATED).send(success(201, "Announcements mark as read successfully"));
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error(500, err.message));
    }
}

export async function markAnnouncementsAsReadForTeacherController(req, res) {
    try {
        const {announcementIds} = req.body;
        const userId = req.teacherId;
        const readAnnouncements = await getAnnouncementsReadStatusService({user: convertToMongoId(userId), userRole: 'teacher', announcement: {$in: announcementIds}});
        const readAnnouncementIds = readAnnouncements.map((announcement) => announcement.announcement.toString());
        const unreadAnnouncementIds = announcementIds.filter(id => !readAnnouncementIds.includes(id));
        const announcementsMarkAsRead = unreadAnnouncementIds.map(announcementId => {
            return {
                user: userId,
                userRole: 'teacher',
                announcement: announcementId,
                readAt: new Date()
            }
        });
        if(announcementsMarkAsRead.length > 0) {
            await createAnnouncementsReadStatusService(announcementsMarkAsRead);
        }
        return res.status(StatusCodes.CREATED).send(success(201, "Announcements mark as read successfully"));
    } catch (err) {
        return res.status(StatusCodes).send(error(500, err.message));
    }
}

