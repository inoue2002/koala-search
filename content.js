// Amazonのページからデータを取得
function getISBN() {
  const detailBullets = document.querySelector('#detailBullets_feature_div');
  if (!detailBullets) return null;

  const listItems = detailBullets.querySelectorAll('li');
  let isbn10 = '';
  let isbn13 = '';

  listItems.forEach(item => {
    const text = item.textContent;
    if (text.includes('ISBN-10')) {
      isbn10 = text.split(':')[1].trim().replace(/[^0-9X]/g, '');
    }
    if (text.includes('ISBN-13')) {
      isbn13 = text.split(':')[1].trim().replace(/[^0-9X]/g, '');
    }
  });

  return { isbn10, isbn13 };
}

// 固定位置のアイコンを作成
function createFloatingIcon(isAvailable = false) {
  const iconContainer = document.createElement('div');
  iconContainer.style.cssText = `
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 9999;
    width: 48px;
    height: 48px;
    cursor: pointer;
    background-color: white;
    border-radius: 50%;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  `;
  iconContainer.innerHTML = isAvailable ? 
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#51cf66"><path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H3V6h18v12z"/><path d="M6 8h12v2H6zm0 4h12v2H6z"/></svg>' :
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#ff6b6b"><path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H3V6h18v12z"/><path d="M6 8h12v2H6zm0 4h12v2H6z"/></svg>';

  // ホバーエフェクト
  iconContainer.addEventListener('mouseenter', () => {
    iconContainer.style.transform = 'translateY(-50%) scale(1.1)';
  });
  iconContainer.addEventListener('mouseleave', () => {
    iconContainer.style.transform = 'translateY(-50%) scale(1)';
  });

  return iconContainer;
}

// ポップアップを表示する関数
function showPopup() {
  chrome.runtime.sendMessage({ action: 'openPopup' });
}

// ページ読み込み完了時に実行
window.addEventListener('load', async () => {
  const isbnData = getISBN();
  if (isbnData) {
    // ISBNをストレージに保存
    chrome.storage.local.set({ isbn: isbnData.isbn10 });

    try {
      // 図書館での検索を実行
      const result = await searchBook(isbnData.isbn10);
      
      // 検索結果をストレージに保存
      chrome.storage.local.set({ 
        searchResult: {
          basicInfo: result.basicInfo,
          bookDetails: result.bookDetails,
          holdingInfo: result.holdingInfo ? result.holdingInfo.outerHTML : null,
          isAvailable: result.isAvailable,
          timestamp: Date.now()
        }
      });
      
      // アイコンを表示
      const icon = createFloatingIcon(result.isAvailable);
      document.body.appendChild(icon);

      // クリックイベントの追加
      icon.addEventListener('click', showPopup);

      // 本が見つかった場合は自動でポップアップを表示
      if (result.isAvailable) {
        // 少し遅延を入れてポップアップを表示（アイコンの表示後）
        setTimeout(showPopup, 500);
      }

    } catch (error) {
      console.error('Error searching library:', error);
      // エラー時は未所蔵アイコンを表示
      const icon = createFloatingIcon(false);
      document.body.appendChild(icon);
      icon.addEventListener('click', showPopup);
    }
  }
}); 