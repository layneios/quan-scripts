/*

=============== Quan X ===============
[rewrite_local]
^https:\/\/cccat\.io\/user\/my.php url script-request-header https://raw.githubusercontent.com/layneios/quan-scripts/main/cccat_io.js

[MITM]
hostname = cccat.io

[task_local]
20 14 * * * https://raw.githubusercontent.com/layneios/quan-scripts/main/cccat_io.js, tag=CCCAT签到, enabled=true
*/

var headers = [];

const url = `https://cccat.io/user/_checkin.php`;
const method = `GET`;
const body = "";
const signKey = "cccat_user_sign_key";
const appName = "CCCAT";

if (typeof $request !== `undefined`) {
  const localCache = $prefs.valueForKey(signKey) || "{}";
  if (localCache) {
    var arr = JSON.parse(localCache);
    if (Array.isArray(arr) && arr.length !== 0) {
      arr.push($request.headers);
    } else {
      arr = [$request.headers];
    }
    const arrStr = JSON.stringify(arr);
    $prefs.setValueForKey(arrStr, signKey);
    $notify(appName, ``, `🎉 CCCAT签到数据获取成功。`);
  }
  $done({});
} else {
  const localCache = $prefs.valueForKey(signKey);
  headers = JSON.parse(localCache);
}

async function checkIn(header) {
  return new Promise((resolve, _) => {
    const myRequest = {
      url: url,
      method: method,
      headers: header,
      body: body,
    };
    $task.fetch(myRequest).then(
      (response) => {
        const msg = response.statusCode + "\n\n" + response.body;
        console.log(msg);
        const body = JSON.parse(response.body);
        resolve(body.msg);
      },
      (reason) => {
        console.log(reason.error);
        resolve(reason.error);
      }
    );
  });
}

(async () => {
  for (let index = 0; index < headers.length; index++) {
    const header = headers[index];
    await checkIn(header);
  }
})()
  .catch((e) => console.log(e))
  .finally((msg) => {
    $notify("CCCAT签到", "", msg);
    $done();
  });
