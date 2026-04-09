# Selulu 推箱子 (Push Box Game Desktop)

一款基于 Electron + Vue 3 构建的推箱子（ Sokoban ）桌面游戏，支持关卡编辑、自定义关卡文件、无限撤销等丰富功能。

## 游戏简介

推箱子是一款经典的益智游戏。玩家需要在二维网格地图中控制角色移动，将所有箱子推到目标位置上即可过关。游戏内置 **18 个关卡**，难度从入门到挑战逐步递进。

## 游戏截图

<table>
  <tr>
    <td align="center"><b>游戏界面</b></td>
    <td align="center"><b>关卡选择</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/gameplay.png" alt="游戏界面" width="400" /></td>
    <td><img src="screenshots/level-selector.png" alt="关卡选择" width="400" /></td>
  </tr>
  <tr>
    <td align="center"><b>路径配置</b></td>
    <td align="center"><b>工具栏</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/path-config.png" alt="路径配置" width="400" /></td>
    <td><img src="screenshots/toolkit.png" alt="工具栏" width="400" /></td>
  </tr>
</table>

## 功能特性

### 核心玩法
- 经典推箱子规则，支持单步推箱
- **18 个内置关卡**，涵盖不同地图尺寸和难度
- **无限撤销**（Undo）——可回退到任意历史状态
- 自动通关检测与过关动画
- 通关倒计时自动跳转下一关

### 关卡编辑器
- 可视化关卡设计工具，支持拖拽操作
- **7 种地图元素**：空地、墙壁、目标点、箱子、玩家、箱子在目标上、玩家在目标上
- 支持从元素面板拖拽到网格、网格内单元格互拖移动
- 可调整地图尺寸（3×3 ~ 12×12）
- 关卡管理：新增、复制、插入、删除关卡
- 导入外部 `levels.json` 文件
- 保存关卡到本地文件

### 自定义关卡路径
- 支持配置自定义 `levels.json` 文件路径
- 路径连通性测试功能
- 配置持久化到 `localStorage`

### 桌面集成
- NSIS 安装程序，支持自定义安装目录
- 桌面快捷方式与开始菜单快捷方式
- 安装完成后自动启动
- 关卡数据独立存储于用户数据目录

## 键盘操作

| 按键 | 功能 |
|---|---|
| `W` / `↑` | 向上移动 |
| `S` / `↓` | 向下移动 |
| `A` / `←` | 向左移动 |
| `D` / `→` | 向右移动 |
| `Enter` | 下一关 |
| `Ctrl + Enter` | 上一关 |
| `Alt + Enter` | 打开关卡选择器 |
| `Space` | 重新开始当前关卡 |
| `Alt + Space` | 打开/关闭关卡编辑器 |
| `Backspace` | 撤销上一步 |

## 技术栈

| 技术 | 说明 |
|---|---|
| [Vue 3](https://vuejs.org/) | 前端框架（Composition API + `<script setup>`） |
| [Vite](https://vitejs.dev/) | 构建工具 |
| [Electron](https://www.electronjs.org/) | 桌面运行时 |
| [electron-builder](https://www.electron.build/) | 打包与分发 |
| [@vueuse/motion](https://motion.vueuse.org/) | 动画库 |

## 项目结构

```
push-box-game-desktop/
├── electron/
│   ├── main.js          # Electron 主进程
│   └── preload.js       # 预加载脚本（IPC 桥接）
├── src/
│   ├── App.vue          # 根组件
│   ├── main.js          # 入口文件
│   ├── style.css        # 全局样式
│   ├── components/
│   │   ├── GameBoard.vue       # 游戏棋盘渲染
│   │   ├── GameInfoPanel.vue   # 左侧信息面板
│   │   ├── SuccessModal.vue    # 通关弹窗
│   │   ├── LevelSelector.vue   # 关卡选择器
│   │   ├── LevelEditor.vue     # 关卡编辑器
│   │   ├── PathConfig.vue      # 关卡路径配置
│   │   ├── Toolkit.vue         # 浮动工具栏
│   │   └── Notification.vue    # 消息通知组件
│   └── composables/
│       └── useGameState.js     # 游戏核心状态管理
├── public/
│   ├── levels.json      # 内置关卡数据（18关）
│   └── images/          # 游戏素材图片
├── index.html
├── vite.config.js
├── electron-builder.yml
└── package.json
```

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- npm >= 8

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动后同时运行 Vite 开发服务器和 Electron 窗口，支持热更新。

### 预览模式

```bash
npm run preview
```

先构建前端代码，然后启动 Electron 加载构建产物。

### 构建安装包

```bash
npm run electron:build
```

构建完成后，安装包位于 `release/push-box-game-1.0.0-setup.exe`。

## 地图元素说明

| 编码 | 元素 | 说明 |
|---|---|---|
| 0 | 空地 | 可通行区域 |
| 1 | 墙壁 | 不可通行，不可推动 |
| 2 | 目标点 | 箱子需要被推到的位置 |
| 3 | 箱子 | 可被玩家推动 |
| 4 | 玩家 | 玩家角色 |
| 5 | 箱子在目标上 | 箱子已到达目标位置 |
| 6 | 玩家在目标上 | 玩家站在目标位置上 |

## 关卡数据格式

关卡文件为 JSON 格式，结构如下：

```json
{
  "levels": [
    [
      [1, 1, 1, 1, 1],
      [1, 4, 0, 3, 1],
      [1, 0, 2, 0, 1],
      [1, 1, 1, 1, 1]
    ]
  ],
  "timestamp": "2025-09-16T09:10:32.285Z"
}
```

每个关卡是一个二维数组，行列分别对应地图的行和列，数组值为上方元素编码。

## 安装与卸载

### 安装

1. 双击 `push-box-game-1.0.0-setup.exe`
2. 按照安装向导提示操作
3. 可选择自定义安装目录
4. 勾选创建桌面快捷方式（默认创建）
5. 安装完成后可选择立即启动

### 卸载

- 通过 Windows 控制面板「程序和功能」卸载
- 或运行安装目录下的卸载程序

## License

ISC
