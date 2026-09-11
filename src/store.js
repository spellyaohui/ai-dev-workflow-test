// 任务数据存储（内存实现）
// 说明：用于演示的简单内存存储，进程重启后数据会重置。
// 生产环境应替换为数据库实现。

const VALID_STATUSES = ["todo", "in_progress", "done"];

let tasks = [];
let nextId = 1;

// 生成初始演示数据
function seed() {
  tasks = [
    { id: 1, title: "搭建开发环境", status: "done", createdAt: nowIso() },
    { id: 2, title: "实现任务看板 API", status: "in_progress", createdAt: nowIso() },
    { id: 3, title: "编写自动化测试", status: "todo", createdAt: nowIso() },
  ];
  nextId = 4;
}

function nowIso() {
  return new Date().toISOString();
}

function listTasks() {
  return tasks;
}

function getTask(id) {
  return tasks.find((t) => t.id === id);
}

function createTask(title) {
  const trimmed = typeof title === "string" ? title.trim() : "";
  if (!trimmed) {
    const err = new Error("任务标题不能为空");
    err.statusCode = 400;
    throw err;
  }
  const task = { id: nextId++, title: trimmed, status: "todo", createdAt: nowIso() };
  tasks.push(task);
  return task;
}

function updateTask(id, updates) {
  const task = getTask(id);
  if (!task) {
    const err = new Error("任务不存在");
    err.statusCode = 404;
    throw err;
  }
  if (updates.status !== undefined) {
    if (!VALID_STATUSES.includes(updates.status)) {
      const err = new Error(`无效的状态值，允许值为: ${VALID_STATUSES.join(", ")}`);
      err.statusCode = 400;
      throw err;
    }
    task.status = updates.status;
  }
  if (updates.title !== undefined) {
    const trimmed = typeof updates.title === "string" ? updates.title.trim() : "";
    if (!trimmed) {
      const err = new Error("任务标题不能为空");
      err.statusCode = 400;
      throw err;
    }
    task.title = trimmed;
  }
  return task;
}

function deleteTask(id) {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    const err = new Error("任务不存在");
    err.statusCode = 404;
    throw err;
  }
  const [removed] = tasks.splice(idx, 1);
  return removed;
}

// 测试辅助：重置为初始状态
function reset() {
  tasks = [];
  nextId = 1;
  seed();
}

seed();

export {
  VALID_STATUSES,
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  reset,
};
