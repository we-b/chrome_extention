// AIカレッジコース一括登録機能（ページリロード対応版）
(function() {
  'use strict';

  // 登録対象コースデータ
  const coursesToRegister = [
    { courseId: 369, displayOrder: 0, name: '【AIカレッジ】初期設備ユーザー_ver.1.0' },
    { courseId: 376, displayOrder: 1, name: '【AIカレッジ】ビジネスAI活用「BizAI」_ver.1.0' },
    { courseId: 374, displayOrder: 2, name: '【AIカレッジ】業務効率化「BizHACK」_ver.1.0' },
    { courseId: 375, displayOrder: 3, name: '【AIカレッジ】生成AI活用マスター_ver.1.0' },
    { courseId: 311, displayOrder: 4, name: '【AIカレッジ】Webデザイン入門_ver.1.0' },
    { courseId: 360, displayOrder: 5, name: '【AIカレッジ】Webサイト制作_ver.1.1' },
    { courseId: 344, displayOrder: 6, name: '【AIカレッジ】Webアプリ開発［基礎］_ver.1.0' },
    { courseId: 306, displayOrder: 7, name: '【AIカレッジ】Webアプリ開発［応用］_ver.1.0' },
    { courseId: 307, displayOrder: 8, name: '【AIカレッジ】Webアプリ開発［発展］_ver.1.0' },
    { courseId: 345, displayOrder: 9, name: '【AIカレッジ】Webアプリ開発［Java］_ver.1.0' },
    { courseId: 312, displayOrder: 10, name: '【AIカレッジ】キャリアウィズ_ver.1.0' },
    { courseId: 313, displayOrder: 11, name: '【AIカレッジ】副業入門ガイド_ver.1.0' },
    { courseId: 248, displayOrder: 12, name: '【AIカレッジ】創作体験クエスト_ver.1.0' },
    { courseId: 343, displayOrder: 13, name: '【AIカレッジ】コンテンツラボ_ver.1.0' },
    { courseId: 390, displayOrder: 14, name: '【AIカレッジ】Webライティング_ver.1.0' },
    { courseId: 427, displayOrder: 15, name: '【AIカレッジ】AI×業務効率化_ver.1.0' },
    { courseId: 429, displayOrder: 16, name: '【AIカレッジ】AIアプリ開発コース_ver.1.0' },
    { courseId: 428, displayOrder: 17, name: '【AIカレッジ】AIエージェントコース_ver.1.0' },
    { courseId: 431, displayOrder: 18, name: '【AIカレッジ】AI駆動開発_ver.1.0' }
  ];

  // localStorage キーのベース名
  const STORAGE_KEY_BASE = 'aiCollege_bulkRegister_state';

  // URLからperiod_idを取得
  function getPeriodId() {
    const urlParams = new URLSearchParams(window.location.search);
    const periodId = urlParams.get('period_id');
    console.log('[一括登録] period_id:', periodId);
    return periodId || 'default';
  }

  // period_id固有のlocalStorageキーを生成
  function getStorageKey() {
    const periodId = getPeriodId();
    const key = `${STORAGE_KEY_BASE}_${periodId}`;
    console.log('[一括登録] storageキー:', key);
    return key;
  }

  // UI要素
  let progressElement = null;
  let statusElement = null;
  let startButton = null;
  let cancelButton = null;

  // 待機関数
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 状態を保存
  function saveState(state) {
    try {
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(state));
      console.log('[一括登録] 状態保存:', state);
    } catch (error) {
      console.error('[一括登録] 状態保存エラー:', error);
    }
  }

  // 状態を取得
  function loadState() {
    try {
      const key = getStorageKey();
      const saved = localStorage.getItem(key);
      if (saved) {
        const state = JSON.parse(saved);
        console.log('[一括登録] 状態復元:', state);
        return state;
      }
    } catch (error) {
      console.error('[一括登録] 状態取得エラー:', error);
    }
    return null;
  }

  // 状態をクリア
  function clearState() {
    try {
      const key = getStorageKey();
      localStorage.removeItem(key);
      console.log('[一括登録] 状態クリア');
    } catch (error) {
      console.error('[一括登録] 状態クリアエラー:', error);
    }
  }

  // 追加ボタンを見つける
  function findAddButton() {
    const buttons = Array.from(document.querySelectorAll('button[type="button"]'));
    return buttons.find(btn =>
      btn.textContent.includes('TC外事業用デフォルトコース') &&
      btn.textContent.includes('追加')
    );
  }

  // モーダルが開いているか確認
  function isModalOpen() {
    const modal = document.querySelector('.modal.fade.in') ||
                  document.querySelector('.modal.show') ||
                  document.querySelector('[role="dialog"][style*="display: block"]');
    return modal !== null;
  }

  // モーダル内のセレクトボックスを取得
  function getModalSelects() {
    const modal = document.querySelector('.modal.fade.in') ||
                  document.querySelector('.modal.show') ||
                  document.querySelector('[role="dialog"]');

    if (!modal) {
      console.error('[一括登録] モーダルが見つかりません');
      return null;
    }

    const selects = modal.querySelectorAll('select');

    if (selects.length < 2) {
      console.error('[一括登録] セレクトボックスが見つかりません:', selects.length);
      return null;
    }

    return {
      courseSelect: selects[0],
      orderSelect: selects[1]
    };
  }

  // モーダル内の送信ボタンを取得
  function getSubmitButton() {
    const modal = document.querySelector('.modal.fade.in') ||
                  document.querySelector('.modal.show') ||
                  document.querySelector('[role="dialog"]');

    if (!modal) return null;

    return modal.querySelector('input[type="submit"][value*="追加"]');
  }

  // フォーム送信（複数の方法を試行）
  async function submitForm(submitButton) {
    try {
      console.log('[一括登録] フォーム送信開始');

      // 方法1: submitボタンをクリック（最もシンプル）
      if (submitButton) {
        console.log('[一括登録] submitボタンをクリック');
        submitButton.click();
        return true;
      }

      console.error('[一括登録] 送信ボタンが見つかりません');
      return false;

    } catch (error) {
      console.error('[一括登録] フォーム送信エラー:', error);
      return false;
    }
  }

  // 次に登録すべきコースを取得（インデックスベース）
  function getNextCourse(currentIndex) {
    console.log('[一括登録] getNextCourse() currentIndex:', currentIndex);

    if (currentIndex >= coursesToRegister.length) {
      console.log('[一括登録] すべてのコース登録完了（インデックス超過）');
      return null; // すべて登録済み
    }

    const nextCourse = coursesToRegister[currentIndex];
    console.log('[一括登録] 次のコース（インデックス', currentIndex, '）:', nextCourse);
    return nextCourse;
  }

  // 1コース分の登録処理（ページリロード前提）
  async function registerNextCourse(currentIndex = 0) {
    console.log('[一括登録] === registerNextCourse() 開始 ===');
    console.log('[一括登録] currentIndex:', currentIndex);

    try {
      const nextCourse = getNextCourse(currentIndex);

      if (!nextCourse) {
        console.log('[一括登録] すべてのコースが登録済みです');
        return { finished: true, success: true };
      }

      const totalCount = coursesToRegister.length;
      const completedCount = currentIndex;

      updateStatus(`コース登録中: ${completedCount + 1}/${totalCount} - ${nextCourse.name}`);
      updateProgress(completedCount, totalCount);
      console.log(`[一括登録] ${completedCount + 1}/${totalCount}: ${nextCourse.name} (ID: ${nextCourse.courseId}, Order: ${nextCourse.displayOrder})`);

      // 追加ボタンをクリック
      const addButton = findAddButton();
      if (!addButton) {
        throw new Error('追加ボタンが見つかりません');
      }

      addButton.click();
      console.log('[一括登録] 追加ボタンをクリックしました');

      // モーダルが開くまで待機
      await wait(1500);

      if (!isModalOpen()) {
        throw new Error('モーダルが開きませんでした');
      }

      // セレクトボックスを取得
      const selects = getModalSelects();
      if (!selects) {
        throw new Error('セレクトボックスが見つかりません');
      }

      // コースIDを設定
      selects.courseSelect.value = String(nextCourse.courseId);
      selects.courseSelect.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`[一括登録] コースID設定: ${nextCourse.courseId}`);

      await wait(300);

      // 表示順を設定
      selects.orderSelect.value = String(nextCourse.displayOrder);
      selects.orderSelect.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`[一括登録] 表示順設定: ${nextCourse.displayOrder}`);

      await wait(500);

      // 送信ボタンを取得して送信
      const submitButton = getSubmitButton();
      if (!submitButton) {
        throw new Error('送信ボタンが見つかりません');
      }

      // ページがリロードされることを想定して、状態を保存してから送信
      const nextIndex = currentIndex + 1;
      console.log('[一括登録] 次のインデックスを保存:', nextIndex);
      saveState({
        active: true,
        currentIndex: nextIndex,
        lastRegisteredCourseId: nextCourse.courseId,
        timestamp: Date.now()
      });

      const submitSuccess = await submitForm(submitButton);
      if (!submitSuccess) {
        throw new Error('フォーム送信に失敗しました');
      }

      console.log(`[一括登録] フォーム送信完了、ページリロード待機中...`);

      // ページがリロードされるため、ここで処理は終了
      return { finished: false, success: true, willReload: true };

    } catch (error) {
      console.error(`[一括登録] 登録失敗:`, error);
      updateStatus(`エラー: ${error.message}`);
      return { finished: false, success: false, error: error.message };
    }
  }

  // 一括登録を開始
  async function startBulkRegistration() {
    console.log('[一括登録] 一括登録開始');

    const message = `${coursesToRegister.length}コースを順次登録します`;

    if (!confirm(message + '\n\n実行してよろしいですか？\n\n※ページが自動的にリロードされます\n※既に登録済みのコースがある場合はスキップしてください')) {
      updateStatus('キャンセルされました');
      return;
    }

    // ボタンを無効化
    if (startButton) {
      startButton.disabled = true;
      startButton.textContent = '登録中...';
    }

    // 状態を保存して開始（インデックス0から）
    saveState({
      active: true,
      currentIndex: 0,
      startTime: Date.now(),
      timestamp: Date.now()
    });

    // 最初のコースを登録
    await registerNextCourse(0);
  }

  // 一括登録を継続（ページリロード後）
  async function continueBulkRegistration(currentIndex) {
    console.log('[一括登録] 一括登録を継続します currentIndex:', currentIndex);

    // ボタンを無効化
    if (startButton) {
      startButton.disabled = true;
      startButton.textContent = '登録中...';
    }

    // 次のコースを登録
    await registerNextCourse(currentIndex);
  }

  // 一括登録をキャンセル
  function cancelBulkRegistration() {
    console.log('[一括登録] 一括登録をキャンセル');
    clearState();
    updateStatus('キャンセルされました');
    updateProgress(0, coursesToRegister.length);

    if (startButton) {
      startButton.disabled = false;
      startButton.textContent = '一括登録開始（19コース）';
    }
  }

  // 一括登録を完了
  function completeBulkRegistration() {
    console.log('[一括登録] 一括登録完了');
    clearState();

    const message = `登録完了！\n全${coursesToRegister.length}コースの登録処理が完了しました`;

    alert(message);
    updateStatus(message.replace(/\n/g, ' '));
    updateProgress(coursesToRegister.length, coursesToRegister.length);

    if (startButton) {
      startButton.disabled = false;
      startButton.textContent = '一括登録開始（19コース）';
    }
  }

  // 進捗表示を更新
  function updateProgress(current, total) {
    if (progressElement) {
      progressElement.textContent = `進捗: ${current}/${total}`;
    }
  }

  // ステータス表示を更新
  function updateStatus(message) {
    if (statusElement) {
      statusElement.textContent = message;
    }
    console.log('[一括登録]', message);
  }

  // UIボタンを追加
  function addBulkRegistrationButton() {
    // 既にボタンが存在する場合はスキップ
    if (document.getElementById('bulk-register-btn')) {
      return;
    }

    // ボタンを配置する場所を探す（追加ボタンの近くに配置）
    const addButton = findAddButton();
    if (!addButton) {
      console.warn('[一括登録] 追加ボタンが見つからないため、UIボタンを配置できません');
      return;
    }

    // コンテナを作成
    const container = document.createElement('div');
    container.id = 'bulk-register-container';
    container.style.cssText = 'margin: 15px 0; padding: 15px; background-color: #f0f8ff; border: 1px solid #4a90e2; border-radius: 5px;';

    // タイトル
    const title = document.createElement('div');
    title.textContent = 'AIカレッジコース一括登録（自動リロード対応）';
    title.style.cssText = 'font-weight: bold; margin-bottom: 10px; color: #333;';
    container.appendChild(title);

    // ボタン行
    const buttonRow = document.createElement('div');
    buttonRow.style.cssText = 'margin-bottom: 10px;';

    // 開始ボタン
    startButton = document.createElement('button');
    startButton.id = 'bulk-register-btn';
    startButton.textContent = '一括登録開始（19コース）';
    startButton.className = 'btn btn-primary';
    startButton.style.marginRight = '10px';
    startButton.onclick = startBulkRegistration;
    buttonRow.appendChild(startButton);

    // キャンセルボタン
    cancelButton = document.createElement('button');
    cancelButton.textContent = 'キャンセル';
    cancelButton.className = 'btn btn-warning';
    cancelButton.onclick = cancelBulkRegistration;
    buttonRow.appendChild(cancelButton);

    container.appendChild(buttonRow);

    // 進捗表示
    progressElement = document.createElement('div');
    progressElement.style.cssText = 'margin-bottom: 5px; color: #555; font-weight: bold;';
    progressElement.textContent = '進捗: 0/19';
    container.appendChild(progressElement);

    // ステータス表示
    statusElement = document.createElement('div');
    statusElement.style.cssText = 'color: #666; font-size: 0.9em;';
    statusElement.textContent = '待機中';
    container.appendChild(statusElement);

    // 追加ボタンの親要素に挿入
    const targetParent = addButton.parentElement;
    targetParent.insertBefore(container, addButton);

    console.log('[一括登録] UIボタンを追加しました');
  }

  // ページ読み込み時の初期化
  function initialize() {
    console.log('[一括登録] initialize() 呼び出し');
    console.log('[一括登録] 現在のURL:', window.location.href);

    // 対象ページかどうか確認
    const url = window.location.href;
    if (!url.includes('/admin/curriculums/another_tc_business_department_default_courses/edit')) {
      console.log('[一括登録] 対象ページではありません');
      return;
    }

    console.log('[一括登録] 初期化開始');

    // localStorageの状態を確認
    const currentState = loadState();
    console.log('[一括登録] 現在の保存状態:', currentState);

    // UIボタンを追加（DOMが完全に読み込まれるまで待機）
    const checkInterval = setInterval(() => {
      const addButton = findAddButton();
      if (addButton) {
        clearInterval(checkInterval);
        addBulkRegistrationButton();

        // 保存された状態を確認
        const state = loadState();
        console.log('[一括登録] UI追加後の状態確認:', state);

        if (state && state.active) {
          console.log('[一括登録] アクティブな状態を検出、処理を継続します');
          const timeSinceUpdate = Date.now() - state.timestamp;
          console.log('[一括登録] 前回の更新からの経過時間:', timeSinceUpdate, 'ms');

          // タイムアウトチェック（5分以上経過している場合は状態をクリア）
          if (timeSinceUpdate > 5 * 60 * 1000) {
            console.warn('[一括登録] 状態がタイムアウトしました');
            clearState();
            updateStatus('タイムアウト: 処理が中断されました');
            return;
          }

          // 現在のインデックスを取得
          const currentIndex = state.currentIndex || 0;
          const remainingCount = coursesToRegister.length - currentIndex;
          console.log('[一括登録] 現在のインデックス:', currentIndex);
          console.log('[一括登録] 残りコース数:', remainingCount);

          if (remainingCount <= 0 || currentIndex >= coursesToRegister.length) {
            // すべて登録完了
            console.log('[一括登録] すべてのコースが登録完了しました');
            completeBulkRegistration();
          } else {
            // まだ登録すべきコースがある場合は継続
            console.log('[一括登録] 次のコース登録を開始します');
            updateStatus('前回の続きから登録を再開します...');
            updateProgress(currentIndex, coursesToRegister.length);

            // すぐに次のコースを登録（setTimeoutを使わない）
            console.log('[一括登録] continueBulkRegistration() を呼び出します');
            continueBulkRegistration(currentIndex);
          }
        } else {
          console.log('[一括登録] アクティブな状態なし、通常の初期表示');
          // 通常の初期表示
          updateProgress(0, coursesToRegister.length);
          updateStatus('待機中');
        }
      }
    }, 500);

    // 10秒経っても見つからない場合はタイムアウト
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);
  }

  // ページ読み込み完了後に初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();
