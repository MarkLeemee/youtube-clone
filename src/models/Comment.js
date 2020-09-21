import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: "Text is required"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
  // mongoose에게 Video.js에서 ID 1에 해당하는 것을 video 속성으로 가져와
  // video: {
  //     // Video.js의 model 객체
  //     type: mongoose.Schema.Types.ObjectId,
  //     // 해당 속성이 어디서 왔는지
  //     ref: "Video"
  // }
});

const model = mongoose.model("Comment", CommentSchema);
export default model;