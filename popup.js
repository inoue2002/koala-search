// 検索処理を関数として切り出し
async function searchBook(isbn) {
  const resultDiv = document.getElementById('result');
  
  if (!isbn) {
    resultDiv.innerHTML = 'ISBNを入力してください';
    return;
  }

  try {
    resultDiv.innerHTML = '検索中...';
    
    const response = await fetch("https://www.lib.kansai-u.ac.jp/webopac/ctlsrh.do", {
      method: "POST",
      headers: {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "ja,en-US;q=0.9,en;q=0.8",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded"
      },
      body: `words=${isbn}&formkeyno=&sortkey=&sorttype=&listcnt=&startpos=&fromDsp=catsre&searchDsp=catsre&initFlg=_RESULT_SET&hitcnt=&searchsql=&combsearch=&searchhis=&akey=&fct_gcattp=&fct_auth=&fct_pub=&fct_year=&fct_cls=&fct_sh=&fct_lang=&fct_holar=&fct_campus=&fct_tag=&fct_range_year=&fct_stamp=&fct_user1=&fct_user2=&fct_user3=&fct_user4=&fct_user5=&fct_holstat=&fct_target_name=&tab_num=0&search_mode=simple&all_area=false`
    });

    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

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
    
    // 結果を整形して表示
    let displayHtml = '<div class="book-info">';
    
    // 基本情報の表示
    if (basicInfo) {
      displayHtml += '<h3>基本情報</h3>';
      displayHtml += `<p>${basicInfo}</p>`;
    }

    // 詳細情報の表示（必要な項目のみ）
    if (Object.keys(bookDetails).length > 0) {
      displayHtml += '<h3>詳細情報</h3>';
      const requiredFields = ['標題および責任表示', 'ISBN', '出版・頒布事項'];
      for (const field of requiredFields) {
        if (bookDetails[field]) {
          displayHtml += `<p><strong>${field}:</strong> ${bookDetails[field]}</p>`;
        }
      }
    }

    // 所蔵情報の表示
    if (holdingInfo) {
      displayHtml += '<h3>所蔵情報</h3>';
      const rows = holdingInfo.querySelectorAll('tr');
      if (rows.length > 1) { // ヘッダー行を除く
        const cells = rows[1].querySelectorAll('td'); // 最初のデータ行
        if (cells.length > 0) {
          displayHtml += '<div class="holding-item">';
          const requiredLabels = ['所蔵館', '配置場所', '請求記号', '資料ID', '状態'];
          const labelIndexes = [2, 3, 5, 6, 9]; // 各ラベルに対応するインデックス
          labelIndexes.forEach((index, i) => {
            const text = cells[index]?.textContent.trim();
            if (text && requiredLabels[i]) {
              displayHtml += `<p><strong>${requiredLabels[i]}:</strong> ${text}</p>`;
            }
          });
          displayHtml += '</div>';
        }
      }
    }

    // 情報が何も取得できなかった場合
    if (!basicInfo && Object.keys(bookDetails).length === 0 && !holdingInfo) {
      resultDiv.innerHTML = '該当する本が見つかりませんでした';
      return;
    }

    displayHtml += '</div>';
    resultDiv.innerHTML = displayHtml;
    
  } catch (error) {
    resultDiv.innerHTML = 'エラーが発生しました: ' + error.message;
  }
}

// ポップアップが開かれた時に実行
document.addEventListener('DOMContentLoaded', () => {
  // 保存されたISBNを読み込んで入力欄に設定し、自動検索を実行
  chrome.storage.local.get(['isbn'], (result) => {
    if (result.isbn) {
      const isbnInput = document.getElementById('isbn');
      isbnInput.value = result.isbn;
      // 自動検索を実行
      searchBook(result.isbn);
    }
  });

  // 検索ボタンのクリックイベント
  document.getElementById('search').addEventListener('click', () => {
    const isbn = document.getElementById('isbn').value;
    searchBook(isbn);
  });
}); 