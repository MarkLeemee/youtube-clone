// routes는 defalut export됐기에 중괄호를 없애야
import routes from "../routes";
// Video를 받는 통로일뿐. 요소 자체를 저장하는 것은 아니다
import Video from "../models/Video";
import Comment from "../models/Comment";
import {
    s3
} from "../middlewares";

// async await를 활용하여 vidoe 데이터를 가져오고 render를 수행
export const home = async (req, res) => {
    try {
        // sort -1음 함으로써, 추후에 업로드 된 비디오가 우선순위가 된다. (즉 순서가 역으로 된다)
        const videos = await Video.find({}).sort({
            _id: -1
        });
        res.render("home", {
            pageTitle: "Home",
            videos
        });
    } catch (error) {
        // 에러 발생시 video가 없는 배열 전달
        console.log(error);
        res.render("home", {
            pageTitle: "Home",
            videos: []
        });
    }
};

export const search = async (req, res) => {
    // form에서 보내온 데이터는 req.query.term 에 들어가 있다
    // { query: { term }} = req 과 req.query.term은 같은 개념
    // 즉, 이하 코드는 term의 이름을 바꿔즈는 것이다.
    // const searchingBy = req.query.term 이거는 새로운 변수를 만드는 것
    const {
        query: {
            term: searchingBy
        },
    } = req;
    // 값이 변동될 것이니 let으로
    let videos = [];
    try {
        // 찾은 비디오로 갱신
        videos = await Video.find({
            // regular expression 활용
            //$regex 포함하는 단어 모두 찾기
            // $options i는 대소문자를 구분하지 않는다.
            title: {
                $regex: searchingBy,
                $options: "i"
            },
        }).sort({
            _id: -1
        });
    } catch (error) {
        console.log(error);
    }
    res.render("search", {
        pageTitle: "Search",
        searchingBy,
        videos
    });
};

export const getUpload = (req, res) =>
    res.render("upload", {
        pageTitle: "Upload"
    });

export const postUpload = async (req, res) => {
    // 데이터베이스에 파일 자체를 저장하는 것이 아니라 파일이 저장되는 경로(아마존 등)을 저장하는 것이다.
    const {
        body: {
            title,
            description
        },
        file: {
            location
        },
    } = req;
    // Video model에 업로드되는 비디오 객체 데이터를 추가(생성)한다.
    const newVideo = await Video.create({
        fileUrl: location,
        title,
        description,
        creator: req.user.id
    });
    req.user.videos.push(newVideo.id);
    req.user.save();
    res.redirect(routes.videoDetail(newVideo.id));
};

export const videoDetail = async (req, res) => {
    const {
        // (detail을 보기로 요청한 video id)복잡한 string이던 req.params.id를 id 변수로 활용
        params: {
            id
        },
    } = req;
    try {
        // id에 해당하는 객체를 Video model 안에 수많은 데이터 중에 찾아줌
        const video = await Video.findById(id)
            .populate("creator")
            .populate("comments");
        res.render("videoDetail", {
            pageTitle: video.title,
            video
        });
    } catch (error) {
        res.redirect(routes.home);
    }
};

export const getEditVideo = async (req, res) => {
    const {
        params: {
            id
        },
    } = req;
    try {
        const video = await Video.findById(id);
        if (String(video.creator) !== req.user.id) {
            throw Error();
        } else {
            res.render("editVideo", {
                pageTitle: `Edit ${video.title}`,
                video
            });
        }
    } catch (error) {
        res.redirect(routes.home);
    }
};

export const postEditVideo = async (req, res) => {
    const {
        params: {
            id
        },
        body: {
            title,
            description
        },
    } = req;
    try {
        // await 앞에 별도 변수없이 그냥 바로 메서드를 실행시키고 끝
        // findeOneAndUpdate 같은 id를 찾고, title을 title로 description을 description으로 선언 (즉, 업데이트)
        // title: title, description: description 과 동일
        await Video.findOneAndUpdate({
            _id: id
        }, {
            title,
            description
        });
        // 같은 페이지로 redirect 함으로써 새로고침 효과
        res.redirect(routes.videoDetail(id));
    } catch (error) {
        res.redirect(routes.home);
    }
};

