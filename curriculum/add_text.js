// プルダウンメニューを選択
let select = document.querySelector('select');
let textarea = document.querySelector('textarea'); // textarea要素を直接取得

if (select && textarea) {
    // infoボタンを作成
    let infoButton = createStyledButton('info', '### <i class="icon information"></i>');

    // attentionボタンを作成
    let attentionButton = createStyledButton('attention', '##### <i class="icon attention"></i>');
    attentionButton.style.marginLeft = '1ch'; // infoボタンの右側に1文字分のスペースを開ける

    // プルダウンメニューの下にボタンを追加
    let breakElementBefore = document.createElement('div');
    breakElementBefore.style.height = '1em';
    let breakElementAfter = document.createElement('div');
    breakElementAfter.style.height = '1em';

    select.parentNode.insertBefore(breakElementBefore, select.nextSibling);
    select.parentNode.insertBefore(infoButton, breakElementBefore.nextSibling);
    select.parentNode.insertBefore(attentionButton, infoButton.nextSibling);
    select.parentNode.insertBefore(breakElementAfter, attentionButton.nextSibling);
}

// カーソル位置にテキストを挿入する関数
function insertTextAtCursor(textarea, text) {
    let cursorPosition = textarea.selectionStart;
    let textValue = textarea.value;
    textarea.value = textValue.slice(0, cursorPosition) + text + textValue.slice(cursorPosition);
}

// スタイル付きのボタンを作成する関数
function createStyledButton(textContent, insertText) {
    let button = document.createElement('button');
    button.textContent = textContent;
    button.style.backgroundColor = '#1F6CB3'; // ボタンの色を「1F6CB3」に設定
    button.style.color = 'white'; // テキストの色を白に設定（背景色が濃いため）
    button.style.borderRadius = '2px';
    button.style.borderColor = '#ddd';
    button.style.borderWidth = '1px';
    button.style.borderStyle = 'solid';
    button.style.height = '30px';
    button.style.fontSize = '14px';
    button.addEventListener('click', function(event) {
        event.preventDefault();
        insertTextAtCursor(textarea, insertText);
    });
    return button;
}
