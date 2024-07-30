/*
Script Author: Yui Chy
*/

!(async () => {
  let ids = $prefs.valueForKey("APP_ID");
  if (!ids) {
    $notify("Đã thêm tất cả TF", "Vui lòng đóng thủ công", "");
    $done();
  } else {
    ids = ids.split(",");
    try {
      for await (const ID of ids) {
        await autoPost(ID);
      }
    } catch (error) {
      console.log(error);
    }
    $done();
  }
})();

async function autoPost(ID) {
  const key = $prefs.valueForKey("key");
  const testurl = `https://testflight.apple.com/v3/accounts/${key}/ru/${ID}`;
  const header = {
    "User-Agent": "Oasis/3.5.1 OasisBuild/425.2 iOS/17.5.1 model/iPhone14,3 hwp/t8110 build/21F90 (6; dt:256) AMS/1 TSE/0",
    "Pragma": "no-cache",
    "Accept": "application/json",
    "Host": "testflight.apple.com",
    "X-Session-Id": $prefs.valueForKey("session_id"),
    "X-Session-Digest": $prefs.valueForKey("session_digest"),
    "X-Apple-Store-Front": "143441-43,29",
    "Accept-Encoding": "br, gzip, deflate",
    "Accept-Language": "vi",
    "X-Apple-TA-Device": "iPhone14,3 iPhone13,4",
    "X-Request-Id": $prefs.valueForKey("request_id"),
    "X-Apple-AMD-M": "0hYxEBrrJeJgrF1kj2jbNIFgwZXFN6VcVWdB1RgEsc48ptRUvUvzS8KKglTq1AFnJz9G6HUHybjPk7Km",
    "Connection": "keep-alive",
    "Content-Type": "application/json",
    "X-Apple-Device-Model": "iPhone14,3"
  };

  try {
    const resp = await $task.fetch({ url: testurl, method: "GET", headers: header });
    if (resp.statusCode === 404) {
      let ids = $prefs.valueForKey("APP_ID").split(",");
      ids = ids.filter(appId => appId !== ID);
      $prefs.setValueForKey(ids.join(","), "APP_ID");
      $notify(ID, "Không tìm thấy TF", "APP_ID đã bị xóa tự động");
    } else {
      const jsonData = JSON.parse(resp.body);
      if (jsonData.data && jsonData.data.status !== "FULL") {
        const res = await $task.fetch({ url: `${testurl}/accept`, method: "POST", headers: header, body: "" });
        const jsonBody = JSON.parse(res.body);
        $notify(jsonBody.data.name, "Tham gia TestFlight thành công", "");
        console.log(`${jsonBody.data.name} Tham gia TestFlight thành công`);
        let ids = $prefs.valueForKey("APP_ID").split(",");
        ids = ids.filter(appId => appId !== ID);
        $prefs.setValueForKey(ids.join(","), "APP_ID");
      }
    }
  } catch (error) {
    console.log(ID + " " + error);
    $notify("Tự động tham gia TF", error, "");
  }
}