export const deleteVideo = async (req, res) => {
    const {
        params: {
            id
        },
    } = req;
    try {
        // findeOneAndRemove 해당 model 객체 삭제 메서드
        // const video = await Video.findById(id);
        // 현재 비디오의 id에서 fileUrl을 받기 위해 현재의 비디오 db를 가져와요.
        const currentPost = await Video.findById(id);

        // 정규표현식을 만들어줍니다. 괄호로 그룹을 만들어줄 수 있어요.
        // group 1(첫 괄호 안의 값)은 프로토콜(http/https),
        // group 2는 서브도메인, 포트를 포함한 도메인 네임(프로토콜 이후~/path 전까지)
        // group 3는 path(도메인 네임 이후 path: 파일 경로 등)로 정의합니다.
        const regex = /(http[s]?:\/\/)?([^\/\s]+\/)(.*)/;

        // 현재 포스트의 fileUrl에서 정규식과 match되는 부분 중에 3번째 그룹을 변수로 선언해줘요.
        const filePath = await currentPost.fileUrl.match(regex)[3];

        // aws-sdk의 s3.deleteObject 함수는 지울 파일을 object로 받아요.
        // 그 obj는 Bucket과 Key를 String으로 갖고있어야해요.
        // Bucket은 생성한 버킷의 이름이예요. (e.g. we-tube)
        // Key는 버킷 안의 경로를 포함한 파일 이름이예요. (e.g. videos/filename)
        // 변수 이름은 potato가 되어도 된다는 것! 명심하세요!
        // 로컬 환경과, 빌드 환경에 따라 버킷을 다르게 하시고 싶은 분은 새로운 버킷 생성 후 dotenv를 이용하세요!
        // (e.g. process.env.PRODUCTION ? process.env.TEST_BUCKET: process.env.PRODUCT_BUCKET)
        const delFile = {
            Bucket: "uu-tube",
            // filePath는 이전에 정규식을 통해 잘라낸 변수임을 명심하세요!
            Key: filePath,
        };

        // s3.deleteObject를 이용해서 s3 내의 파일을 지워줘요.
        // 우리가 만들어준 해당 파일에 대한 object와, callback을 인자로 받아요.
        // 에러를 출력할 수도 있고 성공 메시지를 출력할 수 있어요. 아무 메세지 없이 pass 해줘도 돼요.
        // await로 함수 실행 시 순차적이지 않는 비동기함수의 실행순서를 제어하기 위해 promise를 해줘야돼요.
        await s3.deleteObject(delFile, function (err, data) {
            if (err) console.log(err);
            else console.log("The file has been removed");
        }).promise();

        // 다 왔어요! 파일을 지웠으니, 이제 db에서 찾아서 지워줍시다!
        await Video.findByIdAndRemove({
            _id: id
        });
        res.redirect(routes.home);

        // if (String(video.creator) !== req.user.id) {
        //     throw Error();
        // } else {
        //     await Video.findOneAndRemove({
        //         _id: id
        //     });
        // }
    } catch (error) {
        console.log(error);
    }
};

export const postRegisterView = async (req, res) => {
    const {
        params: {
            id
        }
    } = req;
    try {
        const video = await Video.findById(id);
        video.views += 1;
        video.save();
        res.status(200);
    } catch (error) {
        res.status(400);
    } finally {
        res.end();
    }
};

export const postAddComment = async (req, res) => {
    const {
        params: {
            id
        },
        body: {
            comment
        },
        user
    } = req;
    try {
        const video = await Video.findById(id);
        const newComment = await Comment.create({
            text: comment,
            creator: user.id
        });
        video.comments.push(newComment.id);
        video.save();
    } catch (error) {
        res.status(400);
    } finally {
        res.end();
    }
};