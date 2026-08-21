const { chromium } = require('playwright')
;(async()=>{
  const b=await chromium.launch()
  async function run(label, prep){
    const p=await (await b.newContext({viewport:{width:1512,height:950}})).newPage()
    await p.goto('http://127.0.0.1:3300/zh'); await p.waitForTimeout(1200)
    try{ await p.locator('.cc .btn-p').first().click({timeout:1200}) }catch{}
    await p.waitForTimeout(1500)
    if(prep) await p.evaluate(prep)
    await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(400)
    const r = await p.evaluate(async()=>{
      const gaps=[]; let last=performance.now(); let n=0
      return await new Promise(res=>{
        const step=t=>{ gaps.push(t-last); last=t; window.scrollBy(0,26)
          if(++n<150) requestAnimationFrame(step)
          else { gaps.sort((a,b)=>a-b); res({p50:+gaps[75].toFixed(1),p95:+gaps[142].toFixed(1),over32:gaps.filter(g=>g>32).length}) } }
        requestAnimationFrame(step) })
    })
    console.log(label.padEnd(32), JSON.stringify(r))
    await p.context().close()
  }
  await run('baseline (everything on)', null)
  await run('- hex canvas', ()=>{ document.querySelectorAll('.hexbase,.hexfield').forEach(e=>e.remove()) })
  await run('- hex wipes', ()=>{ document.querySelectorAll('.hexwipe').forEach(e=>e.remove()) })
  await run('- wall 3D stage', ()=>{ document.querySelectorAll('.wall-view').forEach(e=>e.remove()) })
  await run('- hero props', ()=>{ document.querySelectorAll('.props').forEach(e=>e.remove()) })
  await run('- wall glow + hero wash', ()=>{
    document.querySelectorAll('.wall-glow').forEach(e=>e.remove())
    const st=document.createElement('style'); st.textContent='.hero::before{display:none!important}'
    document.head.appendChild(st) })
  await run('- all wall + wipes', ()=>{
    document.querySelectorAll('.hexwipe,.wall').forEach(e=>e.remove()) })
  await b.close()
})()
