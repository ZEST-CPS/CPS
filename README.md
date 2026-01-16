# 项目成果展示网站

纯前端的静态网站项目，展示协作解决问题（CPS）相关的研究成果。所有数据存储在 JSON 文件中，无需后端服务器。

## 项目特点

- ✅ **纯前端项目**：无需后端服务器，所有数据存储在 JSON 文件中
- ✅ **静态网站**：可以直接部署到 GitHub Pages、Netlify、Vercel 等静态托管服务
- ✅ **Vue 3 + Element Plus**：使用 CDN 方式加载，无需构建工具
- ✅ **响应式设计**：适配不同屏幕尺寸

## 快速开始

### 本地运行

```bash
python -m http.server 5500
```

然后在浏览器访问 `http://localhost:5500`

## 项目结构

```
MHHMAM/
├── index.html          # 主页面文件
├── js/
│   └── app.js          # Vue 应用代码
├── data/
│   ├── papers.json     # 论文数据
│   └── overview.json  # 项目总览数据
├── images/             # 图片资源
└── README.md           # 项目说明
```

## 数据管理

### 添加论文

编辑 `data/papers.json` 文件，在对应的分类下添加新论文：

```json
{
  "measurement": [
    {
      "id": 1,
      "title": "论文标题",
      "authors": "作者1, 作者2",
      "category": "measurement",
      "category_display": "测量",
      "abstract": "论文摘要",
      "keywords": "关键词1, 关键词2",
      "publication_date": "2024-10-01",
      "journal": "发表情况",
      "images": [
        {
          "id": 1,
          "image_url": "/images/图片文件名.png",
          "caption": "图注",
          "order": 1
        }
      ]
    }
  ]
}
```

### 修改项目总览

编辑 `data/overview.json` 文件，修改各部分的 `content` 字段。

### 添加图片

将图片文件放到 `images/` 目录下，然后在 JSON 文件中使用绝对路径引用：
- 使用绝对路径：`/images/图片文件名.png`

## 部署

可以直接部署到任何静态托管服务：
- GitHub Pages
- Netlify
- Vercel
- 或其他静态网站托管服务

只需将项目根目录的内容上传即可。

## 技术栈

- **Vue 3**：通过 CDN 加载
- **Element Plus**：UI 组件库
- **Vue Router**：路由管理（使用 hash 模式，兼容静态托管）

## 注意事项

- 图片路径使用绝对路径（以 `/` 开头），确保在不同路径下都能正确加载
- 路由使用 hash 模式（`#/measurement`），避免刷新时出现 404
- 所有数据都存储在 JSON 文件中，修改后刷新浏览器即可看到效果
