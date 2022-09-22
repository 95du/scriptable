const alert = new Alert()
alert.title = '大众集团 iOS 桌面小组件'
alert.message = '根据对应车企下载对应的脚本'

  const menuList = [
    {
      name: 'FVW-Audi-Joiner.js',
      text: '一汽奥迪'
    },
    {
      name: 'SVW-Audi-Joiner.js',
      text: '上汽奥迪'
    },
    {
      name: 'FVW-Joiner.js',
      text: '一汽大众'
    },
    {
      name: 'SVW-Joiner.js',
      text: '上汽大众'
    },
    {
      name: 'DFPV-Joiner.js',
      text: '东风风神'
    },
    {
      name: 'Comfort-Joiner.js',
      text: '体验版'
    }
  ]
  
    menuList.forEach(item => {
      alert.addAction(item.text)
    })
    alert.addCancelAction('取消');

    const menuId = await alert.presentSheet()
    const obj = menuList[menuId]

    if (menuId === -1) {
      return;
    }
  
const FILE_MGR = FileManager[module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local']()

let REQ = new Request(`https://joiner.i95.me/v2/${encodeURIComponent(obj.name)}`)

const RES = await REQ.load()
FILE_MGR.write(FILE_MGR.joinPath(FILE_MGR.documentsDirectory(), obj.name), RES)
FILE_MGR.remove(module.filename)

Safari.open('scriptable:///run?scriptName='+encodeURIComponent(obj.name.replace('.js', '')))