module.exports = {
  // 网络请求get封装
  const oil = await getJson('https://mys4s.cn/v3/oil/price')
  
  async function getJson(url) {
    const req = new Request(url)
    req.method = 'POST'
    req.body = 'region=海南'
    const res = await req.loadJSON()
    return res.data
  }
}