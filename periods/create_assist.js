// 受講期作成アシスト
// 1) /admin/periods/new: 期一覧から最新のスキカレ期を調べ、次のレギュラー期
//    (期名・期番号・開始日)を自動入力する。送信はTM標準の「新規登録する」ボタンのまま
//    (押す前に本人がフォームの値を確認する)。
// 2) 作成後の /admin/periods 配下ページ: 作成した期を名前で探して period_id を特定し、
//    デフォルトコース一括登録ページへの導線を表示する
(function () {
  'use strict';

  const STORAGE_KEY = 'periodCreateAssist_pending';
  const PENDING_TTL_MS = 10 * 60 * 1000; // 10分で失効

  function savePending(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, timestamp: Date.now() }));
  }

  function loadPending() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (Date.now() - data.timestamp > PENDING_TTL_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  }

  function clearPending() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // ---------- 共通UI ----------

  function createButton(label, primary, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.className = primary ? 'btn btn-primary' : 'btn btn-default';
    btn.style.marginRight = '10px';
    btn.onclick = onClick;
    return btn;
  }

  // ---------- 作成ページ(/admin/periods/new) ----------

  function findNameInput() {
    return (
      document.getElementById('period_name') ||
      document.querySelector('input[name="period[name]"]')
    );
  }

  function getStartSelects() {
    const parts = {};
    for (let i = 1; i <= 3; i++) {
      const el = document.getElementById(`period_start_datetime_${i}i`);
      if (el) parts[i] = el;
    }
    return parts[1] && parts[2] && parts[3] ? parts : null;
  }

  // 期一覧から最新のスキカレ期(term最大)とその開始日を取得
  async function fetchLatestRegular() {
    const res = await fetch('/admin/periods', { credentials: 'same-origin' });
    if (!res.ok) return null;
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    let best = null;
    for (const row of doc.querySelectorAll('tr')) {
      const text = row.textContent;
      const nameMatch = text.match(/スキカレ_第(\d+)期/);
      if (!nameMatch) continue;
      const n = parseInt(nameMatch[1], 10);
      const dateMatch = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/); // 最初の日付=開始日
      if (!dateMatch) continue;
      if (!best || n > best.n) {
        best = { n, y: +dateMatch[1], mo: +dateMatch[2], d: +dateMatch[3] };
      }
    }
    return best;
  }

  // レギュラーの次期: 1日開始→同月16日 / 16日開始→翌月1日
  function computeNext(latest) {
    let y = latest.y;
    let mo = latest.mo;
    let d;
    if (latest.d === 1) {
      d = 16;
    } else {
      d = 1;
      mo += 1;
      if (mo > 12) { mo = 1; y += 1; }
    }
    return { n: latest.n + 1, y, mo, d };
  }

  function fillNextRegular(next) {
    const problems = [];

    const nameInput = findNameInput();
    if (nameInput) {
      nameInput.value = `スキカレ_第${next.n}期`;
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      problems.push('期名の入力欄が見つかりません(period_name)');
    }

    const termInput = document.getElementById('period_term');
    if (termInput) {
      termInput.value = String(next.n);
      termInput.dispatchEvent(new Event('input', { bubbles: true }));
      termInput.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      problems.push('期番号の入力欄が見つかりません(period_term)');
    }

    const start = getStartSelects();
    if (start) {
      start[1].value = String(next.y);
      start[2].value = String(next.mo);
      start[3].value = String(next.d);
      [start[1], start[2], start[3]].forEach((el) =>
        el.dispatchEvent(new Event('change', { bubbles: true }))
      );
    } else {
      problems.push('開始日のセレクトボックスが見つかりません(period_start_datetime_1i〜3i)');
    }

    return problems;
  }

  function clearAutofill(original) {
    const nameInput = findNameInput();
    if (nameInput) nameInput.value = original.name;
    const termInput = document.getElementById('period_term');
    if (termInput) termInput.value = original.term;
    const start = getStartSelects();
    if (start) {
      start[1].value = original.startY;
      start[2].value = original.startM;
      start[3].value = original.startD;
    }
  }

  function addAutofillBanner(form) {
    if (document.getElementById('period-create-assist')) return;

    const banner = document.createElement('div');
    banner.id = 'period-create-assist';
    banner.style.cssText =
      'margin: 15px 0; padding: 12px 15px; background-color: #f0fff4; border: 2px solid #2e8b57; border-radius: 5px; font-size: 14px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-weight: bold; margin-bottom: 6px; color: #1a5c38;';
    title.textContent = '受講期作成アシスト';
    const body = document.createElement('div');
    body.style.cssText = 'margin-bottom: 8px; color: #333;';
    body.textContent = '期一覧を確認中...';
    banner.append(title, body);

    form.parentElement.insertBefore(banner, form);
    return { banner, body };
  }

  async function initCreatePage() {
    const form =
      document.querySelector('form[action*="/admin/periods"]') || document.querySelector('form');
    if (!form) return;

    // 送信時に期名を控えておく(作成後ページでperiod_idを特定してコース付与へつなぐ)
    form.addEventListener('submit', () => {
      const nameInput = findNameInput();
      if (nameInput && nameInput.value.trim()) {
        savePending({ periodName: nameInput.value.trim() });
      }
    });

    const ui = addAutofillBanner(form);
    if (!ui) return;

    // クリア用に現在値を控える
    const nameInput = findNameInput();
    const termInput = document.getElementById('period_term');
    const start = getStartSelects();
    const original = {
      name: nameInput ? nameInput.value : '',
      term: termInput ? termInput.value : '',
      startY: start ? start[1].value : '',
      startM: start ? start[2].value : '',
      startD: start ? start[3].value : '',
    };

    let latest = null;
    try {
      latest = await fetchLatestRegular();
    } catch (e) {
      latest = null;
    }

    if (!latest) {
      ui.body.textContent =
        '期一覧からスキカレ期を取得できませんでした。自動入力なし(手動で入力してください)。';
      return;
    }

    const next = computeNext(latest);
    const problems = fillNextRegular(next);

    if (problems.length > 0) {
      ui.body.textContent = `フォームの項目が想定と違うため自動入力を中止しました: ${problems.join(' / ')}`;
      return;
    }

    ui.body.innerHTML = '';
    const line1 = document.createElement('div');
    line1.textContent = `次のレギュラー期を自動入力しました: スキカレ_第${next.n}期(term ${next.n}・開始 ${next.y}/${next.mo}/${next.d})`;
    const line2 = document.createElement('div');
    line2.style.cssText = 'color: #666; margin-top: 4px;';
    line2.textContent = `根拠: TMの最新スキカレ期=第${latest.n}期(開始 ${latest.y}/${latest.mo}/${latest.d})。LPの申込欄と期番号が一致するか確認のうえ、下のフォームの値を確認して「新規登録する」を押してください。`;
    ui.body.append(line1, line2);

    ui.banner.appendChild(
      createButton('自動入力をクリア(短期集中などを作るとき)', false, () => {
        clearAutofill(original);
        ui.body.textContent = '自動入力をクリアしました。手動で入力してください。';
      })
    );
  }

  // ---------- 作成後ページ(/admin/periods 配下) ----------

  function findPeriodIdByName(name) {
    // ページ内のリンクから /admin/periods/:id を探し、行テキストに期名を含むものを返す
    const links = [...document.querySelectorAll('a[href*="/admin/periods/"]')];
    for (const link of links) {
      const m = link.href.match(/\/admin\/periods\/(\d+)/);
      if (!m) continue;
      const row = link.closest('tr') || link.parentElement;
      const text = (row ? row.textContent : link.textContent) || '';
      if (text.includes(name)) return m[1];
    }
    // 詳細ページ(URL自体がid)の場合: ページ本文に期名があればURLのidを使う
    const urlMatch = location.pathname.match(/^\/admin\/periods\/(\d+)/);
    if (urlMatch && document.body.textContent.includes(name)) return urlMatch[1];
    return null;
  }

  function addPostCreateBanner(pending) {
    if (document.getElementById('period-create-assist-banner')) return;
    const periodId = findPeriodIdByName(pending.periodName);

    const banner = document.createElement('div');
    banner.id = 'period-create-assist-banner';
    banner.style.cssText =
      'position: fixed; top: 10px; right: 10px; z-index: 9999; max-width: 420px; padding: 15px; background: #f0fff4; border: 2px solid #2e8b57; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-size: 14px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-weight: bold; margin-bottom: 8px; color: #1a5c38;';
    const body = document.createElement('div');
    body.style.cssText = 'margin-bottom: 10px;';

    if (periodId) {
      title.textContent = '受講期作成アシスト: 期を確認しました';
      body.textContent = `「${pending.periodName}」(period_id: ${periodId})。続けてデフォルトコースの一括登録ページへ進めます。`;
      banner.append(title, body);
      banner.appendChild(
        createButton('デフォルトコース付与へ進む', true, () => {
          clearPending();
          location.href = `/admin/curriculums/another_tc_business_department_default_courses/edit?period_id=${periodId}`;
        })
      );
    } else {
      title.textContent = '受講期作成アシスト: 期がまだ見つかりません';
      body.textContent = `このページで「${pending.periodName}」を確認できませんでした。期一覧で作成結果を確認してください(作成に失敗している可能性もあります)。`;
      banner.append(title, body);
    }

    banner.appendChild(
      createButton('閉じる', false, () => {
        clearPending();
        banner.remove();
      })
    );

    document.body.appendChild(banner);
  }

  // ---------- 初期化 ----------

  function initialize() {
    if (location.pathname === '/admin/periods/new') {
      initCreatePage();
      return;
    }
    const pending = loadPending();
    if (pending && pending.periodName) {
      addPostCreateBanner(pending);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
