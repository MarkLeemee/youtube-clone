import passport from "passport";
import routes from "../routes";
import User from "../models/User";

export const getJoin = (req, res) => {
    res.render("join", {
        pageTitle: "Join",
    });
};

export const postJoin = async (req, res, next) => {
    const {
        body: {
            name,
            email,
            password,
            password2
        },
    } = req;
    if (password !== password2) {
        res.status(400);
        res.render("join", {
            pageTitle: "Join",
        });
    } else {
        //계정을 생성하고 이름 넣기
        // req된 데이터들을 User model을 활용하여 use에 넣어준다
        // passport의 register 메서드를 써서 user정보와 비번등록
        try {
            const user = await User({
                name,
                email,
            });
            await User.register(user, password);
            // next를 호출함으로써 라우터의 다음 함수를 호출할 수 있다.
            next();
        } catch (error) {
            console.log(error);
            res.redirect(routes.home);
        }
    }
};

export const getLogin = (req, res) =>
    res.render("login", {
        pageTitle: "Log In",
    });

// passopor authenticate 인증방식은 유저네임과 패스워드를 찾도록 되어있다
// local은 처음에 설치한 strategy 이름
// 실패했을때와 성공했을때 경로 설정
export const postLogin = passport.authenticate("local", {
    failureRedirect: routes.login,
    successRedirect: routes.home,
});

// passport의 github strategy를 부른다
export const githubLogin = passport.authenticate("github");

// cb는 로그인 성공을 알리는 기본 함수
export const githubLoginCallback = async (_, __, profile, cb) => {
    const {
        _json: {
            id,
            avatar_url: avatarUrl,
            name,
            email
        }
    } = profile;
    try {
        // 이메일이 동일한 사용자를 찾았을 때,
        // if문을 실행
        // 즉, 이전에 가입된 아이디.
        const user = await User.findOne({
            email
        });
        if (user) {
            user.githubId = id;
            user.save();
            return cb(null, user);
        }
        // 없을 시에는 새로운 유저 생성
        const newUser = await User.create({
            email,
            name,
            githubId: id,
            avatarUrl
        });
        return cb(null, newUser);
    } catch (error) {
        return cb(error);
    }
};

export const postGithubLogIn = (req, res) => {
    res.redirect(routes.home);
};

export const facebookLogin = passport.authenticate("facebook");

export const facebookLoginCallback = async (_, __, profile, cb) => {
    const {
        _json: {
            id,
            name,
            email
        }
    } = profile;
    try {
        const user = await User.findOne({
            email
        });
        if (user) {
            user.facebookId = id;
            user.avatarUrl = `https://graph.facebook.com/${id}/picture?type=large`;
            user.save();
            return cb(null, user);
        }
        const newUser = await User.create({
            email,
            name,
            facebookId: id,
            avatarUrl: `https://graph.facebook.com/${id}/picture?type=large`
        });
        return cb(null, newUser);
    } catch (error) {
        return cb(error);
    }
};

export const postFacebookLogin = (req, res) => {
    res.redirect(routes.home);
};

export const logout = (req, res) => {
    req.logout();
    res.redirect(routes.home);
};

// user:req.user를 활용하여 현재 로그인한 사용자 정보를 보낸다
// 전에는 user가 middleware에서 온 것인지, controler에서 온 것인지 구분이 안됐지만,
// middlewarea user를 loggedUser로 바꿔줌으로써 구분가능
export const getMe = (req, res) => {
    res.render("userDetail", {
        pageTitle: "User Detail",
        user: req.user
    });
};

// 잘못된 경로로 profile 접근 시 홈 화면으로
export const userDetail = async (req, res) => {
    const {
        params: {
            id
        }
    } = req;
    try {
        const user = await User.findById(id).populate("videos");
        res.render("userDetail", {
            pageTitle: "User Detail",
            user
        });
    } catch (error) {
        res.redirect(routes.home);
    }
};

export const getEditProfile = (req, res) =>
    res.render("editProfile", {
        pageTitle: "Edit Profile",
    });

export const postEditProfile = async (req, res) => {
    const {
        body: {
            name,
            email
        },
        file
    } = req;
    try {
        await User.findByIdAndUpdate(req.user.id, {
            name,
            email,
            // 수정하는 아바타 파일이 존재하면 해당하는 주소로
            // 파일 업로드 하지 않았으면 기존 아바타 주소로
            avatarUrl: file ? file.location : req.user.avatarUrl
        });
        res.redirect(routes.me);
    } catch (error) {
        res.redirect(routes.editProfile);
    }
};

export const getChangePassword = (req, res) =>
    res.render("changePassword", {
        pageTitle: "Change Password"
    });

export const postChangePassword = async (req, res) => {
    const {
        body: {
            oldPassword,
            newPassword,
            newPassword1
        }
    } = req;
    try {
        if (newPassword !== newPassword1) {
            res.status(400);
            res.redirect(`/users/${routes.changePassword}`);
            return;
        }
        await req.user.changePassword(oldPassword, newPassword);
        res.redirect(routes.me);
    } catch (error) {
        res.status(400);
        res.redirect(`/users/${routes.changePassword}`);
    }
};