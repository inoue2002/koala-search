import fs from 'fs';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

async function fetchLibraryData() {
  const isbn = '441015463X';
  
  try {
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
    
    // レスポンスをファイルに保存
    fs.writeFileSync('response.html', html);
    
    // HTMLの構造を解析
    const dom = new JSDOM(html);
    const document = dom.window.document;

    console.log('=== 書誌情報の解析 ===');
    // 書誌情報テーブルを探す
    const tables = document.querySelectorAll('table');
    tables.forEach((table, index) => {
      console.log(`\nテーブル ${index + 1}:`);
      const rows = table.querySelectorAll('tr');
      if (rows.length > 0) {
        console.log(`行数: ${rows.length}`);
        // 最初の行の内容を表示
        const firstRow = rows[0];
        console.log('最初の行の内容:', firstRow.textContent.trim());
        // テーブルのクラス名を表示
        console.log('テーブルのクラス:', table.className);
      }
    });

    console.log('\n=== 所蔵情報の解析 ===');
    // 所蔵情報エリアを探す
    const holdingAreas = document.querySelectorAll('div');
    holdingAreas.forEach(area => {
      if (area.textContent.includes('所蔵')) {
        console.log('\n所蔵情報を含む要素:');
        console.log('クラス名:', area.className);
        console.log('内容の一部:', area.textContent.slice(0, 200));
      }
    });
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

fetchLibraryData(); 