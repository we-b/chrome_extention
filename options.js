
const selectedKeyElement = document.getElementById('selectedKey');
const conversionKeyElement = document.getElementById('conversionKey');
const saveButton = document.getElementById('save');

const keys = 'abcdefghijklmnopqrstuvwxyz'.split('');

keys.forEach(key => {
    const option1 = document.createElement('option');
    option1.value = key;
    option1.textContent = key;
    selectedKeyElement.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = key;
    option2.textContent = key;
    conversionKeyElement.appendChild(option2);
});

chrome.storage.sync.get(['selectedKey', 'conversionKey'], (result) => {
    if (result.selectedKey) selectedKeyElement.value = result.selectedKey;
    if (result.conversionKey) conversionKeyElement.value = result.conversionKey;
});

saveButton.addEventListener('click', () => {
    chrome.storage.sync.set({
        selectedKey: selectedKeyElement.value,
        conversionKey: conversionKeyElement.value
    }, () => {
        alert('正常に保存されました!');
    });
});

