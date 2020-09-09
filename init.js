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