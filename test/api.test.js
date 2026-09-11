// 任务 API 集成测试
// 使用 node:test 内置测试运行器，在临时端口启动真实 app 并通过 fetch 请求。

import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { reset } from "../src/store.js";

let server;
let baseUrl;

before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(() => {
  server.close();
});

beforeEach(() => {
  reset();
});

async function req(path, options) {
  const res = await fetch(baseUrl + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

test("健康检查返回 ok", async () => {
  const { status, body } = await req("/api/health");
  assert.equal(status, 200);
  assert.equal(body.status, "ok");
});

test("获取初始任务列表", async () => {
  const { status, body } = await req("/api/tasks");
  assert.equal(status, 200);
  assert.equal(body.length, 3);
});

test("创建新任务", async () => {
  const { status, body } = await req("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ title: "接入数据库" }),
  });
  assert.equal(status, 201);
  assert.equal(body.title, "接入数据库");
  assert.equal(body.status, "todo");
  assert.ok(body.id);
});

test("创建空标题任务应返回 400", async () => {
  const { status, body } = await req("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ title: "   " }),
  });
  assert.equal(status, 400);
  assert.ok(body.error);
});

test("更新任务状态", async () => {
  const { status, body } = await req("/api/tasks/3", {
    method: "PATCH",
    body: JSON.stringify({ status: "in_progress" }),
  });
  assert.equal(status, 200);
  assert.equal(body.status, "in_progress");
});

test("更新为非法状态应返回 400", async () => {
  const { status } = await req("/api/tasks/3", {
    method: "PATCH",
    body: JSON.stringify({ status: "unknown" }),
  });
  assert.equal(status, 400);
});

test("更新不存在的任务应返回 404", async () => {
  const { status } = await req("/api/tasks/9999", {
    method: "PATCH",
    body: JSON.stringify({ status: "done" }),
  });
  assert.equal(status, 404);
});

test("删除任务", async () => {
  const del = await req("/api/tasks/1", { method: "DELETE" });
  assert.equal(del.status, 200);

  const list = await req("/api/tasks");
  assert.equal(list.body.length, 2);
});

test("删除不存在的任务应返回 404", async () => {
  const { status } = await req("/api/tasks/9999", { method: "DELETE" });
  assert.equal(status, 404);
});
