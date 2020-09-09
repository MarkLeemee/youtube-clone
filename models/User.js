import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

// 스키마에 유저id, 페이스북id, 깃헙id를 다 넣어서 중복을 방지할 수 있다.
// sns 로그인시 중복가입 혹은 비밀번호나 이메일 설정 알림 등
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    avatarUrl: String,
    facebookId: Number,
    githubId: Number,
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    videos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }]
});

// passport local mogoose 플러그인으로 활용
// 설정객체가 필요하다. 여기서는 유저네임이 어떤거로 할지.
UserSchema.plugin(passportLocalMongoose, {
    usernameField: "email",
});

const model = mongoose.model("User", UserSchema);

export default model;