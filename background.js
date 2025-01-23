// セッションを確立する関数
async function establishSession() {
  try {
    // まずトップページにアクセスしてセッションを確立
    const response = await fetch("https://www.lib.kansai-u.ac.jp/webopac/", {
      method: "GET",
      credentials: "include",
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to establish session: ${response.status}`);
    }
    
    // セッションクッキーを取得
    const cookies = await chrome.cookies.getAll({
      domain: "lib.kansai-u.ac.jp"
    });
    
    return cookies.length > 0;
  } catch (error) {
    console.error('Session establishment error:', error);
    return false;
  }
}

// 図書館検索のリクエストを処理
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'searchLibrary') {
    // セッションを確立してから検索を実行
    establishSession().then(sessionEstablished => {
      if (!sessionEstablished) {
        sendResponse({ 
          success: false, 
          error: "Failed to establish session with the library server" 
        });
        return;
      }

      fetch("https://www.lib.kansai-u.ac.jp/webopac/ctlsrh.do", {
        method: "POST",
        credentials: "include",
        headers: {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "accept-language": "ja,en-US;q=0.9,en;q=0.8",
          "cache-control": "no-cache",
          "content-type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Origin": "https://www.lib.kansai-u.ac.jp",
          "Referer": "https://www.lib.kansai-u.ac.jp/webopac/",
          "Pragma": "no-cache"
        },
        body: `words=${encodeURIComponent(request.isbn)}&formkeyno=&sortkey=&sorttype=&listcnt=&startpos=&fromDsp=catsre&searchDsp=catsre&initFlg=_RESULT_SET&hitcnt=&searchsql=&combsearch=&searchhis=&akey=&fct_gcattp=&fct_auth=&fct_pub=&fct_year=&fct_cls=&fct_sh=&fct_lang=&fct_holar=&fct_campus=&fct_tag=&fct_range_year=&fct_stamp=&fct_user1=&fct_user2=&fct_user3=&fct_user4=&fct_user5=&fct_holstat=&fct_target_name=&tab_num=0&search_mode=simple&all_area=false`
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        if (html.includes('エラーが発生しました') || html.includes('システムエラー')) {
          throw new Error('Library system error');
        }
        sendResponse({ success: true, html });
      })
      .catch(error => {
        console.error('Fetch error:', error);
        sendResponse({ 
          success: false, 
          error: error.message || 'Failed to fetch data from library server' 
        });
      });
    });
    return true; // Will respond asynchronously
  } else if (request.action === 'openPopup') {
    // ポップアップを開く
    chrome.action.openPopup();
    return true;
  }
}); 