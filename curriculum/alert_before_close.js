let userHasInteracted = false;
let hasProcessedModal = false; // モーダルの処理が実行されたかどうかをトラックするためのフラグ

// モーダルが表示されたときの処理を監視
const observer = new MutationObserver(mutations => {
    if (hasProcessedModal) return; // すでに処理済みなら何もしない

    const modalTitleElement = document.querySelector('.modal-title');
    if (modalTitleElement && modalTitleElement.textContent === 'タイトル画像設定') {
        document.getElementById('c_title_image_title').value = '-';
        document.getElementById('c_title_image_description').value = '-';
        document.getElementById('c_title_image_content').click();
        hasProcessedModal = true; // 処理が実行されたのでフラグをセット
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// ユーザーの操作を検出する
document.addEventListener('input', function(e) {
    if (e.target && e.target.tagName === 'TEXTAREA') {
        userHasInteracted = true;
        setBeforeUnload(true);
    }
}, true);

// submitボタンをクリックしたときの処理
document.addEventListener('click', function(e) {
    if (e.target && e.target.matches('input[type="submit"]')) {
        userHasInteracted = false;
        setBeforeUnload(false);
    }
});

// beforeunloadイベントの設定または解除
function setBeforeUnload(enable) {
    if (enable) {
        window.addEventListener('beforeunload', handleBeforeUnload);
    } else {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    }
}

// beforeunloadイベントハンドラ
function handleBeforeUnload(e) {
    if (userHasInteracted) {
        e.preventDefault();
        e.returnValue = '変更内容が保存されていません。このページから離れますか？';
    }
}
