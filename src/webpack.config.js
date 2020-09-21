// express에서는 path 패키지를 기본적으로 제공
const path = require("path");
const autoprefixer = require("autoprefixer");
// 설치한 extract text 엔진을 가져옴
const ExtractCSS = require("extract-text-webpack-plugin");
const MODE = process.env.WEBPACK_ENV;

// __dirname은 현재 프로젝트 디렉토리 이름,  어디서든 접근 가능한 전역변수
// 즉 main.js까지의 걍로
const ENTRY_FILE = path.resolve(__dirname, "assets", "js", "main.js");
// static이라는 폴더로 보낼거다
const OUTPUT_DIR = path.join(__dirname, "static");

const config = {
    // babel/polufill을 통해 접근
    entry: ["@babel/polyfill", ENTRY_FILE],
    mode: MODE,
    module: {
        // rules은 배열, 웹팩에게 파일추가하는 방법
        rules: [{
                test: /\.(js)$/,
                use: [{
                    // es6를 일반자바스크립토
                    loader: "babel-loader",
                }, ],
            },
            {
                // 해당 파일이 맞는지 확인하는 작업 scss가 맞는지
                // scss 파일을 찾게 된다
                // reuglar expression
                test: /\.(scss)$/,
                // scss를 찾았을 때, extract text plugin 활용
                // 이 plugin 안에는 또다른 plugin 활용

                // "css로 바꾸고"!!
                // 그 중 css인 텍스트를 추출하고 css로 저장

                // 일반 문서와 다르게 아래에서 위 순서대로 진행
                // extractCSS로 가져온 css부분만 추출하여서 새로울 파일을 만들어준다.
                use: ExtractCSS.extract([{
                        // 순수한 css만을 이해하도록 만들어줌
                        // 그리고 그걸 추출해서 어딘가로 보내는게 최종 목적
                        // css를 가져온다
                        loader: "css-loader",
                    },
                    {
                        // 단순 번역이 아니라 호환성을 가져줌
                        // 브라우저에서 이해할 수 있게
                        // 특정 plugin들을 css에 대해 실행시켜주고
                        loader: "postcss-loader",
                        options: {
                            // 함수 개념
                            plugins() {
                                // 여기서는 autoprefixer 하나만 했지만,
                                // 배일이니깐 여러개의 plugin을 가져올 수도 있다.
                                // 시중에 있는 99.5%의 브라우저와 호환시켜줌
                                return [
                                    autoprefixer({
                                        overrideBrowserslist: "cover 99.5%",
                                    }),
                                ];
                            },
                        },
                    },
                    {
                        // scss를 받아서 일반 css로 바꿔준다
                        loader: "sass-loader",
                    },
                ]),
            },
        ],
    },
    output: {
        path: OUTPUT_DIR,
        filename: "[name].js",
    },
    // plugin을 설치해야한다.
    // 새로운 css 생성
    plugins: [new ExtractCSS("styles.css")],
};

module.exports = config;