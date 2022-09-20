const widget = await createWidget();

  if (!config.runsInWidget) {
    await widget.presentLarge();  
  }  
  Script.setWidget(widget);  
  Script.complete();
  
  async function createWidget() {
    const widget = new ListWidget();
    const bg = await getImage('https://gitcode.net/4qiao/shortcuts/raw/master/update/img/Lamborghini.jpeg');
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