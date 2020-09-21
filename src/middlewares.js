import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import routes from "./routes";

// 인자로 목적지 넣기 서버에 있는 videos 폴더에 업로드됨
// /uploads/는 컴퓨터 프로젝트 안에 있는 폴더라고 생각할 것. 앞에 /을 없앰으로 경로를 표시
export const s3 = new aws.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_PRIVATE_KEY,
  region: "ap-northeast-2"
});

const multerVideo = multer({
  storage: multerS3({
    s3,
    acl: "public-read",
    bucket: "uu-tube/video"
  })
});
const multerAvatar = multer({
  storage: multerS3({
    s3,
    acl: "public-read",
    bucket: "uu-tube/avatar"
  })
});

export const uploadVideo = multerVideo.single("videoFile");
export const uploadAvatar = multerAvatar.single("avatar");

// 변수를 선언할 수도 있고, 객체를 불러올 수도 있다.
export const localsMiddleware = (req, res, next) => {
  res.locals.siteName = "WeTube";
  res.locals.routes = routes;
  // passport가 유저를 로그인시킬 때, 쿠키나 serialize, deserialize 등의 기능을 다 지원해줌은 물론
  // user가 담긴 객체를 요청에도 올려준다.
  // 전에는 user가 middleware에서 온 것인지, controler에서 온 것인지 구분이 안됐지만,
  // middlewarea user를 loggedUser로 바꿔줌으로써 구분가능
  res.locals.loggedUser = req.user || null;
  // 미들웨어임으로 next를 넣어줘야 다음 단계로 진행할 수있음
  next();
};

export const onlyPublic = (req, res, next) => {
  if (req.user) {
    res.redirect(routes.home);
  } else {
    next();
  }
};

export const onlyPrivate = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect(routes.home);
  }
};

// single은 오직 하나의 파일만 업로드할 수 있는걸 의미한다
// "" 이름은 input 태그에 있는 name이다