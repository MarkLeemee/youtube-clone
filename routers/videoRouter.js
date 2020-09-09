import express from "express";
import routes from "../routes";
import {
  getUpload,
  postUpload,
  videoDetail,
  deleteVideo,
  getEditVideo,
  postEditVideo
} from "../controllers/videoController";
import {
  uploadVideo,
  onlyPrivate
} from "../middlewares";

const videoRouter = express.Router();

videoRouter.get(routes.upload, onlyPrivate, getUpload);
// 비디오 post 업로드 요청이 오면 함수 2개 호출
videoRouter.post(routes.upload, onlyPrivate, uploadVideo, postUpload);

// viedoDetail 주소는 변수이기에 함수로 호출
videoRouter.get(routes.videoDetail(), videoDetail);

videoRouter.get(routes.editVideo(), onlyPrivate, getEditVideo);
videoRouter.post(routes.editVideo(), onlyPrivate, postEditVideo);

videoRouter.get(routes.deleteVideo(), onlyPrivate, deleteVideo);

export default videoRouter;