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

// ページ読み込み完了時に実行
window.addEventListener('load', () => {
  const isbnData = getISBN();
  if (isbnData) {
    // ISBNをストレージに保存
    chrome.storage.local.set({ isbn: isbnData.isbn10 });
    // alert(`amazon page!\nISBN-10: ${isbnData.isbn10}\nISBN-13: ${isbnData.isbn13}`);
  } else {
    // alert('amazon page! (ISBN not found)');
  }
}); 