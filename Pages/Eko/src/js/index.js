import css from '../css/style.css';
import VideoComponent from './VideoCompponent.js'
import fbWrapper from './FirebaseWrapper.js'

const firebase = fbWrapper.getInstance();

class Script {
    constructor() {
        this.videoComponent = {
            video: document.getElementById("video1"),
            btn_PlayPause: document.getElementById("play-pause"),
            btn_Like: document.getElementById("like"),
            btn_Unlike: document.getElementById("unlike"),
            div_Juice: document.querySelector(".orange-juice"),
            div_Bar: document.getElementById("bar"),
            label_VideoTime: document.getElementById("video-time"),
            label_Likes: document.getElementById("label-likes"),
            label_Unlikes: document.getElementById("label-unlikes"),
            label_views: document.getElementById("label-views"),
        }
    }

    run() {
        let video = new VideoComponent(this.videoComponent);
        video.ID = "video3";
        video.Init();
    }
}

let script = new Script();
script.run();