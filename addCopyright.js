/**
 * @file addCopyright.js
 * @description: 使用Node为，项目文件夹添加版权信息（删除文件头已有的版权信息，添加新的版权信息）
 * @created 2023-04
 * @author Leon
 * @email silenceace@gmail.com
 * @usage node addCopyright.js
 * @usage node addCopyright.js /path/to/directory "Leon" "“youremail@domain.com" ".ts,.tsx,.js" 0
 * @usage curl -sSL https://raw.githubusercontent.com/funnyzak/batch-copyright-updater/main/addCopyright.js | node /dev/stdin /path/to/directory "leon" “youremail@domain.com” ".tsx,.ts" 0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2); // 获取命令行参数
const BASE_PATH = args[0] || 'src'; // 指定路径
const AUTHOR = args[1] || 'Leon'; // 作者
const EMAIL = args[2] || 'silenceace@gmail.com'; // 邮箱
const FILE_TYPES = args[3]?.split(',') || ['.tsx', '.ts', '.js']; // 要替换的文件类型
const COPYRIGHT_TEMPLATE_INDEX = args[4] || 0; // 版权信息模板索引

// 版权信息模板
const _COPYRIGHT_TEMPLATE_LIST = [
  `/**
 * Created by ${AUTHOR}<${EMAIL}> at {{createdDate}}.
 * Last modified at {{lastModifiedDate}}
 */

`,
  `/**
 * @file {{filename}}
 * @description
 * @created {{createdDate}}
 * @lastModified {{lastModifiedDate}}
 * @author ${AUTHOR}
 * @email ${EMAIL}
 * @copyright Copyright (c) {{year}}
 */

`,
];

const COPYRIGHT_TEMPLATE =
  _COPYRIGHT_TEMPLATE_LIST[
    COPYRIGHT_TEMPLATE_INDEX > _COPYRIGHT_TEMPLATE_LIST.length - 1 ? 0 : COPYRIGHT_TEMPLATE_INDEX
  ];

let successCount = 0;
let failureCount = 0;

/**
 * 添加版权信息到文件头部
 * @param {string} filePath 文件路径
 */
function addCopyright(filePath) {
  const [createdDate] = execSync(
    `git log --diff-filter=A --format=%ad --date=format:'%Y-%m-%d %H:%M:%S' --reverse -- ${filePath} | head -1`,
    {
      encoding: 'utf-8',
      cwd: BASE_PATH,
    },
  ).split('\n');

  const [lastModifiedDate] = execSync(
    `git log -1 --format=%cd --date=format:'%Y-%m-%d %H:%M:%S' ${filePath}`,
    {
      encoding: 'utf-8',
      cwd: BASE_PATH,
    },
  ).split('\n');

  const [createYear] = createdDate.split('-');

  let content = fs.readFileSync(filePath, { encoding: 'utf-8' });
  const reg = /\/\*\*[\s\S]*?\*\//; // 匹配 /** 开头 */ 结尾的注释
  if (reg.test(content)) {
    content = content.replace(reg, ''); // 删除已经存在的版权信息
  }
  const newContent =
    COPYRIGHT_TEMPLATE.replace('{{createdDate}}', createdDate)
      .replace('{{filename}}', path.basename(filePath))
      .replace('{{lastModifiedDate}}', lastModifiedDate)
      .replace('{{year}}', createYear) + content.replace(/^\s*\n/gm, '');

  fs.writeFileSync(filePath, newContent, { encoding: 'utf-8' });
}

/**
 * 遍历文件夹并处理所有符合条件的文件
 * @param {string} folderPath 文件夹路径
 */
function traverseFolder(folderPath) {
  const files = fs.readdirSync(folderPath);
  files.forEach((filename) => {
    const filePath = path.join(folderPath, filename);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      traverseFolder(filePath);
    } else {
      // 判断文件是否符合要求
      const fileType = path.extname(filePath);
      if (FILE_TYPES.includes(fileType)) {
        console.log(`Processing ${filePath}`);
        try {
          // 处理单个文件
          addCopyright(filePath);
          successCount++;
        } catch (err) {
          failureCount++;
          console.error(`Error processing ${filePath}: `, err);
        }
      }
    }
  });
}

traverseFolder(path.resolve(BASE_PATH));

console.log(`Processed ${successCount + failureCount} files.`);
console.log(`Success: ${successCount}, Failure: ${failureCount}`);
