import "@babel/polyfill";
import dotenv from "dotenv";
import "./db";
// init에서 application을 시작
// app 객체를 가져온다
import app from "./app";
dotenv.config();
import "./models/Video";
import "./models/Comment";
import "./models/User";

// 만약 대상을 못찾으면 4000으로
const PORT = process.env.PORT || 4000;

const handleListening = () =>
  console.log(`Listening on: http://localhost:${PORT}`);

app.listen(PORT, handleListening);

/*
"scripts": {
    "dev:server": "nodemon --exec babel-node src/init.js --delay 2 --ignore '.scss' --ignore 'static' ",
    "dev:assets": "cd src && WEBPACK_ENV=development webpack -w",

    // src에 있는 웹팩을 활용하여 빌드 모든 것 빌드
    "build:assets": "cd src && WEBPACK_ENV=production webpack",
    // src 폴더안에 모든 js를 babel로 build (결과물은 build 디렉토리에)
    "build:server": "babel src --out-dir build --ignore 'src/assets','src/static','src/webpack.config.js'",
    // babel로 빌드 안된 static 폴더와 view 폴더 빌드된 것을 build 폴더에 넣어줌.
    "copyAll": "cp -R src/static build && cp -R src/views build",

    // 위의 3 명령어 묶은 최종 명령어 (asswts, server 빌드하고 모든건 build 폴더에 카피)
    "build": "npm run build:server && npm run build:assets && npm run copyAll",

    // build 폴더를 지워준다. (빌드 하기 전에 사용)
    "prebuild": "rm -rf build",
    "tunnel": "lt --port 4000",
    // 바벨이 아닌 일반 노드
    "start": "node build/init.js"
  },
*/