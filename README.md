# ai-dev-workflow-test

任务看板（Task Board）演示应用，用于验证 AI 开发工作流与 Cloud Agent 开发环境。

技术栈为 Node.js + Express，前端为原生 HTML/CSS/JavaScript，数据保存在内存中（进程重启后重置）。

## 功能

- 三列看板：待办、进行中、已完成
- 创建、状态迁移、删除任务
- REST API 与健康检查
- 实时服务状态指示

## 环境要求

- Node.js >= 20

## 快速开始

```bash
npm ci          # 安装依赖
npm start       # 启动服务（默认 http://localhost:3000）
```

开发模式（文件变更自动重启）：

```bash
npm run dev
```

运行自动化测试：

```bash
npm test
```

可通过环境变量 `PORT`、`HOST` 自定义监听地址。

## API 说明

| 方法   | 路径              | 说明               |
| ------ | ----------------- | ------------------ |
| GET    | `/api/health`     | 健康检查           |
| GET    | `/api/tasks`      | 获取任务列表       |
| GET    | `/api/tasks/:id`  | 获取单个任务       |
| POST   | `/api/tasks`      | 创建任务           |
| PATCH  | `/api/tasks/:id`  | 更新标题或状态     |
| DELETE | `/api/tasks/:id`  | 删除任务           |

任务状态取值：`todo`、`in_progress`、`done`。

## 项目结构

```
.
├── public/           # 前端静态资源
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── src/              # 后端源码
│   ├── app.js        # Express 应用定义
│   ├── server.js     # 服务器启动入口
│   └── store.js      # 内存数据存储
├── test/             # 自动化测试
│   └── api.test.js
└── .cursor/
    └── environment.json  # Cloud Agent 开发环境配置
```
