const { chromium } = require('playwright')
;(async()=>{
  const b=await chromium.launch()
  const p=await (await b.newContext({viewport:{width:1512,height:950}})).newPage()
  await p.goto('http://127.0.0.1:3300/zh'); await p.waitForTimeout(1200)
  try{ await p.locator('.cc .btn-p').first().click({timeout:1500}) }catch{}
  await p.waitForTimeout(1800)

  async function measure(label, y){
    if(y!==null) await p.evaluate(v=>window.scrollTo(0,v), y)
    await p.waitForTimeout(700)
    const r = await p.evaluate(async () => {
      const times=[]; let n=0
      return await new Promise(res=>{
        const orig=window.requestAnimationFrame
        window.requestAnimationFrame=function(cb){
          return orig(function(t){ const s=performance.now(); cb(t); times.push(performance.now()-s)
            if(++n>=140){ window.requestAnimationFrame=orig; times.sort((a,b)=>a-b)
              res({p50:+times[70].toFixed(2), p95:+times[133].toFixed(2), max:+times[139].toFixed(2)}) } })
        }
      })
    })
    console.log(label.padEnd(22), 'JS/frame p50', String(r.p50).padStart(5), ' p95', String(r.p95).padStart(5), ' max', r.max)
  }
  await measure('hero idle', null)
  await measure('catalogue (3D wall)', 1800)
  await measure('games grid', 3300)
  await measure('partners comb', 5400)
  // scrolling stress
  await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(500)
  const jank = await p.evaluate(async () => {
    const gaps=[]; let last=performance.now(); let n=0
    return await new Promise(res=>{
      const step=(t)=>{ gaps.push(t-last); last=t; window.scrollBy(0,26)
        if(++n<180) requestAnimationFrame(step)
        else { gaps.sort((a,b)=>a-b); res({p50:+gaps[90].toFixed(1), p95:+gaps[171].toFixed(1), worst:+gaps[179].toFixed(1),
          over32: gaps.filter(g=>g>32).length}) } }
      requestAnimationFrame(step)
    })
  })
  console.log('full-page scroll frame gaps (ms):', JSON.stringify(jank))
  const nodes = await p.evaluate(()=>document.querySelectorAll('*').length)
  console.log('DOM nodes:', nodes)
  await b.close()
})()
