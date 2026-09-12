// Express 应用定义
// 将应用与服务器启动分离，方便自动化测试直接导入 app。

import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from "./store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

function createApp() {
  const app = express();
  app.use(express.json());

  // 健康检查
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  // 获取任务列表
  app.get("/api/tasks", (req, res) => {
    res.json(listTasks());
  });

  // 获取单个任务
  app.get("/api/tasks/:id", (req, res) => {
    const task = getTask(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ error: "任务不存在" });
    }
    res.json(task);
  });

  // 创建任务
  app.post("/api/tasks", (req, res, next) => {
    try {
      const task = createTask(req.body?.title);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  });

  // 更新任务（标题或状态）
  app.patch("/api/tasks/:id", (req, res, next) => {
    try {
      const task = updateTask(Number(req.params.id), {
        status: req.body?.status,
        title: req.body?.title,
      });
      res.json(task);
    } catch (err) {
      next(err);
    }
  });

  // 删除任务
  app.delete("/api/tasks/:id", (req, res, next) => {
    try {
      const removed = deleteTask(Number(req.params.id));
      res.json(removed);
    } catch (err) {
      next(err);
    }
  });

  // 静态前端资源
  app.use(express.static(publicDir));

  // 统一错误处理
  app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || "服务器内部错误" });
  });

  return app;
}

export { createApp };
