import mongoose from "mongoose";
import dotenv from "dotenv";
// config 함수로 .env 파일 정보를 불러온다
// 찾은 변수들은 process.env.key에 저장된다
dotenv.config();

// mongoose 환경설정 (mongoose가 mongoDB에게 말하는)
mongoose.connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }
);

const db = mongoose.connection;

const handleOpen = () => console.log("✅  Connected to DB");
const handleError = error => console.log(`❌ Error on DB Connectionn:${error}`);

// once는 한번 실행
db.once("open", handleOpen);
db.on("error", handleError);