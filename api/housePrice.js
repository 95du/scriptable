// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: home;
/**
* 小组件作者：95度茅台
* 
* 
*/

const stackBackground = Color.dynamic(
  new Color('#EFEBE9', 0.6), 
  new Color('#161D2A', 0.5)
);
const eventTextColor = Color.dynamic(
  new Color('#1E1E1E'), 
  new Color('#FEFEFE')
);

const uri = Script.name();
const F_MGR = FileManager.local();
const folder = F_MGR.joinPath(F_MGR.documentsDirectory(), "house");
const cacheFile = F_MGR.joinPath(folder, 'data.json');
const bgImage = F_MGR.joinPath(folder, uri + ".jpg");

if (F_MGR.fileExists(cacheFile)) {
  data = F_MGR.readString(cacheFile)
  obj = JSON.parse(data);
}

async function presentMenu() {
  let alert = new Alert();
  alert.title = '我的房子值多少钱'
  alert.message = '\n幸福里房产大数据房屋估值';
  alert.addDestructiveAction('更新代码');
  alert.addDestructiveAction('重置所有');
  alert.addAction('透明背景');
  alert.addAction('房屋估值');
  alert.addAction('预览组件');
  alert.addAction('退出菜单');
  mainMenu = await alert.presentAlert();
  if (mainMenu === 1) {
    if (F_MGR.fileExists(folder)) {
      await F_MGR.remove(folder);
    }
  }
  if (mainMenu === 2) {
    const modulePath = await downloadModule();
    if (modulePath != null) {
      const importedModule = importModule(modulePath);
      await importedModule.main();
    }
  }
  if (mainMenu === 3) {
    await addHouseMsg();
  }
  if (mainMenu === 4) {
    if (F_MGR.fileExists(cacheFile)) {
    await getHouseMsg(obj);
    await widget.presentMedium();
    } else {
      await addHouseMsg();
    }
  }
  if (mainMenu === 4) return;
  if (mainMenu === 0) {
    const iCloudInUse = F_MGR.isFileStoredIniCloud(module.filename);
    const reqUpdate = new Request(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvYXBpL2hvdXNlUHJpY2UuanM='));
    const codeString = await reqUpdate.loadString();
    if (codeString.indexOf('95度茅台') == -1) {
      notify('更新失败⚠️', '请检查网络或稍后再试');
    } else {
      F_MGR.writeString(module.filename, codeString)
      notify('小组件更新成功', '');
      const uri = Script.name();
      Safari.open('scriptable:///run/' + encodeURIComponent(uri));
    }
  }
}

async function createWidget(result) {
  const widget = new ListWidget();
  widget.backgroundImage = F_MGR.readImage(bgImage);
  // Wechat icon
  const picture = await getJson(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zaG9ydGN1dHMvcmF3L21hc3Rlci9hcGkvdXBkYXRlL2JvdHRvbUJhci5qc29u'));
  const items = picture.noticeApp[Math.floor(Math.random() * picture.noticeApp.length)];
  weChat = await getImage(items);
  
  
  // Frame Layout
  const mainStack = widget.addStack();
  mainStack.layoutHorizontally();

  /**
  * Left Stack
  *
  const leftStack = mainStack.addStack();
  leftStack.layoutVertically();
  // logo stack
  const logoStack = leftStack.addStack();
  logoStack.setPadding(0, 0, 0, 0);
  const ironMan = new Request ('https://gitcode.net/4qiao/scriptable/raw/master/img/house/house.png');
  const iconSymbol = await ironMan.loadImage();
  const ironManIcon = logoStack.addImage(iconSymbol);
  ironManIcon.imageSize = new Size(180, 180);
  //leftStack.addSpacer()
  */mainStack.addText(result.neighborhood)
  return widget
}

async function downloadModule() {
  const modulePath = F_MGR.joinPath(folder, 'tool.js');
  if (F_MGR.fileExists(modulePath)) {
    return modulePath;
  } else {
    const req = new Request(atob('aHR0cHM6Ly9naXRjb2RlLm5ldC80cWlhby9zY3JpcHRhYmxlL3Jhdy9tYXN0ZXIvdmlwL2JhY2tncm91bmRTY3JpcHQuanM='));
    const moduleJs = await req.load().catch(() => {
      return null;
    });
    if (moduleJs) {
      F_MGR.write(modulePath, moduleJs);
      return modulePath;
    }
  }
}

async function generateInputAlert(options,confirm) {  
  options = {
    ...options
  };
  const inputAlert = new Alert();
  inputAlert.title = options.title;
  inputAlert.message = options.message;
  const fieldArr = options.options;
  for (const option of fieldArr) {
    inputAlert.addTextField(option.hint, option.value);
  }
  inputAlert.addAction('取消');
  inputAlert.addAction('确认');
  let getIndex = await inputAlert.presentAlert();
  if (getIndex == 1) {
    const inputObj = [];
    fieldArr.forEach((_, index) => {
      let value = inputAlert.textFieldValue(index);
      inputObj.push({index, value});
    });
    confirm(inputObj);
  }
  return getIndex;
}

async function addHouseMsg() {  
  await generateInputAlert ({
    title: '输入房屋估值信息',
    options: [
      { hint: '城市', value: '海口' },
      { hint: '小区', value: '滨江帝景' },
      { hint: '年份', value: '2010' },
      { hint: '面积', value: '128' },
      { hint: '几室', value: '3' },
      { hint: '几厅', value: '2' },
      { hint: '几卫', value: '2' }]
    }, 
    async (inputArr) => {
      const city = await getJson('https://fangchan.toutiao.com/f100/api/city_search?full_text=' + encodeURIComponent(inputArr[0].value));
      const cityID = city.data.data[0].city_id
      // subdistrict
      const housing = await getJson('https://m.xflapp.com/f100/api/get_suggestion?city_id=15310&house_type=4&query=' + encodeURIComponent(inputArr[1].value) + '&only_neighborhood=1&source=h5')
      const houseList = housing.data
      const alert = new Alert();
      alert.title = '幸福里房产大数据';
      alert.message = '选择小区开始房屋估值'
          
      houseList.forEach(item => {
        alert.addAction(item.text + '  在售' + item.tips + '🔥');
      });
      alert.addCancelAction('取消');
      const houseId = await alert.presentSheet()
      const num = houseList[houseId]
      if (houseId === -1) return;
      if (F_MGR.fileExists(cacheFile)) {
        await F_MGR.remove(cacheFile)
      }
      obj = {
        cityID: cityID,
        num: num.id,
        name: num.rich_name.text,
        year: inputArr[2].value,
        squa: inputArr[3].value,
        room: inputArr[4].value,
        hall: inputArr[5].value,
        bath: inputArr[6].value
      }
      return await getHouseMsg(obj);
    }
  );
}


async function getHouseMsg(obj) {
  // House Valuation
  const house = await getJson(`https://m.xflapp.com/f100/api/estimate_house_price?city_id=${obj.cityID}&neighborhood_id=${obj.num}&squaremeter=${obj.squa}&floor_plan_room=${obj.room}&floor_plan_hall=${obj.hall}&floor_plan_bath=${obj.bath}&total_floor=1&floor=1&facing_type=3&decoration_type=4&built_year=${obj.year}&building_type=1&source=h5`);
  // neighborhood
  const neighborhood = await getJson(`https://m.xflapp.com/f100/api/neighborhood/info?neighborhood_id=${obj.num}&source=h5`);
  
  const pricing = house.data.estimate_pricing_persqm_str.split("元")[0];
  obj = {
    ...obj,
    pricing: pricing
  }
  if (!F_MGR.fileExists(folder)) {
    F_MGR.createDirectory(folder);
    F_MGR.writeString(cacheFile, JSON.stringify(obj));
  }
  
  if (pricing > data.pricing || pricing < data.pricing || !F_MGR.fileExists(cacheFile)) {
    notify(obj.name, `房屋价值${house.data.estimate_price_str}万，均价${house.data.estimate_pricing_persqm_str}`);
    F_MGR.writeString(cacheFile, JSON.stringify(obj));
  }
  
  //房屋价值
  //console.log(house.data.estimate_price_str)
  //房屋均价
  //console.log(house.data.estimate_pricing_persqm_str)
  //环比价格
  //console.log(house.data.estimate_price_rate_str)
  
  //小区均价
  //console.log(neighborhood.data.core_info[0].value)

  //在城市中占比
  //console.log(house.data.estimate_price_in_city_level)
  
  result = {
    ...house.data,
    neighborhood: neighborhood.data.core_info[0].value
  }
  return widget = await createWidget(result);
}

if (config.runsInApp) {
  await presentMenu();
} else {
  await getHouseMsg(obj);
  Script.setWidget(widget);
  Script.complete();
}

async function notify (title, body, url, opts = {}) {
  let n = new Notification()
  n = Object.assign(n, opts);
  n.title = title
  n.body = body
  n.sound = 'alert'
  if (url) n.openURL = url
  return await n.schedule();
}

async function getJson(url) {
  const req = await new Request(url)
  return await req.loadJSON();
}

async function getImage(url) {
  const r = await new Request(url);
  return await r.loadImage();
}