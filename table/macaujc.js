// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: bowling-ball;
/**
 * 小组件作者: 95度茅台
 * Version 1.0.0
 * 2023-05-17
 * 澳门六合彩开奖结果
 */


async function main() {
  const fetchData = async (url) => {
    const req = await new Request(url).loadJSON();
    return req[0];
  };
  
  const processData = (data) => {
    const { openCode, zodiac, wave, expect } = data;
    const openCodeArr = openCode.split(",");
    const zodiacArr = zodiac.split(",");
    const waveArr = wave.split(",");
    return { openCodeArr, zodiacArr, waveArr, expect };
  };
  
  const [macaujc1, macaujc2] = await Promise.all([
    fetchData('https://www.macaumarksix.com/api/macaujc.com'),
    fetchData('https://www.macaumarksix.com/api/macaujc2.com')
  ]);
  
  const { openCodeArr, zodiacArr, waveArr, expect} = processData(macaujc1);
  
  const { openCodeArr: openCodeArr2, zodiacArr: zodiacArr2, waveArr: waveArr2 } = processData(macaujc2);
  
  // 处理颜色代码
  const colorHex = {
    green: '#34C759',
    blue: '#0061FF',
    red: '#FF0000',
    orange: '#FF9500',
    purple: '#9D64FF',
    yellow: '#FFA300'
  };
  
  const colorCode = waveArr.map((name) => { return colorHex[name] });
  
  const colorCode2 = waveArr2.map((name) => { return colorHex[name] });
  
  const widgetBgColor = Color.dynamic(
    new Color("#fefefe"),
    new Color("#1e1e1e")
  );
  
  const contextColor = Color.dynamic(
    new Color('#48484b', 0.3),
    new Color('#FFFFFF', 0.3)
  );
  
  /**
   * 获取网络图片
   * @param {Image} url
   */
  const getImage = async (url) => {
    return await new Request(url).loadImage();
  };
  
  
  //=========> Create <=========//
  
  const createWidget = async () => {
    const widget = new ListWidget();
    
    if (!Device.isUsingDarkAppearance()) {
      widget.backgroundImage = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/jingdong/baiTiaoBg2.png');
    };
    
    widget.backgroundColor = widgetBgColor;
    widget.setPadding(10, 5, 10, 5);
    const titleStack = widget.addStack();
    titleStack.layoutHorizontally();
    titleStack.centerAlignContent();
    titleStack.addSpacer();
    
    const titleText = titleStack.addText('澳门六合彩');
    titleText.centerAlignText();
    titleText.font = Font.boldSystemFont(16);
    titleStack.addSpacer(15);
    
    const expectText1 = titleStack.addText('第 ');
    expectText1.font = Font.mediumSystemFont(15);
    
    const expectText2 = titleStack.addText(expect);
    expectText2.font = Font.mediumSystemFont(17);
    expectText2.textColor = Color.red();
    
    const expectText3 = titleStack.addText(' 期');
    expectText3.font = Font.mediumSystemFont(15);
    
    titleStack.addSpacer();
    widget.addSpacer(10);
    
    // openCodeArr
    const mainStack1 = widget.addStack();
    mainStack1.layoutHorizontally();
    mainStack1.addSpacer();
  
    const codeStack = mainStack1.addStack();
    codeStack.layoutHorizontally();
    codeStack.centerAlignContent();
    mainStack1.addSpacer();
    
    widget.addSpacer(3);
    
    const mainStack2 = widget.addStack();
    mainStack2.layoutHorizontally();
    mainStack2.addSpacer();
  
    const zodiacStack = mainStack2.addStack();
    zodiacStack.layoutHorizontally();
    mainStack2.addSpacer();
    
    
    for (let i = 0; i < openCodeArr.length; i++) {
      const item = openCodeArr[i];
      codeStack.addSpacer(4);
      
      const barStack = codeStack.addStack();
      barStack.layoutHorizontally();
      barStack.centerAlignContent();
      barStack.size = new Size(40, 30)
      
      barStack.backgroundColor = new Color(colorCode[i]);
      barStack.cornerRadius = 8;
     
      const openCodeText = barStack.addText(item);
      openCodeText.font = Font.mediumSystemFont(20);
      openCodeText.textColor = Color.white();
      codeStack.addSpacer(4);
    };
    
    for (let i = 0; i < zodiacArr.length; i++) {
      const item = zodiacArr[i];
      zodiacStack.addSpacer();
      const zodiacText = zodiacStack.addText(item);
      zodiacText.font = Font.boldSystemFont(13);
      zodiacText.textOpacity = 0.7;
      zodiacStack.addSpacer();
    };
    
    // 绘制分割线
    widget.addSpacer(8);
    const context = new DrawContext()
    context.size = new Size(150, 0.5);
    context.opaque = false;
    context.respectScreenScale = true;
    context.setFillColor(contextColor);
    const path = new Path();
    path.addRoundedRect(new Rect(0, 0, 150, 0.4), 3, 2);
    context.addPath(path);
    context.fillPath();
    context.setFillColor(contextColor);
    const drawLine = widget.addImage(context.getImage());
    drawLine.centerAlignImage();
    widget.addSpacer(8);
    
    // openCodeArr2
    const mainStack3 = widget.addStack();
    mainStack3.layoutHorizontally();
    mainStack3.addSpacer();
  
    const codeStack2 = mainStack3.addStack();
    codeStack2.layoutHorizontally();
    codeStack2.centerAlignContent();
    mainStack3.addSpacer();
    
    widget.addSpacer(3);
    
    const mainStack4 = widget.addStack();
    mainStack4.layoutHorizontally();
    mainStack4.addSpacer();
  
    const zodiacStack2 = mainStack4.addStack();
    zodiacStack.layoutHorizontally();
    mainStack4.addSpacer();
    
    for (let i = 0; i < openCodeArr2.length; i++) {
      const item = openCodeArr2[i];
      codeStack2.addSpacer(4);
      
      const barStack2 = codeStack2.addStack();
      barStack2.layoutHorizontally();
      barStack2.centerAlignContent();
      barStack2.size = new Size(40, 30)
      barStack2.backgroundColor = new Color(colorCode2[i]);
      barStack2.cornerRadius = 8;
     
      const openCodeText2 = barStack2.addText(item);
      openCodeText2.font = Font.mediumSystemFont(20);
      openCodeText2.textColor = Color.white();
      codeStack2.addSpacer(4);
    };
    
    for (let i = 0; i < zodiacArr2.length; i++) {
      const item = zodiacArr2[i];
      zodiacStack2.addSpacer();
      const zodiacText2 = zodiacStack2.addText(item);
      zodiacText2.font = Font.boldSystemFont(13);
      zodiacText2.textOpacity = 0.7;
      zodiacStack2.addSpacer();
    };
    
    if (config.runsInApp) {
      await widget.presentMedium();
    } else {
      Script.setWidget(widget);
      Script.complete();
    };
    return widget;
  };
  
  const errorWidget = async () => {
    const widget = new ListWidget();
    const text = widget.addText('仅支持中尺寸');
    text.font = Font.systemFont(17);
    text.centerAlignText();
    Script.setWidget(widget);
  };
  
  const runWidget = async () => {
    await (config.runsInApp || config.widgetFamily === 'medium' ? createWidget() : errorWidget());
  }
  await runWidget();
}
module.exports = { main }