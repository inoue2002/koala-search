// Amazonのページからデータを取得
function getISBNFromAmazon() {
  // 複数のパターンで検索
  const patterns = [
    // パターン1: 詳細情報リスト
    () => {
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

      return isbn10 || isbn13 ? { isbn10, isbn13 } : null;
    },
    // パターン2: 商品詳細テーブル
    () => {
      const detailsTable = document.querySelector('#productDetails_detailBullets_sections1');
      if (!detailsTable) return null;

      const rows = detailsTable.querySelectorAll('tr');
      let isbn10 = '';
      let isbn13 = '';

      rows.forEach(row => {
        const th = row.querySelector('th');
        const td = row.querySelector('td');
        if (th && td) {
          const label = th.textContent.trim();
          const value = td.textContent.trim();
          if (label.includes('ISBN-10')) {
            isbn10 = value.replace(/[^0-9X]/g, '');
          }
          if (label.includes('ISBN-13')) {
            isbn13 = value.replace(/[^0-9X]/g, '');
          }
        }
      });

      return isbn10 || isbn13 ? { isbn10, isbn13 } : null;
    },
    // パターン3: メタデータ
    () => {
      const meta = document.querySelector('meta[property="books:isbn"]');
      if (!meta) return null;

      const isbn = meta.getAttribute('content').replace(/[^0-9X]/g, '');
      if (isbn.length === 10) {
        return { isbn10: isbn, isbn13: '' };
      } else if (isbn.length === 13) {
        return { isbn10: convertISBN13to10(isbn) || '', isbn13: isbn };
      }
      return null;
    },
    // パターン4: ASIN（Amazonの商品ID）から取得
    () => {
      const asinMatch = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/);
      if (!asinMatch) return null;

      const asin = asinMatch[1];
      // ASINが10桁の数字またはXで構成されている場合、それはISBN-10である可能性が高い
      if (/^[0-9X]{10}$/.test(asin)) {
        return { isbn10: asin, isbn13: '' };
      }
      return null;
    }
  ];

  // 各パターンを試す
  for (const pattern of patterns) {
    const result = pattern();
    if (result) {
      // 少なくとも1つのISBNが見つかった場合
      if (result.isbn10 || result.isbn13) {
        return result;
      }
    }
  }

  return null;
}

// 楽天ブックスのページからデータを取得
function getISBNFromRakuten() {
  // 複数のパターンで検索
  const patterns = [
    // パターン1: 商品情報セクション内のISBN
    () => {
      const productInfo = document.querySelectorAll('#productDetailedDescription .productInfo');
      for (const item of productInfo) {
        const category = item.querySelector('.category');
        if (category && category.textContent.trim() === 'ISBN：') {
          return item.querySelector('.categoryValue').textContent.trim();
        }
      }
      return null;
    },
    // パターン2: 商品基本情報内のISBN
    () => {
      const basicInfo = document.querySelectorAll('.item-info tr');
      for (const row of basicInfo) {
        const th = row.querySelector('th');
        if (th && th.textContent.trim() === 'ISBN') {
          return row.querySelector('td').textContent.trim();
        }
      }
      return null;
    },
    // パターン3: メタデータ内のISBN
    () => {
      const meta = document.querySelector('meta[property="books:isbn"]');
      return meta ? meta.getAttribute('content') : null;
    }
  ];

  // 各パターンを試す
  let isbn = null;
  for (const pattern of patterns) {
    isbn = pattern();
    if (isbn) {
      isbn = isbn.replace(/[^0-9X]/g, '');
      break;
    }
  }

  if (!isbn) return null;

  // ISBN-13 から ISBN-10 への変換を試みる
  return {
    isbn10: convertISBN13to10(isbn) || '',
    isbn13: isbn.length === 13 ? isbn : ''
  };
}

// ISBN-13 を ISBN-10 に変換する関数
function convertISBN13to10(isbn13) {
  if (!isbn13 || isbn13.length !== 13) return null;
  
  // ISBN-13 が 978 で始まる場合のみ変換可能
  if (!isbn13.startsWith('978')) return null;

  // 978 を除いた後の最初の9桁を取得
  const digits = isbn13.slice(3, 12);
  
  // チェックディジットを計算
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  
  let checkDigit = 11 - (sum % 11);
  if (checkDigit === 10) checkDigit = 'X';
  if (checkDigit === 11) checkDigit = '0';
  
  return digits + checkDigit;
}

// ページのURLに基づいて適切な取得関数を使用
function getISBN() {
  const url = window.location.href;
  let isbnData = null;

  if (url.includes('amazon.co.jp')) {
    isbnData = getISBNFromAmazon();
  } else if (url.includes('books.rakuten.co.jp')) {
    isbnData = getISBNFromRakuten();
  }

  // ISBNが取得できなかった場合のログ出力（デバッグ用）
  if (!isbnData || (!isbnData.isbn10 && !isbnData.isbn13)) {
    console.log('ISBN not found on this page');
    return null;
  }

  return isbnData;
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