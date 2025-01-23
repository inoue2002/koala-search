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
function createFloatingIcon(state = 'loading') {
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

  let iconSvg;
  switch (state) {
    case 'available':
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#51cf66"><path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H3V6h18v12z"/><path d="M6 8h12v2H6zm0 4h12v2H6z"/></svg>';
      break;
    case 'unavailable':
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#ff6b6b"><path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H3V6h18v12z"/><path d="M6 8h12v2H6zm0 4h12v2H6z"/></svg>';
      break;
    case 'loading':
    default:
      iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#ffd43b"><path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H3V6h18v12z"/><path d="M6 8h12v2H6zm0 4h12v2H6z"/></svg>';
      // ローディングアニメーション
      iconContainer.style.animation = 'spin 1s linear infinite';
      break;
  }

  iconContainer.innerHTML = iconSvg;

  // スタイルシートにアニメーションを追加
  if (!document.getElementById('koala-search-styles')) {
    const style = document.createElement('style');
    style.id = 'koala-search-styles';
    style.textContent = `
      @keyframes spin {
        0% { transform: translateY(-50%) rotate(0deg); }
        100% { transform: translateY(-50%) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  // ホバーエフェクト
  iconContainer.addEventListener('mouseenter', () => {
    if (state !== 'loading') {
      iconContainer.style.transform = 'translateY(-50%) scale(1.1)';
    }
  });
  iconContainer.addEventListener('mouseleave', () => {
    if (state !== 'loading') {
      iconContainer.style.transform = 'translateY(-50%) scale(1)';
    }
  });

  return iconContainer;
}

// ポップアップを表示する関数
function showPopup() {
  chrome.runtime.sendMessage({ action: 'openPopup' });
}

// アイコンを更新する関数
function updateIcon(state) {
  const existingIcon = document.querySelector('.koala-search-icon');
  if (existingIcon) {
    const newIcon = createFloatingIcon(state);
    existingIcon.replaceWith(newIcon);
    newIcon.classList.add('koala-search-icon');
    if (state !== 'loading') {
      newIcon.addEventListener('click', showPopup);
    }
  }
}

// ページ読み込み完了時に実行
window.addEventListener('load', async () => {
  const isbnData = getISBN();
  if (isbnData) {
    // まずローディングアイコンを表示
    const loadingIcon = createFloatingIcon('loading');
    loadingIcon.classList.add('koala-search-icon');
    document.body.appendChild(loadingIcon);

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
      
      // アイコンを更新
      updateIcon(result.isAvailable ? 'available' : 'unavailable');

      // 本が見つかった場合は自動でポップアップを表示
      if (result.isAvailable) {
        // 少し遅延を入れてポップアップを表示（アイコンの表示後）
        setTimeout(showPopup, 500);
      }

    } catch (error) {
      console.error('Error searching library:', error);
      // エラー時は未所蔵アイコンを表示
      updateIcon('unavailable');
    }
  }
}); 