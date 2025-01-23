// 図書館での検索を実行する関数
async function searchBook(isbn) {
  try {
    // バックグラウンドスクリプトに検索リクエストを送信
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: 'searchLibrary', isbn },
        response => {
          if (response.success) {
            resolve(response.html);
          } else {
            reject(new Error(response.error));
          }
        }
      );
    });

    const parser = new DOMParser();
    const doc = parser.parseFromString(response, 'text/html');

    // 基本的な書誌情報を取得
    const bibliograph = doc.querySelector('.opac_book_bibliograph');
    let basicInfo = '';
    if (bibliograph) {
      basicInfo = bibliograph.textContent.trim();
    }

    // 詳細な書誌情報を取得
    const bookDetails = {};
    const detailsTable = doc.querySelector('table.opac_syosi_list');
    if (detailsTable) {
      const rows = detailsTable.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const label = cells[0].textContent.trim();
          const value = cells[1].textContent.trim();
          if (label && value) {
            bookDetails[label] = value;
          }
        }
      });
    }

    // 所蔵情報を取得
    const holdingInfo = doc.querySelector('.opac_booksyozou_area.opac_syozou_info.syozou_yoko');

    return {
      basicInfo,
      bookDetails,
      holdingInfo,
      isAvailable: !!(bibliograph || (detailsTable && detailsTable.querySelector('tr')) || holdingInfo),
      doc
    };
  } catch (error) {
    console.error('Error searching library:', error);
    throw error;
  }
} 