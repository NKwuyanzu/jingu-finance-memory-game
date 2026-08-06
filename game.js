(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const roleOrder = ["grandparent", "parent", "youth"];
  const storageKey = "jingu-credit-game-v2";

  const roles = {
    grandparent: {
      chapter: "第一程 · 1978",
      name: "杨凤英",
      occupation: "生产队会计",
      time: "1978 · 春耕前",
      place: "天津南郊乡村",
      source: "情境复原",
      intro: "春耕就要开始，先把账理清",
      cluePrompt: "院里散落着那个年代的金融物件。找到三件能帮助登记、计算和送达信用的工具。",
      objects: [
        { id: "ledger", label: "生产队账本", glyph: "账", x: 18, y: 34, note: "把口头承诺留成可核对的记录" },
        { id: "abacus", label: "木算盘", glyph: "算", x: 32, y: 45, note: "把春耕收支一笔一笔算清" },
        { id: "bag", label: "帆布挎包", glyph: "包", x: 46, y: 37, note: "把服务送到离柜台很远的地方" },
        { id: "passbook", label: "手写存折", glyph: "折", x: 58, y: 47, note: "让家庭积蓄成为看得见的记录" }
      ],
      decisionTitle: "三百元春耕周转款，怎样安排？",
      decisionBody: "种子、化肥都要买，但秋收前还要留出家庭生活和还款余量。",
      choices: [
        { text: "先核清生产需要，分项登记，并留出还款余量", correct: true, feedback: "稳健不是保守，而是让每一笔钱都有去处、每一项承诺都有余地。" },
        { text: "既然都是熟人，不必写得太细", correct: false, feedback: "熟悉能建立信任，却不能替代清楚的账目。" },
        { text: "把钱全部投入最快见效的项目", correct: false, feedback: "没有余量的增长会把一次波动变成难以承担的风险。" }
      ],
      packTitle: "把什么交给下一代？",
      packBody: "从五项原则中选出三项，装进第一代人的挎包。",
      principles: [
        { id: "clear", label: "账目清楚", correct: true },
        { id: "promise", label: "承诺有据", correct: true },
        { id: "door", label: "服务上门", correct: true },
        { id: "relation", label: "只凭关系", correct: false },
        { id: "scale", label: "只看规模", correct: false }
      ],
      stamp: "乡土信用",
      stampLine: "账目清楚，承诺有据",
      result: "对第一代而言，信用的温度来自熟悉的人，信用的分量来自清楚的账。",
      palette: ["#9d8159", "#465a43", "#c79e55"]
    },
    parent: {
      chapter: "第二程 · 1998",
      name: "李建国",
      occupation: "乡镇个体户",
      time: "1998 · 夏日午后",
      place: "天津区县乡镇",
      source: "合成叙事",
      intro: "订单来了，机器也该换了",
      cluePrompt: "找到三件能够说明作坊真实经营状况的线索，让发展不只靠一句“生意不错”。",
      objects: [
        { id: "orders", label: "客户订单", glyph: "单", x: 18, y: 35, note: "订单说明需求，也要核实能否持续" },
        { id: "books", label: "经营账册", glyph: "账", x: 33, y: 46, note: "现金流比门面更能说明经营状况" },
        { id: "machine", label: "作坊机器", glyph: "机", x: 47, y: 40, note: "设备更新要与真实产能匹配" },
        { id: "workbag", label: "工作挎包", glyph: "包", x: 59, y: 31, note: "工作人员仍要走到经营现场" }
      ],
      decisionTitle: "接下大订单，设备资金怎么安排？",
      decisionBody: "扩大生产能带来机会，也会增加库存、工资和还款压力。",
      choices: [
        { text: "结合订单、现金流和现场产能，匹配分期周转计划", correct: true, feedback: "看见发展机会，也把可能的波动提前算进经营安排。" },
        { text: "订单越大越好，先把能借的资金都用上", correct: false, feedback: "规模不是唯一答案，过快扩张会放大经营波动。" },
        { text: "为了稳妥，任何设备都不更新", correct: false, feedback: "稳健也不是停在原地，而是让投入与承受能力相匹配。" }
      ],
      packTitle: "网点变多以后，挎包里还要有什么？",
      packBody: "选出三项，让制度化服务保留“百姓身边的银行”的温度。",
      principles: [
        { id: "proof", label: "规范凭证", correct: true },
        { id: "visit", label: "现场走访", correct: true },
        { id: "cashflow", label: "稳健周转", correct: true },
        { id: "speed", label: "只求速度", correct: false },
        { id: "counter", label: "只等上门", correct: false }
      ],
      stamp: "稳健经营",
      stampLine: "看见生意，也看见风险",
      result: "第二代把熟人信用带进更规范的流程：服务依然近，判断更加稳。",
      palette: ["#8d7459", "#4c5147", "#b46b4d"]
    },
    youth: {
      chapter: "第三程 · 2026",
      name: "周晓桐",
      occupation: "返乡创业者",
      time: "2026 · 清晨发货",
      place: "天津乡村振兴场景",
      source: "未来推演",
      intro: "订单都在手机里，服务也要随时抵达",
      cluePrompt: "找到三种今天仍在延续挎包精神的服务形态。它们不一定长得像旧挎包。",
      objects: [
        { id: "phone", label: "手机银行", glyph: "机", x: 19, y: 46, note: "常用业务不再受距离限制" },
        { id: "station", label: "金融服务站", glyph: "站", x: 34, y: 32, note: "复杂问题仍能找到具体的人" },
        { id: "tablet", label: "数字工作包", glyph: "包", x: 48, y: 43, note: "工作人员把服务带进新的场景" },
        { id: "orders", label: "电商订单", glyph: "单", x: 59, y: 29, note: "生产与更远的市场连接起来" }
      ],
      decisionTitle: "系统提示资料不足，订单却在等资金",
      decisionBody: "纯线上流程很快，但你的农业生产具有季节性，还有些信息无法被标准字段说明。",
      choices: [
        { text: "到服务站补充生产信息，并保留人工复核与解释", correct: true, feedback: "数字提高效率，人工通道让复杂生活不被单一数据误判。" },
        { text: "不断重复线上申请，直到系统自动通过", correct: false, feedback: "重复点击不能解决信息缺口，反而可能掩盖真实需求。" },
        { text: "把所有经营数据永久授权，换取最快速度", correct: false, feedback: "便利不能建立在没有边界的数据使用之上。" }
      ],
      packTitle: "数字挎包必须守住什么？",
      packBody: "选出三项，让数字服务走得更远，也不把任何人落下。",
      principles: [
        { id: "consent", label: "数据有授权", correct: true },
        { id: "human", label: "人工能兜底", correct: true },
        { id: "explain", label: "风险可解释", correct: true },
        { id: "score", label: "只信评分", correct: false },
        { id: "offline", label: "撤掉线下", correct: false }
      ],
      stamp: "数字普惠",
      stampLine: "效率向前，服务兜底",
      result: "第三代让挎包进入手机与服务网络，但没有让人的判断和责任从现场消失。",
      palette: ["#718e87", "#27584a", "#c8a653"]
    }
  };

  function freshProgress() {
    return Object.fromEntries(roleOrder.map((role) => [role, { complete: false }]));
  }

  function loadProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey));
      return parsed && parsed.grandparent && parsed.parent && parsed.youth ? parsed : freshProgress();
    } catch (_error) {
      return freshProgress();
    }
  }

  let progress = loadProgress();
  let activeRole = "grandparent";
  let activeScreen = "title";
  let roleStep = 0;
  let collected = new Map();
  let packed = new Set();
  let decisionPassed = false;
  let animationTime = 0;

  const screens = {
    title: $("#titleScreen"),
    identity: $("#identityScreen"),
    role: $("#roleScreen"),
    result: $("#resultScreen"),
    future: $("#futureScreen"),
    ending: $("#endingScreen")
  };

  function saveProgress() {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }

  function showScreen(name) {
    Object.entries(screens).forEach(([key, screen]) => {
      const active = key === name;
      screen.hidden = !active;
      screen.classList.toggle("is-active", active);
    });
    activeScreen = name;
    document.body.dataset.screen = name;
    soundscape.setEra(name === "role" ? activeRole : name);
  }

  function completedCount() {
    return roleOrder.filter((role) => progress[role].complete).length;
  }

  function updateGlobalProgress() {
    const count = completedCount();
    $("#headerProgress").textContent = `${count} / 3`;
    roleOrder.forEach((role) => {
      $(`[data-progress-dot="${role}"]`).classList.toggle("is-complete", progress[role].complete);
      const card = $(`.identity-card[data-role="${role}"]`);
      card.classList.toggle("is-complete", progress[role].complete);
      $(".identity-status", card).textContent = progress[role].complete ? "印记已获得 · 再次体验" : "进入这一程";
    });
    $("#futureLock").disabled = count !== 3;
    $("#futureLock").textContent = count === 3 ? "三枚印记已集齐，进入未来视界" : `还需 ${3 - count} 枚信用印记解锁未来视界`;
  }

  function resetRoleState() {
    roleStep = 0;
    collected = new Map();
    packed = new Set();
    decisionPassed = false;
  }

  function beginRole(role) {
    activeRole = role;
    resetRoleState();
    const data = roles[role];
    $("#roleChapter").textContent = data.chapter;
    $("#roleName").textContent = data.name;
    $("#roleOccupation").textContent = data.occupation;
    $("#placeLabel span").textContent = data.time;
    $("#placeLabel strong").textContent = data.place;
    showScreen("role");
    renderMission();
  }

  function renderHotspots() {
    const root = $("#sceneHotspots");
    root.replaceChildren();
    if (roleStep !== 0) return;
    roles[activeRole].objects.forEach((object) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `scene-hotspot${collected.has(object.id) ? " is-found" : ""}`;
      button.style.left = `${object.x}%`;
      button.style.top = `${object.y}%`;
      button.dataset.label = object.label;
      button.setAttribute("aria-label", `${object.label}：${object.note}`);
      button.textContent = object.glyph;
      button.addEventListener("click", () => collectObject(object));
      root.appendChild(button);
    });
  }

  function updateInventory() {
    const items = roleStep === 2
      ? Array.from(packed).map((id) => roles[activeRole].principles.find((item) => item.id === id)?.label).filter(Boolean)
      : Array.from(collected.values()).map((item) => item.label);
    $("#inventoryText").textContent = items.length ? items.join(" · ") : "还没有线索";
  }

  function collectObject(object) {
    if (collected.has(object.id)) return;
    collected.set(object.id, object);
    soundscape.effect("collect");
    renderHotspots();
    updateInventory();
    const count = collected.size;
    $("#missionFeedback").textContent = count >= 3 ? `${object.note}。线索齐了，可以继续。` : `${object.note}。${count} / 3 件线索已装入挎包。`;
    if (count >= 3) renderNextButton("把线索带到下一步", () => advanceStep(1));
  }

  function renderNextButton(label, handler) {
    const actions = $("#missionActions");
    actions.replaceChildren();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "next-step";
    button.textContent = label;
    button.addEventListener("click", handler);
    actions.appendChild(button);
  }

  function advanceStep(step) {
    roleStep = step;
    soundscape.effect("turn");
    renderMission();
  }

  function renderDecision(data) {
    const actions = $("#missionActions");
    data.choices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      button.setAttribute("aria-pressed", "false");
      button.textContent = choice.text;
      button.addEventListener("click", () => {
        $$(".choice-button", actions).forEach((node) => {
          node.classList.remove("is-selected", "is-correct", "is-risky");
          node.setAttribute("aria-pressed", "false");
        });
        button.classList.add("is-selected", choice.correct ? "is-correct" : "is-risky");
        button.setAttribute("aria-pressed", "true");

        if (choice.correct) {
          soundscape.effect("correct");
          $("#missionFeedback").textContent = choice.feedback;
          if (!decisionPassed) {
            decisionPassed = true;
            const next = document.createElement("button");
            next.type = "button";
            next.className = "next-step decision-next";
            next.textContent = "把这次判断装进挎包";
            next.addEventListener("click", () => advanceStep(2));
            actions.appendChild(next);
          }
        } else {
          soundscape.effect("wrong");
          $("#missionFeedback").textContent = choice.feedback;
        }
      });
      actions.appendChild(button);
    });
  }

  function renderPacking(data) {
    const actions = $("#missionActions");
    data.principles.forEach((principle) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "principle-button";
      button.textContent = principle.label;
      button.addEventListener("click", () => {
        if (!principle.correct) {
          soundscape.effect("wrong");
          $("#missionFeedback").textContent = `“${principle.label}”会让信用失去边界，再想想。`;
          return;
        }
        if (packed.has(principle.id)) return;
        packed.add(principle.id);
        button.classList.add("is-packed");
        button.disabled = true;
        soundscape.effect("collect");
        updateInventory();
        if (packed.size === 3) {
          $("#missionFeedback").textContent = "三项原则已经装好。这只挎包可以交给下一代了。";
          const complete = document.createElement("button");
          complete.type = "button";
          complete.className = "next-step";
          complete.textContent = "获得这一代的信用印记";
          complete.addEventListener("click", completeRole);
          actions.appendChild(complete);
        } else {
          $("#missionFeedback").textContent = `${packed.size} / 3 项原则已装入挎包。`;
        }
      });
      actions.appendChild(button);
    });
  }

  function renderMission() {
    const data = roles[activeRole];
    $("#missionSource").textContent = data.source;
    $("#stepLabel").textContent = `任务 ${roleStep + 1} / 3`;
    $$(".step-meter i").forEach((node, index) => {
      node.classList.toggle("is-done", index < roleStep);
      node.classList.toggle("is-active", index === roleStep);
    });
    const actions = $("#missionActions");
    actions.replaceChildren();

    if (roleStep === 0) {
      $("#missionType").textContent = "寻找时代线索";
      $("#missionTitle").textContent = data.intro;
      $("#missionBody").textContent = data.cluePrompt;
      $("#missionFeedback").textContent = `${collected.size} / 3 件线索已装入挎包`;
      if (collected.size >= 3) renderNextButton("把线索带到下一步", () => advanceStep(1));
    } else if (roleStep === 1) {
      $("#missionType").textContent = "做出生活选择";
      $("#missionTitle").textContent = data.decisionTitle;
      $("#missionBody").textContent = data.decisionBody;
      $("#missionFeedback").textContent = decisionPassed ? "这次判断已经完成。" : "选择不会扣分，但会告诉你代价。";
      renderDecision(data);
    } else {
      $("#missionType").textContent = "装入精神原则";
      $("#missionTitle").textContent = data.packTitle;
      $("#missionBody").textContent = data.packBody;
      $("#missionFeedback").textContent = `${packed.size} / 3 项原则已装入挎包。`;
      renderPacking(data);
    }
    renderHotspots();
    updateInventory();
  }

  function completeRole() {
    progress[activeRole].complete = true;
    saveProgress();
    updateGlobalProgress();
    soundscape.effect("stamp");
    const data = roles[activeRole];
    $("#earnedStamp span").textContent = data.stamp;
    $("#earnedStamp strong").textContent = data.stampLine;
    $("#earnedStamp small").textContent = data.chapter.split(" · ")[0];
    $("#resultTitle").textContent = `你把“${data.stampLine}”装进了挎包`;
    $("#resultBody").textContent = data.result;
    const incomplete = roleOrder.find((role) => !progress[role].complete);
    $("#nextRoleButton").textContent = incomplete ? "体验下一代" : "三代完成，进入未来";
    showScreen("result");
  }

  class Soundscape {
    constructor() {
      this.context = null;
      this.master = null;
      this.music = $("#backgroundMusic");
      this.music.volume = 0.42;
      this.on = false;
      this.era = "title";
    }

    ensure() {
      if (this.context) return true;
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return false;
      this.context = new AudioCtor();
      this.master = this.context.createGain();
      this.master.gain.value = 0.11;
      this.master.connect(this.context.destination);
      return true;
    }

    start() {
      this.ensure();
      if (this.context) this.context.resume();
      this.music.volume = 0.42;
      this.music.play().catch(() => {
        this.on = false;
        updateSoundButton();
      });
      this.on = true;
      return true;
    }

    stop() {
      this.music.pause();
      this.on = false;
    }

    setEra(era) {
      this.era = era;
    }

    effect(type) {
      if (!this.on || !this.context) return;
      const frequencies = { collect: 660, correct: 880, wrong: 150, turn: 440, stamp: 520 };
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = type === "wrong" ? "sawtooth" : "sine";
      oscillator.frequency.value = frequencies[type] || 440;
      gain.gain.setValueAtTime(0.09, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + (type === "stamp" ? 0.8 : 0.22));
      oscillator.connect(gain).connect(this.master);
      oscillator.start();
      oscillator.stop(this.context.currentTime + (type === "stamp" ? 0.82 : 0.24));
    }
  }

  const soundscape = new Soundscape();

  function updateSoundButton() {
    const button = $("#soundButton");
    button.setAttribute("aria-pressed", String(soundscape.on));
    button.textContent = `声音：${soundscape.on ? "开" : "关"}`;
  }

  $("#soundButton").addEventListener("click", () => {
    if (soundscape.on) soundscape.stop();
    else soundscape.start();
    updateSoundButton();
  });

  $("#startButton").addEventListener("click", () => {
    soundscape.start();
    updateSoundButton();
    updateGlobalProgress();
    showScreen("identity");
  });

  $("#homeButton").addEventListener("click", () => showScreen("title"));
  $("#backToRoles").addEventListener("click", () => showScreen("identity"));
  $("#roleMapButton").addEventListener("click", () => showScreen("identity"));

  $$(".identity-card").forEach((card) => card.addEventListener("click", () => beginRole(card.dataset.role)));

  $("#nextRoleButton").addEventListener("click", () => {
    const next = roleOrder.find((role) => !progress[role].complete);
    if (next) beginRole(next);
    else showScreen("future");
  });

  $("#futureLock").addEventListener("click", () => {
    if (completedCount() === 3) showScreen("future");
  });

  const futureCopy = {
    steady: {
      mode: "稳健优先",
      scenario: "服务人员持续走村入户，依靠长期关系与现场调查理解真实需求。",
      risk: "提醒：关系不能代替规范，服务范围也不能停留在熟人圈层。"
    },
    hybrid: {
      mode: "线上线下协同",
      scenario: "手机完成常用业务，服务站处理复杂需求，关键环节保留人工复核。",
      risk: "底线：数字化不能撤走人工通道，也不能让数据超出用户授权边界。"
    },
    digital: {
      mode: "数字触达优先",
      scenario: "数据帮助服务快速匹配城乡需求，复杂或异常情况自动转入人工处理。",
      risk: "底线：算法必须可解释、可纠正，用户有权选择人工服务。"
    }
  };

  function updateFuture() {
    const innovation = Number($("#futureSlider").value);
    const steady = 100 - innovation;
    const mode = innovation < 34 ? "steady" : innovation > 66 ? "digital" : "hybrid";
    const copy = futureCopy[mode];
    $("#steadyValue").textContent = steady;
    $("#innovationValue").textContent = innovation;
    $("#futureMode").textContent = copy.mode;
    $("#futureScenario").textContent = copy.scenario;
    $("#futureRisk").textContent = copy.risk;
    document.body.dataset.futureMode = mode;
  }

  $("#futureSlider").addEventListener("input", () => {
    updateFuture();
    soundscape.effect("turn");
  });

  $("#makeEnding").addEventListener("click", () => {
    const innovation = Number($("#futureSlider").value);
    const steady = 100 - innovation;
    const mode = innovation < 34 ? "稳健扎根" : innovation > 66 ? "数字拓界" : "守正创新";
    $("#endingText").textContent = `你的结局是“${mode}”：${steady}% 稳健传承与 ${innovation}% 创新变革。技术扩大了抵达的范围，挎包精神守住了信用的重量。`;
    soundscape.effect("stamp");
    showScreen("ending");
  });

  $("#downloadEnding").addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#12372d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#c8a653";
    ctx.fillRect(96, 84, 5, 732);
    ctx.fillStyle = "#eee7d8";
    ctx.font = "700 88px Microsoft YaHei";
    ctx.fillText("挎包里的津沽", 150, 210);
    ctx.font = "32px Microsoft YaHei";
    ctx.fillStyle = "rgba(238,231,216,0.7)";
    ctx.fillText("三代人的信用路 · 我的未来结局", 152, 275);
    ctx.fillStyle = "#9a4b3a";
    ctx.font = "700 105px Georgia";
    ctx.fillText($("#steadyValue").textContent, 150, 480);
    ctx.fillStyle = "#eee7d8";
    ctx.font = "28px Microsoft YaHei";
    ctx.fillText("% 稳健传承", 310, 470);
    ctx.fillStyle = "#c8a653";
    ctx.font = "700 105px Georgia";
    ctx.fillText($("#innovationValue").textContent, 760, 480);
    ctx.fillStyle = "#eee7d8";
    ctx.font = "28px Microsoft YaHei";
    ctx.fillText("% 创新变革", 920, 470);
    ctx.font = "700 32px Microsoft YaHei";
    ctx.fillText($("#futureMode").textContent, 150, 605);
    ctx.font = "23px Microsoft YaHei";
    ctx.fillStyle = "rgba(238,231,216,0.68)";
    ctx.fillText("乡土信用 · 稳健经营 · 数字普惠", 150, 675);
    ctx.fillStyle = "#c8a653";
    ctx.fillText("TIANJIN · 1952 → FUTURE", 150, 755);
    const link = document.createElement("a");
    link.download = "挎包里的津沽-未来结局.png";
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    link.remove();
    const button = $("#downloadEnding");
    button.textContent = "结局海报已生成";
    setTimeout(() => { button.textContent = "保存结局海报"; }, 2200);
  });

  $("#restartButton").addEventListener("click", () => {
    progress = freshProgress();
    saveProgress();
    updateGlobalProgress();
    showScreen("title");
  });

  const archiveDialog = $("#archiveDialog");
  $("#archiveButton").addEventListener("click", () => archiveDialog.showModal());
  $("#closeArchive").addEventListener("click", () => archiveDialog.close());
  archiveDialog.addEventListener("click", (event) => { if (event.target === archiveDialog) archiveDialog.close(); });

  const worldCanvas = $("#worldCanvas");

  function fitCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (worldCanvas.width !== Math.round(width * dpr) || worldCanvas.height !== Math.round(height * dpr)) {
      worldCanvas.width = Math.round(width * dpr);
      worldCanvas.height = Math.round(height * dpr);
    }
    const ctx = worldCanvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  }

  function drawHill(ctx, width, y, color, offset) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, y + 50);
    for (let x = 0; x <= width; x += width / 6) {
      ctx.quadraticCurveTo(x + width / 12, y - 28 + Math.sin(offset + x * 0.01) * 18, x + width / 6, y + 12);
    }
    ctx.lineTo(width, window.innerHeight);
    ctx.lineTo(0, window.innerHeight);
    ctx.closePath();
    ctx.fill();
  }

  function drawVillage(ctx, width, height, time) {
    const base = height * 0.65;
    ctx.fillStyle = "#8f6a4e";
    ctx.fillRect(width * 0.07, base - 170, width * 0.25, 170);
    ctx.fillStyle = "#3d4035";
    ctx.beginPath();
    ctx.moveTo(width * 0.05, base - 170);
    ctx.lineTo(width * 0.195, base - 250);
    ctx.lineTo(width * 0.34, base - 170);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#c4a15f";
    ctx.fillRect(width * 0.15, base - 105, 45, 105);
    ctx.strokeStyle = "#27392e";
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(width * 0.72, base);
    ctx.quadraticCurveTo(width * 0.72, base - 150, width * 0.76, base - 210);
    ctx.stroke();
    ctx.fillStyle = "#465a42";
    [[0.75,-205,58],[0.71,-170,48],[0.8,-165,44]].forEach(([x,y,r]) => {
      ctx.beginPath(); ctx.arc(width*x, base+y, r + Math.sin(time*0.001+x)*2, 0, Math.PI*2); ctx.fill();
    });
    ctx.fillStyle = "rgba(204,178,104,0.44)";
    for (let i = 0; i < 45; i += 1) {
      const x = (i * 89) % width;
      const y = base + 18 + ((i * 47) % Math.max(40, height - base - 20));
      ctx.fillRect(x, y, 2, 15 + (i % 5));
    }
  }

  function drawTown(ctx, width, height) {
    const base = height * 0.67;
    ctx.fillStyle = "#865f4b";
    ctx.fillRect(width * 0.05, base - 260, width * 0.26, 260);
    ctx.fillStyle = "#193e33";
    ctx.fillRect(width * 0.05, base - 260, width * 0.26, 46);
    ctx.fillStyle = "rgba(238,231,216,0.9)";
    ctx.font = "15px Microsoft YaHei";
    ctx.fillText("镇上储蓄网点", width * 0.09, base - 230);
    ctx.fillStyle = "#6b6859";
    ctx.fillRect(width * 0.57, base - 205, width * 0.3, 205);
    ctx.fillStyle = "#343e37";
    for (let i = 0; i < 4; i += 1) ctx.fillRect(width * 0.6 + i * 65, base - 150 + (i % 2) * 30, 45, 82);
    ctx.fillStyle = "#4f554c";
    ctx.fillRect(0, base, width, height - base);
    ctx.strokeStyle = "rgba(238,231,216,0.3)";
    ctx.setLineDash([20,18]);
    ctx.beginPath(); ctx.moveTo(0, base+75); ctx.lineTo(width, base+75); ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawFuture(ctx, width, height, time) {
    const base = height * 0.66;
    ctx.fillStyle = "rgba(186,211,200,0.5)";
    ctx.beginPath();
    ctx.roundRect(width * 0.04, base - 235, width * 0.36, 235, 58);
    ctx.fill();
    ctx.strokeStyle = "rgba(238,231,216,0.62)";
    ctx.stroke();
    ctx.fillStyle = "#98684d";
    ctx.fillRect(width * 0.69, base - 230, width * 0.24, 230);
    ctx.fillStyle = "#153d32";
    ctx.fillRect(width * 0.69, base - 230, width * 0.24, 45);
    ctx.fillStyle = "rgba(238,231,216,0.9)";
    ctx.font = "14px Microsoft YaHei";
    ctx.fillText("乡村金融服务站", width * 0.73, base - 201);
    const nodes = [[0.22,-270],[0.48,-340],[0.68,-275],[0.84,-340]];
    ctx.strokeStyle = "rgba(200,166,83,0.7)";
    ctx.beginPath();
    nodes.forEach(([x,y], index) => index ? ctx.lineTo(width*x, base+y) : ctx.moveTo(width*x, base+y));
    ctx.stroke();
    nodes.forEach(([x,y], index) => {
      ctx.fillStyle = index === Math.floor(time/800)%nodes.length ? "#eee7d8" : "#c8a653";
      ctx.beginPath(); ctx.arc(width*x, base+y, 6, 0, Math.PI*2); ctx.fill();
    });
    ctx.fillStyle = "#496b57";
    ctx.fillRect(0, base, width, height - base);
  }

  function drawWorld(timestamp) {
    animationTime = timestamp;
    const { ctx, width, height } = fitCanvas();
    let palette = ["#6e7969", "#3d5a48", "#c39b61"];
    let roleScene = "grandparent";
    if (activeScreen === "role") {
      palette = roles[activeRole].palette;
      roleScene = activeRole;
    } else if (activeScreen === "future" || activeScreen === "ending") {
      palette = ["#789495", "#28584a", "#c8a653"];
      roleScene = "youth";
    } else if (activeScreen === "identity") {
      palette = ["#786f5e", "#29493d", "#b98859"];
      roleScene = "parent";
    }

    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, palette[0]);
    sky.addColorStop(0.58, palette[2]);
    sky.addColorStop(1, palette[1]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const sunX = width * (0.72 + Math.sin(timestamp * 0.00008) * 0.015);
    ctx.fillStyle = "rgba(218,177,88,0.55)";
    ctx.beginPath(); ctx.arc(sunX, height * 0.19, 53, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "rgba(238,231,216,0.16)";
    for (let i = 0; i < 4; i += 1) {
      const cloudX = ((timestamp * (0.004 + i * 0.0015) + i * width * 0.29) % (width + 260)) - 130;
      ctx.beginPath();
      ctx.ellipse(cloudX, height * (0.13 + i * 0.05), 75, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    drawHill(ctx, width, height * 0.52, "rgba(35,64,50,0.72)", timestamp * 0.0001);
    drawHill(ctx, width, height * 0.59, "rgba(25,54,43,0.92)", 2 + timestamp * 0.00013);

    if (roleScene === "grandparent") drawVillage(ctx, width, height, timestamp);
    if (roleScene === "parent") drawTown(ctx, width, height);
    if (roleScene === "youth") drawFuture(ctx, width, height, timestamp);

    ctx.fillStyle = "rgba(238,231,216,0.11)";
    let seed = 991;
    for (let i = 0; i < 160; i += 1) {
      seed = (seed * 16807) % 2147483647;
      const x = (seed / 2147483647) * width;
      seed = (seed * 16807) % 2147483647;
      const y = (seed / 2147483647) * height;
      ctx.fillRect(x, y, 1, 1);
    }
    requestAnimationFrame(drawWorld);
  }

  window.addEventListener("resize", () => fitCanvas());

  updateGlobalProgress();
  updateFuture();
  showScreen("title");
  requestAnimationFrame(drawWorld);
})();
