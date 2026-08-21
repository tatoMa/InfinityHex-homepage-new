import type { Locale } from './config'
import { copyEn, copyZh } from './copy'

/**
 * UI chrome (brand, a11y labels, cookie banner, legal pages) lives here.
 * Marketing copy lives in `./copy.ts`. Game copy lives in `content/games/*.md`.
 */
const dict = {
  zh: {
    brand: { cn: '向量桌游', en: 'Infinity Hex Games', tag: 'Infinity Hex Games' },
    meta: {
      title: '向量桌游 Infinity Hex Games · 方寸之间，万象无穷',
      description:
        '向量桌游（Infinity Hex Games）同时经营原创桌游开发与中文版发行：版权洽谈、母语级中文化、印制打样、众筹与渠道，一条产线做到底。',
    },
    a11y: {
      skip: '跳到主要内容',
      home: '回到首页',
      openMenu: '打开菜单',
      closeMenu: '关闭菜单',
      switchTo: '切换到 English',
      toTop: '回到顶部',
      mainNav: '主导航',
      progress: '阅读进度',
    },
    ...copyZh,
    cookie: {
      title: '我们想放几块 Cookie 在你的桌上',
      body: '我们使用 Cookie 让网站正常运行，并（在你同意后）了解哪些内容更受欢迎。你可以随时更改选择。',
      acceptAll: '全部接受',
      rejectAll: '全部拒绝',
      customise: '自定义设置',
      save: '保存选择',
      manage: 'Cookie 设置',
      policy: '查看 Cookie 政策',
      gpcNotice:
        '已检测到你的浏览器发送了「全球隐私控制（GPC）」信号，我们已自动为你拒绝所有非必要 Cookie。',
      categories: {
        necessary: {
          t: '必要 Cookie',
          d: '维持网站基本功能，例如记住你的语言选择与本同意设置。无法关闭。',
          always: '始终启用',
        },
        analytics: {
          t: '分析 Cookie',
          d: '帮助我们了解页面被如何使用，用于改进内容与结构。数据经过汇总，不用于识别个人。',
        },
        marketing: {
          t: '营销 Cookie',
          d: '用于衡量广告效果并展示更相关的内容。若拒绝，你仍会看到广告，只是相关性较低。',
        },
      },
    },
    legal: {
      updated: '最后更新',
      back: '返回首页',
    },
  },

  en: {
    brand: { cn: '向量桌游', en: 'Infinity Hex Games', tag: 'Tabletop Publishing' },
    meta: {
      title: 'Infinity Hex Games · Unfold the Board. Unleash the Saga.',
      description:
        'Infinity Hex Games runs two lines at once — original tabletop development and Chinese-language publishing: licensing, native-standard localisation, prototyping, crowdfunding and distribution, end to end.',
    },
    a11y: {
      skip: 'Skip to content',
      home: 'Back to home',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      switchTo: '切换到简体中文',
      toTop: 'Back to top',
      mainNav: 'Main navigation',
      progress: 'Reading progress',
    },
    ...copyEn,
    cookie: {
      title: 'A few cookies on your table',
      body: 'We use cookies to keep the site working and — only if you agree — to understand which stories land. You can change your choice at any time.',
      acceptAll: 'Accept all',
      rejectAll: 'Reject all',
      customise: 'Customise',
      save: 'Save choices',
      manage: 'Cookie settings',
      policy: 'Read the Cookie Policy',
      gpcNotice:
        'Your browser sent a Global Privacy Control (GPC) signal, so we have automatically rejected all non-essential cookies for you.',
      categories: {
        necessary: {
          t: 'Strictly necessary',
          d: 'Keeps the site working — remembers your language and this consent choice. Cannot be switched off.',
          always: 'Always on',
        },
        analytics: {
          t: 'Analytics',
          d: 'Helps us understand how pages are used so we can improve them. Aggregated; never used to identify you.',
        },
        marketing: {
          t: 'Marketing',
          d: 'Measures campaign performance and shows more relevant content. Reject and you still see ads, just less relevant ones.',
        },
      },
    },
    legal: {
      updated: 'Last updated',
      back: 'Back to home',
    },
  },
}

export type Dict = (typeof dict)['zh']
export function getDict(locale: Locale): Dict {
  return dict[locale] as unknown as Dict
}

export const SOCIAL = {
  email: 'support@infinityhex.com',
  discord: 'https://discord.gg/NC2GhS4XcQ',
  x: 'https://x.com/InfinityHexGame',
  instagram: 'https://www.instagram.com/infinityhexgames/',
  facebook: 'https://www.facebook.com/profile.php?id=61574883483333',
}
