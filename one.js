const { chromium } = require('playwright')
;(async()=>{ const b=await chromium.launch()
 for(const [w,h,u,n] of [[1512,950,'/zh','f-hero'],[1512,950,'/en','f-hero-en'],[390,844,'/zh','f-mobile'],[834,1112,'/zh','f-ipad']]){
  const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage()
  await p.goto('http://127.0.0.1:3300'+u); await p.waitForTimeout(1100)
  try{ await p.locator('.cc .btn-p').first().click({timeout:1200}) }catch{}
  await p.waitForTimeout(3800); await p.screenshot({path:`/home/claude/shots3/${n}.png`})
 } await b.close() })()
