document.getElementById('copyButton').addEventListener('click', async () => {
  try {
    // 現在のウィンドウの全タブを取得
    const tabs = await chrome.tabs.query({ currentWindow: true });
    
    // URLを改行で結合
    const urls = tabs.map(tab => tab.url).join('\n');
    
    // クリップボードにコピー
    await navigator.clipboard.writeText(urls);
    
    // ボタンのテキストを一時的に変更
    const button = document.getElementById('copyButton');
    const originalText = button.textContent;
    button.textContent = 'コピー完了！';
    button.style.backgroundColor = '#45a049';
    
    // 2秒後に元のテキストに戻す
    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = '#4CAF50';
    }, 2000);
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}); 