import passport from "passport";
import GithubStrategy from "passport-github";
import FacebookStrategy from "passport-facebook";
import User from "./models/User";
import {
    githubLoginCallback,
    facebookLoginCallback
} from "./controllers/userController";
import routes from "./routes";

// 로그인하는 방식 = strategy, 여러개가 존재. 페잇,북, 깃헙, 등등등
// 지금 여기서는 User. 즉, passport-local-mongoose가 제공하는 strategy를 활용
// 유저네임과 패스워드를 활용
passport.use(User.createStrategy());

passport.use(
    // 기본속성들은 가이드를 보고 작성하면된다.
    new GithubStrategy({
            clientID: process.env.GH_ID,
            clientSecret: process.env.GH_SECRET,
            callbackURL: process.env.PRODUCTION ?
                `https://polar-sea-27980.herokuapp.com${routes.githubCallback}` :
                `http://localhost:4000${routes.githubCallback}`
        },
        // 사용자가 깃헙에서 돌아왔을 때 호출되는 함수
        githubLoginCallback
    )
);

passport.use(
    new FacebookStrategy({
            clientID: process.env.FB_ID,
            clientSecret: process.env.FB_SECRET,
            callbackURL: `https://afraid-baboon-46.localtunnel.me${routes.facebookCallback}`,
            profileFields: ["id", "displayName", "photos", "email"],
            scope: ["public_profile", "email"]
        },
        facebookLoginCallback
    )
);

// passport-local-mongoose를 활용하여 serialize, deserialize
// 일반적으로 user id를 받고 그걸로 확인하기에 여기서도 같은 방법으로 활용
// 어느 사용자인지 식별
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());