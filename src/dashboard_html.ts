// Teaven Email - 全新橙色主题 Dashboard HTML
// 设计风格：现代高端、橙色主题、超大字体层次、卡片式布局

export function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teaven Email - 多租户邮件平台</title>
  <!-- IconPark Icons - 国内CDN -->
  <link rel="stylesheet" href="https://lf6-fe.byted.org/obj/tds/icons/2.2.0/iconpark.css">
  <style>
    :root {
      /* 橙色主题色彩系统 - OKLCH */
      --orange-50: oklch(97% 0.02 50);
      --orange-100: oklch(93% 0.04 50);
      --orange-200: oklch(86% 0.08 50);
      --orange-300: oklch(78% 0.12 48);
      --orange-400: oklch(70% 0.16 45);
      --orange-500: oklch(65% 0.18 42);
      --orange-600: oklch(55% 0.16 38);
      --orange-700: oklch(48% 0.14 35);
      --orange-800: oklch(40% 0.10 32);

      /* 主色 */
      --primary: var(--orange-500);
      --primary-hover: var(--orange-600);
      --primary-glow: oklch(65% 0.25 42 / 0.3);

      /* 深色背景 - 暖色调灰 */
      --bg-base: oklch(14% 0.015 45);
      --bg-elevated: oklch(18% 0.018 45);
      --bg-card: oklch(22% 0.02 45);
      --bg-card-hover: oklch(26% 0.022 45);
      --bg-input: oklch(16% 0.015 45);

      /* 边框 */
      --border: oklch(30% 0.015 45);
      --border-focus: var(--primary);

      /* 文字 */
      --text-primary: oklch(98% 0.01 50);
      --text-secondary: oklch(70% 0.02 50);
      --text-muted: oklch(50% 0.015 45);

      /* 语义色 */
      --success: oklch(70% 0.15 145);
      --warning: oklch(80% 0.15 85);
      --danger: oklch(65% 0.2 25);
      --info: oklch(75% 0.12 220);

      /* 圆角 */
      --radius-sm: 6px;
      --radius-md: 12px;
      --radius-lg: 20px;
      --radius-xl: 28px;

      /* 阴影 - 橙色光晕 */
      --shadow-sm: 0 2px 8px oklch(0% 0 0 / 0.3);
      --shadow-md: 0 8px 24px oklch(0% 0 0 / 0.4);
      --shadow-lg: 0 16px 48px oklch(0% 0 0 / 0.5);
      --shadow-glow: 0 0 40px var(--primary-glow);

      /* 过渡 */
      --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
      --transition-fast: 150ms var(--ease-out-quart);
      --transition-normal: 300ms var(--ease-out-quart);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      font-size: 16px;
      scroll-behavior: smooth;
    }

    body {
      font-family: "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg-base);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    /* ========== 布局 ========== */
    .app {
      display: flex;
      min-height: 100vh;
    }

    /* 侧边栏 */
    .sidebar {
      width: 280px;
      background: var(--bg-elevated);
      border-right: 1px solid var(--border);
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      z-index: 100;
    }

    .sidebar-header {
      padding: 32px 28px;
      border-bottom: 1px solid var(--border);
    }

    .logo {
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, var(--orange-400), var(--orange-600));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .logo-sub {
      font-size: 0.7rem;
      font-weight: 400;
      color: var(--text-muted);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      text-decoration: none;
    }

    .nav-item .icon {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
      flex-shrink: 0;
    }

    .nav-item:hover {
      background: var(--bg-card);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: linear-gradient(135deg, oklch(55% 0.18 42 / 0.2), oklch(55% 0.18 42 / 0.05));
      color: var(--primary);
      border: 1px solid oklch(55% 0.18 42 / 0.3);
    }

    .nav-item.active .icon {
      color: var(--primary);
    }

    .sidebar-footer {
      padding: 24px 28px;
      border-top: 1px solid var(--border);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--orange-400), var(--orange-600));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      color: white;
    }

    .user-name {
      font-size: 0.9rem;
      font-weight: 600;
    }

    .user-email {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    /* 主内容区 */
    .main {
      flex: 1;
      margin-left: 280px;
      padding: 48px 56px;
      max-width: 1400px;
    }

    /* 页面标题 */
    .page-header {
      margin-bottom: 48px;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 8px;
      letter-spacing: 0.05em;
    }

    /* ========== 卡片系统 ========== */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px;
      transition: all var(--transition-normal);
    }

    .card:hover {
      border-color: oklch(40% 0.12 42 / 0.3);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .card-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    /* ========== 统计卡片 ========== */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px;
      position: relative;
      overflow: hidden;
      transition: all var(--transition-normal);
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary), transparent);
      opacity: 0.6;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 20px;
    }

    .stat-icon.orange {
      background: oklch(55% 0.18 42 / 0.15);
      color: var(--primary);
    }

    .stat-icon.green {
      background: oklch(70% 0.15 145 / 0.15);
      color: var(--success);
    }

    .stat-icon.red {
      background: oklch(65% 0.2 25 / 0.15);
      color: var(--danger);
    }

    .stat-icon.yellow {
      background: oklch(80% 0.15 85 / 0.15);
      color: var(--warning);
    }

    .stat-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 2.75rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      line-height: 1;
    }

    .stat-value.orange { color: var(--primary); }
    .stat-value.green { color: var(--success); }
    .stat-value.red { color: var(--danger); }
    .stat-value.yellow { color: var(--warning); }

    .stat-change {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* ========== 按钮 ========== */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: var(--radius-md);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all var(--transition-fast);
      text-decoration: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--orange-500), var(--orange-600));
      color: white;
      box-shadow: 0 4px 16px oklch(55% 0.18 42 / 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px oklch(55% 0.18 42 / 0.4);
    }

    .btn-secondary {
      background: var(--bg-card);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      background: var(--bg-card-hover);
      border-color: var(--primary);
    }

    .btn-danger {
      background: transparent;
      color: var(--danger);
      border: 1px solid var(--danger);
    }

    .btn-danger:hover {
      background: var(--danger);
      color: white;
    }

    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }

    .btn-ghost:hover {
      background: var(--bg-card);
      color: var(--text-primary);
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 0.8rem;
    }

    .btn-lg {
      padding: 16px 32px;
      font-size: 1rem;
    }

    /* ========== 表单 ========== */
    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .form-input,
    .form-select,
    .form-textarea {
      width: 100%;
      padding: 14px 18px;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.95rem;
      outline: none;
      transition: all var(--transition-fast);
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px oklch(55% 0.18 42 / 0.15);
    }

    .form-input::placeholder {
      color: var(--text-muted);
    }

    .form-textarea {
      min-height: 200px;
      resize: vertical;
      font-family: "JetBrains Mono", "Fira Code", monospace;
    }

    .form-hint {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 6px;
    }

    /* ========== 徽章 ========== */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-success {
      background: oklch(70% 0.15 145 / 0.15);
      color: var(--success);
    }

    .badge-warning {
      background: oklch(80% 0.15 85 / 0.15);
      color: var(--warning);
    }

    .badge-danger {
      background: oklch(65% 0.2 25 / 0.15);
      color: var(--danger);
    }

    .badge-info {
      background: oklch(55% 0.18 42 / 0.15);
      color: var(--primary);
    }

    .badge-muted {
      background: oklch(50% 0.015 45 / 0.5);
      color: var(--text-muted);
    }

    /* ========== 标签页 ========== */
    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 28px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0;
    }

    .tab {
      padding: 12px 24px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      transition: all var(--transition-fast);
      margin-bottom: -1px;
    }

    .tab:hover {
      color: var(--text-primary);
    }

    .tab.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }

    /* ========== 模态框 ========== */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: oklch(0% 0 0 / 0.7);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 24px;
    }

    .modal {
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 36px;
      width: 100%;
      max-width: 640px;
      max-height: 90vh;
      overflow-y: auto;
      animation: modalIn 0.3s var(--ease-out-quart);
    }

    @keyframes modalIn {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 24px;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }

    /* ========== Toast ========== */
    .toast {
      position: fixed;
      top: 32px;
      right: 32px;
      padding: 16px 28px;
      border-radius: var(--radius-md);
      color: white;
      font-size: 0.9rem;
      font-weight: 500;
      z-index: 2000;
      animation: toastIn 0.4s var(--ease-out-quart);
      box-shadow: var(--shadow-lg);
    }

    .toast-success {
      background: var(--success);
    }

    .toast-error {
      background: var(--danger);
    }

    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    /* ========== 空状态 ========== */
    .empty-state {
      text-align: center;
      padding: 64px 32px;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: var(--bg-card);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: var(--text-muted);
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .empty-desc {
      font-size: 0.9rem;
      color: var(--text-muted);
      max-width: 400px;
      margin: 0 auto;
    }

    /* ========== 代码块 ========== */
    .code-block {
      background: var(--bg-base);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 20px;
      font-family: "JetBrains Mono", "Fira Code", monospace;
      font-size: 0.85rem;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
      color: var(--success);
    }

    .key-highlight {
      background: oklch(55% 0.18 42 / 0.2);
      color: var(--primary);
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }

    /* ========== 列表卡片 ========== */
    .list-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      transition: all var(--transition-fast);
    }

    .list-item:last-child {
      border-bottom: none;
    }

    .list-item:hover {
      background: var(--bg-card-hover);
    }

    .list-item-info {
      flex: 1;
    }

    .list-item-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .list-item-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .list-item-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    /* ========== 工具栏 ========== */
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* ========== 响应式 ========== */
    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform var(--transition-normal);
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .main {
        margin-left: 0;
        padding: 24px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .page-title {
        font-size: 1.75rem;
      }

      .toolbar {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
    }
  </style>
</head>
<body>
  <div class="app">
    <nav class="sidebar">
      <div class="sidebar-header">
        <div class="logo">Teaven</div>
        <div class="logo-sub">Mail Platform</div>
      </div>
      <div class="sidebar-nav">
        <button class="nav-item active" data-page="dashboard">
          <span class="icon iconpark-home"></span>
          仪表盘
        </button>
        <button class="nav-item" data-page="api-keys">
          <span class="icon iconpark-key"></span>
          API Keys
        </button>
        <button class="nav-item" data-page="templates">
          <span class="icon iconpark-file-text"></span>
          模板管理
        </button>
        <button class="nav-item" data-page="providers">
          <span class="icon iconpark-connected"></span>
          发送通道
        </button>
        <button class="nav-item" data-page="logs">
          <span class="icon iconpark-time"></span>
          发送日志
        </button>
      </div>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">A</div>
          <div>
            <div class="user-name">Admin</div>
            <div class="user-email">admin@teaven.com</div>
          </div>
        </div>
      </div>
    </nav>
    <main class="main" id="main-content"></main>
  </div>
  <div id="toast-container"></div>

  <script>
    const API_BASE = '/v1';
    const API_KEY = localStorage.getItem('teaven_api_key') || '';

    function esc(s) {
      if (!s) return '';
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    async function api(path, opts = {}) {
      const res = await fetch(API_BASE + path, {
        headers: {
          'Authorization': 'Bearer ' + API_KEY,
          'Content-Type': 'application/json',
          ...opts.headers
        },
        ...opts
      });
      return res.json();
    }

    function toast(msg, type = 'success') {
      const c = document.getElementById('toast-container');
      const el = document.createElement('div');
      el.className = 'toast toast-' + type;
      el.textContent = msg;
      c.appendChild(el);
      setTimeout(function() { el.remove(); }, 3000);
    }

    // 导航
    document.querySelectorAll('.nav-item').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderPage(btn.dataset.page);
      });
    });

    function renderPage(page) {
      var main = document.getElementById('main-content');
      switch (page) {
        case 'dashboard': renderDashboard(main); break;
        case 'api-keys': renderApiKeys(main); break;
        case 'templates': renderTemplates(main); break;
        case 'providers': renderProviders(main); break;
        case 'logs': renderLogs(main); break;
      }
    }

    // 仪表盘
    async function renderDashboard(main) {
      if (!API_KEY) { main.innerHTML = setupPage(); return; }
      var resp = await api('/dashboard/overview');
      if (!resp.success) { main.innerHTML = setupPage(); return; }
      var d = resp.data;

      main.innerHTML = `
        <div class="page-header">
          <h1 class="page-title">仪表盘</h1>
          <p class="page-subtitle">MAIL PLATFORM DASHBOARD</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon orange"><span class="iconpark-mail"></span></div>
            <div class="stat-label">今日发送</div>
            <div class="stat-value orange">\${d.today.sent}</div>
            <div class="stat-change">封邮件已投递</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green"><span class="iconpark-check-circle"></span></div>
            <div class="stat-label">送达数量</div>
            <div class="stat-value green">\${d.today.delivered}</div>
            <div class="stat-change">封成功送达</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon red"><span class="iconpark-close-circle"></span></div>
            <div class="stat-label">发送失败</div>
            <div class="stat-value red">\${d.today.failed}</div>
            <div class="stat-change">封投递失败</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon yellow"><span class="iconpark-warning"></span></div>
            <div class="stat-label">退信数量</div>
            <div class="stat-value yellow">\${d.today.bounced}</div>
            <div class="stat-change">封被退回</div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 32px;">
          <div class="card-header">
            <div>
              <div class="card-title">平台概览</div>
              <div class="card-subtitle">RESOURCE STATISTICS</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;">
            <div style="text-align: center; padding: 24px; background: var(--bg-base); border-radius: var(--radius-md);">
              <div style="font-size: 2rem; font-weight: 800; color: var(--primary);">\${d.templates_count}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">模板数量</div>
            </div>
            <div style="text-align: center; padding: 24px; background: var(--bg-base); border-radius: var(--radius-md);">
              <div style="font-size: 2rem; font-weight: 800; color: var(--info);">\${d.providers_count}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">发送通道</div>
            </div>
            <div style="text-align: center; padding: 24px; background: var(--bg-base); border-radius: var(--radius-md);">
              <div style="font-size: 2rem; font-weight: 800; color: var(--success);">\${d.accounts_count}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">发件账号</div>
            </div>
            <div style="text-align: center; padding: 24px; background: var(--bg-base); border-radius: var(--radius-md);">
              <div style="font-size: 2rem; font-weight: 800; color: var(--warning);">\${d.api_keys_count}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">API Keys</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">近 7 天发送趋势</div>
              <div class="card-subtitle">SEND TREND / LAST 7 DAYS</div>
            </div>
          </div>
          <div class="list-card">
            \${(d.recent_7_days || []).map(function(s) {
              return '<div class="list-item">' +
                '<div class="list-item-info">' +
                  '<div class="list-item-title">' + esc(s.date) + '</div>' +
                  '<div class="list-item-subtitle">发送: ' + (s.total_sent || 0) + ' / 送达: ' + (s.total_delivered || 0) + ' / 失败: ' + (s.total_failed || 0) + ' / 退信: ' + (s.total_bounced || 0) + '</div>' +
                '</div>' +
                '<div class="list-item-actions">' +
                  '<span class="badge ' + (s.total_failed > 0 ? 'badge-danger' : 'badge-success') + '">' + (s.total_failed > 0 ? '有失败' : '正常') + '</span>' +
                '</div>' +
              '</div>';
            }).join('') || '<div class="empty-state"><div class="empty-title">暂无数据</div></div>'}
          </div>
        </div>
      `;
    }

    // API Keys
    async function renderApiKeys(main) {
      if (!API_KEY) { main.innerHTML = setupPage(); return; }
      var resp = await api('/api-keys');
      var keys = resp.data || [];

      main.innerHTML = `
        <div class="page-header">
          <h1 class="page-title">API Keys</h1>
          <p class="page-subtitle">MANAGE YOUR API ACCESS KEYS</p>
        </div>

        <div class="toolbar">
          <div class="toolbar-left"></div>
          <div class="toolbar-right">
            <button class="btn btn-primary" onclick="showCreateApiKeyModal()">
              <span class="iconpark-plus"></span>
              创建 API Key
            </button>
          </div>
        </div>

        <div class="card">
          \${keys.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon"><span class="iconpark-key"></span></div>
              <div class="empty-title">暂无 API Key</div>
              <div class="empty-desc">创建你的第一个 API Key 来开始使用邮件服务</div>
            </div>
          ` : `
            <div class="list-card">
              \${keys.map(function(k) {
                return '<div class="list-item">' +
                  '<div class="list-item-info">' +
                    '<div class="list-item-title">' + esc(k.name) + '</div>' +
                    '<div class="list-item-subtitle">前缀: ' + esc(k.prefix) + '*** · 最后使用: ' + (k.last_used_at ? new Date(k.last_used_at).toLocaleString('zh-CN') : '从未使用') + '</div>' +
                  '</div>' +
                  '<div class="list-item-actions">' +
                    '<span class="badge ' + (k.enabled ? 'badge-success' : 'badge-muted') + '">' + (k.enabled ? '启用' : '禁用') + '</span>' +
                    '<button class="btn btn-sm btn-ghost" data-keyid="' + esc(k.id) + '" data-keyenabled="' + (!k.enabled ? 1 : 0) + '" onclick="toggleApiKey(this.dataset.keyid, +this.dataset.keyenabled)">' + (k.enabled ? '禁用' : '启用') + '</button>' +
                    '<button class="btn btn-sm btn-danger" data-keyid="' + esc(k.id) + '" onclick="deleteApiKey(this.dataset.keyid)">删除</button>' +
                  '</div>' +
                '</div>';
              }).join('')}
            </div>
          `}
        </div>
      `;
    }

    function showCreateApiKeyModal() {
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = '<div class="modal">' +
        '<div class="modal-title">创建 API Key</div>' +
        '<div class="form-group">' +
          '<label class="form-label">名称</label>' +
          '<input class="form-input" id="ak-name" placeholder="如：官网生产环境">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">权限</label>' +
          '<div style="display: flex; flex-wrap: wrap; gap: 12px;">' +
            ['SEND_MAIL', 'MANAGE_TEMPLATE', 'READ_LOG', 'MANAGE_PROVIDER'].map(function(p) {
              return '<label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 10px 16px; background: var(--bg-base); border-radius: var(--radius-md);">' +
                '<input type="checkbox" value="' + p + '" ' + (p === 'SEND_MAIL' ? 'checked' : '') + ' class="ak-perm" style="accent-color: var(--primary);">' +
                '<span style="font-size: 0.85rem;">' + p + '</span>' +
              '</label>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" onclick="this.closest(\'.modal-overlay\').remove()">取消</button>' +
          '<button class="btn btn-primary" id="ak-create-btn">创建</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(overlay);

      overlay.querySelector('#ak-create-btn').addEventListener('click', async function() {
        var name = overlay.querySelector('#ak-name').value.trim();
        if (!name) { toast('请输入名称', 'error'); return; }
        var perms = [...overlay.querySelectorAll('.ak-perm:checked')].map(function(cb) { return cb.value; });
        var resp = await api('/api-keys', { method: 'POST', body: JSON.stringify({ name: name, permissions: perms }) });
        if (resp.success) {
          overlay.remove();
          var main = document.getElementById('main-content');
          main.insertAdjacentHTML('afterbegin', '<div class="card" style="border-color: var(--success); margin-bottom: 24px;" id="key-reveal">' +
            '<div class="card-header">' +
              '<div class="card-title">API Key 创建成功</div>' +
              '<button class="btn btn-sm btn-ghost" onclick="document.getElementById(\'key-reveal\').remove()">关闭</button>' +
            '</div>' +
            '<p style="color: var(--text-muted); margin-bottom: 12px;">请立即复制并安全保存此 Key，关闭后将无法再次查看。</p>' +
            '<div class="code-block"><span class="key-highlight">' + esc(resp.data.api_key) + '</span></div>' +
          '</div>');
          renderApiKeys(main);
          toast('API Key 创建成功');
        } else {
          toast(resp.error, 'error');
        }
      });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

    async function toggleApiKey(id, enabled) {
      await api('/api-keys/' + id + '/toggle', { method: 'PUT', body: JSON.stringify({ enabled: enabled }) });
      renderPage('api-keys');
    }

    async function deleteApiKey(id) {
      if (!confirm('确定删除此 API Key？此操作不可撤销。')) return;
      await api('/api-keys/' + id, { method: 'DELETE' });
      renderPage('api-keys');
      toast('API Key 已删除');
    }

    // 模板管理
    async function renderTemplates(main) {
      if (!API_KEY) { main.innerHTML = setupPage(); return; }
      var resp = await api('/templates');
      var templates = resp.data || [];

      main.innerHTML = `
        <div class="page-header">
          <h1 class="page-title">模板管理</h1>
          <p class="page-subtitle">EMAIL TEMPLATE LIBRARY</p>
        </div>

        <div class="toolbar">
          <div class="toolbar-left"></div>
          <div class="toolbar-right">
            <button class="btn btn-primary" onclick="showTemplateModal()">
              <span class="iconpark-plus"></span>
              创建模板
            </button>
          </div>
        </div>

        <div class="card">
          \${templates.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon"><span class="iconpark-file-text"></span></div>
              <div class="empty-title">暂无模板</div>
              <div class="empty-desc">创建邮件模板后，通过 API 调用模板编号即可发送邮件</div>
            </div>
          ` : `
            <div class="list-card">
              \${templates.map(function(t) {
                var vars = typeof t.variables === 'string' ? JSON.parse(t.variables) : (t.variables || []);
                return '<div class="list-item">' +
                  '<div class="list-item-info">' +
                    '<div class="list-item-title"><code style="background: var(--bg-base); padding: 4px 8px; border-radius: 4px; margin-right: 8px;">' + esc(t.template_code) + '</code>' + esc(t.name) + '</div>' +
                    '<div class="list-item-subtitle">分类: <span class="badge badge-info">' + esc(t.category) + '</span> · 版本: v' + t.version + ' · 变量: ' + vars.length + '个</div>' +
                  '</div>' +
                  '<div class="list-item-actions">' +
                    '<button class="btn btn-sm btn-ghost" data-tcode="' + esc(t.template_code) + '" onclick="previewTemplate(this.dataset.tcode)">预览</button>' +
                    '<button class="btn btn-sm btn-ghost" data-tcode="' + esc(t.template_code) + '" onclick="editTemplate(this.dataset.tcode)">编辑</button>' +
                    '<button class="btn btn-sm btn-danger" data-tcode="' + esc(t.template_code) + '" onclick="deleteTemplate(this.dataset.tcode)">删除</button>' +
                  '</div>' +
                '</div>';
              }).join('')}
            </div>
          `}
        </div>
      `;
    }

    function showTemplateModal(code) {
      var isEdit = !!code;
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = '<div class="modal" style="max-width: 720px;">' +
        '<div class="modal-title">' + (isEdit ? '编辑模板' : '创建模板') + '</div>' +
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">' +
          '<div class="form-group">' +
            '<label class="form-label">模板编号 *</label>' +
            '<input class="form-input" id="tmpl-code" placeholder="如：VERIFY_CODE" ' + (isEdit ? 'disabled' : '') + '>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">模板名称 *</label>' +
            '<input class="form-input" id="tmpl-name" placeholder="如：验证码邮件">' +
          '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">分类</label>' +
          '<select class="form-select" id="tmpl-category">' +
            '<option value="VERIFY">VERIFY - 验证</option>' +
            '<option value="NOTIFY">NOTIFY - 通知</option>' +
            '<option value="MARKETING">MARKETING - 营销</option>' +
            '<option value="SYSTEM">SYSTEM - 系统</option>' +
          '</select>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">邮件主题 *</label>' +
          '<input class="form-input" id="tmpl-subject" placeholder="如：您的验证码是 {{code}}">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">HTML 内容 *</label>' +
          '<textarea class="form-textarea" id="tmpl-html" placeholder="<h1>您的验证码：{{code}}</h1>"></textarea>' +
          '<div class="form-hint">支持 Handlebars 模板语法，变量使用 {{变量名}}</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">纯文本内容（可选）</label>' +
          '<textarea class="form-input" id="tmpl-text" style="min-height: 80px;" placeholder="自动从 HTML 生成，也可手动输入"></textarea>' +
        '</div>' +
        (isEdit ? '<div class="form-group"><label class="form-label">更新说明</label><input class="form-input" id="tmpl-changelog" placeholder="如：修改了按钮颜色"></div>' : '') +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" onclick="this.closest(\'.modal-overlay\').remove()">取消</button>' +
          '<button class="btn btn-primary" id="tmpl-save-btn">' + (isEdit ? '更新' : '创建') + '</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(overlay);

      if (isEdit) {
        api('/templates/' + code).then(function(resp) {
          if (resp.data) {
            overlay.querySelector('#tmpl-code').value = resp.data.template_code;
            overlay.querySelector('#tmpl-name').value = resp.data.name;
            overlay.querySelector('#tmpl-category').value = resp.data.category;
            overlay.querySelector('#tmpl-subject').value = resp.data.subject;
            overlay.querySelector('#tmpl-html').value = resp.data.html;
            overlay.querySelector('#tmpl-text').value = resp.data.text_content || '';
          }
        });
      }

      overlay.querySelector('#tmpl-save-btn').addEventListener('click', async function() {
        var codeVal = overlay.querySelector('#tmpl-code').value.trim();
        var name = overlay.querySelector('#tmpl-name').value.trim();
        var category = overlay.querySelector('#tmpl-category').value;
        var subject = overlay.querySelector('#tmpl-subject').value.trim();
        var html = overlay.querySelector('#tmpl-html').value.trim();
        var textContent = overlay.querySelector('#tmpl-text').value.trim();
        var changelog = overlay.querySelector('#tmpl-changelog') ? overlay.querySelector('#tmpl-changelog').value.trim() : null;

        if (!codeVal || !name || !subject || !html) { toast('请填写所有必填字段', 'error'); return; }

        var method = isEdit ? 'PUT' : 'POST';
        var url = isEdit ? '/templates/' + code : '/templates';
        var body = { template_code: codeVal, name: name, category: category, subject: subject, html: html, text_content: textContent || null };
        if (isEdit && changelog) body.changelog = changelog;

        var resp = await api(url, { method: method, body: JSON.stringify(body) });
        if (resp.success) { overlay.remove(); renderPage('templates'); toast(isEdit ? '模板已更新' : '模板创建成功'); }
        else toast(resp.error, 'error');
      });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

    function editTemplate(code) { showTemplateModal(code); }

    async function deleteTemplate(code) {
      if (!confirm('确定删除模板 "' + code + '"？')) return;
      await api('/templates/' + code, { method: 'DELETE' });
      renderPage('templates');
      toast('模板已删除');
    }

    async function previewTemplate(code) {
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = '<div class="modal" style="max-width: 800px;">' +
        '<div class="modal-title">预览模板: ' + esc(code) + '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">测试变量 (JSON)</label>' +
          '<input class="form-input" id="pv-vars" placeholder=\'{"code":"123456"}\' value="{}">' +
        '</div>' +
        '<div id="pv-result" style="margin: 20px 0;"></div>' +
        '<div style="display: flex; gap: 12px; justify-content: flex-end;">' +
          '<button class="btn btn-ghost" onclick="this.closest(\'.modal-overlay\').remove()">关闭</button>' +
          '<button class="btn btn-primary" id="pv-refresh">刷新预览</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(overlay);

      async function refresh() {
        var vars = {};
        try { vars = JSON.parse(overlay.querySelector('#pv-vars').value); } catch (e) {}
        var resp = await api('/templates/' + code + '/preview', { method: 'POST', body: JSON.stringify({ variables: vars }) });
        var data = resp.data || {};
        overlay.querySelector('#pv-result').innerHTML =
          '<div class="card" style="margin-bottom: 16px;"><div class="form-label">主题</div><div>' + esc(data.subject || '') + '</div></div>' +
          '<div class="card"><div class="form-label">HTML 预览</div><div style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 24px; background: #fff; color: #000;">' + (data.html || '<em style="color: #999;">无内容</em>') + '</div></div>' +
          (data.render_errors && data.render_errors.length ? '<div style="color: var(--danger); margin-top: 12px;">警告: ' + data.render_errors.join(', ') + '</div>' : '');
      }
      refresh();
      overlay.querySelector('#pv-refresh').addEventListener('click', refresh);
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

    // 发送通道
    async function renderProviders(main) {
      if (!API_KEY) { main.innerHTML = setupPage(); return; }
      var pResp = await api('/providers');
      var rResp = await api('/providers/routes');
      var providers = pResp.data || [];
      var routes = rResp.data || [];

      main.innerHTML = `
        <div class="page-header">
          <h1 class="page-title">发送通道</h1>
          <p class="page-subtitle">MAIL DELIVERY PROVIDERS CONFIGURATION</p>
        </div>

        <div class="tabs">
          <button class="tab active" onclick="switchProviderTab('providers')">发送通道列表</button>
          <button class="tab" onclick="switchProviderTab('routes')">分类路由</button>
        </div>

        <div id="provider-tab-providers">
          <div class="card">
            \${providers.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon"><span class="iconpark-connected"></span></div>
                <div class="empty-title">暂无发送通道</div>
                <div class="empty-desc">请联系管理员在后台添加全局发送通道配置</div>
              </div>
            ` : `
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                \${providers.map(function(p) {
                  var config = typeof p.config === 'string' ? JSON.parse(p.config) : p.config;
                  var configInfo = p.type === 'smtp' ? 'SMTP: ' + config.host + ':' + config.port : (p.type === 'api' ? 'API: ' + (config.provider_name || 'Generic') : 'Cloudflare: ' + (config.domain || ''));
                  return '<div style="background: var(--bg-base); border-radius: var(--radius-md); padding: 20px;">' +
                    '<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">' +
                      '<div style="font-weight: 600; font-size: 1.05rem;">' + esc(p.name) + '</div>' +
                      '<span class="badge ' + (p.enabled ? 'badge-success' : 'badge-muted') + '">' + (p.enabled ? '启用' : '禁用') + '</span>' +
                    '</div>' +
                    '<div style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 12px;">' + esc(configInfo) + '</div>' +
                    '<span class="badge badge-info">' + esc(p.type) + '</span>' +
                  '</div>';
                }).join('')}
              </div>
            `}
          </div>
        </div>

        <div id="provider-tab-routes" style="display: none;">
          <div class="toolbar">
            <div class="toolbar-left"></div>
            <div class="toolbar-right">
              <button class="btn btn-primary" onclick="showRouteModal()">
                <span class="iconpark-plus"></span>
                添加路由规则
              </button>
            </div>
          </div>
          <div class="card">
            \${routes.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon"><span class="iconpark-git-branch"></span></div>
                <div class="empty-title">暂无路由规则</div>
                <div class="empty-desc">配置不同邮件分类使用不同的发送通道发送</div>
              </div>
            ` : `
              <div class="list-card">
                \${routes.map(function(r) {
                  return '<div class="list-item">' +
                    '<div class="list-item-info">' +
                      '<div class="list-item-title"><span class="badge badge-info">' + esc(r.category) + '</span></div>' +
                      '<div class="list-item-subtitle">发送通道: ' + esc(r.provider_id) + ' · 优先级: ' + r.priority + '</div>' +
                    '</div>' +
                    '<div class="list-item-actions">' +
                      '<button class="btn btn-sm btn-danger" data-rid="' + esc(r.id) + '" onclick="deleteRoute(this.dataset.rid)">删除</button>' +
                    '</div>' +
                  '</div>';
                }).join('')}
              </div>
            `}
          </div>
        </div>
      `;
    }

    function switchProviderTab(tab) {
      ['providers', 'routes'].forEach(function(t) {
        document.getElementById('provider-tab-' + t).style.display = t === tab ? 'block' : 'none';
      });
      document.querySelectorAll('.tab').forEach(function(b, i) {
        b.classList.toggle('active', ['providers', 'routes'][i] === tab);
      });
    }

    function showRouteModal() {
      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = '<div class="modal">' +
        '<div class="modal-title">添加分类路由</div>' +
        '<div class="form-group">' +
          '<label class="form-label">分类 *</label>' +
          '<select class="form-select" id="rt-category">' +
            '<option value="VERIFY">VERIFY</option>' +
            '<option value="NOTIFY">NOTIFY</option>' +
            '<option value="MARKETING">MARKETING</option>' +
            '<option value="SYSTEM">SYSTEM</option>' +
          '</select>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">发送通道 ID *</label>' +
          '<input class="form-input" id="rt-provider" placeholder="发送通道 ID">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">账号 ID（可选）</label>' +
          '<input class="form-input" id="rt-account" placeholder="留空则自动选择">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="form-label">优先级</label>' +
          '<input class="form-input" id="rt-priority" type="number" value="0">' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-ghost" onclick="this.closest(\'.modal-overlay\').remove()">取消</button>' +
          '<button class="btn btn-primary" id="rt-save-btn">创建</button>' +
        '</div>' +
      '</div>';
      document.body.appendChild(overlay);

      overlay.querySelector('#rt-save-btn').addEventListener('click', async function() {
        var category = overlay.querySelector('#rt-category').value;
        var provider_id = overlay.querySelector('#rt-provider').value.trim();
        var account_id = overlay.querySelector('#rt-account').value.trim() || null;
        var priority = parseInt(overlay.querySelector('#rt-priority').value || '0');
        if (!category || !provider_id) { toast('请填写必填字段', 'error'); return; }
        var resp = await api('/providers/routes', { method: 'POST', body: JSON.stringify({ category: category, provider_id: provider_id, account_id: account_id, priority: priority }) });
        if (resp.success) { overlay.remove(); renderPage('providers'); toast('路由创建成功'); }
        else toast(resp.error, 'error');
      });
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    }

    async function deleteRoute(id) {
      if (!confirm('确定删除此路由规则？')) return;
      await api('/providers/routes/' + id, { method: 'DELETE' });
      renderPage('providers');
      toast('路由已删除');
    }

    // 发送日志
    async function renderLogs(main) {
      if (!API_KEY) { main.innerHTML = setupPage(); return; }
      var resp = await api('/mail/logs?limit=100');
      var logs = resp.data || [];

      main.innerHTML = `
        <div class="page-header">
          <h1 class="page-title">发送日志</h1>
          <p class="page-subtitle">MAIL DELIVERY LOGS</p>
        </div>

        <div class="card">
          \${logs.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon"><span class="iconpark-time"></span></div>
              <div class="empty-title">暂无日志</div>
              <div class="empty-desc">发送邮件后可以在此查看投递状态</div>
            </div>
          ` : `
            <div class="list-card">
              \${logs.map(function(l) {
                var badgeClass = l.status === 'sent' ? 'badge-success' : l.status === 'failed' ? 'badge-danger' : l.status === 'pending' ? 'badge-warning' : 'badge-muted';
                return '<div class="list-item">' +
                  '<div class="list-item-info">' +
                    '<div class="list-item-title">' + esc(l.to_email) + '</div>' +
                    '<div class="list-item-subtitle">' + new Date(l.created_at).toLocaleString('zh-CN') + ' · ' + esc(l.subject) + '</div>' +
                  '</div>' +
                  '<div class="list-item-actions">' +
                    '<span class="badge badge-info">' + esc(l.category || '-') + '</span>' +
                    '<span class="badge ' + badgeClass + '">' + esc(l.status) + '</span>' +
                    '<span style="color: var(--text-muted); font-size: 0.8rem;">重试: ' + l.retry_count + '</span>' +
                  '</div>' +
                '</div>';
              }).join('')}
            </div>
          `}
        </div>
      `;
    }

    // 登录页面
    function setupPage() {
      fetch(API_BASE + '/setup/status').then(function(r) { return r.json(); }).then(function(resp) {
        var needsSetup = resp.data && resp.data.needs_setup;
        var main = document.getElementById('main-content');
        if (needsSetup) {
          main.innerHTML = initPage();
        } else {
          main.innerHTML = loginPage();
        }
      }).catch(function() {
        document.getElementById('main-content').innerHTML = initPage();
      });
      return '<div style="text-align: center; padding: 120px; color: var(--text-muted);">加载中...</div>';
    }

    function loginPage() {
      return '<div style="max-width: 480px; margin: 100px auto;">' +
        '<div style="text-align: center; margin-bottom: 48px;">' +
          '<div style="font-size: 4rem; font-weight: 800; background: linear-gradient(135deg, var(--orange-400), var(--orange-600)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px;">Teaven</div>' +
          '<div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 8px;">欢迎回来</div>' +
          '<div style="color: var(--text-muted); font-size: 0.9rem;">登录到邮件管理平台</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="form-group">' +
            '<label class="form-label">邮箱</label>' +
            '<input class="form-input" id="login-email" type="email" placeholder="admin@example.com" value="' + esc(localStorage.getItem('teaven_email') || '') + '">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">密码</label>' +
            '<input class="form-input" id="login-password" type="password" placeholder="输入密码">' +
          '</div>' +
          '<button class="btn btn-primary btn-lg" onclick="doLogin()" style="width: 100%;">登 录</button>' +
          '<div style="text-align: center; margin-top: 24px; color: var(--text-muted);">' +
            '或 <a href="#" onclick="document.getElementById(\'main-content\').innerHTML=apiKeyFallbackPage(); return false;" style="color: var(--primary); text-decoration: none;">使用 API Key 登录</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    function apiKeyFallbackPage() {
      return '<div style="max-width: 480px; margin: 100px auto;">' +
        '<div style="text-align: center; margin-bottom: 48px;">' +
          '<div style="font-size: 3rem; margin-bottom: 16px;"><span class="iconpark-key" style="color: var(--primary);"></span></div>' +
          '<div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 8px;">API Key 登录</div>' +
          '<div style="color: var(--text-muted); font-size: 0.9rem;">使用 API Key 直接访问</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="form-group">' +
            '<label class="form-label">API Key</label>' +
            '<input class="form-input" id="setup-key" type="password" placeholder="sk_...">' +
          '</div>' +
          '<button class="btn btn-primary btn-lg" onclick="saveApiKey()" style="width: 100%;">进 入</button>' +
          '<div style="text-align: center; margin-top: 24px; color: var(--text-muted);">' +
            '<a href="#" onclick="document.getElementById(\'main-content\').innerHTML=loginPage(); return false;" style="color: var(--primary); text-decoration: none;">返回账号登录</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    function doLogin() {
      var email = document.getElementById('login-email').value.trim();
      var password = document.getElementById('login-password').value;
      if (!email || !password) { toast('请输入邮箱和密码', 'error'); return; }

      var btn = document.querySelector('.btn-primary');
      btn.disabled = true;
      btn.textContent = '登录中...';

      localStorage.setItem('teaven_email', email);

      fetch(API_BASE + '/setup/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      }).then(function(r) { return r.json(); }).then(function(resp) {
        if (resp.success) {
          var keys = resp.data.api_keys;
          var activeKey = keys.filter(function(k) { return k.enabled; })[0];
          if (activeKey) {
            fetch(API_BASE + '/setup/key-from-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: email, password: password, name: 'Dashboard Login' })
            }).then(function(r2) { return r2.json(); }).then(function(resp2) {
              if (resp2.success) {
                localStorage.setItem('teaven_api_key', resp2.data.api_key.key);
                location.reload();
              } else {
                toast('请使用 API Key 登录', 'error');
                document.getElementById('main-content').innerHTML = apiKeyFallbackPage();
              }
            });
          } else {
            toast('没有可用的 API Key', 'error');
            btn.disabled = false;
            btn.textContent = '登 录';
          }
        } else {
          toast(resp.error, 'error');
          btn.disabled = false;
          btn.textContent = '登 录';
        }
      }).catch(function() {
        toast('网络错误', 'error');
        btn.disabled = false;
        btn.textContent = '登 录';
      });
    }

    function initPage() {
      return '<div style="max-width: 480px; margin: 100px auto;">' +
        '<div style="text-align: center; margin-bottom: 48px;">' +
          '<div style="font-size: 4rem; font-weight: 800; background: linear-gradient(135deg, var(--orange-400), var(--orange-600)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px;">Teaven</div>' +
          '<div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 8px;">欢迎使用</div>' +
          '<div style="color: var(--text-muted); font-size: 0.9rem;">首次使用，请创建管理员账户</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="form-group">' +
            '<label class="form-label">姓名</label>' +
            '<input class="form-input" id="init-name" placeholder="如：张三">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">邮箱</label>' +
            '<input class="form-input" id="init-email" placeholder="admin@example.com">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">密码（至少6位）</label>' +
            '<input class="form-input" id="init-password" type="password" placeholder="至少6位密码">' +
          '</div>' +
          '<button class="btn btn-primary btn-lg" onclick="doInit()" style="width: 100%;">创建账户</button>' +
        '</div>' +
      '</div>';
    }

    function doInit() {
      var name = document.getElementById('init-name').value.trim();
      var email = document.getElementById('init-email').value.trim();
      var password = document.getElementById('init-password').value;
      if (!name || !email || !password) { toast('请填写所有字段', 'error'); return; }
      if (password.length < 6) { toast('密码至少需要6位', 'error'); return; }

      fetch(API_BASE + '/setup/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, password: password })
      }).then(function(r) { return r.json(); }).then(function(resp) {
        if (resp.success) {
          localStorage.setItem('teaven_email', email);
          localStorage.setItem('teaven_api_key', resp.data.api_key.key);
          var main = document.getElementById('main-content');
          main.innerHTML = '<div class="card" style="max-width: 560px; margin: 80px auto; border-color: var(--success);">' +
            '<div style="text-align: center; margin-bottom: 32px;">' +
              '<div style="font-size: 3rem; margin-bottom: 16px;"><span class="iconpark-check-circle" style="color: var(--success);"></span></div>' +
              '<div style="font-size: 1.5rem; font-weight: 600;">初始化成功！</div>' +
            '</div>' +
            '<p style="color: var(--text-muted); margin-bottom: 8px;">账户: <strong>' + esc(resp.data.user.email) + '</strong></p>' +
            '<p style="color: var(--text-muted); margin-bottom: 12px;">你的 API Key（<strong style="color: var(--danger);">已自动保存</strong>）：</p>' +
            '<div class="code-block" style="margin-bottom: 24px;"><span class="key-highlight">' + esc(resp.data.api_key.key) + '</span></div>' +
            '<button class="btn btn-primary btn-lg" onclick="location.reload()" style="width: 100%;">进入后台</button>' +
          '</div>';
        } else {
          toast(resp.error, 'error');
        }
      }).catch(function() { toast('网络错误，请重试', 'error'); });
    }

    function saveApiKey() {
      var key = document.getElementById('setup-key').value.trim();
      if (!key) { toast('请输入 API Key', 'error'); return; }
      localStorage.setItem('teaven_api_key', key);
      location.reload();
    }

    // 初始化
    if (API_KEY) { renderPage('dashboard'); }
    else { document.getElementById('main-content').innerHTML = setupPage(); }
  </script>
</body>
</html>`;
}
