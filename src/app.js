import "@babel/polyfill";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import passport from "passport";
import mongoose from "mongoose";
import session from "express-session";
import path from "path";
import flash from "express-flash";
import MongoStore from "connect-mongo";
// locals는 오직 템플릿(pug)에서만 쓰여지고
// routes는 자바스크립트에서 활용
import {
    localsMiddleware
} from "./middlewares";
import routes from "./routes";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import globalRouter from "./routers/globalRouter";
import apiRouter from "./routers/apiRouter";

import "./passport";

// app 객체는 express를 실행한 결과
const app = express();

const CokieStore = MongoStore(session);
// 보안 관련 미들웨어라 제일 처음에 넣어준다.
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);
// view engine을 pug로 설정
app.set("view engine", "pug");
// middleware
// uploads 경로 미들웨어 셋팅
// static은 file을 보내주는 미들웨어 그냥 파일만 확인
// 학습예제로 이렇게 설정한것 뿐이지 실제로는 이렇게 코드하면 안됨.
// 여러 서버를 사용하고 언제든 서버가 업데이트 될 수도 있기에
// 이렇게 파일을 직접 다루는게 아님!!!!
// 또한 용량이랑 트래픽 문제도 생길 수 있음
app.set("views", path.join(__dirname, "views"));
// 웹팩으로 만든 css와 js를 서버에도 추가
app.use("/static", express.static(path.join(__dirname, "static")));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(morgan("dev"));
// sesssion을 사용하기 전에 환경설정
// secret 속성이 가장 중요. randomkeygen에서 가져온 값으로 암호화
// resave, saveUnintitailized는 기본옵션
app.use(
    session({
        secret: process.env.COOKIE_SECRET,
        resave: true,
        saveUninitialized: false,
        // 저장하는 곳 설정
        store: new CokieStore({
            mongooseConnection: mongoose.connection,
        }),
    })
);

app.use(flash());
// app에서 passport 내려온 쿠기를 찾아보고 거기에 해당하는 사용자를 찾는다
//그리고 찾은 사용자를 req 객체. 즉, req.user로 만들어준다
app.use(passport.initialize());
app.use(passport.session());

// localsMiddleware라는 함수를 별도로 만들어서 가져왔다
// home, users, viedo 어디서든 활용해야 하기에 템플릿을 활용하는 최상단에 위치시킨다.
app.use(localsMiddleware);
// 작성했던 URL 객체를 활용한다.
// 요청에 따라 구분해준 router들을 활용한다.
app.use(routes.home, globalRouter);
app.use(routes.users, userRouter);
app.use(routes.videos, videoRouter);
app.use(routes.api, apiRouter);

export default app;