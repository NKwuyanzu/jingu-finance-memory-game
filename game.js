/* ============================================================
   挎包里的津沽 · 三代人体验游戏  v3
   新增玩法：算盘结账 / 现金流分配 / 服务通道调度 / 挎包容积取舍
   新增系统：三维信用画像 · 信用存折 · 印记成就 · 分支结局
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 工具 ---------- */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const round2 = (n) => Math.round(n * 100) / 100;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function combos(list, size) {
    if (size === 0) return [[]];
    if (list.length < size) return [];
    const [head, ...rest] = list;
    return [...combos(rest, size - 1).map((c) => [head, ...c]), ...combos(rest, size)];
  }

  const axisValue = (item, axis) => (item.value && item.value[axis]) || 0;

  /* ---------- 三维信用画像 ---------- */

  const AXES = [
    { id: "clarity", label: "账目", color: "var(--gold)", raw: "#c8a653",
      blurb: "记得清、说得明、查得到" },
    { id: "warmth", label: "温度", color: "var(--red-2)", raw: "#c4563f",
      blurb: "有人来、有人听、有人担" },
    { id: "reach", label: "触达", color: "var(--river)", raw: "#6f9b9a",
      blurb: "走得远、办得快、覆盖广" }
  ];

  const AXIS_IDS = AXES.map((a) => a.id);
  const emptyAxes = () => Object.fromEntries(AXIS_IDS.map((id) => [id, 0]));

  /* ---------- 角色数据 ---------- */

  const PORTRAITS = {
    grandparent: `<svg viewBox="0 0 120 150" aria-hidden="true">
      <path class="p-backdrop" d="M60 6 C30 6 8 28 8 56 V144 H112 V56 C112 28 90 6 60 6 Z"/>
      <ellipse class="p-ground" cx="60" cy="138" rx="34" ry="5"/>
      <path class="p-coat" d="M24 150 V116 C24 96 40 84 60 84 C80 84 96 96 96 116 V150 Z"/>
      <line class="p-strap" x1="40" y1="86" x2="80" y2="150"/>
      <line class="p-placket" x1="60" y1="88" x2="60" y2="150"/>
      <g class="p-knots"><line x1="54" y1="98" x2="66" y2="98"/><line x1="54" y1="112" x2="66" y2="112"/><line x1="54" y1="126" x2="66" y2="126"/><line x1="54" y1="140" x2="66" y2="140"/></g>
      <rect class="p-neck" x="53" y="70" width="14" height="14" rx="4"/>
      <circle class="p-skin" cx="60" cy="52" r="17"/>
      <path class="p-scarf" d="M60 28 C45 28 36 40 37 54 C38 64 42 71 46 75 C44 65 49 58 60 58 C71 58 76 65 74 75 C78 71 82 64 83 54 C84 40 75 28 60 28 Z"/>
      <path class="p-scarf-tie" d="M52 73 L60 84 L68 73 L65 92 H55 Z"/>
      <circle class="p-scarf-dot" cx="48" cy="42" r="1.6"/><circle class="p-scarf-dot" cx="72" cy="42" r="1.6"/><circle class="p-scarf-dot" cx="60" cy="35" r="1.6"/>
      <g class="p-book" transform="translate(80 106) rotate(-8)">
        <rect width="26" height="20" rx="2"/><rect class="p-book-line" x="4" y="4" width="18" height="12" rx="1"/>
        <line class="p-book-mark" x1="8" y1="8" x2="18" y2="8"/><line class="p-book-mark" x1="8" y1="12" x2="15" y2="12"/>
      </g>
    </svg>`,
    parent: `<svg viewBox="0 0 120 150" aria-hidden="true">
      <path class="p-backdrop" d="M60 6 C30 6 8 28 8 56 V144 H112 V56 C112 28 90 6 60 6 Z"/>
      <ellipse class="p-ground" cx="60" cy="138" rx="34" ry="5"/>
      <path class="p-jacket" d="M22 150 V114 C22 94 40 82 60 82 C80 82 98 94 98 114 V150 Z"/>
      <path class="p-shirt" d="M53 84 L60 98 L67 84 Z"/>
      <path class="p-lapel-l" d="M60 84 L45 95 L51 114 L60 100 Z"/><path class="p-lapel-r" d="M60 84 L75 95 L69 114 L60 100 Z"/>
      <line class="p-zip" x1="60" y1="112" x2="60" y2="150"/>
      <rect class="p-neck" x="53" y="68" width="14" height="14" rx="4"/>
      <circle class="p-ear" cx="43" cy="54" r="3.4"/><circle class="p-ear" cx="77" cy="54" r="3.4"/>
      <circle class="p-skin" cx="60" cy="52" r="17"/>
      <path class="p-hair" d="M42 54 C40 36 50 27 60 27 C70 27 80 36 78 54 C75 45 71 40 60 40 C49 40 45 45 42 54 Z"/>
      <line class="p-part" x1="52" y1="31" x2="49" y2="42"/>
      <g class="p-case" transform="translate(84 116)">
        <rect width="28" height="21" rx="3"/><path class="p-case-handle" d="M8 0 C8 -6 20 -6 20 0"/><rect class="p-case-latch" x="11" y="8" width="6" height="4" rx="1"/>
      </g>
    </svg>`,
    youth: `<svg viewBox="0 0 120 150" aria-hidden="true">
      <path class="p-backdrop" d="M60 6 C30 6 8 28 8 56 V144 H112 V56 C112 28 90 6 60 6 Z"/>
      <ellipse class="p-ground" cx="60" cy="138" rx="34" ry="5"/>
      <path class="p-hoodie" d="M24 150 V116 C24 96 40 84 60 84 C80 84 96 96 96 116 V150 Z"/>
      <path class="p-hood" d="M40 90 C44 78 76 78 80 90 C74 85 66 83 60 83 C54 83 46 85 40 90 Z"/>
      <line class="p-string" x1="55" y1="92" x2="53" y2="108"/><line class="p-string" x1="65" y1="92" x2="67" y2="108"/>
      <path class="p-apron" d="M45 104 H75 L79 150 H41 Z"/>
      <line class="p-apron-strap" x1="45" y1="104" x2="52" y2="88"/><line class="p-apron-strap" x1="75" y1="104" x2="68" y2="88"/>
      <rect class="p-apron-pocket" x="51" y="122" width="18" height="13" rx="2"/>
      <rect class="p-neck" x="53" y="68" width="14" height="14" rx="4"/>
      <circle class="p-skin" cx="60" cy="52" r="17"/>
      <path class="p-hair-main" d="M42 56 C39 36 50 25 60 25 C70 25 81 36 78 56 C76 46 71 41 60 41 C49 41 44 46 42 56 Z"/>
      <path class="p-ponytail" d="M76 42 C88 48 91 66 86 86 C84 94 77 98 73 95 C78 84 78 64 73 52 Z"/>
      <circle class="p-tie" cx="77" cy="46" r="2.6"/>
      <g class="p-phone" transform="translate(24 106) rotate(6)">
        <rect width="15" height="24" rx="3"/><rect class="p-phone-screen" x="2.5" y="3.5" width="10" height="15" rx="1.5"/><circle class="p-phone-dot" cx="7.5" cy="21" r="1.2"/>
      </g>
      <circle class="p-hand" cx="35" cy="112" r="4.5"/>
      <g class="p-box" transform="translate(86 128)"><rect width="22" height="17" rx="2"/><line class="p-box-tape" x1="11" y1="0" x2="11" y2="17"/></g>
    </svg>`
  };

  const roles = {
    grandparent: {
      chapter: "第一程 · 1978",
      name: "杨凤英",
      occupation: "生产队会计",
      time: "1978 · 春耕前",
      place: "天津南郊乡村",
      source: "情境复原",
      intro: "春耕就要开始，先把账理清",
      cluePrompt: "出院门，把要带的东西找齐。",
      era: "1978 春耕",
      /* 挎包只能装三件。四件都有用，两件是院里常见的杂物——
         取舍不是挑对的，是在都舍不得的东西里排出先后。 */
      objects: [
        { id: "ledger",   label: "生产队账本", glyph: "账", x: 12, y: 32, model: "book", tone: "#a89a76", note: "队里的收支都在这上面", value: { clarity: 11 }, valid: true },
        { id: "abacus",   label: "木算盘",     glyph: "算", x: 20, y: 60, model: "abacus", tone: "#8a5a34", note: "珠子拨响，数目才算数",   value: { clarity: 9 },  valid: true },
        { id: "bag",      label: "帆布挎包",   glyph: "包", x: 30, y: 30, model: "bag", tone: "#8d8a63", note: "背着它，人才能走到田头", value: { warmth: 8, reach: 7 },  valid: true },
        { id: "passbook", label: "手写存折",   glyph: "折", x: 38, y: 56, model: "passbook", tone: "#b8452f", note: "张家的存款，一笔一笔攒的", value: { clarity: 8, warmth: 3 }, valid: true },
        { id: "mug",      label: "搪瓷茶缸",   glyph: "缸", x: 15, y: 82, model: "cup", tone: "#e6e0cd", note: "开会用的，出门不必带", value: {}, valid: false },
        { id: "basket",   label: "竹编篮筐",   glyph: "篮", x: 33, y: 84, model: "basket", tone: "#c69a52", note: "装粮食的，今天不下地",   value: {}, valid: false }
      ],
      /* 算盘不是装饰：会计的手艺就是心算加珠算。
         玩家必须从上一笔余额往下拨，而不是每次从零开始——
         这正是当年记流水账的真实顺序。 */
      mini: {
        type: "abacus",
        title: "把春耕账结出来",
        body: "算盘上已经摆着上一笔的余额。加上这一笔，拨出新余额，再记入。",
        limit: 100,
        unit: "元",
        entries: [
          { label: "信用社春耕周转款", amount: 300.00 },
          { label: "购入稻种",         amount: -86.50 },
          { label: "购进化肥",         amount: -124.00 },
          { label: "副业交售收入",     amount: 47.30 },
          { label: "农具修补",         amount: -18.20 },
          { label: "预留口粮支出",     amount: -62.00 }
        ]
      },
      packTitle: "下一程要带的，先装进包",
      packBody: "六样里挑三样。剩下的，留给以后。",
      packCapacity: 6,
      principles: [
        { id: "clear",    label: "账目清楚", weight: 2, desc: "每一笔都对得上", value: { clarity: 8 } },
        { id: "promise",  label: "承诺有据", weight: 2, desc: "答应了就写下来", value: { clarity: 7 } },
        { id: "door",     label: "服务上门", weight: 3, desc: "人在田头，服务就得过去", value: { warmth: 8, reach: 5 } },
        { id: "record",   label: "一笔一记", weight: 1, desc: "钱少也要上账", value: { clarity: 4 } },
        { id: "relation", label: "只凭关系", weight: 2, desc: "熟人信得过，可熟人也会走", value: { warmth: 5, clarity: -6 } },
        { id: "scale",    label: "只看规模", weight: 1, desc: "账大不等于账稳", value: { reach: 5, warmth: -5 } }
      ],
      stamp: "乡土信用",
      stampLine: "账目清楚，承诺有据",
      result: "那时候的信用，一半写在账本上，一半记在谁认识谁上。",
      palette: { top: "#a08a63", mid: "#dfbe7c", bot: "#415a44", accent: "#c8a653" }
    },

    parent: {
      chapter: "第二程 · 1998",
      name: "李建国",
      occupation: "乡镇个体户",
      time: "1998 · 夏日午后",
      place: "天津区县乡镇",
      source: "合成叙事",
      intro: "订单来了，机器也该换了",
      cluePrompt: "出门前，把要带的找齐。",
      era: "1998 夏日",
      objects: [
        { id: "orders",  label: "客户订单", glyph: "单", x: 13, y: 28, model: "papers", tone: "#cfc3a0", note: "三家的单子，交期挨得很近", value: { reach: 12 },  valid: true },
        { id: "books",   label: "经营账册", glyph: "账", x: 22, y: 58, model: "book", tone: "#9a7346", note: "这半年进出的钱，都在里面", value: { clarity: 13 }, valid: true },
        { id: "machine", label: "作坊机器", glyph: "机", x: 31, y: 33, model: "machine", tone: "#8e9d92", note: "还在转，就是费料",     value: { reach: 10 },  valid: true },
        { id: "workbag", label: "工作挎包", glyph: "包", x: 39, y: 62, model: "bag", tone: "#7d8a76", note: "信贷员来一趟，背的就是它", value: { warmth: 12 }, valid: true },
        { id: "store",   label: "玻璃门面", glyph: "门", x: 16, y: 84, model: "storefront", tone: "#a8a193", note: "上个月刚刷的漆", value: {}, valid: false },
        { id: "pager",   label: "传呼机",   glyph: "呼", x: 34, y: 86, model: "pager", tone: "#5a635c", note: "刚配的，还没几个人打过", value: {}, valid: false }
      ],
      /* 这一程的核心不是"怎么分"，是"先顾哪头"。
         所以玩法从"并行分配"改成"序贯取舍"：
         要钱的事一件件来，当场决定，给出去就收不回——
         选项不再同时摆在眼前，也就没法反复调出一个最优解。
         真实处境本来就是这样：钱一笔笔出，事一件件扛。
         金额合计 72 万，手里只有 60 万，注定要放掉几件。 */
      mini: {
        type: "asks",
        title: "钱在手上过一遍",
        body: "六十万周转款到手。要钱的事一件件来，给出去就收不回——手里得留够，才撑得到十月。",
        total: 60,
        unit: "万",
        asks: [
          { id: "material", label: "材料商老赵", note: "料款欠了两个月，再不给就断供。", amount: 14,
            give: "料续上了，机器没停。", deny: "断了料，两张单子交不上。",
            gauge: "capacity", gain: 45, flag: "料不断" },
          { id: "wage", label: "十六个工人", note: "工钱拖不得，人一走就散了。", amount: 12,
            give: "工钱结清，车间里人心稳。", deny: "欠着工钱，老师傅开始打听别处。",
            gauge: "team", gain: 100, flag: "人心不散" },
          { id: "loan", label: "信用社还款", note: "十月到期，白纸黑字写着。", amount: 14,
            give: "按期还上，这一笔信用记下了。", deny: "到期没还，往后贷款要费口舌。",
            gauge: "credit", gain: 70, flag: "十月不违约" },
          { id: "buffer", label: "留一笔备用金", note: "出点意外，就指望这笔。", amount: 8,
            give: "手里留了底，出点事不慌。", deny: "一分没留，机器一停就悬。",
            gauge: "safety", gain: 100, flag: "有钱应急" },
          { id: "machine", label: "新机器首付", note: "首付交上，大单才接得下。", amount: 10,
            give: "新机器到位，产能上来了。", deny: "还是老机器，大单接不下。",
            gauge: "capacity", gain: 35 },
          { id: "client", label: "老客户周转", note: "帮他这一把，往后还找你。", amount: 8,
            give: "拉了一把，关系更牢。", deny: "没帮上，这单生意渐渐淡了。",
            gauge: "credit", gain: 30 },
          { id: "paint", label: "车间翻新", note: "好看，客户来了有面子。", amount: 6,
            give: "车间亮堂了，来人看着体面。", deny: "还是老样子，也不耽误干活。",
            gauge: "capacity", gain: 20 }
        ],
        gauges: [
          { id: "capacity", label: "产能" },
          { id: "team",     label: "团队" },
          { id: "credit",   label: "信用" },
          { id: "safety",   label: "安全" }
        ]
      },
      packTitle: "网点多了，包里还得有什么",
      packBody: "六样里挑三样。规矩立起来的时候，有些东西最容易掉队。",
      packCapacity: 6,
      principles: [
        { id: "proof",    label: "规范凭证", weight: 2, desc: "白纸黑字，两边都踏实", value: { clarity: 8 } },
        { id: "visit",    label: "现场走访", weight: 3, desc: "进车间看一眼，账才活", value: { warmth: 8, reach: 5 } },
        { id: "cashflow", label: "稳健周转", weight: 2, desc: "下个月的钱得留住", value: { clarity: 7 } },
        { id: "ledger",   label: "台账更新", weight: 1, desc: "生意长了，账也得长", value: { clarity: 4 } },
        { id: "speed",    label: "只求速度", weight: 1, desc: "放得快，也空得快", value: { reach: 5, clarity: -5 } },
        { id: "counter",  label: "只等上门", weight: 2, desc: "坐在屋里，等不来新户", value: { warmth: 4, reach: -5 } }
      ],
      stamp: "稳健经营",
      stampLine: "看见生意，也看见风险",
      result: "流程规范了，判断还得有人做。第二代把这两样接在了一起。",
      palette: { top: "#8f7a5c", mid: "#d4ad72", bot: "#4a5348", accent: "#b46b4d" }
    },

    youth: {
      chapter: "第三程 · 2026",
      name: "周晓桐",
      occupation: "返乡创业者",
      time: "2026 · 清晨发货",
      place: "天津乡村振兴场景",
      source: "未来推演",
      intro: "订单都在手机里，服务也要随时抵达",
      cluePrompt: "发货之前，把要带的找齐。",
      era: "2026 清晨",
      objects: [
        { id: "phone",   label: "手机银行",   glyph: "机", x: 14, y: 36, model: "phone", tone: "#63c9a8", note: "昨晚那笔货款已经到账", value: { reach: 13 },  valid: true },
        { id: "station", label: "金融服务站", glyph: "站", x: 23, y: 66, model: "house", tone: "#a8d8bf", note: "村口那间，小王今天在", value: { warmth: 13 }, valid: true },
        { id: "tablet",  label: "数字工作包", glyph: "包", x: 32, y: 30, model: "tablet", tone: "#6fb79c", note: "办业务的人上门带的",   value: { reach: 11 },  valid: true },
        { id: "orders",  label: "电商订单",   glyph: "单", x: 40, y: 58, model: "parcel", tone: "#d8a463", note: "今天要发的二十三件", value: { reach: 10 },  valid: true },
        { id: "kiosk",   label: "无人柜台",   glyph: "柜", x: 17, y: 86, model: "kiosk", tone: "#8fd2b8", note: "去年装的，用得不多", value: {}, valid: false },
        { id: "poster",  label: "推广海报",   glyph: "广", x: 35, y: 88, model: "poster", tone: "#e07a52", note: "上个月活动剩的", value: {}, valid: false }
      ],
      /* 三个真实存在、彼此不重叠的通道。
         难点不在分配本身，在于承认「标准业务可以不给人工」。 */
      mini: {
        type: "dispatch",
        title: "六个需求，三条通道",
        body: "每条通道今天最多接三位。分得不合适也办得成，只是慢一点。",
        clients: [
          { id: "c1", glyph: "王", name: "王大爷",     need: "存折换卡，不会用智能手机", best: "visit" },
          { id: "c2", glyph: "李", name: "小李",       need: "补办一张卡",               best: "app",  alt: "station" },
          { id: "c3", glyph: "社", name: "果蔬合作社", need: "季节性贷款，材料多",       best: "station" },
          { id: "c4", glyph: "张", name: "张婶",       need: "住得偏，腿脚不便",         best: "visit" },
          { id: "c5", glyph: "店", name: "电商店主",   need: "打半年流水",               best: "app" },
          { id: "c6", glyph: "养", name: "养殖户",     need: "抵押评估，得看圈舍",       best: "visit", alt: "station" }
        ],
        channels: [
          { id: "app",     label: "手机银行",   desc: "标准业务，即时办", cap: 3 },
          { id: "station", label: "金融服务站", desc: "复杂业务，有人商量", cap: 3 },
          { id: "visit",   label: "上门走访",   desc: "特殊情形，人过去", cap: 3 }
        ]
      },
      packTitle: "数字包里，什么不能丢",
      packBody: "六样里挑三样。跑得越快，越要当心把人落下。",
      packCapacity: 6,
      principles: [
        { id: "consent", label: "数据有授权", weight: 2, desc: "要用，先问一声", value: { clarity: 8 } },
        { id: "human",   label: "人工能兜底", weight: 3, desc: "机器说不行的，得有人听", value: { warmth: 8, reach: 4 } },
        { id: "explain", label: "风险可解释", weight: 2, desc: "不给办，也要说清为什么", value: { clarity: 7 } },
        { id: "trace",   label: "日志可追溯", weight: 1, desc: "谁办的，查得到", value: { clarity: 4 } },
        { id: "score",   label: "只信评分",    weight: 1, desc: "分数高的，未必是真的", value: { reach: 5, warmth: -5 } },
        { id: "offline", label: "撤掉线下",    weight: 2, desc: "省了成本，也撤了退路", value: { reach: 4, warmth: -6 } }
      ],
      stamp: "数字普惠",
      stampLine: "效率向前，服务兜底",
      result: "服务搬进了手机，但决定还得由人来做。第三代守住的就是这条缝。",
      palette: { top: "#76938c", mid: "#d3e2d7", bot: "#27584a", accent: "#c8a653" }
    }
  };

  const roleOrder = ["grandparent", "parent", "youth"];
  const sumValues = (v) => Object.values(v).reduce((a, b) => a + b, 0);

  /* 每程小游戏在各轴上的满分贡献 */
  const MINI_MAX = {
    grandparent: { clarity: 50 },
    parent: { clarity: 20, warmth: 15, reach: 15 },
    youth: { warmth: 25, reach: 25 }
  };

  /* ---------- 成就 ---------- */

  const ACHIEVEMENTS = [
    { id: "swift",   label: "算盘飞快", hint: "60 秒内拨完春耕账" },
    { id: "tight",   label: "分毫不差", hint: "周转款恰好用尽" },
    { id: "nobody",  label: "不落一人", hint: "六位街坊全部送到合适通道" },
    { id: "fullbag", label: "满挎包",   hint: "装包用满容量且全为正向原则" },
    { id: "clean",   label: "一气呵成", hint: "三个阶段零失误完成一程" },
    { id: "seals",   label: "三印齐聚", hint: "走完三代人的路" }
  ];

  /* ---------- 存档 ---------- */

  const STORAGE_KEY = "jingu-credit-game-v3";

  function freshSave() {
    return {
      roles: Object.fromEntries(roleOrder.map((r) => [r, { complete: false, axes: emptyAxes(), best: null, detail: null }])),
      achievements: {},
      future: null,
      ending: null
    };
  }

  function loadSave() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!parsed || !parsed.roles || !parsed.roles.grandparent) return freshSave();
      const base = freshSave();
      return {
        roles: Object.fromEntries(roleOrder.map((r) => [r, { ...base.roles[r], ...(parsed.roles[r] || {}) }])),
        achievements: parsed.achievements || {},
        future: parsed.future || null,
        ending: parsed.ending || null
      };
    } catch (_e) {
      return freshSave();
    }
  }

  let save = loadSave();
  const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(save));

  /* ---------- 每个角色的理论满分（用于归一） ---------- */

  /* 每个角色在各轴上的理论上限（寻线三件 + 实操满分 + 装包三件） */
  const roleMax = Object.fromEntries(roleOrder.map((roleId) => {
    const data = roles[roleId];
    const packCombos = combos(data.principles, 3)
      .filter((c) => c.reduce((s, i) => s + i.weight, 0) <= data.packCapacity);
    const maxes = emptyAxes();
    AXIS_IDS.forEach((axis) => {
      const explore = Math.max(0, ...combos(data.objects, 3).map((c) => c.reduce((s, i) => s + axisValue(i, axis), 0)));
      const pack = Math.max(0, ...packCombos.map((c) => c.reduce((s, i) => s + axisValue(i, axis), 0)));
      maxes[axis] = Math.max(1, explore + (MINI_MAX[roleId][axis] || 0) + pack);
    });
    return [roleId, maxes];
  }));

  const roleScore = (roleId, earned) => Object.fromEntries(
    AXIS_IDS.map((axis) => [axis, Math.round(clamp(earned[axis] / roleMax[roleId][axis]) * 100)])
  );

  const scoreAverage = (scores) => AXIS_IDS.reduce((s, a) => s + scores[a], 0) / AXIS_IDS.length;

  /* 三轴互相牵制，单项满分的组合往往不可兼得。
     所以评级参照「实操满分时的最佳联合解」，而不是三轴上限的简单平均。 */
  const roleBest = Object.fromEntries(roleOrder.map((roleId) => {
    const data = roles[roleId];
    const packCombos = combos(data.principles, 3)
      .filter((c) => c.reduce((s, i) => s + i.weight, 0) <= data.packCapacity);
    let best = 0;
    combos(data.objects, 3).forEach((exploreCombo) => {
      packCombos.forEach((packCombo) => {
        const total = emptyAxes();
        [...exploreCombo, ...packCombo].forEach((item) => {
          AXIS_IDS.forEach((axis) => { total[axis] += axisValue(item, axis); });
        });
        AXIS_IDS.forEach((axis) => { total[axis] += MINI_MAX[roleId][axis] || 0; });
        const avg = scoreAverage(roleScore(roleId, total));
        if (avg > best) best = avg;
      });
    });
    return [roleId, Math.max(1, best)];
  }));

  /* ---------- 运行时状态 ---------- */

  let activeRole = "grandparent";
  let activeScreen = "title";
  let roleStep = 0;
  let collected = new Map();
  let packed = new Set();
  let earned = emptyAxes();
  let mistakes = 0;
  let miniResult = null;
  let activeTimer = null;

  const screens = {
    title: $("#titleScreen"),
    identity: $("#identityScreen"),
    role: $("#roleScreen"),
    result: $("#resultScreen"),
    future: $("#futureScreen"),
    ending: $("#endingScreen"),
    ledger: $("#ledgerScreen")
  };

  /* ---------- 音效 ---------- */

  /* 音量分两层：MASTER_VOLUME 是总线，管音效；MUSIC_VOLUME 管背景音乐。
     之前的毛病是总线 0.1、珠子再乘 0.05，乘完只剩 0.005，等于没声。
     现在总线抬到 0.5，单条按"轻但听得见"定——要整体调音效只动这一个数。
     背景音乐是作者原文件（assets/津沽舒缓纯音乐.wav，48 秒，循环），音量保持原样。 */
  const MASTER_VOLUME = 0.5;
  const MUSIC_VOLUME = 0.4;

  class Soundscape {
    constructor() {
      this.ctx = null;
      this.master = null;
      /* 原背景音乐，一直在。别删也别换：文件在 assets/ 里，index.html 里挂着 #backgroundMusic */
      this.music = $("#backgroundMusic");
      this.music.volume = MUSIC_VOLUME;
      this.on = false;
    }
    ensure() {
      if (this.ctx) return true;
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return false;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = MASTER_VOLUME;
      this.master.connect(this.ctx.destination);
      return true;
    }
    start() {
      this.ensure();
      if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
      this.on = true;
      this.music.play().catch(() => { /* 没有音频文件也别把特效一起关掉 */ });
    }
    stop() { this.music.pause(); this.on = false; }
    /* 单音：起音给一点下滑，比一条平音自然 */
    tone(freq, dur, type = "sine", vol = 0.09) {
      if (!this.on || !this.ctx) return;
      const t0 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.84), t0 + dur);
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain).connect(this.master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    }
    /* 木珠撞梁：极短的带通噪声当"咔"，跟一个很快衰下去的音高当"木"。
       只有音高没有噪声就是电子音，只有噪声就是一片沙沙。 */
    wood(freq, vol) {
      if (!this.on || !this.ctx) return;
      const t0 = this.ctx.currentTime;
      const len = Math.max(1, Math.floor(this.ctx.sampleRate * 0.02));
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;
      const bp = this.ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = freq * 2.2;
      bp.Q.value = 1.1;
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(vol * 0.85, t0);
      ng.gain.exponentialRampToValueAtTime(0.001, t0 + 0.035);
      noise.connect(bp).connect(ng).connect(this.master);
      noise.start(t0);

      const osc = this.ctx.createOscillator();
      const og = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t0);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t0 + 0.05);
      og.gain.setValueAtTime(vol, t0);
      og.gain.exponentialRampToValueAtTime(0.001, t0 + 0.065);
      osc.connect(og).connect(this.master);
      osc.start(t0);
      osc.stop(t0 + 0.09);
    }
    /* 闷响：东西落进挎包、盖章这类"有分量的一下" */
    thud(freq, dur, vol) {
      if (!this.on || !this.ctx) return;
      const t0 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * 1.8, t0);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t0 + dur);
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain).connect(this.master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    }
    /* 扫一下：换屏、场景过场。有起有落，不是"啪"地开始 */
    sweep(from, to, dur, vol) {
      if (!this.on || !this.ctx) return;
      const t0 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const lp = this.ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(1500, t0);
      lp.frequency.exponentialRampToValueAtTime(480, t0 + dur);
      osc.type = "sine";
      osc.frequency.setValueAtTime(from, t0);
      osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(vol, t0 + dur * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(lp).connect(gain).connect(this.master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    }
    /* 拨珠：按档位定音高，从左到右一路降下来，听着像珠子真在杆上滑。
       不做时间节流——连发的场景已经在调用处按 60ms 错开了，
       这里再拦一道反而会把错开好的声音吞掉。 */
    beadHit(rodIndex = 2, vol = 0.34) {
      const scale = [1180, 990, 820, 690, 570];
      const base = scale[clamp(rodIndex, 0, 4)] || 820;
      this.wood(base + (Math.random() * 50 - 25), vol);
    }
    effect(type) {
      switch (type) {
        case "bead": this.beadHit(2); return;
        case "catch": this.thud(180, 0.2, 0.3); return;   /* 挎包接住东西 */
        case "go": this.sweep(300, 620, 0.3, 0.16); return; /* 换屏 */
        default: break;
      }
      /* [频率, 时长, 波形, 音量] */
      const map = {
        tick: [780, 0.05, "triangle", 0.14],
        collect: [680, 0.2, "sine", 0.26],
        correct: [920, 0.26, "sine", 0.3],
        wrong: [150, 0.24, "sawtooth", 0.2],
        turn: [470, 0.2, "sine", 0.18],
        stamp: [540, 0.85, "sine", 0.26],
        pack: [760, 0.16, "sine", 0.24]
      };
      const spec = map[type];
      if (spec) this.tone(spec[0], spec[1], spec[2], spec[3]);
    }
    chord() {
      [523, 659, 784].forEach((f, i) => setTimeout(() => this.tone(f, 0.9, "sine", 0.22), i * 90));
    }
  }

  const sound = new Soundscape();

  function updateSoundButton() {
    const btn = $("#soundButton");
    btn.setAttribute("aria-pressed", String(sound.on));
    btn.textContent = `声音：${sound.on ? "开" : "关"}`;
  }

  /* ---------- 场景画布 ---------- */

  const canvas = $("#worldCanvas");
  const ctx2d = canvas.getContext("2d");

  const SCENE_PALETTE = {
    title: { top: "#7d8a72", mid: "#d9b87e", bot: "#33543f", accent: "#c8a653" },
    identity: { top: "#7a7563", mid: "#c9a871", bot: "#2d4a3d", accent: "#b98859" },
    result: { top: "#7a7563", mid: "#c9a871", bot: "#2d4a3d", accent: "#b98859" },
    ledger: { top: "#7a7563", mid: "#c9a871", bot: "#2d4a3d", accent: "#b98859" },
    future: { top: "#7c9895", mid: "#dfe9e2", bot: "#28584a", accent: "#c8a653" },
    ending: { top: "#7c9895", mid: "#dfe9e2", bot: "#28584a", accent: "#c8a653" }
  };

  const scenePalette = (name) => roles[name] ? roles[name].palette : (SCENE_PALETTE[name] || SCENE_PALETTE.title);
  const sceneEra = (name) => (roles[name] ? name : (name === "future" || name === "ending" ? "youth" : "grandparent"));

  let sceneFrom = "title";
  let sceneTo = "title";
  let sceneBlend = 1;

  /* 视差：指针给一个目标值，每帧再追上去，动起来才顺 */
  let parTX = 0;
  let parTY = 0;
  let parX = 0;
  let parY = 0;
  let parScroll = 0;

  function setScene(name) {
    if (name === sceneTo) return;
    sceneFrom = sceneTo;
    sceneTo = name;
    sceneBlend = 0;
  }

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function mixHex(a, b, t) {
    const [r1, g1, b1] = hexToRgb(a);
    const [r2, g2, b2] = hexToRgb(b);
    const m = (x, y) => Math.round(x + (y - x) * t);
    return `rgb(${m(r1, r2)}, ${m(g1, g2)}, ${m(b1, b2)})`;
  }

  function fitCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const pw = Math.round(w * dpr);
    const ph = Math.round(h * dpr);
    if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  function ridge(ctx, w, baseY, amp, color, phase, step, xOff = 0) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, baseY + amp);
    for (let x = 0; x <= w + step; x += step) {
      const y = baseY - Math.sin((x + xOff) * 0.0021 + phase) * amp - Math.sin((x + xOff) * 0.0067 + phase * 1.7) * amp * 0.42;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w + step, ctx.canvas.height);
    ctx.lineTo(0, ctx.canvas.height);
    ctx.closePath();
    ctx.fill();
  }

  /* 前景芦苇：最靠近镜头的一层，动得最多，画面才有厚度 */
  function drawForeground(ctx, w, h, t) {
    const groundY = h * 0.94;
    const shift = parX * 46;
    ctx.strokeStyle = "rgba(12, 30, 23, 0.62)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let i = 0; i < 46; i += 1) {
      const bx = ((i * 137) % (w + 80)) - 40 + shift;
      const bh = 26 + (i % 5) * 13;
      const sway = Math.sin(t * 0.0011 + i * 0.8) * 6;
      ctx.moveTo(bx, groundY + 34);
      ctx.quadraticCurveTo(bx + sway * 0.4, groundY + 34 - bh * 0.6, bx + sway, groundY + 34 - bh);
    }
    ctx.stroke();
    ctx.lineWidth = 1;

    /* 底边压一道暗，把画面兜住 */
    const grad = ctx.createLinearGradient(0, h * 0.84, 0, h);
    grad.addColorStop(0, "rgba(10, 26, 20, 0)");
    grad.addColorStop(1, "rgba(8, 22, 17, 0.72)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, h * 0.84, w, h * 0.16);
  }

  function drawVillage(ctx, w, h, t, alpha, hideHouse) {
    const base = h * 0.72;
    ctx.globalAlpha = alpha;

    /* 远树排：把村子往后推一层 */
    ctx.fillStyle = "rgba(46,72,56,0.45)";
    for (let i = 0; i < 7; i += 1) {
      const tx = w * (0.36 + i * 0.09);
      const th = 34 + (i % 3) * 12;
      ctx.beginPath();
      ctx.arc(tx, base - th, 20 + (i % 2) * 6, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!hideHouse) {
      /* 土坯房 */
      ctx.fillStyle = "#8d6a4e";
      ctx.fillRect(w * 0.06, base - 168, w * 0.24, 168);
      /* 受光的一侧 */
      ctx.fillStyle = "rgba(214,180,132,0.26)";
      ctx.fillRect(w * 0.06, base - 168, w * 0.07, 168);
      /* 屋檐阴影 */
      ctx.fillStyle = "rgba(30,24,16,0.26)";
      ctx.fillRect(w * 0.06, base - 168, w * 0.24, 15);
      /* 屋顶 */
      ctx.fillStyle = "#3b3e33";
      ctx.beginPath();
      ctx.moveTo(w * 0.04, base - 168);
      ctx.lineTo(w * 0.18, base - 250);
      ctx.lineTo(w * 0.32, base - 168);
      ctx.closePath();
      ctx.fill();
      /* 屋脊亮边 */
      ctx.strokeStyle = "rgba(224,206,168,0.26)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.04, base - 168);
      ctx.lineTo(w * 0.18, base - 250);
      ctx.stroke();
      ctx.lineWidth = 1;
      /* 门 */
      ctx.fillStyle = "rgba(200,166,83,0.75)";
      ctx.fillRect(w * 0.145, base - 108, 44, 108);
      /* 窗：屋里点着灯 */
      ctx.fillStyle = "rgba(244,214,140,0.66)";
      ctx.fillRect(w * 0.086, base - 134, 32, 28);
      ctx.strokeStyle = "rgba(40,30,20,0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.086, base - 134, 32, 28);
      ctx.beginPath();
      ctx.moveTo(w * 0.086 + 16, base - 134);
      ctx.lineTo(w * 0.086 + 16, base - 106);
      ctx.stroke();
      ctx.lineWidth = 1;
      /* 炊烟 */
      ctx.strokeStyle = "rgba(238,231,216,0.16)";
      ctx.lineWidth = 7;
      ctx.beginPath();
      const cx = w * 0.1;
      ctx.moveTo(cx, base - 232);
      for (let i = 1; i <= 5; i += 1) {
        ctx.lineTo(cx + Math.sin(t * 0.0007 + i * 0.9) * 15 * i * 0.32, base - 232 - i * 22);
      }
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    /* 电线杆：把村子和外头连上 */
    ctx.strokeStyle = "rgba(28,34,28,0.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.44, base);
    ctx.lineTo(w * 0.44, base - 176);
    ctx.moveTo(w * 0.42, base - 168);
    ctx.lineTo(w * 0.46, base - 168);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(28,34,28,0.4)";
    ctx.beginPath();
    ctx.moveTo(w * 0.32, base - 150);
    ctx.quadraticCurveTo(w * 0.38, base - 118, w * 0.42, base - 168);
    ctx.moveTo(w * 0.46, base - 168);
    ctx.quadraticCurveTo(w * 0.57, base - 120, w * 0.68, base - 150);
    ctx.stroke();

    /* 老树 */
    ctx.strokeStyle = "#26392e";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(w * 0.72, base);
    ctx.quadraticCurveTo(w * 0.72, base - 150, w * 0.76, base - 212);
    ctx.stroke();
    ctx.fillStyle = "#3f5b46";
    [[0.75, -208, 58], [0.705, -170, 48], [0.8, -164, 44]].forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(w * x, base + y, r + Math.sin(t * 0.001 + x * 9) * 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.lineWidth = 1;

    /* 玉米垛：收下来的堆在院里 */
    [[0.585, 0.085], [0.625, 0.055]].forEach(([x, sk]) => {
      ctx.fillStyle = "rgba(206,176,102,0.55)";
      ctx.beginPath();
      ctx.moveTo(w * x - w * sk, base);
      ctx.quadraticCurveTo(w * x, base - 68, w * x + w * sk, base);
      ctx.closePath();
      ctx.fill();
    });

    /* 手扶拖拉机：这时候拉货、下地都靠它，停在院门外的田埂上 */
    const traX = w * 0.5;
    const traY = base - 2;
    ctx.fillStyle = "rgba(146,58,42,0.92)"; /* 车头 */
    ctx.fillRect(traX, traY - 30, 34, 24);
    ctx.fillStyle = "rgba(68,74,64,0.92)";  /* 拖斗 */
    ctx.fillRect(traX + 40, traY - 26, 46, 20);
    ctx.strokeStyle = "rgba(30,34,28,0.85)"; /* 扶手 */
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(traX + 30, traY - 30);
    ctx.lineTo(traX + 46, traY - 48);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = "rgba(24,28,24,0.92)"; /* 轮子 */
    ctx.beginPath();
    ctx.arc(traX + 10, traY - 4, 13, 0, Math.PI * 2);
    ctx.arc(traX + 36, traY - 4, 8, 0, Math.PI * 2);
    ctx.arc(traX + 76, traY - 4, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(198,172,96,0.5)"; /* 轮毂 */
    ctx.beginPath();
    ctx.arc(traX + 10, traY - 4, 5, 0, Math.PI * 2);
    ctx.fill();

    /* 生产队大喇叭：通知靠喊，一根杆子支在村口 */
    const hornX = w * 0.355;
    ctx.strokeStyle = "rgba(34,40,32,0.75)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(hornX, base);
    ctx.lineTo(hornX, base - 214);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = "#4c5148";
    ctx.beginPath(); /* 尾窄口宽，才像个喇叭 */
    ctx.moveTo(hornX + 2, base - 196);
    ctx.lineTo(hornX + 10, base - 214);
    ctx.lineTo(hornX + 42, base - 204);
    ctx.lineTo(hornX + 42, base - 172);
    ctx.lineTo(hornX + 10, base - 178);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(232,206,146,0.55)"; /* 口沿 */
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hornX + 42, base - 204);
    ctx.lineTo(hornX + 42, base - 172);
    ctx.stroke();
    ctx.lineWidth = 1;

    /* 篱笆 */
    ctx.strokeStyle = "rgba(58,46,30,0.55)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 16; i += 1) {
      const fx = w * 0.5 + i * w * 0.03;
      if (fx > w * 0.99) break;
      ctx.beginPath();
      ctx.moveTo(fx, base + 2);
      ctx.lineTo(fx, base - 26);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(w * 0.5, base - 19);
    ctx.lineTo(w * 0.98, base - 19);
    ctx.stroke();
    ctx.lineWidth = 1;

    /* 麦田 */
    ctx.fillStyle = "rgba(198,172,96,0.42)";
    for (let i = 0; i < 60; i += 1) {
      const x = (i * 97) % w;
      const y = base + 12 + ((i * 53) % Math.max(40, h - base - 16));
      const sway = Math.sin(t * 0.0012 + i) * 3;
      ctx.fillRect(x + sway, y, 2, 14 + (i % 5));
    }
    ctx.globalAlpha = 1;
  }

  function drawTown(ctx, w, h, t, alpha) {
    const base = h * 0.72;
    ctx.globalAlpha = alpha;

    /* 远楼群：镇子不止一条街 */
    ctx.fillStyle = "rgba(74,84,78,0.4)";
    for (let i = 0; i < 9; i += 1) {
      const bw = w * (0.05 + (i % 3) * 0.02);
      const bh = 90 + (i % 4) * 34;
      ctx.fillRect(w * (0.33 + i * 0.075), base - bh, bw, bh);
    }

    /* 储蓄所 */
    ctx.fillStyle = "#8a6149";
    ctx.fillRect(w * 0.05, base - 250, w * 0.26, 250);
    ctx.fillStyle = "rgba(214,178,132,0.2)";
    ctx.fillRect(w * 0.05, base - 250, w * 0.05, 250);
    ctx.fillStyle = "#173c31";
    ctx.fillRect(w * 0.05, base - 250, w * 0.26, 44);
    ctx.fillStyle = "rgba(244,236,219,0.92)";
    ctx.font = "15px 'Microsoft YaHei', sans-serif";
    ctx.fillText("镇上储蓄网点", w * 0.09, base - 220);
    /* 一排窗，有几扇亮着 */
    for (let i = 0; i < 5; i += 1) {
      const lit = (i + Math.floor(t * 0.0004)) % 3 === 0;
      ctx.fillStyle = lit ? "rgba(246,222,160,0.6)" : "rgba(200,166,83,0.45)";
      ctx.fillRect(w * 0.065 + i * w * 0.048, base - 190 + (i % 2) * 22, w * 0.032, 40);
    }
    ctx.fillStyle = "rgba(20,40,32,0.6)";
    ctx.fillRect(w * 0.05, base - 46, w * 0.26, 46);

    /* 竖灯箱：天一暗，"储蓄"两个字还亮着 */
    const sbX = w * 0.318;
    const sbY = base - 158;
    ctx.fillStyle = "rgba(16,40,33,0.94)";
    ctx.fillRect(sbX, sbY, 26, 80);
    ctx.strokeStyle = "rgba(226,196,124,0.72)";
    ctx.lineWidth = 2;
    ctx.strokeRect(sbX, sbY, 26, 80);
    ctx.lineWidth = 1;
    ctx.fillStyle = "rgba(246,226,170,0.94)";
    ctx.font = "14px 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("储", sbX + 13, sbY + 30);
    ctx.fillText("蓄", sbX + 13, sbY + 54);
    ctx.textAlign = "left";

    /* 摩托车：跑业务的主要脚力，停在储蓄所门口 */
    const moX = w * 0.36;
    const moY = base - 2;
    ctx.strokeStyle = "rgba(22,26,22,0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(moX, moY - 12, 12, 0, Math.PI * 2);
    ctx.arc(moX + 46, moY - 12, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = "rgba(158,72,50,0.92)"; /* 车身 */
    ctx.beginPath();
    ctx.moveTo(moX + 6, moY - 20);
    ctx.lineTo(moX + 30, moY - 27);
    ctx.lineTo(moX + 45, moY - 18);
    ctx.lineTo(moX + 34, moY - 10);
    ctx.lineTo(moX + 10, moY - 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(28,32,28,0.9)"; /* 前叉、车把、后视镜 */
    ctx.fillRect(moX + 27, moY - 40, 4, 16);
    ctx.fillRect(moX + 22, moY - 45, 16, 3);
    ctx.fillStyle = "rgba(240,226,178,0.9)"; /* 车灯 */
    ctx.beginPath();
    ctx.arc(moX + 45, moY - 22, 4, 0, Math.PI * 2);
    ctx.fill();

    /* 厂房 */
    ctx.fillStyle = "#6d6a5b";
    ctx.fillRect(w * 0.57, base - 200, w * 0.3, 200);
    ctx.fillStyle = "rgba(224,220,200,0.12)";
    ctx.fillRect(w * 0.57, base - 200, w * 0.3, 12);
    ctx.fillStyle = "#333d36";
    for (let i = 0; i < 4; i += 1) ctx.fillRect(w * 0.6 + i * 68, base - 148 + (i % 2) * 30, 46, 84);
    /* 车间灯带 */
    ctx.fillStyle = "rgba(246,222,160,0.38)";
    for (let i = 0; i < 4; i += 1) ctx.fillRect(w * 0.6 + i * 68 + 6, base - 141 + (i % 2) * 30, 34, 6);
    /* 烟囱冒烟 */
    ctx.fillStyle = "rgba(238,231,216,0.12)";
    for (let i = 0; i < 4; i += 1) {
      const p = ((t * 0.02 + i * 300) % 900) / 900;
      ctx.beginPath();
      ctx.arc(w * 0.8 + Math.sin(p * 6) * 22, base - 220 - p * 150, 8 + p * 26, 0, Math.PI * 2);
      ctx.fill();
    }

    /* 公路 */
    const road = ctx.createLinearGradient(0, base, 0, h);
    road.addColorStop(0, "#565c54");
    road.addColorStop(1, "#3b403a");
    ctx.fillStyle = road;
    ctx.fillRect(0, base, w, h - base);
    ctx.strokeStyle = "rgba(244,236,219,0.32)";
    ctx.setLineDash([22, 20]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, base + 78);
    ctx.lineTo(w, base + 78);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 1;

    /* 路灯：杆子立着，灯下一圈光 */
    const lampX = w * 0.5;
    ctx.strokeStyle = "rgba(24,30,26,0.8)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(lampX, base);
    ctx.lineTo(lampX, base - 156);
    ctx.quadraticCurveTo(lampX, base - 170, lampX + 26, base - 170);
    ctx.stroke();
    ctx.lineWidth = 1;
    const lampGlow = ctx.createRadialGradient(lampX + 26, base - 164, 2, lampX + 26, base - 164, 70);
    lampGlow.addColorStop(0, "rgba(248,224,150,0.34)");
    lampGlow.addColorStop(1, "rgba(248,224,150,0)");
    ctx.fillStyle = lampGlow;
    ctx.fillRect(lampX - 48, base - 238, 148, 148);
    ctx.fillStyle = "rgba(248,228,158,0.95)";
    ctx.beginPath();
    ctx.arc(lampX + 26, base - 164, 5, 0, Math.PI * 2);
    ctx.fill();

    /* 公交车 */
    const busX = ((t * 0.05) % (w + 420)) - 210;
    ctx.fillStyle = "rgba(196,88,64,0.85)";
    ctx.fillRect(busX, base + 16, 132, 40);
    ctx.fillStyle = "rgba(240,236,222,0.5)";
    for (let i = 0; i < 4; i += 1) ctx.fillRect(busX + 10 + i * 30, base + 24, 22, 16);
    ctx.fillStyle = "rgba(240,196,120,0.9)";
    ctx.fillRect(busX + 122, base + 26, 8, 8);
    ctx.fillStyle = "rgba(20,26,22,0.85)";
    ctx.beginPath();
    ctx.arc(busX + 26, base + 58, 9, 0, Math.PI * 2);
    ctx.arc(busX + 106, base + 58, 9, 0, Math.PI * 2);
    ctx.fill();

    /* 自行车剪影 */
    const bx = ((t * 0.035) % (w + 160)) - 80;
    ctx.strokeStyle = "rgba(20,26,22,0.72)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(bx, base + 44, 13, 0, Math.PI * 2);
    ctx.arc(bx + 38, base + 44, 13, 0, Math.PI * 2);
    ctx.moveTo(bx, base + 44); ctx.lineTo(bx + 18, base + 20); ctx.lineTo(bx + 38, base + 44);
    ctx.moveTo(bx + 18, base + 20); ctx.lineTo(bx + 10, base + 4);
    ctx.stroke();
    ctx.lineWidth = 1;

    ctx.globalAlpha = 1;
  }

  /* 第三代：服务搬进了手机。
     所以这一程的背景就是一块手机屏——直播、弹幕、扫码、通知，
     底下还是那片光伏田，田和屏之间连着线：两边是一回事。 */
  function futureHeart(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.42);
    ctx.bezierCurveTo(x - s * 1.24, y - s * 0.6, x - s * 0.34, y - s * 1.5, x, y - s * 0.48);
    ctx.bezierCurveTo(x + s * 0.34, y - s * 1.5, x + s * 1.24, y - s * 0.6, x, y + s * 0.42);
    ctx.fill();
  }

  function drawFuture(ctx, w, h, t, alpha) {
    const base = h * 0.72;
    ctx.globalAlpha = alpha;

    const font = "'Noto Sans SC', 'Microsoft YaHei', system-ui, sans-serif";
    /* 机身要整个看得见：上不顶到页头，下踩在田里 */
    const phoneW = Math.min(w * 0.25, h * 0.32);
    const phoneH = phoneW * 1.8;
    const phoneX = w * 0.055;
    const phoneY = base - phoneH + 12;
    const pad = phoneW * 0.036;
    const scrX = phoneX + pad;
    const scrY = phoneY + pad;
    const scrW = phoneW - pad * 2;
    const scrH = phoneH - pad * 2;
    const rr = (x, y, ww, hh, r) => {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, ww, hh, r); else ctx.rect(x, y, ww, hh);
    };

    /* 屏光：手机把周围照亮一圈 */
    const cx = phoneX + phoneW / 2;
    const cy = phoneY + phoneH / 2;
    const halo = ctx.createRadialGradient(cx, cy, phoneW * 0.1, cx, cy, phoneH * 0.78);
    halo.addColorStop(0, "rgba(146, 226, 202, 0.24)");
    halo.addColorStop(1, "rgba(146, 226, 202, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(cx - phoneH, cy - phoneH, phoneH * 2, phoneH * 2);

    /* 信号弧：从机身右上角往外荡 */
    ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i += 1) {
      const pulse = (Math.sin(t * 0.0022 - i * 0.9) + 1) / 2;
      ctx.globalAlpha = alpha * (0.14 + pulse * 0.46);
      ctx.strokeStyle = "rgba(224,196,124,0.9)";
      ctx.beginPath();
      ctx.arc(phoneX + phoneW * 0.9, phoneY + phoneH * 0.06, i * phoneW * 0.15, Math.PI * 1.08, Math.PI * 1.72);
      ctx.stroke();
    }
    ctx.globalAlpha = alpha;

    /* 机身 */
    ctx.fillStyle = "#0e1d18";
    rr(phoneX, phoneY, phoneW, phoneH, phoneW * 0.15);
    ctx.fill();
    ctx.strokeStyle = "rgba(224,196,124,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    /* 屏幕 */
    const sg = ctx.createLinearGradient(scrX, scrY, scrX, scrY + scrH);
    sg.addColorStop(0, "#2d6759");
    sg.addColorStop(0.48, "#1d4b41");
    sg.addColorStop(1, "#123229");
    ctx.fillStyle = sg;
    rr(scrX, scrY, scrW, scrH, phoneW * 0.11);
    ctx.fill();

    /* 刘海 */
    ctx.fillStyle = "#0a1512";
    rr(scrX + scrW / 2 - phoneW * 0.1, scrY + phoneW * 0.022, phoneW * 0.2, phoneW * 0.046, phoneW * 0.03);
    ctx.fill();

    /* 状态栏：时间 + 信号 + 电量 */
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(234,247,241,0.86)";
    ctx.font = `${Math.round(phoneW * 0.072)}px ${font}`;
    ctx.fillText("07:20", scrX + scrW * 0.08, scrY + phoneW * 0.055);
    for (let i = 0; i < 4; i += 1) {
      const bw = phoneW * 0.017;
      const bh = phoneW * (0.018 + i * 0.011);
      ctx.fillRect(scrX + scrW - phoneW * 0.33 + i * (bw + phoneW * 0.012), scrY + phoneW * 0.055 - bh / 2, bw, bh);
    }
    ctx.strokeStyle = "rgba(234,247,241,0.8)";
    ctx.lineWidth = 1.3;
    ctx.strokeRect(scrX + scrW - phoneW * 0.14, scrY + phoneW * 0.034, phoneW * 0.088, phoneW * 0.042);
    ctx.fillStyle = "rgba(234,247,241,0.8)";
    ctx.fillRect(scrX + scrW - phoneW * 0.134, scrY + phoneW * 0.039, phoneW * 0.058, phoneW * 0.032);

    /* 直播卡 */
    const lvX = scrX + scrW * 0.07;
    const lvY = scrY + scrW * 0.22;
    const lvW = scrW * 0.86;
    const lvH = scrH * 0.28;
    const lg = ctx.createLinearGradient(lvX, lvY, lvX + lvW, lvY + lvH);
    lg.addColorStop(0, "rgba(228, 172, 116, 0.96)");
    lg.addColorStop(0.55, "rgba(160, 112, 80, 0.96)");
    lg.addColorStop(1, "rgba(96, 80, 64, 0.96)");
    ctx.fillStyle = lg;
    rr(lvX, lvY, lvW, lvH, phoneW * 0.05);
    ctx.fill();

    /* 主播 */
    ctx.fillStyle = "rgba(246, 228, 198, 0.92)";
    ctx.beginPath();
    ctx.arc(lvX + lvW * 0.25, lvY + lvH * 0.5, lvW * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(62, 44, 32, 0.88)";
    ctx.beginPath();
    ctx.arc(lvX + lvW * 0.25, lvY + lvH * 0.43, lvW * 0.058, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lvX + lvW * 0.25, lvY + lvH * 0.7, lvW * 0.095, Math.PI, Math.PI * 2);
    ctx.fill();

    /* 播放三角 */
    ctx.fillStyle = "rgba(255,252,244,0.92)";
    ctx.beginPath();
    ctx.moveTo(lvX + lvW * 0.5, lvY + lvH * 0.34);
    ctx.lineTo(lvX + lvW * 0.5, lvY + lvH * 0.66);
    ctx.lineTo(lvX + lvW * 0.72, lvY + lvH * 0.5);
    ctx.closePath();
    ctx.fill();

    /* LIVE 标 */
    const blink = Math.sin(t * 0.0045) > -0.3 ? 1 : 0.5;
    ctx.fillStyle = `rgba(206, 62, 48, ${0.72 + blink * 0.28})`;
    rr(lvX + lvW * 0.06, lvY + lvH * 0.09, lvW * 0.24, lvH * 0.17, 3);
    ctx.fill();
    ctx.fillStyle = "rgba(255,246,240,0.96)";
    ctx.textAlign = "left";
    ctx.font = `700 ${Math.round(phoneW * 0.06)}px ${font}`;
    ctx.fillText("LIVE", lvX + lvW * 0.095, lvY + lvH * 0.178);
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,246,240,0.9)";
    ctx.font = `${Math.round(phoneW * 0.052)}px ${font}`;
    ctx.fillText("1.2万人在看", lvX + lvW * 0.94, lvY + lvH * 0.9);
    ctx.textAlign = "left";

    /* 爱心：从直播卡往上飘出手机 */
    for (let i = 0; i < 7; i += 1) {
      const p = (t * 0.00034 + i * 0.143) % 1;
      const hx = lvX + lvW * (0.84 + Math.sin(p * 7 + i * 1.7) * 0.06);
      const hy = lvY + lvH * 0.9 - p * phoneH * 0.55;
      const s = phoneW * (0.048 + (1 - p) * 0.028);
      ctx.globalAlpha = alpha * (1 - p) * 0.92;
      ctx.fillStyle = i % 3 === 0 ? "#e8a04a" : "#e2604f";
      futureHeart(ctx, hx, hy, s);
    }
    ctx.globalAlpha = alpha;

    /* 弹幕：一条条从右往左滑 */
    const danmu = ["货到了", "这个价实在", "已下单", "村里也能办"];
    ctx.font = `${Math.round(phoneW * 0.058)}px ${font}`;
    for (let i = 0; i < danmu.length; i += 1) {
      const speed = 0.02 + (i % 3) * 0.006;
      const span = scrW + 180;
      const dx2 = scrX + scrW - ((t * speed + i * 210) % span);
      const dy2 = lvY + lvH + phoneW * (0.075 + (i % 2) * 0.085);
      if (dy2 > scrY + scrH) continue;
      const tw = ctx.measureText(danmu[i]).width;
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = "rgba(12, 34, 28, 0.55)";
      rr(dx2 - 6, dy2 - phoneW * 0.038, tw + 12, phoneW * 0.076, phoneW * 0.038);
      ctx.fill();
      ctx.fillStyle = i % 2 ? "rgba(224,196,124,0.95)" : "rgba(226,240,234,0.92)";
      ctx.fillText(danmu[i], dx2, dy2);
    }
    ctx.globalAlpha = alpha;

    /* 应用宫格 */
    const apps = 8;
    const gridTop = scrY + scrH * 0.6;
    const cellW = scrW * 0.19;
    const gapX = scrW * 0.055;
    for (let i = 0; i < apps; i += 1) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const ax = scrX + scrW * 0.08 + col * (cellW + gapX);
      const ay = gridTop + row * (cellW + scrW * 0.05);
      ctx.fillStyle = i === 1 ? "rgba(200,166,83,0.85)" : "rgba(224,240,234,0.2)";
      rr(ax, ay, cellW, cellW, cellW * 0.26);
      ctx.fill();
      ctx.strokeStyle = "rgba(224,240,234,0.24)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    /* 通知条：从屏幕上沿滑进来 */
    const np = Math.min(1, ((t * 0.0006) % 1) * 3);
    if (np > 0.02) {
      const nW = scrW * 0.74;
      const nH = phoneW * 0.16;
      const nX = scrX + scrW / 2 - nW / 2;
      const nY = scrY + phoneW * 0.11 - nH * (1 - Math.min(1, np)) - nH * 0.15;
      ctx.globalAlpha = alpha * 0.94;
      ctx.fillStyle = "rgba(238, 246, 240, 0.94)";
      rr(nX, nY, nW, nH, nH * 0.34);
      ctx.fill();
      ctx.fillStyle = "rgba(24, 74, 60, 0.9)";
      ctx.beginPath();
      ctx.arc(nX + nH * 0.55, nY + nH / 2, nH * 0.26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(40, 62, 54, 0.92)";
      ctx.font = `${Math.round(phoneW * 0.05)}px ${font}`;
      ctx.fillText("货款到账 ¥ 3,280.00", nX + nH * 1.02, nY + nH / 2);
      ctx.globalAlpha = alpha;
    }

    /* 底部：付款条 */
    ctx.fillStyle = "rgba(200,166,83,0.92)";
    rr(scrX + scrW * 0.08, scrY + scrH * 0.9, scrW * 0.84, scrH * 0.06, phoneW * 0.03);
    ctx.fill();
    ctx.fillStyle = "rgba(14, 40, 32, 0.9)";
    ctx.textAlign = "center";
    ctx.font = `700 ${Math.round(phoneW * 0.055)}px ${font}`;
    ctx.fillText("向合作社付款", scrX + scrW / 2, scrY + scrH * 0.93);
    ctx.textAlign = "left";

    /* 地面：光伏田 */
    const ground = ctx.createLinearGradient(0, base, 0, h);
    ground.addColorStop(0, "#3f6552");
    ground.addColorStop(1, "#2a4638");
    ctx.fillStyle = ground;
    ctx.fillRect(0, base, w, h - base);
    for (let i = 0; i < 9; i += 1) {
      const px2 = w * 0.03 + i * w * 0.108;
      const py2 = base + 26 + (i % 3) * 18;
      ctx.fillStyle = "rgba(150,205,190,0.3)";
      ctx.beginPath();
      ctx.moveTo(px2, py2 + 16);
      ctx.lineTo(px2 + w * 0.07, py2 + 16);
      ctx.lineTo(px2 + w * 0.062, py2);
      ctx.lineTo(px2 + w * 0.008, py2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(224,240,234,0.24)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    /* 快递柜：件到了自己来取，柜子立在田头 */
    const lkX = w * 0.3;
    const lkY = base + 88; /* 立在田里，不是浮在地平线上 */
    ctx.fillStyle = "rgba(58,110,96,0.94)";
    ctx.fillRect(lkX, lkY - 74, 50, 74);
    ctx.fillStyle = "rgba(16,36,30,0.55)";
    ctx.fillRect(lkX + 5, lkY - 69, 40, 40);
    ctx.strokeStyle = "rgba(224,240,234,0.3)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i += 1) ctx.strokeRect(lkX + 5 + i * 13.4, lkY - 69, 13.4, 40);
    for (let i = 0; i < 3; i += 1) ctx.strokeRect(lkX + 5 + i * 13.4, lkY - 26, 13.4, 14);
    ctx.fillStyle = "rgba(224,196,124,0.9)";
    ctx.fillRect(lkX, lkY - 81, 50, 7); /* 顶灯条 */

    /* 无人机：从村子上空穿一趟，吊着一件快递 */
    const dpSpan = w * 0.5;
    const dpRaw = (t * 0.022) % (dpSpan * 2);
    const dpX = w * 0.5 + (dpRaw < dpSpan ? dpRaw : dpSpan * 2 - dpRaw);
    const dpY = h * 0.135 + Math.sin(t * 0.0016) * 8;
    ctx.fillStyle = "rgba(238,248,244,0.92)";
    ctx.fillRect(dpX - 17, dpY, 34, 13);    /* 机身 */
    ctx.fillRect(dpX - 42, dpY - 6, 24, 5); /* 左机臂 */
    ctx.fillRect(dpX + 18, dpY - 6, 24, 5); /* 右机臂 */
    ctx.fillStyle = "rgba(180,240,216,0.62)"; /* 旋翼 */
    ctx.beginPath();
    ctx.ellipse(dpX - 30, dpY - 9, 17, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(dpX + 30, dpY - 9, 17, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(28,74,60,0.75)"; /* 云台 */
    ctx.beginPath();
    ctx.arc(dpX, dpY + 15, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(200,166,83,0.6)"; /* 吊绳 */
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(dpX, dpY + 13);
    ctx.lineTo(dpX, dpY + 26);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = "rgba(216,164,99,0.95)"; /* 吊着的包裹 */
    ctx.fillRect(dpX - 11, dpY + 26, 22, 17);
    ctx.fillStyle = "rgba(255,246,230,0.5)";
    ctx.fillRect(dpX - 11, dpY + 32, 22, 4);
    ctx.strokeStyle = "rgba(255,246,230,0.45)";
    ctx.strokeRect(dpX - 11, dpY + 26, 22, 17);

    /* 田和屏之间连着线，线上一颗颗数据在走 */
    const nodes = [[0.2, -20], [0.42, 4], [0.62, -14], [0.82, 6]];
    ctx.strokeStyle = "rgba(200,166,83,0.5)";
    ctx.lineWidth = 1.4;
    nodes.forEach(([nx, ny]) => {
      ctx.beginPath();
      ctx.moveTo(phoneX + phoneW * 0.5, base - 6);
      ctx.quadraticCurveTo((phoneX + phoneW * 0.5 + w * nx) / 2, base - 40, w * nx, base + ny);
      ctx.stroke();
    });
    nodes.forEach(([nx, ny], i) => {
      const pulse = Math.sin(t * 0.002 - i * 0.7) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(224,196,124,${0.35 + pulse * 0.6})`;
      ctx.beginPath();
      ctx.arc(w * nx, base + ny, 4 + pulse * 2.4, 0, Math.PI * 2);
      ctx.fill();
      /* 走的包 */
      ctx.fillStyle = `rgba(180, 240, 216, ${0.5 + pulse * 0.5})`;
      ctx.beginPath();
      ctx.arc(w * nx, base + ny - 14 - pulse * 10, 2.6, 0, Math.PI * 2);
      ctx.fill();
    });

    /* 服务站：还是村口那间，只是挂上了招牌灯 */
    ctx.fillStyle = "#7d5a45";
    ctx.fillRect(w * 0.7, base - 150, w * 0.2, 150);
    ctx.fillStyle = "#123b30";
    ctx.fillRect(w * 0.7, base - 150, w * 0.2, 32);
    ctx.fillStyle = "rgba(244,236,219,0.9)";
    ctx.font = `${Math.round(Math.max(11, w * 0.009))}px ${font}`;
    ctx.fillText("乡村金融服务站", w * 0.72, base - 128);
    ctx.fillStyle = "rgba(224,196,124,0.7)";
    ctx.fillRect(w * 0.72, base - 108, w * 0.05, 10);
    ctx.fillRect(w * 0.79, base - 108, w * 0.05, 10);

    /* 收回默认基线，别影响别处画字 */
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = 1;
  }

  function drawEra(ctx, era, w, h, t, alpha, isTitle) {
    if (era === "grandparent") drawVillage(ctx, w, h, t, alpha, isTitle);
    else if (era === "parent") drawTown(ctx, w, h, t, alpha);
    else drawFuture(ctx, w, h, t, alpha);
  }

  let lastFrame = 0;

  function drawWorld(timestamp) {
    const dt = lastFrame ? Math.min(64, timestamp - lastFrame) : 16;
    lastFrame = timestamp;

    const { w, h } = fitCanvas();
    const t = timestamp;

    sceneBlend = Math.min(1, sceneBlend + dt / 900);
    const ease = 1 - Math.pow(1 - sceneBlend, 3);

    /* 视差追值：指针给目标，每帧追一点 */
    const follow = Math.min(1, dt / 280);
    parX += (parTX - parX) * follow;
    parY += (parTY - parY) * follow;
    const root = document.documentElement;
    root.style.setProperty("--par-x", parX.toFixed(3));
    root.style.setProperty("--par-y", parY.toFixed(3));
    root.style.setProperty("--par-scroll", parScroll.toFixed(3));

    const pA = scenePalette(sceneFrom);
    const pB = scenePalette(sceneTo);
    const top = mixHex(pA.top, pB.top, ease);
    const mid = mixHex(pA.mid, pB.mid, ease);
    const bot = mixHex(pA.bot, pB.bot, ease);

    /* 天空 */
    const sky = ctx2d.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, top);
    sky.addColorStop(0.44, mid);
    sky.addColorStop(0.68, mid);
    sky.addColorStop(1, bot);
    ctx2d.fillStyle = sky;
    ctx2d.fillRect(0, 0, w, h);

    /* 地平线附近亮一层，天地才分得开 */
    const horizon = ctx2d.createLinearGradient(0, h * 0.4, 0, h * 0.68);
    horizon.addColorStop(0, "rgba(255,240,208,0)");
    horizon.addColorStop(1, "rgba(255,236,196,0.18)");
    ctx2d.fillStyle = horizon;
    ctx2d.fillRect(0, h * 0.4, w, h * 0.28);

    /* 日轮 */
    const sunX = w * (0.7 + Math.sin(t * 0.00008) * 0.02) + parX * 14;
    const sunY = h * 0.19 + parY * 8;
    const glow = ctx2d.createRadialGradient(sunX, sunY, 4, sunX, sunY, 168);
    glow.addColorStop(0, "rgba(226,186,96,0.66)");
    glow.addColorStop(0.5, "rgba(226,186,96,0.2)");
    glow.addColorStop(1, "rgba(226,186,96,0)");
    ctx2d.fillStyle = glow;
    ctx2d.fillRect(sunX - 180, sunY - 180, 360, 360);
    ctx2d.fillStyle = "rgba(244,226,182,0.78)";
    ctx2d.beginPath();
    ctx2d.arc(sunX, sunY, 44, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.strokeStyle = "rgba(255,246,224,0.22)";
    ctx2d.lineWidth = 2;
    ctx2d.beginPath();
    ctx2d.arc(sunX, sunY, 58, 0, Math.PI * 2);
    ctx2d.stroke();
    ctx2d.lineWidth = 1;

    /* 云：一朵不止一个圆，指针一动高低层就分开 */
    for (let i = 0; i < 6; i += 1) {
      const speed = 0.004 + i * 0.0015;
      const cx = ((t * speed + i * w * 0.23) % (w + 380)) - 190 + parX * (16 + i * 5);
      const cy = h * (0.09 + i * 0.038) + parY * (5 + (i % 3) * 3);
      const cs = 58 + i * 12;
      ctx2d.fillStyle = `rgba(244,236,219,${0.07 + (i % 2) * 0.05})`;
      ctx2d.beginPath();
      ctx2d.ellipse(cx, cy, cs, 12 + i * 1.6, 0, 0, Math.PI * 2);
      ctx2d.ellipse(cx + cs * 0.52, cy + 4, cs * 0.6, 10 + i, 0, 0, Math.PI * 2);
      ctx2d.ellipse(cx - cs * 0.55, cy + 5, cs * 0.48, 9 + i, 0, 0, Math.PI * 2);
      ctx2d.fill();
    }

    /* 远山三层：越近动得越多 */
    ridge(ctx2d, w, h * 0.46, 40, "rgba(35,64,50,0.45)", t * 0.0001, 24, parX * 6);
    ridge(ctx2d, w, h * 0.53, 34, "rgba(27,54,43,0.7)", 2.2 + t * 0.00013, 22, parX * 12);
    ridge(ctx2d, w, h * 0.60, 26, "rgba(18,44,35,0.9)", 4.4 + t * 0.00016, 20, parX * 20);

    /* 海河水面 */
    const riverY = h * 0.665;
    const river = ctx2d.createLinearGradient(0, riverY, 0, h * 0.74);
    river.addColorStop(0, "rgba(120,168,164,0.72)");
    river.addColorStop(1, "rgba(60,110,104,0.24)");
    ctx2d.fillStyle = river;
    ctx2d.fillRect(0, riverY, w, h * 0.075);

    /* 日头在水里的碎光 */
    for (let i = 0; i < 12; i += 1) {
      const rx = sunX - 34 + i * 6 + Math.sin(t * 0.0008 + i) * 3;
      const ry = riverY + 4 + (i * 7) % (h * 0.06);
      ctx2d.fillStyle = `rgba(244,226,182,${0.06 + (i % 3) * 0.05})`;
      ctx2d.fillRect(rx, ry, 3, 6 + (i % 4) * 4);
    }

    /* 水纹 */
    ctx2d.strokeStyle = "rgba(244,236,219,0.16)";
    ctx2d.lineWidth = 1;
    for (let i = 0; i < 16; i += 1) {
      const y = riverY + 6 + (i * 11) % (h * 0.07);
      const off = Math.sin(t * 0.0009 + i) * 26 + parX * 10;
      ctx2d.beginPath();
      ctx2d.moveTo(w * 0.1 + off + (i * 83) % (w * 0.8), y);
      ctx2d.lineTo(w * 0.1 + off + (i * 83) % (w * 0.8) + 40 + (i % 4) * 18, y);
      ctx2d.stroke();
    }

    /* 一条船：河不是空的 */
    const boatX = ((t * 0.012) % (w + 260)) - 130;
    ctx2d.fillStyle = "rgba(26,38,32,0.72)";
    ctx2d.beginPath();
    ctx2d.moveTo(boatX, riverY + 22);
    ctx2d.lineTo(boatX + 58, riverY + 22);
    ctx2d.lineTo(boatX + 48, riverY + 32);
    ctx2d.lineTo(boatX + 10, riverY + 32);
    ctx2d.closePath();
    ctx2d.fill();
    ctx2d.fillRect(boatX + 26, riverY - 8, 3, 30);
    ctx2d.beginPath();
    ctx2d.moveTo(boatX + 29, riverY - 7);
    ctx2d.lineTo(boatX + 54, riverY + 6);
    ctx2d.lineTo(boatX + 29, riverY + 14);
    ctx2d.closePath();
    ctx2d.fill();

    /* 时代中景（交叉淡入） */
    const eraA = sceneEra(sceneFrom);
    const eraB = sceneEra(sceneTo);
    if (eraA === eraB) {
      drawEra(ctx2d, eraB, w, h, t, 1, sceneTo === "title");
    } else {
      drawEra(ctx2d, eraA, w, h, t, 1 - ease, sceneFrom === "title");
      drawEra(ctx2d, eraB, w, h, t, ease, sceneTo === "title");
    }

    /* 飞鸟 */
    ctx2d.strokeStyle = "rgba(22,30,26,0.42)";
    ctx2d.lineWidth = 1.6;
    for (let i = 0; i < 6; i += 1) {
      const bx = ((t * (0.026 + i * 0.004) + i * 340) % (w + 200)) - 100 + parX * 12;
      const by = h * (0.14 + (i % 3) * 0.05) + Math.sin(t * 0.0014 + i) * 7 + parY * 6;
      const flap = Math.sin(t * 0.006 + i) * 5;
      ctx2d.beginPath();
      ctx2d.moveTo(bx - 9, by);
      ctx2d.quadraticCurveTo(bx - 4, by - flap, bx, by);
      ctx2d.quadraticCurveTo(bx + 4, by - flap, bx + 9, by);
      ctx2d.stroke();
    }
    ctx2d.lineWidth = 1;

    /* 前景：最近的一层，动得最多 */
    drawForeground(ctx2d, w, h, t);

    requestAnimationFrame(drawWorld);
  }

  window.addEventListener("resize", fitCanvas);

  /* 指针位置推背景：横竖各给一个 -1..1 的目标值 */
  window.addEventListener("pointermove", (e) => {
    parTX = (e.clientX / window.innerWidth) * 2 - 1;
    parTY = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  window.addEventListener("pointerleave", () => { parTX = 0; parTY = 0; });

  /* 任务面板滚动，也算一种视差（scroll 不冒泡，得用捕获） */
  document.addEventListener("scroll", (e) => {
    const node = e.target;
    if (node && node.classList && node.classList.contains("mission-panel")) {
      parScroll = clamp(node.scrollTop / 260, 0, 1);
    }
  }, true);

  /* ---------- 屏幕切换 ---------- */

  function showScreen(name) {
    stopTimer();
    if (activeScreen !== name) sound.effect("go"); /* 换屏扫一下，别让画面干切 */
    Object.entries(screens).forEach(([key, node]) => {
      const active = key === name;
      node.hidden = !active;
      node.classList.toggle("is-active", active);
    });
    activeScreen = name;
    document.body.dataset.screen = name;
    setScene(name === "role" ? activeRole : name);
  }

  /* ---------- 顶栏 / 进度 ---------- */

  function completedCount() {
    return roleOrder.filter((r) => save.roles[r].complete).length;
  }

  function renderIdentityCards() {
    const grid = $("#identityGrid");
    grid.replaceChildren();

    roleOrder.forEach((roleId, index) => {
      const data = roles[roleId];
      const record = save.roles[roleId];
      const card = el("button", "identity-card");
      card.type = "button";
      card.dataset.role = roleId;
      if (record.complete) {
        card.classList.add("is-complete");
        card.dataset.badge = record.best ? `最佳 ${record.best}` : "印记已获得";
      }

      const top = el("span", "identity-top");
      top.append(el("span", "identity-number", `0${index + 1}`));
      top.append(el("span", "identity-era", data.chapter.split(" · ")[1] + " · " + data.place));
      card.append(top);

      const portrait = el("span", `identity-portrait portrait-${roleId}`);
      portrait.innerHTML = PORTRAITS[roleId];
      card.append(portrait);

      card.append(el("strong", null, data.name));
      card.append(el("small", "identity-role", data.occupation));
      card.append(el("p", "identity-desc", data.cluePrompt));

      const scores = roleScore(roleId, record.axes);
      const axes = el("div", "identity-axes");
      AXES.forEach((axis) => {
        const row = el("div", "axis-mini");
        row.append(el("span", null, axis.label));
        const bar = el("i");
        bar.style.setProperty("--v", `${record.complete ? scores[axis.id] : 0}%`);
        bar.style.setProperty("--c", axis.raw);
        row.append(bar);
        row.append(el("b", null, record.complete ? String(scores[axis.id]) : "—"));
        axes.append(row);
      });
      card.append(axes);

      const go = el("i", "identity-go", record.complete ? "印记已获得 · 再来一次" : "进入这一程");
      card.append(go);

      card.addEventListener("click", () => beginRole(roleId));
      grid.append(card);
    });
  }

  function updateGlobalProgress() {
    const count = completedCount();
    $("#headerProgress").textContent = `${count} / 3`;
    roleOrder.forEach((roleId) => {
      const dot = $(`[data-progress-dot="${roleId}"]`);
      if (dot) dot.classList.toggle("is-complete", save.roles[roleId].complete);
    });

    $("#futureLock").disabled = count !== 3;
    $("#futureLock").textContent = count === 3
      ? "三枚印记已集齐，进入未来视界"
      : `还需 ${3 - count} 枚信用印记解锁未来视界`;

    const resume = $("#titleResume");
    resume.hidden = count === 0 || count === 3;
    if (!resume.hidden) {
      const next = roleOrder.find((r) => !save.roles[r].complete);
      $("#resumeButton").textContent = `继续 · ${roles[next].chapter} ${roles[next].name} →`;
    }

    renderIdentityCards();
    renderLedger();
  }

  /* ---------- 流程：开始一程 ---------- */

  function resetRoleState() {
    roleStep = 0;
    collected = new Map();
    packed = new Set();
    earned = emptyAxes();
    mistakes = 0;
    miniResult = null;
  }

  function beginRole(roleId) {
    activeRole = roleId;
    resetRoleState();
    const data = roles[roleId];
    $("#roleChapter").textContent = data.chapter;
    $("#roleName").textContent = data.name;
    $("#roleOccupation").textContent = data.occupation;
    $("#placeLabel span").textContent = data.time;
    $("#placeLabel strong").textContent = data.place;
    showScreen("role");
    renderMission();
  }

  function setStage(stage) {
    $("#missionPanel").dataset.stage = stage;
  }

  /* 反馈行有两档：一句常态提示，加一句「下一次该怎么点」。
     不做弹窗教学——指引贴着操作走，学会就自动消失。 */
  function feedback(text, tone = "") {
    const node = $("#missionFeedback");
    node.textContent = text;
    if (tone) node.dataset.tone = tone;
    else delete node.dataset.tone;
  }

  /* 阶段内的引导文字。每完成一步就换到下一句，
     而不是一口气把规则全说完。 */
  const GUIDES = {
    abacus: [
      "1/4　先看账单第 02 笔：余额要从 300 减到 213.5。",
      "2/4　珠子是用手拨的：上珠往下拨是五，下珠往上推，一珠算一。",
      "3/4　拨到数目对得上，点「记入这一笔」。",
      "4/4　拨错了，点「清零重拨」，只重来这一笔。"
    ],
    asks: [
      "1/3　要钱的事一件件来。先看「给了」和「不给」各是什么后果。",
      "2/3　给出去就收不回。每给一笔，先看手里还剩多少。",
      "3/3　剩得不多就掂量着给。四条线要到最后才结算。"
    ],
    dispatch: [
      "1/3　先点一位街坊——他要去哪儿，看他那句话。",
      "2/3　再点一条通道。每条通道今天最多接三位。",
      "3/3　点通道里的名字可以撤回来。六位都安排好再确认。"
    ]
  };

  function guideText(type, step) {
    const list = GUIDES[type];
    return list ? list[Math.min(step, list.length - 1)] : "";
  }

  /* ---------- 立体物件模型 ----------

     场景里散落的线索不该是红点。拨的是算盘就画算盘，背的是挎包就画挎包——
     认得出东西，才谈得上"从生活里找线索"。
     统一用等距（顶面 + 正面 + 侧面）拼，明暗关系跟开场那只挎包是一套。 */

  function tint(hex, k) {
    const [r, g, b] = hexToRgb(hex);
    const f = (v) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  }

  /* 等距长方体：先侧面、再顶面、最后正面 */
  function isoBox(x, y, w, h, d, tone, o = {}) {
    const dx = Math.round(d * 0.6);
    const dy = Math.round(d * 0.52);
    const front = o.front || tone;
    const top = o.top || tint(tone, 0.32);
    const side = o.side || tint(tone, -0.34);
    return `<path d="M${x + w} ${y} l${dx} ${-dy} v${h} l${-dx} ${dy} Z" fill="${side}"/>`
      + `<path d="M${x} ${y} l${dx} ${-dy} h${w} l${-dx} ${dy} Z" fill="${top}"/>`
      + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${front}"/>`;
  }

  /* 等距平面：贴在顶面上的东西（封面压印、箱贴、胶带） */
  function isoTop(x, y, w, d, fill, opacity = 1) {
    const dx = Math.round(d * 0.6);
    const dy = Math.round(d * 0.52);
    return `<path d="M${x} ${y} l${dx} ${-dy} h${w} l${-dx} ${dy} Z" fill="${fill}" opacity="${opacity}"/>`;
  }

  function isoShadow(cx, cy, rx, ry, o = 0.34) {
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(4,14,11,${o})"/>`;
  }

  const OBJECT_MODELS = {
    /* 账本 / 账册：平放的一厚本，封面朝上，书口露白 */
    book: (t) => isoShadow(60, 86, 32, 7)
      + isoBox(24, 58, 58, 14, 28, t, { front: "#efe4cd", side: "#dccdaa" })
      + isoTop(38, 56, 30, 16, tint(t, 0.16))
      + isoTop(43, 54, 18, 8, "#b23a2c", 0.88),

    /* 存折：小一圈、薄一点，封面上一条银行色带 */
    passbook: (t) => isoShadow(60, 84, 26, 6)
      + isoBox(32, 62, 50, 11, 22, t, { front: "#f3ebd8", side: "#e0d3b4" })
      + isoTop(44, 60, 24, 12, tint(t, 0.18))
      + isoTop(44, 60, 24, 4, "#2f7d63", 0.8),

    /* 订单 / 单据：一叠纸，压着个夹子 */
    papers: (t) => isoShadow(60, 84, 28, 6)
      + isoTop(30, 74, 56, 20, "#e6dcbe")
      + isoTop(30, 70, 56, 20, "#f2ead4")
      + isoTop(30, 66, 56, 20, "#fbf6e8")
      + `<path d="M42 66 l12 -10 h10 l-12 10 Z" fill="${tint(t, 0.3)}"/>`
      + `<rect x="52" y="52" width="12" height="6" rx="2" fill="${t}"/>`,

    /* 纸箱：胶带十字 */
    parcel: (t) => isoShadow(60, 84, 28, 7)
      + isoBox(28, 52, 52, 30, 18, t)
      + isoTop(50, 52, 9, 18, tint(t, 0.55))
      + `<rect x="50" y="52" width="9" height="30" fill="${tint(t, 0.5)}"/>`,

    /* 算盘：木框 + 梁 + 上下两排珠子 */
    abacus: (t) => isoShadow(60, 86, 34, 7)
      + isoBox(14, 50, 72, 30, 16, t)
      + `<rect x="20" y="55" width="60" height="20" fill="#2c1c10"/>`
      + `<rect x="20" y="63" width="60" height="3" fill="#c8a653"/>`
      + [0, 1, 2, 3, 4, 5, 6].map((i) => `<circle cx="${24 + i * 8.7}" cy="59.6" r="2.7" fill="#e6c477"/>`).join("")
      + [0, 1, 2, 3, 4, 5, 6].map((i) => `<circle cx="${24 + i * 8.7}" cy="69.6" r="2.7" fill="#d6ae5f"/>`).join(""),

    /* 挎包：帆布包身 + 翻盖 + 背带 */
    bag: (t) => isoShadow(60, 86, 28, 7)
      + `<path d="M42 58 q18 -26 36 0" fill="none" stroke="${tint(t, -0.3)}" stroke-width="5" stroke-linecap="round"/>`
      + isoBox(26, 56, 52, 28, 16, t)
      + isoTop(26, 56, 52, 16, tint(t, 0.2))
      + `<rect x="30" y="67" width="44" height="5" fill="${tint(t, -0.18)}"/>`
      + `<rect x="54" y="71" width="10" height="7" rx="2" fill="#c8a653"/>`,

    /* 搪瓷茶缸：圆柱 + 蓝边 + 把手 */
    cup: (t) => isoShadow(58, 84, 20, 6)
      + `<path d="M40 50 v26 a20 7 0 0 0 40 0 V50 Z" fill="${t}"/>`
      + `<ellipse cx="60" cy="50" rx="20" ry="7" fill="${tint(t, 0.4)}"/>`
      + `<ellipse cx="60" cy="50" rx="20" ry="7" fill="none" stroke="#3f6ea8" stroke-width="5"/>`
      + `<path d="M80 56 q15 6 0 16" fill="none" stroke="${tint(t, -0.16)}" stroke-width="5" stroke-linecap="round"/>`,

    /* 竹编篮筐：敞口 + 编织纹 */
    basket: (t) => isoShadow(60, 84, 26, 6)
      + `<path d="M36 52 L44 78 H76 L84 52 Z" fill="${t}"/>`
      + `<ellipse cx="60" cy="52" rx="24" ry="8" fill="${tint(t, 0.26)}"/>`
      + `<ellipse cx="60" cy="52" rx="24" ry="8" fill="none" stroke="${tint(t, -0.3)}" stroke-width="3"/>`
      + `<path d="M42 60 H78 M45 68 H75" stroke="${tint(t, -0.26)}" stroke-width="2" fill="none"/>`,

    /* 作坊机器：机身 + 电机 + 皮带轮 */
    machine: (t) => isoShadow(60, 86, 32, 7)
      + isoBox(20, 56, 56, 28, 18, t)
      + isoBox(28, 44, 24, 12, 12, tint(t, -0.1))
      + `<circle cx="84" cy="66" r="10" fill="${tint(t, -0.34)}"/>`
      + `<circle cx="84" cy="66" r="4" fill="${tint(t, 0.2)}"/>`
      + `<path d="M46 56 L80 60" stroke="#2a2a26" stroke-width="3" fill="none"/>`,

    /* 玻璃门面：卷帘门 + 金字招牌 */
    storefront: (t) => isoShadow(60, 86, 32, 7)
      + isoBox(16, 50, 68, 34, 16, t)
      + `<rect x="22" y="60" width="56" height="18" fill="${tint(t, 0.3)}" opacity="0.7"/>`
      + `<path d="M22 62 H78 M22 67 H78 M22 72 H78" stroke="${tint(t, -0.32)}" stroke-width="1.6"/>`
      + `<rect x="22" y="52" width="56" height="7" fill="#c8a653"/>`,

    /* 传呼机：小方盒 + 绿屏 + 两个键 */
    pager: (t) => isoShadow(58, 84, 20, 6)
      + isoBox(34, 46, 36, 34, 12, t)
      + `<rect x="39" y="52" width="26" height="13" fill="#7fbf8e"/>`
      + `<rect x="41" y="54" width="22" height="9" fill="#1d3324" opacity="0.5"/>`
      + `<circle cx="46" cy="72" r="3" fill="${tint(t, 0.36)}"/>`
      + `<circle cx="58" cy="72" r="3" fill="${tint(t, 0.36)}"/>`,

    /* 手机：竖屏。机身走浅色，屏幕留深色——
       第三代场景本身就是一块深色手机界面，全深色的机子会糊在背景里。 */
    phone: (t) => isoShadow(60, 88, 20, 6)
      + isoBox(38, 30, 34, 58, 7, t, { front: tint(t, 0.08) })
      + `<rect x="42" y="36" width="26" height="46" rx="2" fill="#16302c"/>`
      + `<rect x="45" y="39" width="20" height="13" rx="1.5" fill="#5fd0a8"/>`
      + `<rect x="45" y="56" width="20" height="4" fill="#3d8a76"/>`
      + `<rect x="45" y="63" width="13" height="9" fill="#3d8a76"/>`
      + `<rect x="52" y="32" width="6" height="2.5" rx="1" fill="#0a1412"/>`,

    /* 平板：横屏 + 手写笔。同样浅机身、深屏 */
    tablet: (t) => isoShadow(60, 86, 30, 6)
      + isoBox(22, 44, 60, 40, 8, t, { front: tint(t, 0.08) })
      + `<rect x="27" y="49" width="50" height="30" rx="2" fill="#16302c"/>`
      + `<rect x="30" y="52" width="30" height="24" rx="1.5" fill="#4fbf99"/>`
      + `<rect x="63" y="52" width="11" height="24" rx="1.5" fill="#2c6f5c"/>`
      + `<path d="M88 60 l15 -6" stroke="${tint(t, 0.4)}" stroke-width="4" stroke-linecap="round"/>`,

    /* 服务站：小房子 + 金字招牌 */
    house: (t) => isoShadow(60, 86, 30, 7)
      + isoBox(24, 56, 46, 28, 16, t)
      + `<path d="M18 56 l30 -20 l30 20 Z" fill="${tint(t, -0.3)}"/>`
      + `<path d="M18 56 l30 -20 l30 20" fill="none" stroke="${tint(t, -0.45)}" stroke-width="2"/>`
      + `<rect x="30" y="58" width="34" height="6" fill="#c8a653"/>`
      + `<rect x="44" y="68" width="12" height="16" fill="${tint(t, -0.24)}"/>`,

    /* 无人柜台：立式自助机 */
    kiosk: (t) => isoShadow(60, 88, 22, 6)
      + isoBox(32, 32, 34, 56, 14, t)
      + `<rect x="37" y="38" width="24" height="18" fill="#5fb69c"/>`
      + `<rect x="37" y="60" width="24" height="4" fill="${tint(t, -0.3)}"/>`
      + `<rect x="37" y="70" width="14" height="9" rx="1" fill="#101c19"/>`,

    /* 推广海报：斜靠的立牌 */
    poster: (t) => isoShadow(60, 86, 26, 6)
      + `<path d="M34 34 L86 46 L86 80 L34 68 Z" fill="${t}"/>`
      + `<path d="M40 40 L80 50 L80 74 L40 64 Z" fill="${tint(t, 0.34)}"/>`
      + `<path d="M52 46 L62 48 L62 66 L52 64 Z" fill="${tint(t, -0.2)}" opacity="0.7"/>`
      + `<path d="M34 68 L86 80" stroke="${tint(t, -0.34)}" stroke-width="3"/>`
  };

  function objectModel(object) {
    const draw = OBJECT_MODELS[object.model] || OBJECT_MODELS.book;
    /* 模型本身画在 120×120 的格子里，但实体集中在中间偏下；
       裁掉四周留白，物件就能撑满热区，看得清是什么。 */
    return `<svg class="hotspot-svg" viewBox="14 18 92 92" aria-hidden="true">${draw(object.tone || "#8a8063")}</svg>`;
  }

  /* ---------- 任务 1：寻线 ---------- */

  function renderHotspots() {
    const root = $("#sceneHotspots");
    root.replaceChildren();
    if (roleStep !== 0) return;

    roles[activeRole].objects.forEach((object) => {
      const btn = el("button", `scene-hotspot${collected.has(object.id) ? " is-found" : ""}`);
      btn.type = "button";
      btn.style.left = `${object.x}%`;
      btn.style.top = `${object.y}%`;
      btn.dataset.label = object.label;
      btn.setAttribute("aria-label", `${object.label}：${object.note}`);
      /* 每个线索摆一件对应的立体小模型，而不是一颗红点：
         模型形状照着物件本身做，玩家一眼能看出要捡的是什么。 */
      btn.innerHTML = objectModel(object);
      btn.classList.add("has-model");
      btn.style.setProperty("--tone", object.tone || "#8a8063");
      btn.addEventListener("click", () => collectObject(object, btn));
      root.append(btn);
    });
  }

  /* 东西进包，要有"放进去"这一下：
     一个小牌子从原地飞向包口，落包时包被压一下再弹回来。 */
  function bagAnchor() {
    const bag = $(".inventory-bag");
    if (!bag) return null;
    const r = bag.getBoundingClientRect();
    if (!r.width && !r.height) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, node: bag };
  }

  /* 东西进包，要有"放进去"这一下：
     挎包先从右下角原位提起来、放大到页面正中，东西落进包口，
     包被压一下再回弹，然后缩回原位。
     这一下不只为好看——它把"收进包里"从背景操作里拎出来，
     玩家能看清楚自己刚往包里放了什么。 */
  function flyToBag(source, label, modelHtml) {
    if (!source || typeof source.getBoundingClientRect !== "function") return;
    const anchor = bagAnchor();
    if (!anchor) return;
    const bag = anchor.node;

    const catchBag = () => {
      if (!bag) return;
      sound.effect("catch"); /* 东西落进包，得有一声"闷" */
      bag.classList.remove("is-catch");
      void bag.offsetWidth; /* 重排一下，动画才会重新播 */
      bag.classList.add("is-catch");
      setTimeout(() => bag.classList.remove("is-catch"), 520);
    };

    /* 关掉动效的人，就别让东西飞了，包动一下意思到了就行 */
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const from = source.getBoundingClientRect();
    if (!from.width && !from.height) { catchBag(); renderBagSlots(); return; }
    if (reduce || typeof Element.prototype.animate !== "function") { catchBag(); renderBagSlots(); return; }

    const sx = from.left + from.width / 2;
    const sy = from.top + from.height / 2;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const toX = cx - sx; /* 从线索处飞到正中，横向要挪多少 */
    const toY = cy - sy;

    /* 起飞的是物件本体（3D 小模型），不是一块文字牌 */
    const chip = el("span", "fly-chip");
    if (modelHtml) {
      chip.classList.add("has-model");
      chip.innerHTML = `<span class="fly-chip-model">${modelHtml}</span>`
        + (label ? `<span class="fly-chip-label">${label}</span>` : "");
    } else {
      chip.textContent = label || "";
    }
    chip.style.left = `${sx}px`;
    chip.style.top = `${sy}px`;
    document.body.append(chip);

    /* 正中的放大挎包：直接复用包本身的样式，只换位置和大小 */
    const stage = el("div", "bag-stage");
    const ghost = el("span", "inventory-bag");
    ghost.setAttribute("aria-hidden", "true");
    ghost.innerHTML = "<i></i><b></b>";
    stage.append(ghost);
    document.body.append(stage);

    const DUR = 980;
    const dx0 = anchor.x - cx; /* 原位相对正中的偏移 */
    const dy0 = anchor.y - cy;
    /* 落袋那一刻，才把物件摆进右下角的包图案里，跟飞的行动作对上 */
    const finish = () => { chip.remove(); stage.remove(); renderBagSlots(); };

    let chipAnim, ghostAnim;
    try {
      chipAnim = chip.animate(
        [
          { transform: "translate(-50%,-50%) scale(0.42) rotate(-12deg)", opacity: 0 },
          { transform: "translate(-50%,-50%) scale(1) rotate(0deg)", opacity: 1, offset: 0.16 },
          { transform: `translate(calc(-50% + ${toX}px), calc(-50% + ${toY - 30}px)) scale(1.06) rotate(10deg)`, opacity: 1, offset: 0.44 },
          { transform: `translate(calc(-50% + ${toX}px), calc(-50% + ${toY}px)) scale(0.14) rotate(22deg)`, opacity: 0.08 }
        ],
        { duration: DUR, easing: "cubic-bezier(0.34, 0, 0.36, 1)", fill: "forwards" }
      );

      ghostAnim = ghost.animate(
        [
          { transform: `translate(${dx0}px, ${dy0}px) scale(1)`, opacity: 0 },
          { transform: `translate(${dx0}px, ${dy0}px) scale(1.08)`, opacity: 1, offset: 0.1 },
          { transform: "translate(0px, 0px) scale(2.5) rotate(-2deg)", opacity: 1, offset: 0.42 },
          /* 接住那一下：先压扁，再回弹 */
          { transform: "translate(0px, 0px) scale(2.92, 2.06) rotate(0deg)", opacity: 1, offset: 0.54 },
          { transform: "translate(0px, 0px) scale(2.44, 2.7) rotate(1.6deg)", opacity: 1, offset: 0.65 },
          { transform: `translate(${dx0}px, ${dy0}px) scale(1.08) rotate(0deg)`, opacity: 1, offset: 0.92 },
          { transform: `translate(${dx0}px, ${dy0}px) scale(1)`, opacity: 0 }
        ],
        { duration: DUR, easing: "cubic-bezier(0.34, 0, 0.36, 1)", fill: "forwards" }
      );
    } catch (_) { finish(); catchBag(); return; }

    /* 小模型落袋的瞬间，真包也跟着压一下 */
    setTimeout(catchBag, Math.round(DUR * 0.56));
    ghostAnim.onfinish = finish;
    ghostAnim.oncancel = finish;
  }

  function updateInventory(pendingId) {
    const items = roleStep === 2
      ? Array.from(packed).map((id) => roles[activeRole].principles.find((p) => p.id === id)?.label).filter(Boolean)
      : Array.from(collected.values()).map((item) => item.label);
    $("#inventoryText").textContent = items.length ? items.join(" · ") : "还没有线索";

    renderBagSlots(pendingId);

    const inv = $(".inventory");
    inv.classList.add("is-bump");
    setTimeout(() => inv.classList.remove("is-bump"), 320);

    renderCapacity();
  }

  /* 收进包里的东西，按原样摆进包的图案里（小一号的立体模型）。
     pendingId：刚收下、还在飞的那件，先不摆，等落袋了再补上。 */
  function renderBagSlots(pendingId) {
    const bag = $(".inventory-bag");
    if (!bag) return;
    let slots = bag.querySelector(".bag-slots");
    if (!slots) {
      slots = el("span", "bag-slots");
      bag.append(slots);
    }
    const list = roleStep === 2
      ? []
      : Array.from(collected.values()).filter((item) => item.id !== pendingId);
    slots.replaceChildren(...list.slice(0, 3).map((item) => {
      const slot = el("span", "bag-slot");
      slot.innerHTML = objectModel(item);
      return slot;
    }));
    bag.classList.toggle("has-items", list.length > 0);
  }

  /* 挎包容量条：寻线阶段按件数，装包阶段按格数 */
  function renderCapacity() {
    const bar = $("#invCapacity");
    if (!bar) return;
    const data = roles[activeRole];

    if (roleStep === 1) { bar.replaceChildren(); return; }

    if (roleStep === 0) {
      if (bar.childElementCount !== 3) {
        bar.replaceChildren();
        for (let i = 0; i < 3; i += 1) bar.append(el("i"));
      }
      $$("i", bar).forEach((pip, i) => pip.classList.toggle("is-used", i < collected.size));
      return;
    }

    if (bar.childElementCount !== data.packCapacity) {
      bar.replaceChildren();
      for (let i = 0; i < data.packCapacity; i += 1) bar.append(el("i"));
    }
    const used = Array.from(packed).reduce(
      (s, id) => s + (data.principles.find((p) => p.id === id)?.weight || 0), 0
    );
    $$("i", bar).forEach((pip, i) => pip.classList.toggle("is-used", i < used));
  }

  function collectObject(object, btn) {
    /* 已收则取出 */
    if (collected.has(object.id)) {
      collected.delete(object.id);
      sound.effect("turn");
      renderHotspots();
      updateInventory();
      feedback(`「${object.label}」放回原处。包里 ${collected.size} 件。`);
      renderExploreActions();
      return;
    }

    if (collected.size >= 3) {
      feedback("满了。先取出一件。", "bad");
      return;
    }

    collected.set(object.id, object);
    if (!object.valid) {
      /* 干扰项：装得进去，但占掉一格 */
      mistakes += 1;
      sound.effect("wrong");
      btn.classList.add("is-rejected");
      setTimeout(() => btn.classList.remove("is-rejected"), 460);
      feedback(`「${object.label}」装进去了，可用不上。`, "bad");
    } else {
      sound.effect("collect");
      feedback(`${object.note}。包里 ${collected.size} 件。`, "good");
    }

    flyToBag(btn, object.label, objectModel(object));
    renderHotspots();
    updateInventory(object.id); /* 这件的槽位等飞到了再补 */
    renderExploreActions();
  }

  /* 寻线阶段的动作区：容量提示 + 下一步 */
  function renderExploreActions() {
    const actions = $("#missionActions");
    actions.replaceChildren();

    const hint = el("div", "explore-hint");
    hint.append(el("span", null, "挎包容量"));
    hint.append(el("b", null, `${collected.size} / 3`));
    actions.append(hint);

    if (collected.size >= 3) {
      renderNextButton("把线索带到下一步", () => advanceStep(1));
    }
  }

  function renderNextButton(label, handler) {
    const actions = $("#missionActions");
    const btn = el("button", "next-step", label);
    btn.type = "button";
    btn.addEventListener("click", handler);
    actions.append(btn);
  }

  function advanceStep(step) {
    roleStep = step;
    sound.effect("turn");
    renderMission();
  }

  /* ---------- 任务 2：时代玩法 ---------- */

  function bankExploreScore() {
    collected.forEach((item) => {
      AXIS_IDS.forEach((axis) => { earned[axis] += axisValue(item, axis); });
    });
  }

  function finishMini(detail) {
    bankExploreScore();
    miniResult = detail;
    const split = MINI_MAX[activeRole];
    AXIS_IDS.forEach((axis) => { earned[axis] += (split[axis] || 0) * detail.score / 100; });
    advanceStep(2);
  }

  /* —— 算盘结账 —— */

  /* 拨珠：一次只认一颗。
     按下就点亮这一颗（is-grabbed），拖的时候只有它跟手；
     被它顶住的珠子加 is-drag-carry，跟着走但不是自己动。
     松手才落位——真算盘的珠子停在梁边，不会停在半路。
     拖动过的那次 click 要丢掉，不然一次拖拽会拨两回。 */
  function wasDragged(node) {
    const end = Number(node.dataset.dragEnd || 0);
    if (end && performance.now() - end < 400) { node.dataset.dragEnd = ""; return true; }
    return false;
  }

  function enableBeadDrag(node, rod, plan, rodIndex = 2) {
    const THRESHOLD = 8;
    const travel = () => parseFloat(getComputedStyle(rod).getPropertyValue("--bead-travel")) || 16;
    let startY = 0;
    let dy = 0;
    let dragging = false;
    let pid = null;
    let carried = [];
    let lastMoved = -1; /* 上一次"要挪几颗"，用来判断有没有滑过一颗珠子 */

    const paintLift = (value) => rod.style.setProperty("--drag-lift", `${value}px`);

    const clearCarry = () => {
      carried.forEach((n) => n.classList.remove("is-drag-carry"));
      carried = [];
    };

    const reset = () => {
      clearCarry();
      node.classList.remove("is-grabbed", "is-drag-lead");
      rod.classList.remove("is-dragging");
      paintLift(0);
    };

    node.addEventListener("pointerdown", (e) => {
      if (pid !== null) return;
      pid = e.pointerId;
      startY = e.clientY;
      dy = 0;
      dragging = false;
      /* 先选中这一颗，再谈拖动 */
      node.classList.add("is-grabbed", "is-drag-lead");
      try { node.setPointerCapture(pid); } catch (_) { /* 不支持就算了 */ }
    });

    node.addEventListener("pointermove", (e) => {
      if (pid === null || e.pointerId !== pid) return;
      dy = e.clientY - startY;
      if (!dragging) {
        if (Math.abs(dy) < THRESHOLD) return;
        dragging = true;
        rod.classList.add("is-dragging");
      }
      /* moving() 返回的是这一拨里会挪位的珠子；除了手上这颗，其余都算被带动 */
      const want = plan.moving(dy);
      carried.forEach((n) => { if (want.indexOf(n) < 0) n.classList.remove("is-drag-carry"); });
      want.forEach((n) => { if (n !== node) n.classList.add("is-drag-carry"); });
      carried = want.filter((n) => n !== node);
      const t = travel();
      paintLift(want.length ? clamp(dy, -t, t) : 0);
      /* 珠子是"整批"一起走的，所以声音要一颗颗补：
         一次拨过去几颗就咔几声，前后错开 60ms，听着像珠子接连撞上梁。 */
      if (want.length !== lastMoved) {
        const n = Math.abs(want.length - (lastMoved < 0 ? 0 : lastMoved));
        for (let i = 0; i < n; i += 1) {
          setTimeout(() => sound.beadHit(rodIndex, 0.22), i * 60);
        }
        lastMoved = want.length;
      }
    });

    const finish = () => {
      if (pid === null) return;
      try { node.releasePointerCapture(pid); } catch (_) { /* noop */ }
      pid = null;
      if (dragging) {
        dragging = false;
        node.dataset.dragEnd = String(performance.now());
        plan.commit(dy);
      }
      lastMoved = -1;
      reset();
    };
    node.addEventListener("pointerup", finish);
    node.addEventListener("pointercancel", finish);
  }

  function renderAbacus(data) {
    const actions = $("#missionActions");
    const wrap = el("div", "abacus-stage");

    /* 账单 */
    const ledger = el("div", "abacus-ledger");
    const rows = [];
    data.mini.entries.forEach((entry, index) => {
      const row = el("div", "ledger-row");
      row.append(el("span", "lr-idx", String(index + 1).padStart(2, "0")));
      row.append(el("span", null, entry.label));
      const amt = el("span", `lr-amt ${entry.amount >= 0 ? "is-in" : "is-out"}`, Math.abs(entry.amount).toFixed(2));
      row.append(amt);
      ledger.append(row);
      rows.push(row);
    });
    wrap.append(ledger);

    /* 算盘 */
    const frame = el("div", "abacus-wrap");
    const abacus = el("div", "abacus");
    const rods = ["百", "十", "元", "角", "分"].map((name, index) => {
      const rod = el("div", "abacus-rod");
      const state = { upper: false, count: 0 };

      /* 落位那一下比拖动时那几声实一点 */
      const tap = () => { sound.beadHit(index, 0.36); paint(); };
      const paint = () => {
        upper.classList.toggle("is-on", state.upper);
        lowers.forEach((b, i) => b.classList.toggle("is-on", i < state.count));
        readout();
      };

      const upper = el("button", "bead up");
      upper.type = "button";
      upper.setAttribute("aria-label", `${name}位 上珠 五`);
      /* 轻点：上珠翻面 */
      upper.addEventListener("click", () => {
        if (wasDragged(upper)) return;
        state.upper = !state.upper;
        tap();
      });
      /* 拖才是正经拨珠：上珠往下拨是五 */
      enableBeadDrag(upper, rod, {
        moving: (dy) => {
          const target = dy > 0;
          return target === state.upper ? [] : [upper];
        },
        commit: (dy) => {
          const target = dy > 0;
          if (target === state.upper) return;
          state.upper = target;
          tap();
        }
      }, index);

      const beam = el("div", "beam");
      /* i 是这颗珠子本身的数（3/2/1/0），不是数组下标——
         下珠靠"有几颗贴着梁"记数，所以数值必须在闭包里留住。
         拨一颗，它和它上边那几颗一起动：count 从现在的颗数变到目标颗数，
         中间这一段就是要挪的珠子，拖的时候一起走，松手一起落位。 */
      const lowers = [3, 2, 1, 0].map((i) => {
        const bead = el("button", "bead down");
        bead.type = "button";
        bead.setAttribute("aria-label", `${name}位 下珠 ${i + 1}`);
        /* 抓住第 i 颗（0 是最下边那颗，3 最靠梁）：
           往上推 —— 它和它上边那几颗一起贴梁，贴梁总数 = 4 - i；
           往下拉 —— 它和它下边那几颗一起落底，留在梁上的 = 3 - i。
           原来按 i+1 算，等于多带一颗，才会"拖一颗、动三颗"。 */
        const targetFor = (dy) => (dy < 0
          ? Math.max(state.count, 4 - i)
          : Math.min(state.count, 3 - i));
        /* 轻点：这一颗连同上面的珠子一起推上去，或一起放下来 */
        bead.addEventListener("click", () => {
          if (wasDragged(bead)) return;
          state.count = state.count > i ? i : i + 1;
          tap();
        });
        /* 下珠往上推才贴梁，一珠算一 */
        enableBeadDrag(bead, rod, {
          moving: (dy) => {
            const target = targetFor(dy);
            const lo = Math.min(state.count, target);
            const hi = Math.max(state.count, target);
            return lowers.slice(lo, hi);
          },
          commit: (dy) => {
            const target = targetFor(dy);
            if (target === state.count) return;
            state.count = target;
            tap();
          }
        }, index);
        return bead;
      });

      rod.append(upper);
      rod.append(beam);
      lowers.forEach((b) => rod.append(b));
      const label = el("span", "rod-label", name);
      rod.append(label);

      return { rod, state, paint, place: Math.pow(10, 2 - index) };
    });
    rods.forEach((r) => abacus.append(r.rod));
    frame.append(abacus);

    const readoutRow = el("div", "abacus-readout");
    const out = el("strong", null, "0.00");
    readoutRow.append(el("small", null, "算盘上"));
    readoutRow.append(out);
    frame.append(readoutRow);

    /* 计时与操作 */
    const control = el("div", "abacus-controls");
    const timer = el("span", "abacus-timer", `⏱ ${data.mini.limit}s`);
    const commit = el("button", "ghost-button", "记入这一笔");
    commit.type = "button";
    const clear = el("button", "ghost-button", "清零重拨");
    clear.type = "button";
    const skip = el("button", "ghost-button", "放弃结账，直接进入装包");
    skip.type = "button";
    control.append(timer, commit, clear, skip);
    wrap.append(frame, control);
    actions.append(wrap);

    let index = 0;
    let running = 0;
    let correctCount = 0;
    let wrongTries = 0;
    const startedAt = Date.now();
    const limit = data.mini.limit * 1000;

    const abacusValue = () => round2(rods.reduce((sum, r) => sum + ((r.state.upper ? 5 : 0) + r.state.count) * r.place, 0));
    const readout = () => { out.textContent = abacusValue().toFixed(2); };

    function markRows() {
      rows.forEach((row, i) => {
        row.classList.toggle("is-current", i === index);
        row.classList.toggle("is-done", i < index);
      });
    }

    function setAbacus(value) {
      rods.forEach((r) => {
        const digit = Math.round((value / r.place) % 10);
        r.state.upper = digit >= 5;
        r.state.count = digit >= 5 ? digit - 5 : digit;
        r.paint();
      });
    }

    /* 每一笔都从上一次的余额起步，只需拨出这一笔的增减 */
    function startEntry() {
      setAbacus(running);
      markRows();
    }

    function tick() {
      const left = Math.max(0, limit - (Date.now() - startedAt));
      timer.textContent = `⏱ ${Math.ceil(left / 1000)}s`;
      timer.classList.toggle("is-urgent", left < 20000);
      if (left <= 0) { finish(true); return; }
      activeTimer = setTimeout(tick, 250);
    }

    function finish(timedOut) {
      stopTimer();
      const elapsed = (Date.now() - startedAt) / 1000;
      const ratio = correctCount / data.mini.entries.length;
      const timeBonus = clamp(1 - elapsed / data.mini.limit);
      const score = Math.round(ratio * 80 + timeBonus * 20);

      if (correctCount === data.mini.entries.length && elapsed <= 60) unlock("swift");

      commit.disabled = true;
      clear.disabled = true;
      skip.disabled = true;
      feedback(
        timedOut
          ? `时间到。结清 ${correctCount} 笔，余额停在 ${running.toFixed(2)} 元。`
          : `账结完了。余额 ${running.toFixed(2)} 元，${correctCount} 笔都对得上。`,
        ratio >= 1 ? "good" : ""
      );

      setTimeout(() => finishMini({
        score: Math.max(0, score),
        summary: `结账 ${correctCount}/${data.mini.entries.length} 笔 · 余额 ${running.toFixed(2)} 元`
      }), 900);
    }

    commit.addEventListener("click", () => {
      const entry = data.mini.entries[index];
      const target = round2(running + entry.amount);
      if (abacusValue() === target) {
        running = target;
        correctCount += 1;
        index += 1;
        sound.effect("correct");
        if (index >= data.mini.entries.length) { finish(false); return; }
        startEntry();
        const next = data.mini.entries[index];
        feedback(`对了。下一笔「${next.label}」${next.amount > 0 ? "加" : "减"} ${Math.abs(next.amount).toFixed(2)}，要从 ${running.toFixed(2)} 拨到 ${round2(running + next.amount).toFixed(2)}。`, "good");
      } else {
        wrongTries += 1;
        mistakes += 1;
        sound.effect("wrong");
        frame.classList.add("shake");
        setTimeout(() => frame.classList.remove("shake"), 440);
        feedback(`算盘上是 ${abacusValue().toFixed(2)}，应该是 ${target.toFixed(2)}。${entry.amount > 0 ? "这一笔是进账" : "这一笔是出账"}，从 ${running.toFixed(2)} 再调一调。`, "bad");
      }
    });

    clear.addEventListener("click", () => { setAbacus(running); sound.effect("turn"); });

    skip.addEventListener("click", () => {
      stopTimer();
      finishMini({ score: 0, summary: "结账未完成" });
    });

    /* 第一笔的目标直接说出来，不让玩家猜规则 */
    feedback(guideText("abacus", 0));
    startEntry();
    tick();
  }

  /* —— 现金流分配 —— */

  /* —— 序贯取舍：钱一笔笔出 ——

     和"分配"的区别在三条：
     1. 选项不再同时摆在眼前 —— 一件事来，你只面对这一件；
     2. 给出去就收不回 —— 没有"调一调"这个动作；
     3. 钱注定不够 —— 合计 72 万，手里只有 60 万。
     所以玩家做的不是求解，是取舍。 */

  function renderAsks(data) {
    const mini = data.mini;
    const actions = $("#missionActions");
    const wrap = el("div", "asks-stage");

    /* 顶栏：手里还剩多少（肉眼可见地变薄） */
    const head = el("div", "asks-head");
    const headTop = el("div", "asks-head-top");
    headTop.append(el("small", null, "手里还剩"));
    const leftNum = el("strong", null, String(mini.total));
    headTop.append(leftNum);
    headTop.append(el("em", null, mini.unit));
    head.append(headTop);
    const bar = el("div", "asks-bar");
    const barFill = el("i");
    bar.append(barFill);
    head.append(bar);
    wrap.append(head);

    /* 四条线 */
    const gaugesBox = el("div", "asks-gauges");
    const gaugeNodes = {};
    mini.gauges.forEach((g) => {
      const box = el("div", "gauge-mini");
      box.append(el("span", null, g.label));
      const track = el("i");
      box.append(track);
      box.append(el("b", null, "0%"));
      gaugesBox.append(box);
      gaugeNodes[g.id] = { box, bar: track, label: box.querySelector("b") };
    });
    wrap.append(gaugesBox);

    const stage = el("div", "asks-cards");
    wrap.append(stage);

    actions.append(wrap);

    let index = 0;
    let spent = 0;
    const funded = {};
    const totals = {};

    const moneyLeft = () => mini.total - spent;

    function paintGauges() {
      mini.gauges.forEach((g) => {
        const raw = Math.min(100, totals[g.id] || 0);
        const ref = gaugeNodes[g.id];
        ref.bar.style.setProperty("--v", `${raw}%`);
        ref.label.textContent = `${raw}%`;
        ref.box.classList.toggle("is-pass", raw >= 100);
        ref.box.classList.toggle("is-fail", raw > 0 && raw < 100);
      });
    }

    function paintMoney() {
      leftNum.textContent = String(moneyLeft());
      barFill.style.setProperty("--v", `${Math.max(0, (moneyLeft() / mini.total) * 100)}%`);
      head.classList.toggle("is-low", moneyLeft() < 12);
    }

    function renderCard() {
      stage.replaceChildren();
      if (index >= mini.asks.length) { finish(); return; }

      const ask = mini.asks[index];
      const affordable = moneyLeft() >= ask.amount;

      const card = el("div", "ask-card");
      const meta = el("div", "ask-meta");
      meta.append(el("span", "ask-tag", `第 ${index + 1} / ${mini.asks.length} 件`));
      meta.append(el("b", "ask-who", ask.label));
      card.append(meta);
      card.append(el("p", "ask-note", ask.note));

      const amount = el("div", "ask-amount");
      amount.append(el("small", null, "要"));
      amount.append(el("strong", null, String(ask.amount)));
      amount.append(el("em", null, mini.unit));
      card.append(amount);

      const outs = el("div", "ask-outs");
      outs.append(el("p", "ask-out is-give", `给了 · ${ask.give}`));
      outs.append(el("p", "ask-out is-deny", `不给 · ${ask.deny}`));
      card.append(outs);
      stage.append(card);

      const btns = el("div", "ask-actions");
      const give = el("button", "ask-give", `把钱给他 · ${ask.amount} ${mini.unit}`);
      give.type = "button";
      give.disabled = !affordable;
      if (!affordable) give.textContent = "手里不够了";
      const pass = el("button", "ask-pass", "这钱先留着");
      pass.type = "button";
      give.addEventListener("click", () => decide(true));
      pass.addEventListener("click", () => decide(false));
      btns.append(give, pass);
      stage.append(btns);

      paintMoney();
      paintGauges();
    }

    function decide(give) {
      const ask = mini.asks[index];
      const card = stage.querySelector(".ask-card");
      if (card) card.classList.add(give ? "is-stamped" : "is-passed");

      if (give) {
        spent += ask.amount;
        funded[ask.id] = true;
        totals[ask.gauge] = (totals[ask.gauge] || 0) + ask.gain;
        sound.effect("stamp");
        feedback(`${ask.give}手里还剩 ${moneyLeft()} ${mini.unit}。`, "good");
        paintMoney();
        paintGauges();
      } else {
        sound.effect("turn");
        feedback(ask.deny);
      }

      index += 1;
      $$(".ask-give, .ask-pass", stage).forEach((b) => { b.disabled = true; });
      activeTimer = setTimeout(() => {
        if (index >= mini.asks.length) { finish(); return; }
        renderCard();
        /* 走了两三件之后再提醒一次，别一上来就念经 */
        const nudge = index === 2 ? 1 : (index === 5 ? 2 : 0);
        if (nudge) feedback(guideText("asks", nudge));
      }, 680);
    }

    function finish() {
      stopTimer();
      stage.replaceChildren();
      const avg = mini.gauges.reduce((s, g) => s + Math.min(100, totals[g.id] || 0), 0) / mini.gauges.length;
      const flagAsks = mini.asks.filter((a) => a.flag);
      const passed = flagAsks.filter((a) => funded[a.id]).length;

      const box = el("div", "asks-result");
      box.append(el("b", null, "这一趟走完了"));
      const list = el("div", "asks-flags");
      flagAsks.forEach((a) => {
        const ok = funded[a.id];
        list.append(el("span", `flag${ok ? " is-pass" : " is-fail"}`, (ok ? "✓ " : "✗ ") + a.flag));
      });
      box.append(list);
      box.append(el("p", null,
        `手里还剩 ${moneyLeft()} ${mini.unit}。四条线均 ${Math.round(avg)}%，硬底线过 ${passed} / ${flagAsks.length}。`));
      stage.append(box);

      const confirm = el("button", "next-step", "获得这一代的信用印记");
      confirm.type = "button";
      confirm.addEventListener("click", () => finishMini({
        score: Math.max(0, Math.round(avg * 0.8 + (passed / flagAsks.length) * 20)),
        summary: `底线 ${passed}/${flagAsks.length} · 四条线均 ${Math.round(avg)}%`
      }));
      stage.append(confirm);

      feedback(
        `走完了。手里还剩 ${moneyLeft()} ${mini.unit}，底线过了 ${passed} / ${flagAsks.length}。`,
        passed === flagAsks.length ? "good" : ""
      );
    }

    feedback(guideText("asks", 0));
    renderCard();
  }

  /* —— 服务通道调度 —— */

  function renderDispatch(data) {
    const mini = data.mini;
    const actions = $("#missionActions");
    const wrap = el("div", "dispatch-stage");
    wrap.append(el("p", "dispatch-hint", "点街坊，再点通道。点名字可以撤回。"));

    const clientsBox = el("div", "dispatch-clients");
    const channelsBox = el("div", "dispatch-channels");
    const summary = el("div", "dispatch-summary");

    const placed = {};
    let selected = null;
    /* 自动提示得能取消——否则上一次安排的「下一位」会盖掉刚说出口的「满员」 */
    let nudgeTimer = null;
    const clearNudge = () => { if (nudgeTimer) { clearTimeout(nudgeTimer); nudgeTimer = null; } };

    const clientNodes = {};
    mini.clients.forEach((client) => {
      const card = el("button", "client-card");
      card.type = "button";
      const glyph = el("span", "client-glyph", client.glyph);
      const meta = el("span", "client-meta");
      meta.append(el("b", null, client.name));
      meta.append(el("span", null, client.need));
      card.append(glyph, meta);
      card.addEventListener("click", () => {
        if (placed[client.id]) return;
        clearNudge();
        selected = selected === client.id ? null : client.id;
        Object.entries(clientNodes).forEach(([id, node]) => node.classList.toggle("is-selected", id === selected));
        sound.effect("tick");
        paint();
        if (selected) feedback(`已选「${client.name}」。点一条通道。`, "");
      });
      clientsBox.append(card);
      clientNodes[client.id] = card;
    });
    wrap.append(clientsBox);

    const channelNodes = {};
    mini.channels.forEach((channel) => {
      const box = el("div", "channel");
      const head = el("div", "channel-head");
      head.append(el("b", null, channel.label));
      head.append(el("em", null, `0 / ${channel.cap}`));
      box.append(head);
      box.append(el("p", "channel-desc", channel.desc));
      const slots = el("div", "channel-slots");
      box.append(slots);
      box.addEventListener("click", () => place(channel.id));
      channelsBox.append(box);
      channelNodes[channel.id] = { box, slots, count: head.querySelector("em") };
    });
    wrap.append(channelsBox);
    wrap.append(summary);

    const confirm = el("button", "next-step", "确认调度");
    confirm.type = "button";
    confirm.addEventListener("click", submit);
    wrap.append(confirm);
    actions.append(wrap);

    function countIn(channelId) {
      return Object.values(placed).filter((c) => c === channelId).length;
    }

    function paint() {
      mini.channels.forEach((channel) => {
        const ref = channelNodes[channel.id];
        const list = Object.keys(placed).filter((id) => placed[id] === channel.id);
        ref.count.textContent = `${list.length} / ${channel.cap}`;
        ref.slots.replaceChildren();
        if (!list.length) {
          ref.slots.append(el("span", "slot-empty", "空"));
        } else {
          list.forEach((id) => {
            const client = mini.clients.find((c) => c.id === id);
            const fit = client.best === channel.id ? 1 : (client.alt === channel.id ? 0.7 : 0.35);
            const chip = el("span", `slot${fit < 1 ? " is-misfit" : ""}`, client.name);
            chip.title = fit === 1 ? "正合适" : (fit === 0.7 ? "也能办，但绕了一道" : "办得成，只是慢一点");
            chip.addEventListener("click", (e) => {
              e.stopPropagation();
              clearNudge();
              delete placed[id];
              clientNodes[id].classList.remove("is-placed");
              sound.effect("turn");
              feedback(`${client.name} 撤回来了。`);
              paint();
            });
            ref.slots.append(chip);
          });
        }
        const full = list.length >= channel.cap;
        ref.box.classList.toggle("is-full", full);
        ref.box.classList.toggle("is-target", Boolean(selected) && !full && list.length < channel.cap);
      });

      Object.entries(clientNodes).forEach(([id, node]) => {
        node.classList.toggle("is-placed", Boolean(placed[id]));
      });

      const total = Object.keys(placed).length;
      summary.replaceChildren();
      const perfect = mini.clients.filter((c) => placed[c.id] === c.best).length;
      const alt = mini.clients.filter((c) => placed[c.id] === c.alt).length;
      summary.append(el("span", `flag${total === mini.clients.length ? " is-pass" : ""}`, `已安排 ${total} / ${mini.clients.length}`));
      summary.append(el("span", `flag${perfect + alt === total && total > 0 ? " is-pass" : ""}`, `合适 ${perfect + alt}`));
      confirm.disabled = total !== mini.clients.length;
      return { total, perfect, alt };
    }

    function place(channelId) {
      clearNudge();
      if (!selected) { feedback("先点一位街坊。"); return; }
      if (countIn(channelId) >= mini.channels.find((c) => c.id === channelId).cap) {
        feedback("这条满员了。", "bad");
        sound.effect("wrong");
        return;
      }
      const client = mini.clients.find((c) => c.id === selected);
      const fit = client.best === channelId ? 1 : (client.alt === channelId ? 0.7 : 0.35);
      placed[selected] = channelId;
      selected = null;
      Object.values(clientNodes).forEach((n) => n.classList.remove("is-selected"));
      sound.effect("pack");
      paint();
      const done = Object.keys(placed).length;
      const left = mini.clients.filter((c) => !placed[c.id]);
      const tail = `${done} / ${mini.clients.length}`;
      if (fit === 1) feedback(`对路。${tail}`, "good");
      else if (fit === 0.7) feedback(`能办，绕了一道。${tail}`);
      else feedback(`这条不太对路。${tail}`, "bad");
      if (left.length) {
        nudgeTimer = setTimeout(() => {
          nudgeTimer = null;
          feedback(`下一位：「${left[0].name}」——${left[0].need}。${tail}`);
        }, 1100);
      }
    }

    function submit() {
      clearNudge();
      const stat = paint();
      const fitTotal = mini.clients.reduce((s, c) => {
        const ch = placed[c.id];
        return s + (ch === c.best ? 1 : (ch === c.alt ? 0.7 : 0.35));
      }, 0);
      const score = Math.round((fitTotal / mini.clients.length) * 100);
      if (stat.perfect === mini.clients.length) unlock("nobody");

      feedback(
        `${stat.perfect} 位到位，${stat.alt} 位绕了路。`,
        stat.perfect === mini.clients.length ? "good" : ""
      );
      setTimeout(() => finishMini({
        score: Math.max(0, score),
        summary: `调度 ${stat.perfect}/${mini.clients.length} 位正合适`
      }), 800);
    }

    paint();
    confirm.disabled = true;
    feedback(guideText("dispatch", 0));
  }

  /* ---------- 任务 3：装包取舍 ---------- */

  function renderPacking(data) {
    const actions = $("#missionActions");
    const wrap = el("div", "pack-stage");

    const head = el("div", "pack-head");
    head.append(el("small", null, "挎包容量"));
    const capBar = el("div", "capacity-bar");
    for (let i = 0; i < data.packCapacity; i += 1) capBar.append(el("i"));
    head.append(capBar);
    wrap.append(head);

    const grid = el("div", "pack-grid");
    const nodes = {};

    data.principles.forEach((item) => {
      const btn = el("button", "pack-item");
      btn.type = "button";
      const weight = el("span", "pack-weight");
      for (let i = 0; i < item.weight; i += 1) weight.append(el("i"));
      btn.append(weight);

      const body = el("span", "pack-item-body");
      body.append(el("b", null, item.label));
      body.append(el("span", null, item.desc));
      btn.append(body);

      const effect = el("span", "pack-effect");
      AXES.forEach((axis) => {
        const v = axisValue(item, axis);
        if (!v) return;
        effect.append(el("em", v > 0 ? "is-plus" : "is-minus", `${axis.label} ${v > 0 ? "+" : "−"}${Math.abs(v)}`));
      });
      btn.append(effect);

      btn.addEventListener("click", () => {
        if (packed.has(item.id)) {
          packed.delete(item.id);
          btn.classList.remove("is-packed");
          sound.effect("turn");
        } else {
          const used = usedWeight();
          if (used + item.weight > data.packCapacity) {
            feedback(`「${item.label}」要 ${item.weight} 格，只剩 ${data.packCapacity - used} 格。`, "bad");
            sound.effect("wrong");
            return;
          }
          if (packed.size >= 3) {
            feedback("只带三样。先取出一件。", "bad");
            return;
          }
          packed.add(item.id);
          btn.classList.add("is-packed");
          sound.effect("pack");
          flyToBag(btn, item.label);
        }
        paintPack();
      });

      grid.append(btn);
      nodes[item.id] = btn;
    });
    wrap.append(grid);

    const confirm = el("button", "next-step", "获得这一代的信用印记");
    confirm.type = "button";
    confirm.addEventListener("click", completeRole);
    wrap.append(confirm);
    actions.append(wrap);

    function usedWeight() {
      return Array.from(packed).reduce((s, id) => s + (data.principles.find((p) => p.id === id)?.weight || 0), 0);
    }

    function paintPack() {
      const used = usedWeight();
      $$("i", capBar).forEach((pip, i) => pip.classList.toggle("is-used", i < used));
      confirm.disabled = packed.size !== 3;
      updateInventory();

      if (packed.size === 3) {
        const allPositive = Array.from(packed).every((id) => {
          const item = data.principles.find((p) => p.id === id);
          return AXIS_IDS.every((axis) => axisValue(item, axis) >= 0);
        });
        if (used === data.packCapacity) {
          feedback(`正好装满 ${used} 格。`, "good");
          if (allPositive) unlock("fullbag");
        } else {
          feedback(`三样都装好了，还空 ${data.packCapacity - used} 格。`, "good");
        }
      } else {
        feedback(`已装 ${packed.size} / 3。`);
      }
    }

    paintPack();
  }

  /* ---------- 任务渲染入口 ---------- */

  function renderMission() {
    const data = roles[activeRole];
    $("#missionSource").textContent = data.source;

    const labels = ["寻找时代线索", "亲手做一次判断", "装入精神原则"];
    $("#missionType").textContent = labels[roleStep];
    $("#stepLabel").textContent = `任务 ${roleStep + 1} / 3`;
    $$(".step-meter i").forEach((node, i) => {
      node.classList.toggle("is-done", i < roleStep);
      node.classList.toggle("is-active", i === roleStep);
    });

    const actions = $("#missionActions");
    actions.replaceChildren();

    if (roleStep === 0) {
      setStage("explore");
      $("#missionTitle").textContent = data.intro;
      $("#missionBody").textContent = data.cluePrompt;
      feedback(`包里 ${collected.size} 件。`);
      renderExploreActions();

    } else if (roleStep === 1) {
      setStage("game");
      $("#missionTitle").textContent = data.mini.title;
      $("#missionBody").textContent = data.mini.body;
      /* 引导交给各小游戏自己的 guideText，这里不重复交代 */
      if (data.mini.type === "abacus") renderAbacus(data);
      else if (data.mini.type === "asks") renderAsks(data);
      else renderDispatch(data);

    } else {
      setStage("pack");
      $("#missionTitle").textContent = data.packTitle;
      $("#missionBody").textContent = data.packBody;
      feedback(`选三样带走。`);
      renderPacking(data);
    }

    renderHotspots();
    updateInventory();
  }

  function stopTimer() {
    if (activeTimer) { clearTimeout(activeTimer); activeTimer = null; }
  }

  /* ---------- 结算 ---------- */

  function unlock(id) {
    if (save.achievements[id]) return;
    save.achievements[id] = true;
    persist();
  }

  const GRADES = [
    [92, "上", "这一程，几乎挑不出毛病"],
    [78, "优", "走得稳当，也走得明白"],
    [60, "良", "大方向没错，还可以更细"],
    [40, "中", "有人在等你把这件事做好"],
    [0, "再走一遍", "挎包还空着一半"]
  ];

  function completeRole() {
    /* 装包计分 */
    packed.forEach((id) => {
      const item = roles[activeRole].principles.find((p) => p.id === id);
      AXIS_IDS.forEach((axis) => { earned[axis] += axisValue(item, axis); });
    });

    const scores = roleScore(activeRole, earned);
    const rawAverage = scoreAverage(scores);
    const overall = Math.round(clamp(rawAverage / roleBest[activeRole]) * 100);

    if (mistakes === 0 && overall >= 78) unlock("clean");

    const record = save.roles[activeRole];
    const previousBest = record.best || 0;
    record.complete = true;
    record.axes = { ...earned };
    record.scores = scores;
    record.detail = {
      explore: `${Array.from(collected.values()).filter((o) => o.valid).length}/3 件有效`,
      mini: miniResult ? miniResult.summary : "未完成",
      pack: `${Array.from(packed).map((id) => roles[activeRole].principles.find((p) => p.id === id)?.label).join("·")}`
    };
    record.best = Math.max(previousBest, overall);
    save.ending = null;

    if (completedCount() === 3) unlock("seals");
    persist();
    updateGlobalProgress();

    sound.effect("stamp");
    setTimeout(() => sound.chord(), 260);

    const data = roles[activeRole];
    $("#earnedStamp span").textContent = data.stamp;
    $("#earnedStamp strong").textContent = data.stampLine;
    $("#earnedStamp small").textContent = data.chapter.split(" · ")[0];
    $("#resultTitle").textContent = `你把「${data.stampLine}」装进了挎包`;
    $("#resultBody").textContent = data.result;

    /* 三轴得分 */
    const scoreBox = $("#resultScore");
    scoreBox.replaceChildren();
    AXES.forEach((axis) => {
      const box = el("div", "axis-score");
      box.append(el("span", null, axis.label));
      const bar = el("i");
      bar.style.setProperty("--v", "0%");
      bar.style.setProperty("--c", axis.raw);
      box.append(bar);
      const num = el("b", null, String(scores[axis.id]));
      num.append(el("small", null, " / 100"));
      box.append(num);
      scoreBox.append(box);
      requestAnimationFrame(() => bar.style.setProperty("--v", `${scores[axis.id]}%`));
    });

    const grade = GRADES.find(([min]) => overall >= min);
    $("#resultGrade").textContent = grade[1];
    $("#resultGradeNote").textContent = `${grade[2]} · 综合 ${overall} 分${overall > previousBest && previousBest > 0 ? "（刷新最佳）" : ""}`;

    const next = roleOrder.find((r) => !save.roles[r].complete);
    $("#nextRoleButton").textContent = next ? "体验下一代" : "三代完成，进入未来";

    showScreen("result");
  }

  /* ---------- 未来视界 ---------- */

  const FUTURE_DIRS = [
    { id: "branch",  label: "网点与服务站", desc: "把柜台留在人走得到的地方" },
    { id: "digital", label: "数字平台与数据", desc: "让常用业务不再受距离限制" },
    { id: "people",  label: "一线人员与走访", desc: "让复杂情形始终有人可商量" },
    { id: "risk",    label: "风控与合规", desc: "把可解释、可纠偏放进流程" }
  ];

  const FUTURE_GAUGES = [
    { id: "cover", label: "覆盖率", min: 55, calc: (v) => v.branch * 8 + v.digital * 10 + v.people * 6,
      note: "服务能抵达多少人" },
    { id: "warm",  label: "温度",   min: 40, calc: (v) => v.people * 10 + v.branch * 6 - v.digital * 2,
      note: "还留着多少「有人管」" },
    { id: "guard", label: "风控",   min: 32, calc: (v) => v.risk * 12 + v.branch * 2 + v.people * 2 - v.digital * 4,
      note: "出事之前能不能拦住" }
  ];

  /* 六件难事的走向凑成哪一种未来 */
  const FUTURE_MODES = {
    digital: { tag: "数字拓界", scenario: "数据先跑一步，把服务推到人走不到的地方；复杂和异常转人工。", risk: "条件：算法要能解释、能纠正，用户随时可以选人工。" },
    people:  { tag: "扎根乡里", scenario: "人继续走村入户，靠长期关系和现场调查摸清真实需求。", risk: "代价：覆盖慢。也不能只在熟人圈里打转。" },
    guard:   { tag: "稳健为先", scenario: "风控合规走在前。宁可慢一步，也不把风险转给扛不住的人。", risk: "代价：太谨慎会挡住真需要钱的人，得留一条可解释的例外。" },
    branch:  { tag: "网点深耕", scenario: "网点和服务站织密，先把「走得到、找得着人」立住。", risk: "代价：固定成本高。偏远和特殊情况还得靠走访补。" },
    balanced:{ tag: "守正创新", scenario: "常用业务进手机，复杂需求留服务站，关键环节保住人工复核。", risk: "底线：数字化不能撤掉人工通道，数据不能越出用户授权。" }
  };

  /* 未来章不是"配置资源"，是"一件件难事怎么接"。
     每个难题给三条路，只能选一条，选完不能回头——
     真实的数字化也没有"推倒重来"这个选项。
     六个难题定完，资源刚好是 12 份的权重（每条 +2）。
     难度压在"看得懂就能过"：三条线全在明面上，落后了会提示。 */
  const FUTURE_DILEMMAS = [
    {
      id: "elder", title: "村里老人不会用手机",
      note: "存折换卡，他们站在机器前发愣。",
      options: [
        { dir: "digital", label: "派人上门教", tag: "教会一次，往后自己办" },
        { dir: "people",  label: "柜员带设备过去办", tag: "慢一点，当场解决" },
        { dir: "branch",  label: "请老人到服务站", tag: "走两步就到，有人手把手" }
      ]
    },
    {
      id: "reject", title: "风控模型拒了一批人",
      note: "名单里有几户，客户经理说他们不该被拒。",
      options: [
        { dir: "risk",    label: "回头重审模型", tag: "改规则，不是破例" },
        { dir: "people",  label: "开一条人工复核", tag: "让懂行的人看一眼" },
        { dir: "branch",  label: "就近设申诉点", tag: "不服气，走两步就能问" }
      ]
    },
    {
      id: "remote", title: "偏远村子没人愿意去",
      note: "路远、人少，跑一趟成本压不住。",
      options: [
        { dir: "branch",  label: "在村里设服务站", tag: "一次投入，长期有人" },
        { dir: "digital", label: "远程视频办业务", tag: "不用跑，但得会用" },
        { dir: "people",  label: "排班走访，一周一次", tag: "慢，但见得到人" }
      ]
    },
    {
      id: "consent", title: "数据要用，用户不放心",
      note: "「我的信息，凭什么让你们看？」",
      options: [
        { dir: "risk",    label: "授权边界写进流程", tag: "规矩先说清" },
        { dir: "people",  label: "每次调用先打电话", tag: "麻烦，但踏实" },
        { dir: "digital", label: "让用户自己在手机上开关", tag: "主动权交给他" }
      ]
    },
    {
      id: "urgent", title: "急事等不了审批",
      note: "客户在柜台等着，流程还在走。",
      options: [
        { dir: "digital", label: "常用业务自动化", tag: "快，但机器会说不行" },
        { dir: "risk",    label: "给紧急通道定规则", tag: "有例外，也有边界" },
        { dir: "people",  label: "留一个人签字拍板", tag: "慢一步，但有人担着" }
      ]
    },
    {
      id: "scale", title: "新业务要铺开，成本压不住",
      note: "每个村都配人配点，账算不过来。",
      options: [
        { dir: "branch",  label: "先把网点织密", tag: "重，但稳" },
        { dir: "digital", label: "先上线上，覆盖最快", tag: "轻，但有人够不着" },
        { dir: "risk",    label: "先立规矩再铺", tag: "慢，不留后患" }
      ]
    }
  ];

  const futureAlloc = { branch: 0, digital: 0, people: 0, risk: 0 };
  let futureStep = 0;

  const futureUsed = () => sumValues(futureAlloc);

  function resetFutureRun() {
    futureStep = 0;
    FUTURE_DIRS.forEach((d) => { futureAlloc[d.id] = 0; });
  }

  function renderFuture() {
    /* 三条线先搭好，之后一直挂在上面 */
    const gaugeBox = $("#futureGauges");
    gaugeBox.replaceChildren();
    FUTURE_GAUGES.forEach((g) => {
      const box = el("div", "gauge");
      const head = el("div", "gauge-head");
      head.append(el("b", null, g.label));
      const val = el("em", null, "0");
      val.append(el("small", null, "%"));
      head.append(val);
      box.append(head);

      const track = el("div", "gauge-track");
      const fill = el("div", "gauge-fill");
      track.append(fill);
      const mark = el("div", "gauge-threshold");
      mark.style.left = `${g.min}%`;
      track.append(mark);
      box.append(track);
      box.append(el("p", "gauge-note", `${g.note} · 底线 ${g.min}%`));
      gaugeBox.append(box);
      g.ref = { wrap: box, fill, val };
    });

    const pips = $("#futurePips");
    pips.replaceChildren();
    for (let i = 0; i < FUTURE_DILEMMAS.length; i += 1) pips.append(el("i"));

    resetFutureRun();
    renderDilemma();
  }

  function renderDilemma() {
    const box = $("#futureAlloc");
    box.replaceChildren();
    if (futureStep >= FUTURE_DILEMMAS.length) { paintFuture(); return; }

    const dilemma = FUTURE_DILEMMAS[futureStep];
    const card = el("div", "dilemma-card");
    const meta = el("div", "dilemma-meta");
    meta.append(el("span", "dilemma-tag", `第 ${futureStep + 1} / ${FUTURE_DILEMMAS.length} 件`));
    meta.append(el("b", "dilemma-title", dilemma.title));
    card.append(meta);
    card.append(el("p", "dilemma-note", dilemma.note));
    box.append(card);

    const opts = el("div", "dilemma-options");
    dilemma.options.forEach((opt) => {
      const dir = FUTURE_DIRS.find((d) => d.id === opt.dir);
      const btn = el("button", "dilemma-option");
      btn.type = "button";
      const main = el("span", "opt-main");
      main.append(el("b", null, opt.label));
      main.append(el("em", "opt-tag", opt.tag));
      btn.append(main);
      btn.append(el("span", "opt-dir", dir.label));
      btn.addEventListener("click", () => chooseDilemma(opt.dir));
      opts.append(btn);
    });
    box.append(opts);

    paintFuture();
  }

  function chooseDilemma(dir) {
    if (futureStep >= FUTURE_DILEMMAS.length) return;
    futureAlloc[dir] += 2;
    futureStep += 1;
    sound.effect("pack");
    $$(".dilemma-option", $("#futureAlloc")).forEach((b) => { b.disabled = true; });
    const picked = $("#futureAlloc .dilemma-option.is-picked");
    if (picked) picked.classList.remove("is-picked");
    paintFuture();

    activeTimer = setTimeout(() => {
      renderDilemma();
      if (futureStep >= FUTURE_DILEMMAS.length) return;
      const warn = laggingLine();
      if (warn) feedback(warn);
    }, 560);
  }

  /* 落后提示：只在过半之后说，免得一上来就唠叨 */
  function laggingLine() {
    const left = FUTURE_DILEMMAS.length - futureStep;
    if (left <= 0 || futureStep < 3) return "";
    let worst = null;
    FUTURE_GAUGES.forEach((g) => {
      const raw = g.calc(futureAlloc);
      const pace = g.min * (futureStep / FUTURE_DILEMMAS.length);
      const gap = raw - pace;
      if (gap < 0 && (!worst || gap < worst.gap)) worst = { label: g.label, gap };
    });
    return worst ? `还剩 ${left} 件。「${worst.label}」这条线落后了。` : "";
  }

  function paintFuture() {
    const left = FUTURE_DILEMMAS.length - futureStep;
    $("#futureRemaining").textContent = String(left);
    $$("#futurePips i").forEach((pip, i) => pip.classList.toggle("is-left", i < left));

    let allPass = true;
    FUTURE_GAUGES.forEach((g) => {
      const raw = g.calc(futureAlloc);
      const shown = Math.round(clamp(raw / 100) * 100);
      const pass = raw >= g.min;
      if (!pass) allPass = false;
      g.ref.fill.style.setProperty("--v", `${Math.min(100, Math.max(0, shown))}%`);
      g.ref.val.firstChild.textContent = String(shown);
      g.ref.wrap.classList.toggle("is-pass", pass);
      g.ref.wrap.classList.toggle("is-fail", !pass && futureStep > 0);
    });

    const done = futureStep >= FUTURE_DILEMMAS.length;
    const mode = futureMode();
    const copy = FUTURE_MODES[mode];
    $("#futureMode").textContent = copy.tag;

    if (!done) {
      $("#futureScenario").textContent = `还剩 ${left} 件没定。每定一件，三条线都会跟着动。`;
      $("#futureRisk").textContent = "底线：覆盖率 55% · 温度 40% · 风控 32%。定完才结算。";
      $("#makeEnding").disabled = true;
    } else if (allPass) {
      $("#futureScenario").textContent = copy.scenario;
      $("#futureRisk").textContent = copy.risk;
      $("#makeEnding").disabled = false;
    } else {
      $("#futureScenario").textContent = "三条线没能同时过线。换个接法，重新推演一遍。";
      $("#futureRisk").textContent = "底线：覆盖率 55% · 温度 40% · 风控 32%。";
      $("#makeEnding").disabled = true;
    }
    document.body.dataset.futureMode = mode;

    renderRedo(done && !allPass);
    return { allPass, used: futureUsed(), mode };
  }

  /* 没过线时给条退路，别把人堵死在这 */
  function renderRedo(show) {
    const box = $("#futureAlloc");
    const old = box.querySelector(".dilemma-redo");
    if (old) old.remove();
    if (!show) return;
    const redo = el("button", "dilemma-redo", "重新推演一遍");
    redo.type = "button";
    redo.addEventListener("click", () => {
      sound.effect("turn");
      resetFutureRun();
      renderDilemma();
      feedback("从头再来。这回先看清三条线各差多少。");
    });
    box.append(redo);
  }

  function futureMode() {
    const entries = FUTURE_DIRS.map((d) => [d.id, futureAlloc[d.id]]);
    entries.sort((a, b) => b[1] - a[1]);
    const [topId, topVal] = entries[0];
    const second = entries[1][1];
    if (topVal >= 5 && topVal - second >= 2) return topId;
    return "balanced";
  }

  /* ---------- 结局 ---------- */

  function globalAxes() {
    const totals = emptyAxes();
    roleOrder.forEach((roleId) => {
      const s = roleScore(roleId, save.roles[roleId].axes);
      AXIS_IDS.forEach((axis) => { totals[axis] += s[axis]; });
    });
    return Object.fromEntries(AXIS_IDS.map((axis) => [axis, Math.round(totals[axis] / 3)]));
  }

  const ENDINGS = {
    clarity: { tag: "账清如洗", title: "挎包会旧，<br>账不会旧。",
      text: "三程下来，每笔钱都找得到去处，每句承诺都留得下凭据。技术在换，账不会骗人。" },
    warmth: { tag: "人情未减", title: "路可以更远，<br>人不能更远。",
      text: "你把「有人管」一直放在包最上面。日子越过越快，一次上门、一句解释，就能把人拉回来。" },
    reach: { tag: "无远弗届", title: "从前挎包装票据，<br>今天装的是信号。",
      text: "服务先到了人走不到的地方。可到了之后还有下一关：人得接得住。" },
    "clarity+warmth": { tag: "守正", title: "算得清，<br>也走得近。",
      text: "账没糊涂，人没缺席。这两件事最难同时守住，你守住了。" },
    "warmth+reach": { tag: "温润普惠", title: "跑得快，<br>也不落人。",
      text: "能线上办的没让人跑腿，跑不动的有人上门。普惠不是平均值，是最远那一个也被算进去。" },
    "clarity+reach": { tag: "可信高效", title: "既办得快，<br>也说得明。",
      text: "清楚的账撑起了速度。跑得远，是因为每一步都留了痕。" },
    balanced: { tag: "并行不悖", title: "挎包会旧，<br>服务的路不会停。",
      text: "三条线差不多长：账清楚、人好找、路够远。你没押任何一头，也就没落下谁。" }
  };

  function pairKey(a, b) {
    const order = ["clarity", "warmth", "reach"];
    return order.indexOf(a) < order.indexOf(b) ? `${a}+${b}` : `${b}+${a}`;
  }

  function pickEnding(globals) {
    const ranked = AXIS_IDS.slice().sort((a, b) => globals[b] - globals[a]);
    const [first, second] = ranked;
    let key = "balanced";
    if (globals[first] - globals[second] >= 8) key = first;
    else key = pairKey(first, second);
    if (!ENDINGS[key]) key = "balanced";
    return { ...ENDINGS[key], key };
  }

  function makeEnding() {
    const state = paintFuture();
    if (!(state.allPass && state.used === 12)) return;

    const globals = globalAxes();
    const ending = pickEnding(globals);
    const modeCopy = FUTURE_MODES[state.mode];

    save.future = { ...futureAlloc, mode: state.mode };
    save.ending = { key: ending.key, tag: ending.tag, axes: globals, mode: state.mode };
    persist();

    $("#endingTitle").innerHTML = ending.title;
    $("#endingTagline").textContent = `「${ending.tag}」 · ${modeCopy.tag}`;
    $("#endingText").textContent = `${ending.text}未来图景：${modeCopy.scenario}`;

    const stamps = $("#endingStamps");
    stamps.replaceChildren();
    roleOrder.forEach((roleId) => stamps.append(el("span", null, roles[roleId].stamp)));

    const axesBox = $("#endingAxes");
    axesBox.replaceChildren();
    AXES.forEach((axis) => {
      const box = el("div", "axis-score");
      box.append(el("span", null, axis.label));
      const bar = el("i");
      bar.style.setProperty("--v", "0%");
      bar.style.setProperty("--c", axis.raw);
      box.append(bar);
      const num = el("b", null, String(globals[axis.id]));
      num.append(el("small", null, " / 100"));
      box.append(num);
      axesBox.append(box);
      requestAnimationFrame(() => bar.style.setProperty("--v", `${globals[axis.id]}%`));
    });

    const achBox = $("#endingAchievements");
    achBox.replaceChildren();
    ACHIEVEMENTS.forEach((a) => {
      const got = Boolean(save.achievements[a.id]);
      const chip = el("span", `achievement${got ? "" : " is-locked"}`);
      chip.append(el("i"));
      chip.append(document.createTextNode(a.label));
      chip.title = a.hint;
      achBox.append(chip);
    });

    renderLedger();
    sound.chord();
    showScreen("ending");
  }

  /* ---------- 信用存折 ---------- */

  function renderLedger() {
    const axesBox = $("#ledgerAxes");
    axesBox.replaceChildren();
    const globals = globalAxes();
    AXES.forEach((axis) => {
      const box = el("div", "axis-score");
      box.append(el("span", null, axis.label));
      const bar = el("i");
      bar.style.setProperty("--v", "0%");
      bar.style.setProperty("--c", axis.raw);
      box.append(bar);
      const num = el("b", null, String(globals[axis.id]));
      num.append(el("small", null, " / 100"));
      box.append(num);
      axesBox.append(box);
      requestAnimationFrame(() => bar.style.setProperty("--v", `${globals[axis.id]}%`));
    });

    const list = $("#ledgerEntries");
    list.replaceChildren();
    let any = false;

    roleOrder.forEach((roleId) => {
      const record = save.roles[roleId];
      if (!record.complete) return;
      any = true;
      const data = roles[roleId];
      const scores = roleScore(roleId, record.axes);
      const overall = Math.round(clamp(scoreAverage(scores) / roleBest[roleId]) * 100);

      const entry = el("div", "ledger-entry");
      entry.append(el("time", null, data.era));
      const p = el("p");
      p.append(el("b", null, `${data.name} · ${data.occupation}`));
      p.append(el("small", null, `${record.detail?.explore || "—"} ｜ ${record.detail?.mini || "—"} ｜ 装包：${record.detail?.pack || "—"}`));
      entry.append(p);
      entry.append(el("span", "amount is-plus", `+${overall}`));
      list.append(entry);
    });

    if (save.future) {
      const entry = el("div", "ledger-entry");
      entry.append(el("time", null, "未来"));
      const p = el("p");
      p.append(el("b", null, `资源投向 · ${FUTURE_MODES[save.future.mode].tag}`));
      p.append(el("small", null, FUTURE_DIRS.map((d) => `${d.label} ${save.future[d.id]}`).join(" ｜ ")));
      entry.append(p);
      entry.append(el("span", "amount is-plus", save.ending ? save.ending.tag : "已落地"));
      list.append(entry);
      any = true;
    }

    $("#ledgerEmpty").hidden = any;

    const achBox = $("#ledgerAchievements");
    achBox.replaceChildren();
    ACHIEVEMENTS.forEach((a) => {
      const got = Boolean(save.achievements[a.id]);
      const chip = el("span", `achievement${got ? "" : " is-locked"}`);
      chip.append(el("i"));
      chip.append(document.createTextNode(a.label));
      chip.title = a.hint;
      achBox.append(chip);
    });
  }

  /* ---------- 结局海报 ---------- */

  function downloadPoster() {
    const globals = globalAxes();
    const ending = save.ending || { tag: "并行不悖", axes: globals, mode: "balanced" };
    const canvasEl = document.createElement("canvas");
    canvasEl.width = 1600;
    canvasEl.height = 1000;
    const c = canvasEl.getContext("2d");

    /* 纸底 */
    const bg = c.createLinearGradient(0, 0, 1600, 1000);
    bg.addColorStop(0, "#123a2e");
    bg.addColorStop(0.5, "#0f3227");
    bg.addColorStop(1, "#0a231c");
    c.fillStyle = bg;
    c.fillRect(0, 0, 1600, 1000);

    /* 鎏金边 */
    c.strokeStyle = "rgba(200,166,83,0.5)";
    c.lineWidth = 3;
    c.strokeRect(56, 56, 1488, 888);
    c.lineWidth = 1;
    c.strokeRect(72, 72, 1456, 856);

    /* 竖排装饰字 */
    c.fillStyle = "rgba(244,236,219,0.05)";
    c.font = '900 320px "Noto Serif SC", serif';
    c.fillText("沽", 1180, 620);

    /* 标题 */
    c.fillStyle = "#c8a653";
    c.fillRect(120, 150, 6, 300);
    c.fillStyle = "#f4ecdb";
    c.font = '900 96px "Noto Serif SC", serif';
    c.fillText("挎包里的津沽", 160, 240);
    c.fillStyle = "rgba(244,236,219,0.62)";
    c.font = '400 30px "Noto Sans SC", sans-serif';
    c.fillText("三代人的信用路 · 我的未来结局", 164, 300);

    /* 结局称号 */
    c.fillStyle = "#a03c2c";
    c.fillRect(120, 350, 200, 4);
    c.fillStyle = "#e0c47c";
    c.font = '900 78px "Noto Serif SC", serif';
    c.fillText(ending.tag, 120, 440);

    c.fillStyle = "rgba(244,236,219,0.66)";
    c.font = '300 24px "Noto Sans SC", sans-serif';
    c.fillText(`未来图景：${FUTURE_MODES[ending.mode] ? FUTURE_MODES[ending.mode].tag : "守正创新"}`, 124, 486);

    /* 三轴条 */
    AXES.forEach((axis, i) => {
      const y = 560 + i * 74;
      c.fillStyle = "rgba(244,236,219,0.7)";
      c.font = '400 24px "Noto Sans SC", sans-serif';
      c.fillText(axis.label, 124, y + 24);
      c.fillStyle = "rgba(244,236,219,0.12)";
      c.fillRect(220, y + 4, 620, 16);
      c.fillStyle = axis.raw;
      c.fillRect(220, y + 4, 620 * (globals[axis.id] / 100), 16);
      c.fillStyle = axis.raw;
      c.font = '700 30px Georgia, serif';
      c.fillText(String(globals[axis.id]), 872, y + 28);
    });

    /* 三枚印记 */
    roleOrder.forEach((roleId, i) => {
      const x = 1240;
      const y = 180 + i * 130;
      c.strokeStyle = "#c4563f";
      c.lineWidth = 4;
      c.beginPath();
      c.arc(x + 60, y, 56, 0, Math.PI * 2);
      c.stroke();
      c.lineWidth = 2;
      c.beginPath();
      c.arc(x + 60, y, 46, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = "#e0866d";
      c.font = '700 26px "Noto Serif SC", serif';
      const label = roles[roleId].stamp;
      c.fillText(label, x + 60 - (label.length * 13), y + 10);
    });

    /* 落款 */
    c.fillStyle = "rgba(244,236,219,0.5)";
    c.font = '400 22px "Noto Sans SC", sans-serif';
    c.fillText("乡土信用 · 稳健经营 · 数字普惠", 124, 872);
    c.fillStyle = "#c8a653";
    c.font = '700 24px Georgia, serif';
    c.fillText("TIANJIN · 1952 → FUTURE", 124, 912);

    const link = document.createElement("a");
    link.download = "挎包里的津沽-未来结局.png";
    link.href = canvasEl.toDataURL("image/png");
    document.body.append(link);
    link.click();
    link.remove();

    const btn = $("#downloadEnding");
    btn.textContent = "结局海报已生成";
    setTimeout(() => { btn.textContent = "保存结局海报"; }, 2200);
  }

  /* ---------- 事件绑定 ---------- */

  $("#soundButton").addEventListener("click", () => {
    if (sound.on) sound.stop(); else sound.start();
    updateSoundButton();
  });

  /* 浏览器不许没交互就出声。第一次点或按键时自动把声音打开，
     免得有人找不到右上角那个「声音：关」，以为这游戏没有声音。
     只跑一次：之后用户自己按了「关」，就不要再替他打开。 */
  const firstGestureAudio = () => {
    if (!sound.on) { sound.start(); updateSoundButton(); }
    window.removeEventListener("pointerdown", firstGestureAudio);
    window.removeEventListener("keydown", firstGestureAudio);
  };
  window.addEventListener("pointerdown", firstGestureAudio);
  window.addEventListener("keydown", firstGestureAudio);

  $("#startButton").addEventListener("click", () => {
    sound.start();
    updateSoundButton();
    updateGlobalProgress();
    showScreen("identity");
  });

  $("#resumeButton").addEventListener("click", () => {
    sound.start();
    updateSoundButton();
    updateGlobalProgress();
    const next = roleOrder.find((r) => !save.roles[r].complete) || "grandparent";
    beginRole(next);
  });

  $("#homeButton").addEventListener("click", () => showScreen("title"));
  $("#backToRoles").addEventListener("click", () => { stopTimer(); showScreen("identity"); });
  $("#roleMapButton").addEventListener("click", () => showScreen("identity"));

  $("#nextRoleButton").addEventListener("click", () => {
    const next = roleOrder.find((r) => !save.roles[r].complete);
    if (next) beginRole(next);
    else showScreen("future");
  });

  $("#futureLock").addEventListener("click", () => {
    if (completedCount() === 3) showScreen("future");
  });

  $("#makeEnding").addEventListener("click", makeEnding);
  $("#downloadEnding").addEventListener("click", downloadPoster);

  $("#restartButton").addEventListener("click", () => {
    save = freshSave();
    persist();
    resetFutureRun();
    renderDilemma();
    updateGlobalProgress();
    showScreen("title");
  });

  /* 档案库 */
  const archiveDialog = $("#archiveDialog");
  $("#archiveButton").addEventListener("click", () => archiveDialog.showModal());
  $("#closeArchive").addEventListener("click", () => archiveDialog.close());
  archiveDialog.addEventListener("click", (e) => { if (e.target === archiveDialog) archiveDialog.close(); });

  /* 信用存折 */
  let ledgerReturn = "title";
  function openLedger() {
    ledgerReturn = activeScreen === "ledger" ? ledgerReturn : activeScreen;
    renderLedger();
    showScreen("ledger");
  }
  $("#ledgerButton").addEventListener("click", openLedger);
  $("#viewLedgerButton").addEventListener("click", openLedger);
  $("#closeLedger").addEventListener("click", () => showScreen(ledgerReturn));

  /* ---------- 启动 ---------- */

  updateGlobalProgress();
  renderFuture();

  const params = new URLSearchParams(window.location.search);
  const debugScreen = params.get("screen");
  const debugRole = params.get("role");
  if (debugScreen === "role" && roles[debugRole]) beginRole(debugRole);
  else if (debugScreen && screens[debugScreen]) showScreen(debugScreen);
  else showScreen("title");

  requestAnimationFrame(drawWorld);
})();
