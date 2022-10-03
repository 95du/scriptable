// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: paper-plane;
const widget = await createWidget();

  if (!config.runsInWidget) {
    await widget.presentMedium();  
  } else {
    Script.setWidget(widget);  
    Script.complete();
  }
  
  async function createWidget() {
    const widget = new ListWidget();
    // car Data
    const req = new Request('http://ts.amap.com/ws/tservice/location/getLast?in=KQg8sUmvHrGwu0pKBNTpm771R2H0JQ%2FOGXKBlkZU2BGhuA1pzHHFrOaNuhDzCrQgzcY558tHvcDx%2BJTJL1YGUgE04I1R4mrv6h77NxyjhA433hFM5OvkS%2FUQSlrnwN5pfgKnFF%2FLKN1lZwOXIIN7CkCmdVD26fh%2Fs1crIx%2BJZUuI6dPYfkutl1Z5zqSzXQqwjFw03j3aRumh7ZaqDYd9fXcT98gi034XCXQJyxrHpE%2BPPlErnfiKxd36lLHKMJ7FtP7WL%2FOHOKE%2F3YNN0V9EEd%2Fj3BSYacBTdShJ4Y0pEtUf2qTpdsIWn%2F7Ls1llHCsoBB24PQ%3D%3D&ent=2&keyt=4');
    req.method = 'GET'
    req.headers = {"Cookie": "sessionid=ggylbvv5klxzm6ahibpfng4ldna2cxsy"}
    const res = await req.loadJSON();
    const data = res.data
    
    //address
    const REQ = new Request(`http://restapi.amap.com/v3/geocode/regeo?key=9d6a1f278fdce6dd8873cd6f65cae2e0&s=rsv3&location=${data.longitude},${data.latitude}`);  
    const RES = await REQ.loadJSON();
    const address = RES.regeocode.formatted_address
    
    //Background
    const bg = await getImage(`https://restapi.amap.com/v3/staticmap?&key=a35a9538433a183718ce973382012f55&zoom=14&size=450*300&markers=-1,https://image.fosunholiday.com/cl/image/comment/619016bf24e0bc56ff2a968a_Locating_9.png,0:${data.longitude},${data.latitude}`);
    widget.backgroundImage = await shadowImage(bg);


    //TextField
    const Stack = widget.addStack();  
    const carText = Stack.addText(`${address}`);
    if (data.speed <= 5) {
      carText.textColor = Color.blue();
    } else {
      carText.textColor = new Color('#34C759');
    }
    carText.font = Font.boldSystemFont(15);
    carText.centerAlignText()
    widget.addSpacer(90);
    //widget jump  
    widget.url = `https://maps.apple.com/?q=HONDA&ll=${data.latitude},${data.longitude}&t=m`;
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
