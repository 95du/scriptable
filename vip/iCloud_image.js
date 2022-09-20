
let cover = await getData()
let widget = createWidget(cover)

if (!config.runsInWidget) {
    await widget.presentMedium()
}

Script.setWidget(widget)
Script.complete()

async function getImage(url) {
    let r = new Request(url)
    return await r.loadImage()
}

async function getData() {
    let fm = FileManager.iCloud();
    let imageList = ['IMG_9334.png']
    let count = imageList.length
    let m = count
    let n = 1
    let index = Math.ceil(Math.random() * (n - m) + m) - 1
    let path = fm.documentsDirectory() + "/" + imageList[index]
    // Image.fromFile(path) can also be used
    return fm.readImage(path)
}

function createWidget(cover) {
 
    let w = new ListWidget()
    
    w.backgroundImage = cover
    let gradient = new LinearGradient()
    gradient.locations = [0, 1]
    gradient.colors = [
        new Color('#00000000'),
        new Color('#000000CC')
    ]
    w.backgroundGradient = gradient
    
    return w
}