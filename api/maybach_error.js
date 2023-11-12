// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: car;

async function main() {
const fm = FileManager.local();
const mainPath = fm.joinPath(fm.documentsDirectory(), 'mercedes');
if (!fm.fileExists(mainPath)) fm.createDirectory(mainPath);

const cache = fm.joinPath(mainPath, 'cachePath');
if (!fm.fileExists(cache)) fm.createDirectory(cache);

const cacheFile = fm.joinPath(mainPath, 'setting.json')

/**
 * 读取储存的设置
 * @param {string} file - JSON
 * @returns {object} - JSON
 */
const getSettings = (file) => {
  let setting = {};
  if (fm.fileExists(file)) {
    return { parkingTime, myPlate, address, imgArr } = JSON.parse(fm.readString(file));
  }
  return {}
}
const setting = await getSettings(cacheFile);

/**
 * 获取远程图片
 * @returns {image} - image
 */
const getImage = async (url) => {
  return await new Request(url).loadImage();
};

/**
 * 获取图片并使用缓存
 * @param {string} File Extension
 * @returns {image} - Request
 */
const downloadCarImage = async (item) => {
  const carImage = await getImage(item);
  const imgKey = decodeURIComponent(item.substring(item.lastIndexOf("/") + 1));
  const cachePath = fm.joinPath(cache, imgKey);
  fm.writeImage(cachePath, carImage, { overwrite: true });
  imgArr.push(imgKey);
  writeSettings(setting);
};

const loadPicture = async () => {
  if ( !setting.imgArr?.length ) {
    const maybach = Array.from({ length: 9 }, (_, index) => `https://gitcode.net/4qiao/scriptable/raw/master/img/car/Maybach-${index}.png`);
    maybach.forEach(async (item) => {
      await downloadCarImage(item);
    });
  }
};

/**
 * 随机获取缓存图片
 * @param {image} file
 */
async function getRandomImage() {
  const count = imgArr.length;
  const index = Math.floor(Math.random() * count);
  const cacheImgPath = cache + '/' + imgArr[index];
  return fm.readImage(cacheImgPath);
};

/**
 * 获取网络图片并使用缓存
 * @param {Image} url
 */
const useFileManager = () => {
  return {
    readImage: (fileName) => {
      const imgPath = fm.joinPath(cache, fileName);
      return fm.fileExists(imgPath) ? fm.readImage(imgPath) : null;
    },
    writeImage: (fileName, image) => fm.writeImage(fm.joinPath(cache, fileName), image)
  }
};
  
const getCacheImage = async (name, url) => {
  const cache = useFileManager();
  const image = cache.readImage(name);
  if ( image ) return image;
  const img = await getImage(url);
  cache.writeImage(name, img);
  return img;
};

// 设置组件背景
const setBackground = async (widget) => {
  widget.backgroundColor = Color.white();
  const gradient = new LinearGradient();
  const color = [
    "#82B1FF",
    "#4FC3F7",
    "#66CCFF",
    "#99CCCC",
    "#BCBBBB",
    "#A0BACB"
  ];
  const items = color[Math.floor(Math.random() * color.length)];
  gradient.locations = [0, 1];
  gradient.colors = [
    new Color(items, 0.5),
    new Color('#00000000')
  ];
  widget.backgroundGradient = gradient;
};

//=========> Create <=========//
const createWidget = async () => {
  const widget = new ListWidget();
  await setBackground(widget);
  widget.setPadding(10, 10, 10, 15);
  
  const mainStack = widget.addStack();
  mainStack.layoutHorizontally();
  mainStack.addSpacer();

  /**
   * Create left stack
   * @param {image} SFSymbol
   * @param {string} text
   * Cylindrical Bar Chart
   */
  const leftStack = mainStack.addStack();
  leftStack.layoutVertically();
  leftStack.addSpacer();
  
  const plateStack = leftStack.addStack();
  const plateText = plateStack.addText('琼A·849A8');
  plateText.font = Font.mediumSystemFont(19);
  plateText.textColor = Color.black();
  plateText.textOpacity = 0.9;
  leftStack.addSpacer(3);
  
  const benzStack = leftStack.addStack();
  benzStack.layoutHorizontally();
  benzStack.centerAlignContent();
  const iconSymbol = SFSymbol.named('car.circle');
  const carIcon1 = benzStack.addImage(iconSymbol.image);
  carIcon1.imageSize = new Size(16, 16);
  benzStack.addSpacer(4);
  
  const vehicleModelText = benzStack.addText('not network');
  vehicleModelText.font = Font.mediumSystemFont(14);
  vehicleModelText.textColor = Color.black();
  vehicleModelText.textOpacity = 0.7;
  leftStack.addSpacer(3)
  
  // Update Time
  const dateStack = leftStack.addStack();
  dateStack.layoutHorizontally();
  dateStack.centerAlignContent();
  const iconSymbol2 = SFSymbol.named('timer');
  const carIcon2 = dateStack.addImage(iconSymbol2.image)
  carIcon2.imageSize = new Size(16, 16);
  dateStack.addSpacer(4);
  
  const updateTimeText = dateStack.addText(parkingTime);
  updateTimeText.font = Font.mediumSystemFont(13);
  updateTimeText.textColor = Color.black();
  updateTimeText.textOpacity = 0.7;
  leftStack.addSpacer(22);
  
  // Left Stack bar
  const barStack = leftStack.addStack();
  barStack.layoutHorizontally();
  barStack.centerAlignContent();
  barStack.setPadding(3, 10, 3, 10);
  barStack.cornerRadius = 10;
  barStack.borderColor = new Color('#AB47BC', 0.7);
  barStack.borderWidth = 2;
  
  const barIcon = SFSymbol.named('location');
  const barIconElement = barStack.addImage(barIcon.image);
  barIconElement.imageSize = new Size(16, 16);
  barIconElement.tintColor = Color.purple();
  barStack.addSpacer(4);
  
  const speedText = barStack.addText('已静止');
  speedText.font = Font.mediumSystemFont(14);
  speedText.textColor = new Color('#AA00FF');
  leftStack.addSpacer(8);

  // Left Stack bar2
  const barStack2 = leftStack.addStack();
  barStack2.layoutHorizontally();
  barStack2.centerAlignContent();
  barStack2.setPadding(3, 10, 3, 10);
  barStack2.cornerRadius = 10;
  barStack2.borderColor = new Color('#000000', 0.4);
  barStack2.borderWidth = 2;
  
  const barIcon2 = SFSymbol.named('lock.shield.fill');
  const barIconElement2 = barStack2.addImage(barIcon2.image);
  barIconElement2.imageSize = new Size(16, 16);
  barIconElement2.tintColor = Color.green();
  barStack2.addSpacer(4);
  
  const statusText = barStack2.addText('已锁车');
  statusText.font = Font.mediumSystemFont(14);
  statusText.textColor = Color.black();
  statusText.textOpacity = 0.6;
  leftStack.addSpacer();
    
  /**
   * Create right Stack
   * @param {image} image
   * @param {string} address
   */
  const rightStack = mainStack.addStack();
  rightStack.layoutVertically();
  rightStack.addSpacer();
  
  const carLogoStack = rightStack.addStack();
  carLogoStack.addSpacer();
  const carLogo = await getCacheImage('maybachLogo.png' ,'https://gitcode.net/4qiao/scriptable/raw/master/img/car/maybachLogo.png');
  const image = carLogoStack.addImage(carLogo);
  image.imageSize = new Size(27, 27);
  image.tintColor = Color.black();
  rightStack.addSpacer(1);
    
  // Car image
  const carImageStack = rightStack.addStack();
  carImageStack.setPadding(-25, 5, 0, 0);
  const imageCar = carImageStack.addImage(await getRandomImage());
  imageCar.imageSize = new Size(225, 100);
  rightStack.addSpacer();

  // show address
  const adrStack = rightStack.addStack();
  adrStack.centerAlignContent();
  adrStack.size = new Size(226, 30);
  
  const jmz = {};
  jmz.GetLength = function(str) {
    return str.replace(/[\u0391-\uFFE5]/g,"@@").length;
   };  
  const str = jmz.GetLength(address);
  if ( str <= 35 ) {
    addressText = adrStack.addText(address + ' - 当前位置属乡镇、高速路或无名路段 🚫');
  } else {
    addressText = adrStack.addText(address + ' 🚫');
  }
  
  addressText.font = Font.mediumSystemFont(11.3);
  addressText.textColor = Color.black();
  addressText.textOpacity = 0.7;
  addressText.centerAlignText();
  rightStack.addSpacer();
  
  Script.setWidget(widget);
  Script.complete();
};

/**-------------------------**/

const runWidget = async () => {
  if (config.runsInWidget && config.widgetFamily === 'medium') {
    await createWidget();
  }
};
await runWidget();
}
module.exports = { main }