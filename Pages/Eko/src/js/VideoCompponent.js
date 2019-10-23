import fbWrapper from './FirebaseWrapper.js';
import IpExtractor from './IpExtractor.js';

const k_ColorNeutral = '#aaa';
const k_ColorLike = '#0084FF';
const k_ColorUnlike = '#ff2b1c';
const firebase = fbWrapper.getInstance();
const enumLike = {
    like: 1,
    neutral: 0,
    unlike: -1,
}

export default class VideoComponent {

    constructor(i_VideoElements) {
        // Fields
        this.video = i_VideoElements.video;
        this.btn_PlayPause = i_VideoElements.btn_PlayPause;
        this.btn_Like = i_VideoElements.btn_Like;
        this.btn_Unlike = i_VideoElements.btn_Unlike;
        this.label_vidTime = i_VideoElements.label_VideoTime;
        this.label_Likes = i_VideoElements.label_Likes;
        this.label_Unlikes = i_VideoElements.label_Unlikes;
        this.label_views = i_VideoElements.label_views;
        this.progressBar = i_VideoElements.div_Bar;
        this.progressJuice = i_VideoElements.div_Juice;
        this.didView = false;
        this.ID = "video3";

        //Methods
        this.Init = this.Init.bind(this);
        this.OnClick_ButtonPlayPause = this.OnClick_ButtonPlayPause.bind(this);
        this.OnTimeUpdate_VideoPlayer = this.OnTimeUpdate_VideoPlayer.bind(this);
        this.OnClick_ProgressBar = this.OnClick_ProgressBar.bind(this);
        this.OnClick_ButtonLike = this.OnClick_ButtonLike.bind(this);
        this.OnClick_ButtonUnlike = this.OnClick_ButtonUnlike.bind(this);
        this._updateLikeButtonsColor = this._updateLikeButtonsColor.bind(this);

        // Init
        this.video.pause();
    }

    Init() {
        this.btn_PlayPause.onclick = this.OnClick_ButtonPlayPause
        this.video.ontimeupdate = this.OnTimeUpdate_VideoPlayer;
        this.video.onclick = this.OnClick_ButtonPlayPause;
        this.progressBar.onclick = this.OnClick_ProgressBar;
        this.btn_Like.onclick = this.OnClick_ButtonLike;
        this.btn_Unlike.onclick = this.OnClick_ButtonUnlike;
        IpExtractor.getUserID().then((uid) => {
            const path = `users/${uid}/views/${this.ID}`;
            fbWrapper.addListener(path, snap => { if (snap.exists()) this._updateLikeButtonsColor(snap.val().like); });
        })

        fbWrapper.addListener(`Videos/${this.ID}/`, snap => {
            let val = snap.val();
            this.label_Likes.innerHTML = `${val.likes}`;
            this.label_Unlikes.innerHTML = `${val.unlikes}`;
            this.label_views.innerHTML = `${val.views}`;
        })

        document.body.onkeyup = (e) => {
            if (e.keyCode == 32) {
                this.OnClick_ButtonPlayPause();

            }
            else if (e.keyCode == 37) {
                this.video.currentTime = this.video.currentTime - 1.5;;
            }
            else if (e.keyCode == 39) {
                this.video.currentTime = this.video.currentTime + 1.5;;
            }

        }
    }

    _shouldUpdateCount() {
        IpExtractor.getUserID().then(i_UserID => {
            const userPath = 'users/' + i_UserID + '/views/' + this.ID;
            fbWrapper.pathExists(userPath).then(pathExists => {
                if (!pathExists) {
                    const toAdd = { like: 0 }
                    fbWrapper.setValue(userPath, toAdd)
                    fbWrapper.incrementValue(`Videos/${this.ID}/views`);
                }
            });
        });

        this.didView = true;
    }

