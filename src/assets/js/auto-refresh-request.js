import axios from "axios";

let count = 1;
export default async function request(config) {
    return await axios(config).then((res)=>{
        if (res.data.code===13){
            if (count >= 5) {
                return res
            }
            let token = res.data.data.token;
            localStorage.setItem('token', token)
            config['headers']['Token'] = token
            return request(config)
        }else {
            return res
        }
    })
}
