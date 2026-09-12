// 服务器启动入口
import { createApp } from "./app.js";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const app = createApp();

app.listen(PORT, HOST, () => {
  console.log(`任务看板服务已启动: http://${HOST}:${PORT}`);
});
