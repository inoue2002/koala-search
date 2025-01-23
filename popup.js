document.getElementById('search').addEventListener('click', async () => {
  const isbn = document.getElementById('isbn').value;
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
        "content-type": "application/x-www-form-urlencoded",
        "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1"
      },
      body: `words=${isbn}&formkeyno=&sortkey=&sorttype=&listcnt=&startpos=&fromDsp=catsre&searchDsp=catsre&initFlg=_RESULT_SET&hitcnt=&searchsql=&combsearch=&searchhis=&akey=&fct_gcattp=&fct_auth=&fct_pub=&fct_year=&fct_cls=&fct_sh=&fct_lang=&fct_holar=&fct_campus=&fct_tag=&fct_range_year=&fct_stamp=&fct_user1=&fct_user2=&fct_user3=&fct_user4=&fct_user5=&fct_holstat=&fct_target_name=&tab_num=0&search_mode=simple&all_area=false`
    });

    const html = await response.text();
    resultDiv.innerHTML = html;
    
  } catch (error) {
    resultDiv.innerHTML = 'エラーが発生しました: ' + error.message;
  }
}); 