    _updateLikeButtonsColor(i_LikeType) {
        switch (i_LikeType) {
            case enumLike.like:
                this.btn_Like.style.color = k_ColorLike;
                this.btn_Unlike.style.color = k_ColorNeutral;
                break;
            case enumLike.neutral:
                this.btn_Like.style.color = k_ColorNeutral;
                this.btn_Unlike.style.color = k_ColorNeutral;
                break;
            case enumLike.unlike:
                this.btn_Like.style.color = k_ColorNeutral;
                this.btn_Unlike.style.color = k_ColorUnlike;
                break;
        }
    }

    OnTimeUpdate_VideoPlayer() {
        let time = this._ssToHHMMSS(this.video.currentTime);
        let duration = this._ssToHHMMSS(this.video.duration);
        this.label_vidTime.innerHTML = ` ${time} / ${duration} `;

        let x = this.video.currentTime / this.video.duration;
        this.progressJuice.style.width = x * 100 + '%';
        if (this.video.ended) {
            this.btn_PlayPause.className = 'play';
        }
    }

    OnClick_ButtonPlayPause() {
        if (this.video.paused) {
            this.video.play();
            this.btn_PlayPause.className = "pause";
            if (!this.didView) {
                this._shouldUpdateCount();
            }
        }
        else {
            this.btn_PlayPause.className = "play";
            this.video.pause();
        }
    }

    OnClick_ProgressBar() {
        var test = (event.offsetX - this.progressBar.offsetLeft) / this.progressBar.offsetWidth;
        this.video.currentTime = (test * this.video.duration);
    }

    OnClick_ButtonLike() {
        IpExtractor.getUserID().then(async i_UserID => {
            const uid = i_UserID.split('.').join("");
            const userPath = `users/${uid}/views/${this.ID}`;
            const videoLikesPath = `Videos/${this.ID}/likes`;
            const videoUnlikesPath = `Videos/${this.ID}/unlikes`;
            const snap = await fbWrapper.get(userPath);

            if (!snap.exists()) {
                fbWrapper.setValue(userPath, { like: 1 });
                fbWrapper.incrementValue(videoLikesPath);
            }
            else {
                switch (snap.val().like) {
                    case enumLike.like:
                        fbWrapper.setValue(userPath, { like: 0 });
                        fbWrapper.incrementValue(videoLikesPath, -1);
                        break;
                    case enumLike.neutral:
                        fbWrapper.setValue(userPath, { like: 1 });
                        fbWrapper.incrementValue(videoLikesPath);
                        break;
                    case enumLike.unlike:
                        fbWrapper.setValue(userPath, { like: 1 });
                        fbWrapper.incrementValue(videoLikesPath);
                        fbWrapper.incrementValue(videoUnlikesPath, -1);
                        break;
                }
            }
        })
    }

    OnClick_ButtonUnlike() {
        IpExtractor.getIP().then(ip => {
            const uid = ip.split('.').join("");
            const userPath = `users/${uid}/views/${this.ID}`;
            const videoLikesPath = `Videos/${this.ID}/likes`;
            const videoUnlikesPath = `Videos/${this.ID}/unlikes`;

            fbWrapper.get(userPath).then(snap => {
                if (!snap.exists()) {
                    fbWrapper.setValue(userPath, { like: -1 });
                    fbWrapper.incrementValue(videoUnlikesPath);
                }
                else {
                    let like = snap.val().like;
                    switch (like) {
                        case enumLike.like:
                            fbWrapper.setValue(userPath, { like: -1 });
                            fbWrapper.incrementValue(videoLikesPath, -1);
                            fbWrapper.incrementValue(videoUnlikesPath);
                            break;
                        case enumLike.neutral:
                            fbWrapper.setValue(userPath, { like: -1 });
                            fbWrapper.incrementValue(videoUnlikesPath);
                            break;
                        case enumLike.unlike:
                            fbWrapper.setValue(userPath, { like: 0 });
                            fbWrapper.incrementValue(videoUnlikesPath, -1);
                            break;
                    }
                }
            });
        })
    }

    _ssToHHMMSS(secs) {
        let sec_num = parseInt(secs, 10)
        let hours = Math.floor(sec_num / 3600)
        let minutes = Math.floor(sec_num / 60) % 60
        let seconds = sec_num % 60

        return [hours, minutes, seconds]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":")
    }


}