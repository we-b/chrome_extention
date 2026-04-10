// コース選択のフィルタリング機能
(function() {
  'use strict';

  // フィルタリング対象のコース名キーワード
  const courseNameKeyword = 'AIカレッジ';

  // フィルタリング済みかどうかを記録
  const filteredSelects = new WeakSet();

  // イベントリスナー設定済みかどうかを記録
  const setupSelects = new WeakSet();

  // セレクトボックスの選択肢をフィルタリングする関数
  function filterCourseOptions(selectElement) {
    if (!selectElement) return;

    // すでにフィルタリング済みの場合はスキップ
    if (filteredSelects.has(selectElement)) return;

    const options = selectElement.querySelectorAll('option');

    options.forEach(option => {
      // 空のオプション（プレースホルダー）はスキップ
      if (!option.value || option.value === '') {
        return;
      }

      const optionText = option.textContent.trim();

      // コース名にキーワードが含まれていない場合は非表示
      if (!optionText.includes(courseNameKeyword)) {
        option.style.display = 'none';
        option.disabled = true;
      }
    });

    // フィルタリング済みとしてマーク
    filteredSelects.add(selectElement);
  }

  // セレクトボックスにイベントリスナーを設定
  function setupFilterListener() {
    const selectElements = document.querySelectorAll('.js-select_course.input-sm.form-control');

    selectElements.forEach(select => {
      // id="course_id"の要素のみを対象とする
      if (select.id !== 'course_id') {
        return;
      }

      // すでにイベントリスナーを設定済みの場合はスキップ
      if (setupSelects.has(select)) {
        return;
      }

      // クリック時にフィルタリングを実行
      select.addEventListener('click', function() {
        filterCourseOptions(this);
      });

      // フォーカス時にもフィルタリングを実行（キーボード操作対応）
      select.addEventListener('focus', function() {
        filterCourseOptions(this);
      });

      // イベントリスナー設定済みとしてマーク
      setupSelects.add(select);
    });
  }

  // ページ読み込み完了後に実行（初回のみ）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFilterListener);
  } else {
    setupFilterListener();
  }
})();
