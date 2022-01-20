/*
 */
const $ = new Env('萌虎摇摇乐');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let message = '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
const JD_API_HOST = 'https://api.m.jd.com/api';
$.shareCode = [];
$.sharecardpool = [];
$.authorcode = '';
let Candraw = 0;//如果要抽奖改为1
let Candrawtime = 5;//默认抽奖次数5次
//如果要生成送卡链接，而不是内部送卡，填①③④;如果内部送卡，填②③④⑤
let Cansharelink = 0;//①如果送卡链接改为1
let Cansharein = 0;//②如果要内部送卡改为1
let sent = '';//③要赠送卡片的账号顺序(从1开始)
let sharecardid = '';//④填入要赠送卡片的id
let receive = '';//⑤要收卡的账号顺序(从1开始)

if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  console.log(`let Candraw = 0;//如果要抽奖改为1\nlet Candrawtime = 5;//默认抽奖次数5次\n\n//如果要生成送卡链接，而不是内部送卡，填①③④;如果内部送卡，填②③④⑤\nlet Cansharelink = 0;//①如果送卡链接改为1\nlet Cansharein = 0;//②如果要内部送卡改为1\nlet sent = '';//③要赠送卡片的账号顺序(从1开始)\nlet sharecardid = '';//④填入要赠送卡片的id\nlet receive = '';//⑤要收卡的账号顺序(从1开始)\n\n`)
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      await TotalBean();
      console.log(`\n*******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
        try{
            if (Date.now() <= 1643587200000) {
                console.log(`活动未结束,开始任务`);
                await jd_wish();
            } else if (Date.now() > 1643630400000) {
                let receiveprize = await takePost(`{"apiMapping":"/api/carveUp/receivePrize"}`);//到时间后领取瓜分奖励
                console.log(`瓜分获得${receiveprize.jdNums}`);
            }
        }catch (e) {
            console.log(JSON.stringify(e));
        }
    }
  }
    if (sent && Cansharelink == 1 && sharecardid) {
        $.sent = sent - 1;
        cookie = cookiesArr[$.sent];
        console.log(`\t└【账号${sent}】卡片尝试分享`);
        let sharecard = await takePost(`{"cardId":${sharecardid},"apiMapping":"/api/card/share"}`);
        console.log(`\t└赠送卡片信息获取成功`);
        console.log(`\t└赠卡链接: https://yearfestival.jd.com/#/?giveCardId=${sharecard}&t=${Date.now()}`);
        message +=(`\n【京东账号${sent}】\n赠卡链接:\n https://yearfestival.jd.com/#/?giveCardId=${sharecard}&t=${Date.now()}`);
        await $.wait(1000);
    }
    if (sent && receive && Cansharein == 1 && sharecardid) {
        $.sent = sent - 1;
        cookie = cookiesArr[$.sent];
        let sharecard = await takePost(`{"cardId":${sharecardid},"apiMapping":"/api/card/share"}`);
        $.sharecard = sharecard;
        console.log(`\t└赠送卡片信息获取成功`);
        $.receive = receive - 1;
        cookie = cookiesArr[$.receive];
        console.log(`开始领卡`);
        let receiv = await takePost(`{"uuid":"${$.sharecard}","apiMapping":"/api/card/receiveCard"}`);
        console.log(`\t└【账号${receive}】收到 ${receiv.cardName}`);
    }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      console.log(`开始内部助力\n`)
        for (let j = 0; j < $.shareCode.length; j++) {
            console.log(`${$.UserName} 去助力 ${$.shareCode[j].use}`)
            if ($.UserName == $.shareCode[j].use) {
              console.log(`不能助力自己`)
              continue
            }
            $.sharecode1 = $.shareCode[j].code;
            let doSupport = await takePost(`{"shareId":"${$.sharecode1}","apiMapping":"/api/task/support/doSupport"}`);
            if(doSupport.status == 7){
                console.log(`助力成功,自己获得 福气值${doSupport.supporterPrize.score} 京豆${doSupport.supporterPrize.beans} ,对方获得 福气值${doSupport.sharerPrize.score} 京豆${doSupport.sharerPrize.beans}`);
            }else if(doSupport.status == 3){
                console.log(`已助力过`);
            }else if(doSupport.status == 5){
                console.log(`助力次数已用完`);
            }else if(doSupport.status == 4){
                console.log(`助力已满`);
            }
            await $.wait(2000)
        }
    }
  }
    if (message) {
      $.msg($.name, '', message);
      if ($.isNode()) await notify.sendNotify($.name, message)
    }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })

async function jd_wish() {
    try {
        if (Cansharein == 0 && Cansharelink == 0) {
            let shareId = await takePost('{"apiMapping":"/api/task/support/getShareId"}');
            console.log(`【京东账号${$.index}（${$.UserName}）互助码】${shareId}\n`)
            $.shareCode.push({"code":shareId,"use":$.UserName});
            await $.wait(1000)
            let info = await takePost('{"apiMapping":"/api/index/indexInfo"}');
            console.log(`\n当前福气值  ${info.heatOwn}  ,可抽奖  ${info.lotteryNum}  次\n`);
            if (Candraw == 1) {
                console.log(`开始抽奖`);
                for (let j = 0; j < Candrawtime; j++) {
                    let lottery = await takePost(`{"apiMapping":"/api/lottery/lottery"}`);
                    if (lottery.prizeType == 2) {
                        console.log(`抽奖:${lottery.prizeCount} ${lottery.prizeName}`);
                    } else {
                        console.log(`抽奖:${lottery.prizeName}`);
                    }
                    await $.wait(1000)
                }
            }
            await $.wait(500)
            let taskALLlist = await takePost('{"apiMapping":"/api/task/brand/tabs"}');//获取任务总列表
            for (let k = 0; k < taskALLlist.length; k++) {
                $.everyTask = taskALLlist[k];
                $.taskGroupId = $.everyTask.taskGroupId;
                console.log(`去做分任务：${taskALLlist[k].brandName}`);
                await $.wait(500)
                let taskList = await takePost(`{"taskGroupId":${$.taskGroupId},"apiMapping":"/api/task/brand/getTaskList"}`);//获取分任务列表
                for (let i = 0; i < taskList.length; i++) {
                    $.indexi = i;
                    if (taskList[i].taskState == 0){
                        console.log(`任务：${taskList[i].taskItemName}，已完成`);
                        continue;
                    }
                    $.taskId = taskList[i].taskId;
                    $.browseTime = taskList[i].browseTime;
                    $.taskPrefixType = taskList[i].taskPrefixType;
                    $.hasNum = parseInt(taskList[i].totalNum) - parseInt(taskList[i].finishNum);//计算还需做多少次
                    await $.wait(500)
                    for (let m = 0; m < $.hasNum; m++) {
                        let lastList = await takePost(`{"taskGroupId":${$.taskGroupId},"apiMapping":"/api/task/brand/getTaskList"}`);
                        $.taskItemId = lastList[$.indexi].taskItemId;
                        $.taskItemName = lastList[$.indexi].taskItemName;
                        await $.wait(1000)
                        if ($.taskPrefixType == 1) {
                            console.log(`去做任务：${$.taskItemName}`)
                            let dotask = await takePost(`{"taskGroupId":${$.taskGroupId},"taskId":${$.taskId},"taskItemId":${$.taskItemId},"apiMapping":"/api/task/brand/doTask"}`);
                            await $.wait($.browseTime * 1000);
                            let getreward = await takePost(`{"taskGroupId":${$.taskGroupId},"taskId":${$.taskId},"taskItemId":${$.taskItemId},"timestamp":${dotask.timeStamp},"apiMapping":"/api/task/brand/getReward"}`);
                            console.log("获得福气值"+ getreward.integral +",京豆"+ getreward.jbean);
                        } else {
                            let dotask = await takePost(`{"taskGroupId":${$.taskGroupId},"taskId":${$.taskId},"taskItemId":${$.taskItemId},"apiMapping":"/api/task/brand/doTask"}`);
                            if (dotask.rewardInfoVo) {
                                //console.log(dotask.rewardInfoVo);
                                console.log("获得福气值"+ dotask.rewardInfoVo.integral +",京豆"+ dotask.rewardInfoVo.jbean);
                            } else {
                                console.log(`任务成功`);
                            }
                        }
                    }
                }
            }
        }
        let cardinfo = await takePost(`{"apiMapping":"/api/card/list"}`);
        cardown = cardinfo.cardList || [];
        for (let item of cardown) {
            if (item.cardId == 1 || item.cardId == 775 || item.cardId == 776 || item.cardId == 777 ) {
                console.log(`现有-稀有-卡片：${item.cardName}   ${item.count}   张,卡片id  ${item.cardId}`);
            } else {
                console.log(`现有卡片：${item.cardName}   ${item.count}   张,卡片id  ${item.cardId}`);
            }
        }
        await $.wait(1000)
    } catch (e) {
        $.logErr(e)
    }
}

async function takePost(info) {
    let body = `appid=china-joy&functionId=collect_bliss_cards_prod&body=${info}&t=${Date.now()}&loginType=2`
    let options = {
        url: `https://api.m.jd.com/api`,
        body:body,
        headers: {
            "Host":"api.m.jd.com",
            "Accept": "application/json, text/plain, */*",
            "Content-Type":"application/x-www-form-urlencoded",
            "Origin":"https://yearfestival.jd.com",
            'Cookie': cookie,
            "Accept-Language": "zh-CN",
            "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            "Referer": `https://yearfestival.jd.com/`,
            "Accept-Encoding": "gzip, deflate, br",
        }
    }
    return new Promise(resolve => {
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if(data){
                        data = JSON.parse(data);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data['data'] || {});
            }
        })
    })
}
function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
      "headers": {
        "Accept": "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 13) {
              $.isLogin = false; //cookie过期
              return
            }
            if (data['retcode'] === 0) {
              $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
            } else {
              $.nickName = $.UserName
            }
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}
function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
