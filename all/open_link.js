
let isDragging = false;
let currentKey = null;
let startDragX, startDragY;
let selectedKey = 'z'; 
let conversionKey = 'x'; 
let boxElement, links = [];
let originalSelection = null;

document.addEventListener('keydown', (e) => {
    if (e.key === selectedKey || e.key === conversionKey) {
        currentKey = e.key;
        document.addEventListener('mousedown', onMouseDown);
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === selectedKey || e.key === conversionKey) {
        currentKey = null;
    }
});

function onMouseDown(e) {
    if (!currentKey) {
        document.removeEventListener('mousedown', onMouseDown);
        return;
    }

    isDragging = true;
    startDragX = e.clientX;
    startDragY = e.clientY;

    originalSelection = window.getSelection().toString();

    boxElement = document.createElement('div');
    boxElement.style.position = 'fixed';
    boxElement.style.border = '2px dashed red';
    boxElement.style.zIndex = '9999';
    boxElement.style.pointerEvents = 'none';
    document.body.appendChild(boxElement);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e) {
    if (!isDragging || !currentKey) return;

    const width = e.clientX - startDragX;
    const height = e.clientY - startDragY;

    boxElement.style.left = `${startDragX}px`;
    boxElement.style.top = `${startDragY}px`;
    boxElement.style.width = `${width}px`;
    boxElement.style.height = `${height}px`;

    links.forEach(link => {
        link.style.border = '';
    });

    links = Array.from(document.querySelectorAll('a')).filter(link => {
        const rect = link.getBoundingClientRect();
        return !(rect.right < startDragX || rect.left > e.clientX || rect.bottom < startDragY || rect.top > e.clientY);
    });

    links.forEach(link => {
        link.style.border = '1px solid red';
    });

    window.getSelection().removeAllRanges();
}

function onMouseUp(e) {
    if (currentKey === selectedKey) {
        links.forEach(link => {
            window.open(link.href, '_blank');
        });
    } else if (currentKey === conversionKey) {
        links.forEach(link => {
            const newUrl = link.href.replace('/v2/curriculums/', '/admin/curriculums/') + '/write';
            window.open(newUrl, '_blank');
        });
    }

    document.body.removeChild(boxElement);
    links.forEach(link => {
        link.style.border = '';
    });
    links = [];

    if (originalSelection) {
        const range = document.createRange();
        range.selectNodeContents(document.body);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    currentKey = null;
}

try {
    chrome.storage.sync.get(['selectedKey', 'conversionKey'], (result) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }

        if (result.selectedKey) {
            selectedKey = result.selectedKey;
        } else {
            selectedKey = 'z';
            chrome.storage.sync.set({ selectedKey: 'z' });
        }

        if (result.conversionKey) {
            conversionKey = result.conversionKey;
        } else {
            conversionKey = 'x';
            chrome.storage.sync.set({ conversionKey: 'x' });
        }
    });
} catch (error) {
    console.error('Error retrieving keys from storage:', error);
}

