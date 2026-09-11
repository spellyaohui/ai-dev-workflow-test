// 前端逻辑：与后端任务 API 交互并渲染看板
const STATUS_LABELS = {
  todo: "待办",
  in_progress: "进行中",
  done: "已完成",
};

const board = document.getElementById("board");
const createForm = document.getElementById("createForm");
const titleInput = document.getElementById("titleInput");
const toastEl = document.getElementById("toast");
const healthPill = document.getElementById("healthPill");
const healthText = document.getElementById("healthText");

let toastTimer = null;

function showToast(message, isError = false) {
  toastEl.textContent = message;
  toastEl.classList.toggle("error", isError);
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let msg = `请求失败 (${res.status})`;
    try {
      const data = await res.json();
      if (data.error) msg = data.error;
    } catch (_) {}
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

async function loadTasks() {
  const tasks = await api("/api/tasks");
  render(tasks);
}

function render(tasks) {
  const byStatus = { todo: [], in_progress: [], done: [] };
  for (const t of tasks) {
    (byStatus[t.status] || byStatus.todo).push(t);
  }

  for (const status of Object.keys(byStatus)) {
    const container = board.querySelector(`[data-cards="${status}"]`);
    const countEl = board.querySelector(`[data-count="${status}"]`);
    container.innerHTML = "";
    countEl.textContent = byStatus[status].length;

    if (byStatus[status].length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "暂无任务";
      container.appendChild(empty);
      continue;
    }

    for (const task of byStatus[status]) {
      container.appendChild(renderCard(task));
    }
  }
}

function renderCard(task) {
  const card = document.createElement("div");
  card.className = "card" + (task.status === "done" ? " done" : "");
  card.dataset.id = task.id;

  const title = document.createElement("div");
  title.className = "card-title";
  title.textContent = task.title;
  card.appendChild(title);

  const actions = document.createElement("div");
  actions.className = "card-actions";

  // 状态迁移按钮
  const transitions = {
    todo: [["in_progress", "开始 →"]],
    in_progress: [["todo", "← 退回"], ["done", "完成 ✓"]],
    done: [["in_progress", "↩ 重开"]],
  };
  for (const [next, label] of transitions[task.status] || []) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.onclick = () => moveTask(task.id, next);
    actions.appendChild(btn);
  }

  const del = document.createElement("button");
  del.className = "del";
  del.textContent = "删除";
  del.onclick = () => removeTask(task.id);
  actions.appendChild(del);

  card.appendChild(actions);
  return card;
}

async function moveTask(id, status) {
  try {
    await api(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    showToast(`已移动到「${STATUS_LABELS[status]}」`);
    await loadTasks();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function removeTask(id) {
  try {
    await api(`/api/tasks/${id}`, { method: "DELETE" });
    showToast("任务已删除");
    await loadTasks();
  } catch (err) {
    showToast(err.message, true);
  }
}

createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  try {
    await api("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    titleInput.value = "";
    showToast("任务已创建");
    await loadTasks();
  } catch (err) {
    showToast(err.message, true);
  }
});

async function checkHealth() {
  try {
    const data = await api("/api/health");
    if (data.status === "ok") {
      healthPill.classList.add("ok");
      healthPill.classList.remove("down");
      healthText.textContent = "服务正常";
      return;
    }
    throw new Error("异常");
  } catch (_) {
    healthPill.classList.add("down");
    healthPill.classList.remove("ok");
    healthText.textContent = "服务不可用";
  }
}

(async function init() {
  await checkHealth();
  try {
    await loadTasks();
  } catch (err) {
    showToast(err.message, true);
  }
  setInterval(checkHealth, 15000);
})();
