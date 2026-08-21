import type { Locale } from '@/i18n/config'

export const legalDocs = ['privacy', 'cookies', 'terms'] as const
export type LegalDoc = (typeof legalDocs)[number]

type Doc = { title: string; updated: string; html: string }

/* NOTE FOR THE CLIENT ---------------------------------------------------
 * These are working drafts that describe what this codebase actually does:
 * the only cookies it sets are strictly necessary ones, and the analytics /
 * marketing categories are wired but empty until you add a tool. Have your
 * counsel review before launch, and update the "last updated" date and the
 * company entity details below.
 * --------------------------------------------------------------------- */

const COMPANY = 'Infinity Hex Games'
const EMAIL = 'support@infinityhex.com'
const UPDATED = '2026-08-14'

const cookieTableZh = `
<table>
<thead><tr><th>名称</th><th>类别</th><th>用途</th><th>存续期</th></tr></thead>
<tbody>
<tr><td><code>ihx_locale</code></td><td>必要</td><td>记住你选择的界面语言</td><td>1 年</td></tr>
<tr><td><code>ihx_consent</code></td><td>必要</td><td>记录你对 Cookie 的选择，避免重复询问</td><td>180 天</td></tr>
<tr><td><code>ihx_motion</code>（localStorage）</td><td>必要</td><td>记住你是否关闭了动态效果</td><td>直到你清除浏览器数据</td></tr>
</tbody></table>`

const cookieTableEn = `
<table>
<thead><tr><th>Name</th><th>Category</th><th>Purpose</th><th>Retention</th></tr></thead>
<tbody>
<tr><td><code>ihx_locale</code></td><td>Necessary</td><td>Remembers your interface language</td><td>1 year</td></tr>
<tr><td><code>ihx_consent</code></td><td>Necessary</td><td>Records your cookie choice so we stop asking</td><td>180 days</td></tr>
<tr><td><code>ihx_motion</code> (localStorage)</td><td>Necessary</td><td>Remembers whether you turned motion off</td><td>Until you clear site data</td></tr>
</tbody></table>`

