const req = new Request(`https://gitcode.net/4qiao/scriptable/raw/master/api/bmw.js`);
const res = await req.loadString();
const Name = '正在安装小组件...';
  
FileManager.local().writeString(FileManager.local().documentsDirectory() + `/${Name}.js`,`${res}`);

 Safari.open('scriptable:///run/' + encodeURIComponent(Name));