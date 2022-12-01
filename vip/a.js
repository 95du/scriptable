async function main() {
  // Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: images;
const widget = await createWidget();
  
async function createWidget() {
  const widget = new ListWidget();
  const bg = await getImage('https://gitcode.net/4qiao/scriptable/raw/master/img/car/Lamborghini.jpeg');
  widget.backgroundImage = await shadowImage(bg);
  return widget;  
}

async function getImage(url) {
  const r = await new Request(url);
  return await r.loadImage();
}
  
async function shadowImage(img) {
  const ctx = new DrawContext();
  ctx.size = img.size;
  ctx.drawImageInRect(img, new Rect(0, 0, img.size['width'], img.size['height']));
  const res = await ctx.getImage();
  return res;  
}

if (!config.runsInWidget) {
  await widget.presentMedium();  
} else {
  Script.setWidget(widget);  
  Script.complete();
}
}

module.exports = {
  main
}