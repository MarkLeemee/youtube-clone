import express from "express";
import passport from "passport";
import routes from "../routes";
// controller를 가져온다
import {
  home,
  search
} from "../controllers/videoController";
import {
  getJoin,
  getLogin,
  logout,
  postJoin,
  postLogin,
  githubLogin,
  postGithubLogIn,
  getMe,
  facebookLogin,
  postFacebookLogin
} from "../controllers/userController";
import {
  onlyPublic,
  onlyPrivate
} from "../middlewares";

const globalRouter = express.Router();

globalRouter.get(routes.join, onlyPublic, getJoin);
globalRouter.post(routes.join, onlyPublic, postJoin, postLogin);

globalRouter.get(routes.login, onlyPublic, getLogin);
globalRouter.post(routes.login, onlyPublic, postLogin);

// URL은 routes 객체를, 함수는 controller를 활용
globalRouter.get(routes.home, home);
globalRouter.get(routes.search, search);
globalRouter.get(routes.logout, onlyPrivate, logout);

globalRouter.get(routes.gitHub, githubLogin);

globalRouter.get(
  routes.githubCallback,
  passport.authenticate("github", {
    failureRedirect: "/login"
  }),
  postGithubLogIn
);
globalRouter.get(routes.me, getMe);

globalRouter.get(routes.facebook, facebookLogin);
globalRouter.get(
  routes.facebookCallback,
  passport.authenticate("facebook", {
    failureRedirect: "/login"
  }),
  postFacebookLogin
);

export default globalRouter;