export const legal: Record<Locale, Record<LegalDoc, Doc>> = {
  zh: {
    privacy: {
      title: '隐私政策',
      updated: UPDATED,
      html: `
<p>本政策说明 ${COMPANY}（下称「我们」）在你访问本网站时如何处理个人数据。若你通过邮件或众筹平台与我们联系，另有相应说明。</p>

<h2>1. 我们收集什么</h2>
<ul>
<li><strong>你主动提供的</strong>：当你写邮件给我们时提供的姓名、邮箱与内容。</li>
<li><strong>技术性数据</strong>：为了让网站正常工作而必然产生的数据，例如你的语言偏好与 Cookie 选择。本站不内置任何第三方分析或广告脚本。</li>
</ul>

<h2>2. 处理目的与法律依据</h2>
<ul>
<li>提供网站基本功能——依据：为履行你请求的服务所必需（GDPR 第 6(1)(b)/(f) 条）。</li>
<li>回复你的咨询——依据：合法利益。</li>
<li>在你同意后启用的分析或营销功能——依据：你的同意（GDPR 第 6(1)(a) 条），可随时撤回。</li>
</ul>

<h2>3. 我们不做什么</h2>
<p>我们不出售个人信息，不为跨情境行为广告而共享个人信息，也不基于个人数据进行自动化决策或用户画像。</p>

<h2>4. 保留期限</h2>
<p>邮件往来保留至事项结束后 24 个月；Cookie 的存续期见《Cookie 政策》。</p>

<h2>5. 你的权利</h2>
<p>视你所在地区，你可能享有以下权利：访问、更正、删除、限制处理、反对处理、数据可携，以及撤回同意。加州居民另可行使知情权、删除权、更正权，以及拒绝「出售/共享」的权利——我们不进行此类出售或共享，且尊重浏览器发送的全球隐私控制（GPC）信号。行使权利请邮件联系 <a href="mailto:${EMAIL}">${EMAIL}</a>，我们将在法定期限内答复。你也有权向所在地监管机构投诉。</p>

<h2>6. 国际传输</h2>
<p>本网站的托管与邮件服务商可能位于你所在国家/地区之外。发生此类传输时，我们会依赖经批准的传输机制（如标准合同条款）。</p>

<h2>7. 变更</h2>
<p>本政策更新时，我们会修改页首的「最后更新」日期；如变更重大，我们会在网站上另行提示。</p>

<h2>8. 联系我们</h2>
<p>${COMPANY} — <a href="mailto:${EMAIL}">${EMAIL}</a>，工作日 48 小时内回复。</p>`,
    },
    cookies: {
      title: 'Cookie 政策',
      updated: UPDATED,
      html: `
<p>Cookie 是网站存放在你设备上的小型文本文件。本站把它们分为三类，并且——除必要类别外——在你明确同意之前不会设置任何一个。</p>

<h2>1. 必要 Cookie（无法关闭）</h2>
<p>这些 Cookie 用于实现你主动请求的功能，例如记住你选的语言。没有它们，网站无法按你的预期工作。依据 ePrivacy 指令，这一类无需事先同意。</p>
${cookieTableZh}

<h2>2. 分析 Cookie（默认关闭）</h2>
<p>用于统计页面被如何浏览，帮助我们改进内容。<strong>本站目前未安装任何分析工具</strong>——该类别已预留接口，一旦启用，只会在你同意后加载。</p>

<h2>3. 营销 Cookie（默认关闭）</h2>
<p>用于衡量推广效果并展示更相关的内容。<strong>本站目前未安装任何营销或广告工具。</strong></p>

<h2>4. 如何更改你的选择</h2>
<p>页脚的「Cookie 设置」可随时重新打开设置面板，撤回同意与给予同意一样简单。你也可以在浏览器设置中删除所有 Cookie。</p>

<h2>5. 全球隐私控制（GPC）</h2>
<p>如果你的浏览器发送 GPC 信号，我们会将其视为有效的拒绝，自动关闭所有非必要类别，并且不再向你弹出同意窗口。</p>

<h2>6. 同意记录</h2>
<p>你的选择连同时间戳与政策版本号一起记录在 <code>ihx_consent</code> 中，保存 180 天，到期后我们会再次询问。</p>`,
    },
    terms: {
      title: '使用条款',
      updated: UPDATED,
      html: `
<h2>1. 关于本网站</h2>
<p>本网站由 ${COMPANY} 运营，用于介绍我们的原创作品、代理发行项目与合作服务。</p>

<h2>2. 内容与知识产权</h2>
<p>本站的文字、版面与视觉设计归 ${COMPANY} 所有。作品名称、封面与商标归各自权利人所有，在此仅用于说明性展示。标注为「示例数据」的条目为占位内容，不构成任何要约或承诺。</p>

<h2>3. 免责声明</h2>
<p>我们尽力保持信息准确，但不对内容的完整性或时效性作出保证。众筹金额、支持者数量与上市时间以对应平台与最终公告为准。</p>

<h2>4. 外部链接</h2>
<p>本站包含指向第三方平台（社区、社交媒体、众筹平台）的链接。我们不对其内容或隐私实践负责。</p>

<h2>5. 联系</h2>
<p><a href="mailto:${EMAIL}">${EMAIL}</a></p>`,
    },
  },

  en: {
    privacy: {
      title: 'Privacy Policy',
      updated: UPDATED,
      html: `
<p>This policy explains how ${COMPANY} ("we") handles personal data when you visit this website. Contacting us by email or backing a campaign on a crowdfunding platform is covered separately.</p>

<h2>1. What we collect</h2>
<ul>
<li><strong>What you give us</strong> — the name, email address and message content you provide when you write to us.</li>
<li><strong>Technical data</strong> — the minimum needed to make the site work, such as your language preference and your cookie choice. This site ships with no third-party analytics or advertising scripts.</li>
</ul>

<h2>2. Purposes and legal bases</h2>
<ul>
<li>Providing core site functionality — necessary for the service you requested (GDPR Art. 6(1)(b)/(f)).</li>
<li>Answering your enquiry — legitimate interest.</li>
<li>Any analytics or marketing you opt into — your consent (GDPR Art. 6(1)(a)), withdrawable at any time.</li>
</ul>

<h2>3. What we do not do</h2>
<p>We do not sell personal information, we do not share it for cross-context behavioural advertising, and we do not carry out automated decision-making or profiling.</p>

<h2>4. Retention</h2>
<p>Email correspondence is kept for 24 months after the matter closes. Cookie lifetimes are listed in the Cookie Policy.</p>

<h2>5. Your rights</h2>
<p>Depending on where you live you may have rights of access, rectification, erasure, restriction, objection, portability, and withdrawal of consent. California residents additionally have rights to know, delete, correct, and to opt out of "sale"/"sharing" — we do neither, and we honour the Global Privacy Control signal sent by your browser. To exercise a right, email <a href="mailto:${EMAIL}">${EMAIL}</a> and we will respond within the statutory period. You may also complain to your local supervisory authority.</p>

<h2>6. International transfers</h2>
<p>Our hosting and email providers may be located outside your country. Where that happens we rely on an approved transfer mechanism such as the Standard Contractual Clauses.</p>

<h2>7. Changes</h2>
<p>When this policy changes we update the "last updated" date above, and we flag material changes on the site.</p>

<h2>8. Contact</h2>
<p>${COMPANY} — <a href="mailto:${EMAIL}">${EMAIL}</a>, answered within 48 hours on business days.</p>`,
    },
    cookies: {
      title: 'Cookie Policy',
      updated: UPDATED,
      html: `
<p>Cookies are small text files a site stores on your device. We sort them into three categories and — outside the necessary ones — we set none of them before you have explicitly agreed.</p>

<h2>1. Strictly necessary (cannot be switched off)</h2>
<p>These deliver functionality you asked for, such as remembering your chosen language. Without them the site cannot behave as you expect. Under the ePrivacy Directive this category does not require prior consent.</p>
${cookieTableEn}

<h2>2. Analytics (off by default)</h2>
<p>Used to understand how pages are read so we can improve them. <strong>No analytics tool is installed on this site today</strong> — the category is wired up so that, if one is ever added, it will only load after you opt in.</p>

<h2>3. Marketing (off by default)</h2>
<p>Used to measure campaigns and show more relevant content. <strong>No marketing or advertising tool is installed on this site today.</strong></p>

<h2>4. Changing your mind</h2>
<p>"Cookie settings" in the footer reopens the panel at any time. Withdrawing consent is exactly as easy as giving it. You can also clear cookies in your browser settings.</p>

<h2>5. Global Privacy Control</h2>
<p>If your browser sends a GPC signal we treat it as a valid opt-out: every non-essential category is switched off automatically and we do not show you the consent dialog.</p>

<h2>6. Record of consent</h2>
<p>Your choice is stored in <code>ihx_consent</code> together with a timestamp and a policy version number, for 180 days, after which we ask again.</p>`,
    },
    terms: {
      title: 'Terms of Use',
      updated: UPDATED,
      html: `
<h2>1. About this site</h2>
<p>This site is operated by ${COMPANY} to present our original titles, licensed editions and partnership services.</p>

<h2>2. Content and intellectual property</h2>
<p>The text, layout and visual design of this site belong to ${COMPANY}. Game titles, cover art and trademarks belong to their respective owners and appear here for identification only. Entries marked "sample data" are placeholder content and constitute no offer or commitment.</p>

<h2>3. Disclaimer</h2>
<p>We work to keep information accurate but make no warranty as to completeness or currency. Funding totals, backer counts and release dates are governed by the relevant platform and by our final announcements.</p>

<h2>4. External links</h2>
<p>This site links to third-party platforms (community, social media, crowdfunding). We are not responsible for their content or privacy practices.</p>

<h2>5. Contact</h2>
<p><a href="mailto:${EMAIL}">${EMAIL}</a></p>`,
    },
  },
}
