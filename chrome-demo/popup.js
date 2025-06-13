document.getElementById('helloBtn').addEventListener('click', function() {
  alert('Hello from Chrome Extension!');
});

document.getElementById('copyTextBtn').addEventListener('click', async function() {
  // 向当前活动页面注入脚本，提取所有可见文字
  if (!chrome.tabs) {
    alert('请在Chrome扩展环境下使用');
    return;
  }
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  if (!tab || !tab.id) {
    alert('未找到活动页面');
    return;
  }
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    func: () => {
      // 提取body下所有可见文字
      function getVisibleText(element) {
        if (element.nodeType === Node.TEXT_NODE) {
          return element.textContent;
        }
        if (element.nodeType !== Node.ELEMENT_NODE) return '';
        const style = window.getComputedStyle(element);
        if (style && (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0')) {
          return '';
        }
        let text = '';
        for (const child of element.childNodes) {
          text += getVisibleText(child);
        }
        return text;
      }
      return getVisibleText(document.body).replace(/\s+/g, ' ').trim();
    },
  }, async (results) => {
    if (chrome.runtime.lastError || !results || !results[0]) {
      alert('提取失败');
      return;
    }
    const text = results[0].result;
    try {
      await navigator.clipboard.writeText(text);
      alert('页面文字已复制！');
    } catch (e) {
      alert('复制失败：' + e.message);
    }
  });
}); 