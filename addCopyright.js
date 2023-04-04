/**
 * @file addCopyright.js
 * @description: 使用Node为，项目文件夹添加版权信息（删除文件头已有的版权信息，添加新的版权信息）
 * @created 2023-04
 * @author Leon
 * @usage node addCopyright.js
 * @usage node addCopyright.js /path/to/directory "Leon" "silenceace@gmail.com" ".ts,.tsx,.js"
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const args = process.argv.slice(2) // 获取命令行参数
const BASE_PATH = args[0] || 'src' // 指定路径
const AUTHOR = args[1] || 'Leon' // 作者
const EMAIL = args[2] || 'silenceace@gmail.com' // 邮箱
const FILE_TYPES = args[3]?.split(',') || ['.tsx', '.ts', '.js'] // 要替换的文件类型

// 版权信息模板1
const _COPYRIGHT_TEMPLATE = `/**
 * Created by ${AUTHOR}<${EMAIL}> on {{createdDate}}.
 */

`

// 版权信息模板2
const _COPYRIGHT_TEMPLATE2 = `/**
 * @file {{filename}}
 * @description 
 * @created {{createdDate}}
 * @author ${AUTHOR}
 * @email ${EMAIL}
 * @copyright Copyright (c) {{year}}
 */

`
const COPYRIGHT_TEMPLATE = _COPYRIGHT_TEMPLATE

let successCount = 0
let failureCount = 0

/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  const second = date.getSeconds().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

/**
 * 添加版权信息到文件头部
 * @param {string} filePath 文件路径
 */
function addCopyright(filePath) {
  const gitLog = execSync(
    `git log --reverse --format="%aI" "${filePath}"`,
    {
      encoding: 'utf-8',
      cwd: BASE_PATH
    }
  )
  const createdDate = formatDate(new Date(gitLog.split('\n')[0]))
  const [year] = createdDate.split('-')

  let content = fs.readFileSync(filePath, { encoding: 'utf-8' })
  const reg = /\/\*\*[\s\S]*?\*\// // 匹配 /** 开头 */ 结尾的注释
  if (reg.test(content)) {
    content = content.replace(reg, '') // 删除已经存在的版权信息
  }
  const newContent =
    COPYRIGHT_TEMPLATE.replace('{{createdDate}}', createdDate)
      .replace('{{filename}}', path.basename(filePath))
      .replace('{{year}}', year) + content.replace(/^\s*\n/gm, '')

  fs.writeFileSync(filePath, newContent, { encoding: 'utf-8' })
}

/**
 * 遍历文件夹并处理所有符合条件的文件
 * @param {string} folderPath 文件夹路径
 */
function traverseFolder(folderPath) {
  const files = fs.readdirSync(folderPath)
  files.forEach((filename) => {
    const filePath = path.join(folderPath, filename)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      traverseFolder(filePath)
    } else {
      // 判断文件是否符合要求
      const fileType = path.extname(filePath)
      if (FILE_TYPES.includes(fileType)) {
        console.log(`Processing ${filePath}`)
        try {
          // 处理单个文件
          addCopyright(filePath)
          successCount++
        } catch (err) {
          failureCount++
          console.error(`Error processing ${filePath}: `, err)
        }
      }
    }
  })
}

traverseFolder(path.resolve(BASE_PATH))

console.log(`Processed ${successCount + failureCount} files.`)
console.log(`Success: ${successCount}, Failure: ${failureCount}`)
