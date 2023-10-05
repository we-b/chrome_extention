let dropdowns = document.querySelectorAll('select');

dropdowns.forEach(select => {
  // 各プルダウンメニューのすべてのオプションをループする
  for (let i = 0; i < select.options.length; i++) {
    let option = select.options[i];
    let value = option.value;
    option.textContent = `${value} ${option.textContent}`;
  }
});