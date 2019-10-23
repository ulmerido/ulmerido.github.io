
const token = 'd6a0f4dddcef3105d3079c42de4cca7e';
const base = 'http://api.ipstack.com/'
const ipUrl = base + `check?access_key=${token}`;

class IpExtractor {


    constructor() {
    }

    async getIP() {
        const response = await fetch(ipUrl)
        const myJson = await response.json();
        return myJson.ip
    }

    async getUserID() {
        const response = await fetch(ipUrl)
        const myJson = await response.json();
        const uid = myJson.ip.split('.').join("");
        return uid
    }
}

const ipEx = new IpExtractor();
export default ipEx;
