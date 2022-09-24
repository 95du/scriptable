const url = `https://api.jinse.com/new-market/v1/info/currencies/by_slug/bitcoin`
const req = new Request(url)
const res = await req.loadJSON()
const amount = res.data.data.price_cny_format.data;
const currency = 'CNY';
const i = new Request('https://sweixinfile.hisense.com/media/M00/70/3B/Ch4FyGMuoFSAJk59AAAYqbtdSgY066.png')
const img = await i.loadImage()


let widget = createWidget(amount, currency, img)
if (config.runsInWidget) {
  // create and show widget
  Script.setWidget(widget)
  Script.complete()
}
else {
  widget.presentSmall()
}

// Assemble widget layout 
function createWidget(amount, currency, img) {
  let w = new ListWidget()
  w.backgroundColor = Color.white()

  let image = w.addImage(img)
  image.imageSize = new Size(60, 60)
  image.centerAlignImage()

  w.addSpacer(8)

  let staticText = w.addText("Bitcoin - RMB")
  staticText.textColor = Color.orange()
  staticText.font = Font.boldSystemFont(16)
  staticText.centerAlignText()

  w.addSpacer(8)

  let amountTxt = w.addText(amount + ' ' + currency)
  amountTxt.textColor = Color.green()
  amountTxt.font = Font.systemFont(18)
  amountTxt.centerAlignText()

  w.addSpacer(8)

  // Show current date in format Day. Month Year
  let currentDate = new Date();
  let lastDate = w.addDate(currentDate);
  lastDate.textColor = Color.black()
  lastDate.font = Font.mediumSystemFont(14)
  lastDate.centerAlignText();

  w.setPadding(0, 0, 0, 0)
  return w
}