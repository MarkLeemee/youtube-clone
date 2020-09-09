import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: "File URL is required"
  },
  title: {
    type: String,
    required: "Tilte is required"
  },
  description: String,
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // comment 데이터가 저장되는 것이 아니라 id값들이 저장되는거다
  // [1, 4, 5, 8, 33, ... ] 식으로
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});
// 모델의 이름은 Video과 schema는 VideoSchema로 설정
const model = mongoose.model("Video", VideoSchema);
export default model;