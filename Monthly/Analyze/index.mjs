import fs from 'fs';
import path from 'path';

const MONTHLY_DIR = './Monthly';
const TITLES_DIR = './Titles';

// 出力先フォルダの作成
if (!fs.existsSync(TITLES_DIR)) {
  fs.mkdirSync(TITLES_DIR, { recursive: true });
}

// 作品ごとのデータを保持するMap
const animeMap = new Map();

function parseMarkdown(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split(/\r?\n/);

  let currentDate = '日付不明';
  let currentTitle = null;
  let currentRawHeader = '';
  let currentBuffer = [];

  const saveCurrentEntry = () => {
    if (currentTitle && currentBuffer.length > 0) {
      if (!animeMap.has(currentTitle)) {
        animeMap.set(currentTitle, []);
      }
      animeMap.get(currentTitle).push({
        date: currentDate,
        rawHeader: currentRawHeader,
        content: currentBuffer.join('\n').trim()
      });
    }
  };

  for (const line of lines) {
    // H1から日付を取得 (# 今日見たアニメ2026/09/01（火） など)
    const dateMatch = line.match(/(\d{4}\/\d{2}\/\d{2})/);
    if (line.startsWith('#') && dateMatch) {
      currentDate = dateMatch[1];
    }

    // H3の見出し（### 作品名 #話数 「サブタイトル」）を検知
    if (line.startsWith('### ')) {
      saveCurrentEntry();

      currentRawHeader = line.replace(/^###\s+/, '').trim();

      // 話数 (#09 など) や サブタイトル (「...」) を除外して純粋な作品名を取得
      let cleanTitle = currentRawHeader
        .replace(/\s+#\d+.*$/, '')        // #09 以降をトリム
        .replace(/\s+「.*?」.*$/, '')     // 「サブタイトル」以降をトリム
        .trim();

      currentTitle = cleanTitle;
      currentBuffer = [];
    } else if (currentTitle) {
      // 次のH1やH2（目次など）が来たら現在の作品ブロックを終了
      if (line.startsWith('# ') || line.startsWith('## ')) {
        saveCurrentEntry();
        currentTitle = null;
        currentBuffer = [];
      } else {
        currentBuffer.push(line);
      }
    }
  }
  saveCurrentEntry();
}

// Monthly フォルダ内の全 md ファイルを解析
if (fs.existsSync(MONTHLY_DIR)) {
  const files = fs.readdirSync(MONTHLY_DIR).filter(f => f.endsWith('.md'));
  for (const file of files) {
    parseMarkdown(path.join(MONTHLY_DIR, file));
  }
} else {
  console.error(`エラー: ${MONTHLY_DIR} フォルダが存在しません。`);
  process.exit(1);
}

// Windows等のファイル名に使えない禁用文字（: や / など）を安全な全角文字に置換
function sanitizeFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, char => {
    const map = {
      '\\': '￥', '/': '／', ':': '：', '*': '＊',
      '?': '？', '"': '”', '<': '＜', '>': '＞', '|': '｜'
    };
    return map[char] || '_';
  });
}

// 作品ごとに個別ファイルへ書き出し
for (const [title, entries] of animeMap.entries()) {
  const safeTitle = sanitizeFileName(title);
  const outputPath = path.join(TITLES_DIR, `${safeTitle}.md`);

  let fileContent = `# ${title}\n\n`;
  for (const entry of entries) {
    fileContent += `## ${entry.date} (${entry.rawHeader})\n\n`;
    fileContent += `${entry.content}\n\n---\n\n`;
  }

  fs.writeFileSync(outputPath, fileContent, 'utf-8');
}

console.log(`処理完了: ${animeMap.size} 作品の感想を ${TITLES_DIR}/ に整理して保存しました。`);