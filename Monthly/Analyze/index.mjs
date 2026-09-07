import fs from 'fs';
import path from 'path';

const MONTHLY_DIR = '../';
const TITLES_DIR = './Titles';

// 解析対象のファイルを指定（例: ["2026年9月アニメ感想.md"]）
// 空配列 [] にした場合は Monthly フォルダ内の全 .md ファイルを対象にする全件探索モードになります
const TARGET_MD_LIST = [
  "2026年9月アニメ感想.md"
];

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

      // ラベル (【録画】【配信】等)、話数 (#09 等)、サブタイトル (「...」) を除外して純粋な作品名を取得
      let cleanTitle = currentRawHeader
        .replace(/【.*?】/g, '')          // 【録画】【配信】などのラベルを削除
        .replace(/\[.*?\]/g, '')          // [録画][配信] などの半角ブラケットも除去
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

// 解析対象ファイルのリスト決定
let filesToProcess = [];

if (TARGET_MD_LIST && TARGET_MD_LIST.length > 0) {
  // 指定モード
  filesToProcess = TARGET_MD_LIST;
  console.log(`指定モード実行: ${filesToProcess.length} 件のファイルを対象にします。`);
} else if (fs.existsSync(MONTHLY_DIR)) {
  // 全件探索モード
  filesToProcess = fs.readdirSync(MONTHLY_DIR).filter(f => f.endsWith('.md'));
  console.log(`全件探索モード実行: ${MONTHLY_DIR}/ 内の ${filesToProcess.length} 件のファイルを対象にします。`);
} else {
  console.error(`エラー: ${MONTHLY_DIR} フォルダが存在しません。`);
  process.exit(1);
}

// 対象ファイルを順次解析
for (const file of filesToProcess) {
  const filePath = path.join(MONTHLY_DIR, file);
  if (fs.existsSync(filePath)) {
    parseMarkdown(filePath);
  } else {
    console.warn(`警告: ファイルが見つかりません (${filePath})`);
  }
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

  // 既存ファイルがある場合は上書き（特定月のみ追加で処理したい場合等はアペンド処理に変更も可能）
  fs.writeFileSync(outputPath, fileContent, 'utf-8');
}

console.log(`処理完了: ${animeMap.size} 作品の感想を ${TITLES_DIR}/ に整理して保存しました。`);