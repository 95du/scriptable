// width: 分割线的长度
const width = 150;
// h: 分割线的宽度
h=0.1
// 创建组件
let w = await createWidget();
// 将组件显示为中等
await w.presentMedium();
// 如果在快捷指令中运行的话，在弹窗中显示此小组件
Script.setWidget(w);
// 从API获取热榜
async function get_hot() {
    let req = new Request("https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=50&desktop=true")
    req.headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36"
    }
    return req.loadJSON()
}

async function createWidget() {
    let list = new ListWidget();
    list.backgroundColor = new Color("#3ca4fe", 0.6);
    let stack = list.addStack();
    // 水平居中
    stack.centerAlignContent();
    // 添加知乎的图标
    let img = stack.addImage(Image.fromData(await load_image("https://static.zhihu.com/heifetz/assets/apple-touch-icon-152.a53ae37b.png")));
    img.imageSize = new Size(20, 20);
    stack.addSpacer(5);
    // 添加主标题
    let main_title = stack.addText("知乎热榜");
    main_title.font = new Font("PingFang SC", 20);
    let hot_list = (await get_hot()).data;
    for (let i = 0; i < 4; i++) {
        let title = hot_list[i].target.title;
        let link = `zhihu://question/${hot_list[i].target.id}`;
        let w_text = list.addText(`${i + 1}. ${title}`);
        w_text.font = new Font("PingFang SC", 14)
        w_text.url = link;
        // 绘制分割线
        let context = new DrawContext()
        context.size = new Size(width, h)
        context.opaque = false
        context.respectScreenScale = true
        context.setFillColor(new Color("#48484b",1))
        let path = new Path()
        path.addRoundedRect(new Rect(0, 0, width, h), 3, 2)
        context.addPath(path)
        context.fillPath()
        context.setFillColor(new Color("#373737",1))
        // 添加分割线
        list.addImage(context.getImage())
    }
    return list
}
// 从url获取图片的数据
async function load_image(url) {
    let req = new Request(url)
    req.headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36"
    }
    return req.load();
}