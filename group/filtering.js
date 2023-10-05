// プルダウンメニューを選択
let select = document.querySelector('select');

if (select) {
    // テキストボックスを作成
    let textBox = document.createElement('input');
    textBox.type = 'text';
    textBox.style.marginTop = '1em';  // テキストボックスの上に1行分の空白を設ける
    textBox.placeholder = 'フィルタリング文字列';  // プレースホルダーを追加

    // セレクトボックスのmousedownイベントリスナーを追加
    select.addEventListener('mousedown', function() {
        let filterText = textBox.value.toLowerCase();
        
        // テキストボックスに何も入力されていない場合は何も行わない
        if (filterText) {
            Array.from(select.options).forEach(function(option) {
                if (option.textContent.toLowerCase().includes(filterText)) {
                    option.style.display = "";
                } else {
                    option.style.display = "none";
                }
            });
        } else {
            Array.from(select.options).forEach(function(option) {
                option.style.display = "";
            });
        }
    });

    // プルダウンメニューの下にテキストボックスを追加
    select.parentNode.insertBefore(textBox, select.nextSibling);
}
