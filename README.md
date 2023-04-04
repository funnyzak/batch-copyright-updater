# Batch Copyright Updater

批量给指定路径下的代码文件添加版权信息。日期部分从文件的 Git 首次提交时间生成。如果文件头部已经包含以 `/**` 开头，`*/` 结尾的版权信息注释，则删除用新模板替换。

**提示**： 版权信息模板可自行从文件修改，模板中的 `{{author}}` 和 `{{email}}`等，会被替换为传入的参数。

## 使用

```bash
# 本地执行
node addCopyright.js path/to/directory AUTHOR EMAIL FILE_TYPES

node script.js /path/to/directory "leon" “youremail@domain.com” ".tsx,.ts" 

# 一键执行
curl -sSL https://raw.githubusercontent.com/funnyzak/batch-copyright-updater/main/addCopyright.js | node /dev/stdin BASE_PATH AUTHOR FILE_TYPES COPYRIGHT_TEMPLATE

curl -sSL https://raw.githubusercontent.com/funnyzak/batch-copyright-updater/main/addCopyright.js | node /dev/stdin /path/to/directory "leon" “youremail@domain.com” ".tsx,.ts" 
```

## 模板

默认的版权信息模板如下：

```plain
/**
 * Created by ${AUTHOR}<${EMAIL}> on {{createdDate}}.
 */

````

其他参考模板：

```plain
/**
 * @file {{filename}}
 * @description 
 * @created {{createdDate}}
 * @author ${AUTHOR}
 * @email ${EMAIL}
 * @copyright Copyright (c) {{year}}
 */
```

## 版权

MIT License © 2023 [funnyzak](https://github.com/funnyzak)