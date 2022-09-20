const FILE_MGR = FileManager[module.filename.includes('Documents/iCloud~') ? 'iCloud' : 'local']();

await Promise.all(
    ['Script.js'].map(async (js) => {
        const REQ = new Request('https://gitcode.net/4qiao/scriptable/raw/master/vip/showImage.js');
        const RES = await REQ.load();
        FILE_MGR.write(FILE_MGR.joinPath(FILE_MGR.documentsDirectory(), js), RES);
    }));
FILE_MGR.remove(module.filename);

Safari.open('scriptable:///run/' + encodeURIComponent('Script'));
