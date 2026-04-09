<template>
  <div
      v-motion
      :initial="{ opacity: 0, scale: 0.8 }"
      :enter="{ opacity: 1, scale: 1 }"
      :transition="{ duration: 500, type: 'spring' }"
      class="game-container"
  >
    <!-- 左侧信息面板 -->
    <div class="left-panel">
      <div
          v-motion
          :initial="{ x: -50, opacity: 0 }"
          :enter="{ x: 0, opacity: 1 }"
          :transition="{ duration: 600, delay: 200 }"
          class="game-info-panel"
      >
        <div class="level-display">
          <h2 class="level-title">当前关卡</h2>
          <div class="level-number">{{ gameState.currentLevel + 1 }} / {{ gameState.totalLevels }}</div>
        </div>

        <div class="steps-display">
          <h3 class="steps-title">步数统计</h3>
          <div class="steps-number">{{ gameState.steps }}</div>
        </div>

        <div class="controls-info">
          <h3 class="controls-title">移动控制</h3>
          <p class="controls-desc">使用 WASD 键或方向键移动</p>
        </div>

        <div class="shortcuts-info">
          <h3 class="shortcuts-title">快捷键操作</h3>
          <div class="shortcuts-grid">
            <span>Enter - 下一关</span>
            <span>Ctrl+Enter - 上一关</span>
            <span>Space - 重新开始</span>
            <span>Backspace - 撤销</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧游戏面板 -->
    <div class="right-panel">
      <h1
          v-motion
          :initial="{ y: -20, opacity: 0 }"
          :enter="{ y: 0, opacity: 1 }"
          :transition="{ duration: 600, delay: 300 }"
          class="game-title"
      >
        Selulu PUSH BOX
      </h1>

      <div
          v-motion
          :initial="{ scale: 0.9, opacity: 0 }"
          :enter="{ scale: 1, opacity: 1 }"
          :transition="{ duration: 500, delay: 400 }"
          class="game-board"
      >
        <div
            v-for="(row, rowIndex) in gameState.map"
            :key="rowIndex"
            class="game-row"
        >
          <div
              v-for="(cell, colIndex) in row"
              :key="`${rowIndex}-${colIndex}`"
              v-motion
              :initial="{ scale: 0 }"
              :enter="{ scale: 1 }"
              :transition="{ duration: 300, delay: (rowIndex + colIndex) * 50 }"
              class="game-cell"
              :style="getCellStyle(cell, rowIndex, colIndex)"
          >
          </div>
        </div>
      </div>
    </div>

    <!-- 成功通关弹框 -->
    <div
        v-if="gameState.showSuccessModal"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1 }"
        :leave="{ opacity: 0 }"
        :transition="{ duration: 300 }"
        class="success-modal-overlay"
        @click="gameState.showSuccessModal = false"
    >
      <div
          v-motion
          :initial="{ scale: 0.5, opacity: 0, rotate: -10 }"
          :enter="{ scale: 1, opacity: 1, rotate: 0 }"
          :leave="{ scale: 0.5, opacity: 0, rotate: 10 }"
          :transition="{ duration: 600, type: 'spring', bounce: 0.6 }"
          class="success-modal"
          @click.stop
      >
        <div class="success-icon">🎉</div>
        <h2 class="success-title">通关成功！</h2>
        <div class="success-info">
          <p>第 {{ gameState.currentLevel + 1 }} 关完成</p>
          <p>用时 {{ gameState.steps }} 步</p>
        </div>

        <div v-if="gameState.currentLevel < gameState.totalLevels - 1" class="success-actions">
          <div class="countdown-display">
            <span class="countdown-number">{{ gameState.countdown }}</span>
            <span class="countdown-text">秒后自动进入下一关</span>
          </div>
          <div class="success-buttons">
            <button
                v-motion
                :hovered="{ scale: 1.05 }"
                :tapped="{ scale: 0.95 }"
                @click="nextLevel"
                class="btn btn-primary btn-large"
            >
              立即进入下一关
            </button>
            <button
                v-motion
                :hovered="{ scale: 1.05 }"
                :tapped="{ scale: 0.95 }"
                @click="restart"
                class="btn btn-secondary btn-large"
            >
              重新挑战本关
            </button>
          </div>
        </div>

        <div v-else class="final-success">
          <div class="final-icon">🏆</div>
          <h3 class="final-title">恭喜通关全部{{ gameState.totalLevels }}关！</h3>
          <p class="final-message">你是真正的推箱子大师！</p>
          <button
              v-motion
              :hovered="{ scale: 1.05 }"
              :tapped="{ scale: 0.95 }"
              @click="goToLevel(0)"
              class="btn btn-primary btn-large"
          >
            重新开始游戏
          </button>
        </div>
      </div>
    </div>

    <!-- 关卡选择弹框 -->
    <div
        v-if="gameState.showLevelSelector"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1 }"
        :leave="{ opacity: 0 }"
        :transition="{ duration: 300 }"
        class="level-selector-overlay"
        @click="gameState.showLevelSelector = false"
    >
      <div
          v-motion
          :initial="{ scale: 0.8, opacity: 0 }"
          :enter="{ scale: 1, opacity: 1 }"
          :leave="{ scale: 0.8, opacity: 0 }"
          :transition="{ duration: 300, type: 'spring' }"
          class="level-selector-modal"
          @click.stop
      >
        <h3 class="level-selector-title">选择关卡</h3>
        <div class="level-grid">
          <button
              v-for="(level, index) in levels"
              :key="index"
              v-motion
              :hovered="{ scale: 1.1 }"
              :tapped="{ scale: 0.9 }"
              @click="goToLevel(index)"
              :class="['level-button', { 'current': index === gameState.currentLevel }]"
          >
            {{ index + 1 }}
          </button>
        </div>
        <button
            v-motion
            :hovered="{ scale: 1.05 }"
            :tapped="{ scale: 0.95 }"
            @click="gameState.showLevelSelector = false"
            class="btn btn-secondary close-button"
        >
          关闭
        </button>
      </div>
    </div>

    <!-- 关卡编辑器弹框 -->
    <div
        v-if="gameState.showLevelEditor"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1 }"
        :leave="{ opacity: 0 }"
        :transition="{ duration: 300 }"
        class="level-editor-overlay"
        @click="gameState.showLevelEditor = false"
    >
      <div
          v-motion
          :initial="{ scale: 0.8, opacity: 0 }"
          :enter="{ scale: 1, opacity: 1 }"
          :leave="{ scale: 0.8, opacity: 0 }"
          :transition="{ duration: 300, type: 'spring' }"
          class="level-editor-modal"
          @click.stop
      >
        <h3 class="level-editor-title">
          关卡编辑器 - 第 {{ gameState.editingLevel + 1 }} 关
          <span class="level-count">(共 {{ gameState.totalLevels }} 关)</span>
        </h3>

        <!-- 编辑器主体 - 左右分栏 -->
        <div class="editor-main">
          <!-- 左侧工具面板 -->
          <div class="editor-left-panel">
            <!-- 模块1: 元素选择器 -->
            <div class="cell-type-selector">
              <h4 class="selector-title">元素类型</h4>
              <div class="cell-type-buttons-grid">
                <button
                    v-for="(type, key) in CELL_TYPES"
                    :key="key"
                    @click="gameState.selectedCellType = type"
                    :class="['cell-type-btn-grid', { 'active': gameState.selectedCellType === type }]"
                    :style="getCellTypeButtonStyle(type)"
                    :title="getCellTypeName(type) + ' (可拖拽到地图)'"
                    draggable="true"
                    @dragstart="onDragStart($event, type)"
                    @dragend="onDragEnd($event)"
                >
                </button>
              </div>
            </div>

            <!-- 模块2: 关卡管理 -->
            <div class="level-management">
              <h4 class="level-mgmt-title">关卡管理</h4>
              <div class="level-mgmt-buttons">
                <button @click="addNewLevel" class="btn-level-mgmt btn-success" title="新关卡">+</button>
                <button @click="copyCurrentLevel" class="btn-level-mgmt btn-info" title="复制">📋</button>
                <button @click="insertLevel" class="btn-level-mgmt btn-secondary" title="插入">➕</button>
                <button @click="deleteCurrentLevel" class="btn-level-mgmt btn-danger" title="删除" :disabled="levels.length <= 1">🗑</button>
              </div>
            </div>

            <!-- 模块3: 文件操作 -->
            <div class="file-operations">
              <h4 class="file-ops-title">文件操作</h4>
              <div class="file-ops-buttons">
                <input
                    type="file"
                    accept=".json"
                    @change="loadLevels"
                    style="display: none"
                    ref="fileInput"
                >
                <button
                    v-motion
                    :hovered="{ scale: 1.05 }"
                    :tapped="{ scale: 0.95 }"
                    @click="$refs.fileInput?.click()"
                    class="btn-file-ops btn-secondary"
                    title="导入关卡"
                >
                  📁 导入
                </button>
                <button
                    v-motion
                    :hovered="{ scale: 1.05 }"
                    :tapped="{ scale: 0.95 }"
                    @click="saveLevel"
                    class="btn-file-ops btn-primary"
                    title="保存并导出"
                >
                  💾 保存
                </button>
                <button
                    v-motion
                    :hovered="{ scale: 1.05 }"
                    :tapped="{ scale: 0.95 }"
                    @click="gameState.showLevelEditor = false"
                    class="btn-file-ops btn-danger"
                    title="关闭编辑器"
                >
                  ✕ 关闭
                </button>
              </div>
            </div>
          </div>

          <!-- 右侧编辑区域 -->
          <div class="editor-right-panel">
            <!-- 模块3: 编辑区域顶部控制 -->
            <div class="editor-top-controls">
              <div class="top-control-section level-section">
                <div class="level-section-content">
                  <h4 class="top-control-title">关卡选择</h4>
                  <select v-model.number="gameState.editingLevel" @change="initEditor" class="level-select">
                    <option v-for="(level, index) in levels" :key="index" :value="index">
                      第 {{ index + 1 }} 关
                    </option>
                  </select>
                </div>
              </div>

              <div class="top-control-section size-section">
                <div class="level-section-content">
                  <h4 class="top-control-title">地图尺寸</h4>
                  <div class="size-controls-top">
                    <label>
                      <span>行:</span>
                      <input type="number" v-model.number="gameState.editorRows" min="3" max="12" @change="updateEditorSize" class="size-input">
                    </label>
                    <label>
                      <span>列:</span>
                      <input type="number" v-model.number="gameState.editorCols" min="3" max="12" @change="updateEditorSize" class="size-input">
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- 模块4: 编辑网格 -->
            <div class="editor-grid">
              <div
                  v-for="(row, rowIndex) in gameState.editorMap"
                  :key="rowIndex"
                  class="editor-row"
              >
                <div
                    v-for="(cell, colIndex) in row"
                    :key="`${rowIndex}-${colIndex}`"
                    class="editor-cell"
                    :class="{
                      'drag-over': gameState.dragOverCell === `${rowIndex}-${colIndex}`,
                      'dragging': gameState.draggingCell === `${rowIndex}-${colIndex}`
                    }"
                    :style="getEditorCellStyle(cell)"
                    :draggable="cell !== 0"
                    @click="setCellType(rowIndex, colIndex, gameState.selectedCellType)"
                    @dragstart="onCellDragStart($event, rowIndex, colIndex, cell)"
                    @dragend="onCellDragEnd($event, rowIndex, colIndex)"
                    @dragover.prevent="onDragOver($event, rowIndex, colIndex)"
                    @dragleave="onDragLeave($event, rowIndex, colIndex)"
                    @drop.prevent="onDrop($event, rowIndex, colIndex)"
                    :title="`${getCellTypeName(cell)} (${cell}) - ${cell !== 0 ? '可拖拽移动' : ''}可接受拖放`"
                >
                  <span v-if="cell === 0" class="cell-number">{{ cell }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 路径配置弹框 -->
    <div
        v-if="gameState.showPathConfig"
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1 }"
        :leave="{ opacity: 0 }"
        :transition="{ duration: 300 }"
        class="path-config-overlay"
        @click="gameState.showPathConfig = false"
    >
      <div
          v-motion
          :initial="{ scale: 0.8, opacity: 0 }"
          :enter="{ scale: 1, opacity: 1 }"
          :leave="{ scale: 0.8, opacity: 0 }"
          :transition="{ duration: 300, type: 'spring' }"
          class="path-config-modal"
          @click.stop
      >
        <h3 class="path-config-title">配置关卡文件路径</h3>

        <div class="path-config-content">
          <div class="path-input-group">
            <label for="levelPath">关卡文件绝对路径：</label>
            <input
                id="levelPath"
                type="text"
                v-model="gameState.levelFilePath"
                class="path-input"
                placeholder="例如: D:\Users\YourName\Desktop\levels.json"
            >
          </div>

          <div class="path-config-info">
            <h4>使用说明：</h4>
            <ul>
              <li>请输入 levels.json 文件的完整绝对路径</li>
              <li>如果文件不存在，系统会尝试创建新文件</li>
              <li>确保路径中的文件夹都已存在</li>
              <li>Windows 路径示例: D:\Games\levels.json</li>
              <li>Mac/Linux 路径示例: /Users/username/levels.json</li>
            </ul>
          </div>
        </div>

        <div class="path-config-actions">
          <button
              v-motion
              :hovered="{ scale: 1.05 }"
              :tapped="{ scale: 0.95 }"
              @click="testPathConnection"
              class="btn btn-secondary"
          >
            测试连接
          </button>
          <button
              v-motion
              :hovered="{ scale: 1.05 }"
              :tapped="{ scale: 0.95 }"
              @click="savePathConfig"
              class="btn btn-primary"
          >
            保存配置
          </button>
          <button
              v-motion
              :hovered="{ scale: 1.05 }"
              :tapped="{ scale: 0.95 }"
              @click="gameState.showPathConfig = false"
              class="btn btn-secondary"
          >
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 右下角工具集 -->
    <div class="toolkit-container">
      <!-- 工具集触发按钮 -->
      <button
          v-if="!gameState.showLevelEditor"
          v-motion
          :initial="{ scale: 0, rotate: -180 }"
          :enter="{ scale: 1, rotate: 0 }"
          :transition="{ duration: 600, delay: 1000, type: 'spring' }"
          :hovered="{ scale: 1.1, rotate: gameState.showToolkit ? 45 : 0 }"
          :tapped="{ scale: 0.9 }"
          @click="gameState.showToolkit = !gameState.showToolkit"
          class="toolkit-trigger"
          :class="{ 'active': gameState.showToolkit }"
          title="工具集"
      >
        <span class="toolkit-icon">⚙</span>
      </button>

      <!-- 工具集面板 -->
      <div
          v-if="gameState.showToolkit"
          v-motion
          :initial="{ opacity: 0, scale: 0.3, y: 50 }"
          :enter="{ opacity: 1, scale: 1, y: 0 }"
          :leave="{ opacity: 0, scale: 0.3, y: 50 }"
          :transition="{ duration: 400, type: 'spring' }"
          class="toolkit-panel"
          @click.stop
      >
        <!-- 关卡控制区 -->
        <div class="toolkit-section">
          <h4 class="toolkit-section-title">关卡控制</h4>
          <div class="toolkit-buttons">
            <button
                v-motion
                :hovered="{ scale: 1.05 }"
                :tapped="{ scale: 0.95 }"
                @click="handleToolkitAction(prevLevel)"
                :disabled="gameState.currentLevel === 0"
                class="toolkit-btn toolkit-btn-secondary"
                title="上一关"
            >
              <span class="btn-icon">⬅</span>
              <span class="btn-text">上一关</span>
            </button>
            <button
                v-motion
                :hovered="{ scale: 1.05 }"
                :tapped="{ scale: 0.95 }"
                @click="handleToolkitAction(nextLevel)"
                :disabled="gameState.currentLevel === gameState.totalLevels - 1"
                class="toolkit-btn toolkit-btn-primary"
                title="下一关"
            >
              <span class="btn-icon">➡</span>
              <span class="btn-text">下一关</span>
            </button>
            <button
                v-motion
                :hovered="{ scale: 1.05 }"
                :tapped="{ scale: 0.95 }"
                @click="handleToolkitAction(toggleLevelSelector)"
                class="toolkit-btn toolkit-btn-info"
                title="选择关卡"
            >
              <span class="btn-icon">📋</span>
              <span class="btn-text">选择关卡</span>
            </button>
          </div>
        </div>

        <!-- 游戏控制区 -->
        <div class="toolkit-section">
          <h4 class="toolkit-section-title">游戏控制</h4>
          <div class="toolkit-buttons">
            <button
                v-motion
                :hovered="{ scale: 1.05 }"
                :tapped="{ scale: 0.95 }"
                @click="handleToolkitAction(undo)"
                :disabled="gameState.history.length === 0"
                class="toolkit-btn toolkit-btn-secondary"
                title="撤销"
            >
              <span class="btn-icon">↶</span>
              <span class="btn-text">撤销</span>
            </button>
            <button
                v-motion
                :hovered="{ scale: 1.05 }"
                :tapped="{ scale: 0.95 }"
                @click="handleToolkitAction(restart)"
                class="toolkit-btn toolkit-btn-warning"
                title="重新开始"
            >
              <span class="btn-icon">🔄</span>
              <span class="btn-text">重新开始</span>
            </button>
          </div>
        </div>

        <!-- 编辑器区 -->
        <div class="toolkit-section">
          <h4 class="toolkit-section-title">关卡编辑</h4>
          <div class="toolkit-buttons">
            <button
                v-motion
                :hovered="{ scale: 1.05 }"
                :tapped="{ scale: 0.95 }"
                @click="handleToolkitAction(toggleLevelEditor)"
                class="toolkit-btn toolkit-btn-success"
                title="配置关卡"
            >
              <span class="btn-icon">🎨</span>
              <span class="btn-text">配置关卡</span>
            </button>
            <button
                v-motion
                :hovered="{ scale: 1.05 }"
                :tapped="{ scale: 0.95 }"
                @click="handleToolkitAction(togglePathConfig)"
                class="toolkit-btn toolkit-btn-danger"
                title="配置路径"
            >
              <span class="btn-icon">📁</span>
              <span class="btn-text">配置路径</span>
            </button>
          </div>
        </div>

        <!-- 关闭按钮 -->
        <button
            v-motion
            :hovered="{ scale: 1.1 }"
            :tapped="{ scale: 0.9 }"
            @click="gameState.showToolkit = false"
            class="toolkit-close"
            title="关闭工具集"
        >
          ✕
        </button>
      </div>

      <!-- 点击工具集外部关闭 -->
      <div
          v-if="gameState.showToolkit"
          class="toolkit-overlay"
          @click="gameState.showToolkit = false"
      ></div>
    </div>

    <!-- 自定义通知组件 -->
    <div
        v-if="gameState.notification.show"
        v-motion
        :initial="{ opacity: 0, y: -50, scale: 0.8 }"
        :enter="{ opacity: 1, y: 0, scale: 1 }"
        :leave="{ opacity: 0, y: -50, scale: 0.8 }"
        :transition="{ duration: 300, type: 'spring' }"
        class="notification"
        :class="[`notification-${gameState.notification.type}`]"
        @click="hideNotification"
    >
      <div class="notification-content">
        <div class="notification-icon">
          <span v-if="gameState.notification.type === 'success'">✓</span>
          <span v-else-if="gameState.notification.type === 'error'">✕</span>
          <span v-else-if="gameState.notification.type === 'warning'">⚠</span>
          <span v-else>ℹ</span>
        </div>
        <div class="notification-message">{{ gameState.notification.message }}</div>
        <button class="notification-close" @click.stop="hideNotification">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {reactive, computed, onMounted, onUnmounted, watch} from 'vue'

const isElectron = !!window.electronAPI

const CELL_TYPES = {
  EMPTY: 0,
  WALL: 1,
  TARGET: 2,
  BOX: 3,
  PLAYER: 4,
  BOX_ON_TARGET: 5,
  PLAYER_ON_TARGET: 6
}

const DIRECTIONS = {
  UP: {row: -1, col: 0},
  DOWN: {row: 1, col: 0},
  LEFT: {row: 0, col: -1},
  RIGHT: {row: 0, col: 1}
}

let levels = []

const gameState = reactive({
  map: [],
  playerPos: {row: 0, col: 0},
  steps: 0,
  history: [],
  originalLevel: [],
  currentLevel: 0,
  totalLevels: levels.length,
  playerDirection: 'front',
  showLevelSelector: false,
  autoAdvanceTimer: null,
  showSuccessModal: false,
  countdown: 3,
  levelCompleted: false,
  countdownInterval: null,
  successTimeout: null,
  justSwitchedLevel: false,
  showLevelEditor: false,
  editorRows: 8,
  editorCols: 8,
  editorMap: [],
  editingLevel: 0,
  selectedCellType: 0,
  showPathConfig: false,
  levelFilePath: '', // 将由后端环境配置决定
  notification: {
    show: false,
    message: '',
    type: 'info', // success, error, warning, info
    timeout: null
  },
  // 拖拽相关状态
  dragOverCell: null,
  draggingType: null,
  draggingCell: null, // 记录正在拖拽的格子位置
  draggingFromCell: null, // 记录拖拽源的位置和类型
  // 工具集状态
  showToolkit: false
})

// 自定义通知函数
function showNotification(message, type = 'info', duration = 3000) {
  // 清除之前的通知定时器
  if (gameState.notification.timeout) {
    clearTimeout(gameState.notification.timeout)
  }

  // 设置通知内容
  gameState.notification.message = message
  gameState.notification.type = type
  gameState.notification.show = true

  // 设置自动隐藏
  gameState.notification.timeout = setTimeout(() => {
    gameState.notification.show = false
  }, duration)
}

// 隐藏通知
function hideNotification() {
  if (gameState.notification.timeout) {
    clearTimeout(gameState.notification.timeout)
  }
  gameState.notification.show = false
}

function initGame(levelIndex = 0) {
  // 清除所有计时器和延迟任务
  if (gameState.autoAdvanceTimer) {
    clearTimeout(gameState.autoAdvanceTimer)
    gameState.autoAdvanceTimer = null
  }
  if (gameState.countdownInterval) {
    clearInterval(gameState.countdownInterval)
    gameState.countdownInterval = null
  }
  if (gameState.successTimeout) {
    clearTimeout(gameState.successTimeout)
    gameState.successTimeout = null
  }

  // 重置成功弹框状态
  gameState.showSuccessModal = false
  gameState.countdown = 3
  gameState.levelCompleted = false
  gameState.justSwitchedLevel = true

  const currentLevelData = levels[levelIndex]
  gameState.currentLevel = levelIndex
  gameState.originalLevel = currentLevelData.map(row => [...row])
  gameState.map = currentLevelData.map(row => [...row])
  gameState.steps = 0
  gameState.history = []

  for (let row = 0; row < gameState.map.length; row++) {
    for (let col = 0; col < gameState.map[row].length; col++) {
      if (gameState.map[row][col] === CELL_TYPES.PLAYER ||
          gameState.map[row][col] === CELL_TYPES.PLAYER_ON_TARGET) {
        gameState.playerPos = {row, col}
        // 如果玩家在目标上，将格子值改为TARGET，这样getCellStyle能正确显示
        if (gameState.map[row][col] === CELL_TYPES.PLAYER_ON_TARGET) {
          gameState.map[row][col] = CELL_TYPES.TARGET
        } else {
          gameState.map[row][col] = CELL_TYPES.EMPTY
        }
        break
      }
    }
  }

  // 延迟重置 justSwitchedLevel，允许关卡完成检测
  // 这样可以处理关卡一开始就完成的情况（如预配置的箱子在目标上）
  setTimeout(() => {
    gameState.justSwitchedLevel = false
  }, 100)
}

function saveState() {
  gameState.history.push({
    map: gameState.map.map(row => [...row]),
    playerPos: {...gameState.playerPos},
    steps: gameState.steps
  })
}

function getCellStyle(cell, row, col) {
  const isPlayerHere = gameState.playerPos.row === row && gameState.playerPos.col === col

  let backgroundImage = ''

  // 如果角色在这里，优先显示角色，背景为目标点（如果存在）
  if (isPlayerHere) {
    const characterImage = `url(images/character_${gameState.playerDirection}.png)`

    // 如果角色站在目标点上，目标点作为背景
    if (cell === CELL_TYPES.TARGET || cell === CELL_TYPES.PLAYER_ON_TARGET) {
      backgroundImage = `${characterImage}, url(images/target.png)`
    } else {
      backgroundImage = characterImage
    }
  } else {
    // 角色不在这里，正常显示格子内容
    if (cell === CELL_TYPES.WALL) {
      backgroundImage = 'url(images/wall.png)'
    } else if (cell === CELL_TYPES.TARGET) {
      backgroundImage = 'url(images/target.png)'
    } else if (cell === CELL_TYPES.BOX) {
      backgroundImage = 'url(images/box.png)'
    } else if (cell === CELL_TYPES.BOX_ON_TARGET) {
      backgroundImage = 'url(images/success.png)'
    }
  }

  return {
    backgroundImage: backgroundImage
  }
}

function movePlayer(direction) {
  // 如果刚切换关卡，第一次移动时重置标志
  if (gameState.justSwitchedLevel) {
    gameState.justSwitchedLevel = false
  }

  const newRow = gameState.playerPos.row + direction.row
  const newCol = gameState.playerPos.col + direction.col

  if (newRow < 0 || newRow >= gameState.map.length ||
      newCol < 0 || newCol >= gameState.map[0].length) {
    return false
  }

  const targetCell = gameState.map[newRow][newCol]

  if (targetCell === CELL_TYPES.WALL) {
    return false
  }

  if (targetCell === CELL_TYPES.BOX || targetCell === CELL_TYPES.BOX_ON_TARGET) {
    const boxNewRow = newRow + direction.row
    const boxNewCol = newCol + direction.col

    if (boxNewRow < 0 || boxNewRow >= gameState.map.length ||
        boxNewCol < 0 || boxNewCol >= gameState.map[0].length) {
      return false
    }

    const boxTargetCell = gameState.map[boxNewRow][boxNewCol]

    if (boxTargetCell === CELL_TYPES.WALL ||
        boxTargetCell === CELL_TYPES.BOX ||
        boxTargetCell === CELL_TYPES.BOX_ON_TARGET) {
      return false
    }

    saveState()

    if (targetCell === CELL_TYPES.BOX_ON_TARGET) {
      gameState.map[newRow][newCol] = CELL_TYPES.TARGET
    } else {
      gameState.map[newRow][newCol] = CELL_TYPES.EMPTY
    }

    if (boxTargetCell === CELL_TYPES.TARGET) {
      gameState.map[boxNewRow][boxNewCol] = CELL_TYPES.BOX_ON_TARGET
    } else {
      gameState.map[boxNewRow][boxNewCol] = CELL_TYPES.BOX
    }
  } else {
    saveState()
  }

  // 恢复玩家离开位置的原始状态
  const currentRow = gameState.playerPos.row
  const currentCol = gameState.playerPos.col
  const originalCell = gameState.originalLevel[currentRow][currentCol]

  // 检查原始关卡数据中这个位置是什么类型
  if (originalCell === CELL_TYPES.TARGET ||
      originalCell === CELL_TYPES.PLAYER_ON_TARGET ||
      originalCell === CELL_TYPES.BOX_ON_TARGET) {
    gameState.map[currentRow][currentCol] = CELL_TYPES.TARGET
  } else {
    gameState.map[currentRow][currentCol] = CELL_TYPES.EMPTY
  }

  gameState.playerPos.row = newRow
  gameState.playerPos.col = newCol

  if (gameState.map[newRow][newCol] === CELL_TYPES.TARGET) {
    gameState.map[newRow][newCol] = CELL_TYPES.PLAYER_ON_TARGET
  } else {
    gameState.map[newRow][newCol] = CELL_TYPES.PLAYER
  }

  gameState.steps++
  return true
}

function handleKeyPress(event) {
  const key = event.key.toLowerCase()

  // 处理快捷键（优先级高于游戏移动键）
  if (key === 'enter' && !event.ctrlKey && !event.altKey) {
    // Enter: 下一关
    event.preventDefault()
    if (gameState.currentLevel < gameState.totalLevels - 1) {
      nextLevel()
    }
    return
  }

  if (key === 'enter' && event.ctrlKey && !event.altKey) {
    // Ctrl + Enter: 上一关
    event.preventDefault()
    if (gameState.currentLevel > 0) {
      prevLevel()
    }
    return
  }

  if (key === 'enter' && event.altKey && !event.ctrlKey) {
    // Alt + Enter: 选择关卡
    event.preventDefault()
    toggleLevelSelector()
    return
  }

  if (key === 'backspace' && !event.ctrlKey && !event.altKey) {
    // Backspace: 撤销
    event.preventDefault()
    undo()
    return
  }

  if (key === ' ' && event.altKey && !event.ctrlKey) {
    // Alt + Space: 配置关卡
    event.preventDefault()
    toggleLevelEditor()
    return
  }

  if (key === ' ' && !event.altKey && !event.ctrlKey && !event.shiftKey) {
    // Space: 重新开始
    event.preventDefault()
    restart()
    return
  }

  if (key === 'enter' && event.ctrlKey && event.shiftKey && !event.altKey) {
    // Ctrl + Shift + Enter: 选择关卡（替代方案）
    event.preventDefault()
    toggleLevelSelector()
    return
  }

  // 处理游戏移动键（只有在没有弹窗时才响应）
  if (!gameState.showLevelSelector && !gameState.showLevelEditor && !gameState.showPathConfig && !gameState.showSuccessModal) {
    switch (key) {
      case 'w':
      case 'arrowup':
        gameState.playerDirection = 'back'
        movePlayer(DIRECTIONS.UP)
        break
      case 's':
      case 'arrowdown':
        gameState.playerDirection = 'front'
        movePlayer(DIRECTIONS.DOWN)
        break
      case 'a':
      case 'arrowleft':
        gameState.playerDirection = 'left'
        movePlayer(DIRECTIONS.LEFT)
        break
      case 'd':
      case 'arrowright':
        gameState.playerDirection = 'right'
        movePlayer(DIRECTIONS.RIGHT)
        break
    }
  }
}

function undo() {
  if (gameState.history.length === 0) return

  const lastState = gameState.history.pop()
  gameState.map = lastState.map
  gameState.playerPos = lastState.playerPos
  gameState.steps = lastState.steps
}

function restart() {
  initGame(gameState.currentLevel)
}

function nextLevel() {
  if (gameState.currentLevel < gameState.totalLevels - 1) {
    initGame(gameState.currentLevel + 1)
  }
}

function prevLevel() {
  if (gameState.currentLevel > 0) {
    initGame(gameState.currentLevel - 1)
  }
}

function goToLevel(levelIndex) {
  if (levelIndex >= 0 && levelIndex < gameState.totalLevels) {
    gameState.showLevelSelector = false
    initGame(levelIndex)
  }
}

// 关闭所有弹窗的统一函数
function closeAllModals() {
  gameState.showLevelSelector = false
  gameState.showLevelEditor = false
  gameState.showPathConfig = false
  // 注意：不关闭 showSuccessModal 和 showToolkit，这些有特殊的处理逻辑
}

function toggleLevelSelector() {
  closeAllModals()
  gameState.showLevelSelector = true
}

function toggleLevelEditor() {
  closeAllModals()
  gameState.showToolkit = false
  gameState.showLevelEditor = true
  gameState.editingLevel = gameState.currentLevel
  initEditor()
}

function togglePathConfig() {
  closeAllModals()
  gameState.showPathConfig = true
}

// 获取环境信息
async function getEnvironmentInfo() {
  if (!isElectron) return null
  try {
    return await window.electronAPI.getEnvironmentInfo()
  } catch (error) {
    console.error('获取环境信息失败：', error)
    return null
  }
}

// 测试路径连接
async function testPathConnection() {
  if (!isElectron) {
    showNotification('测试失败：桌面环境不可用', 'error')
    return
  }
  try {
    const result = await window.electronAPI.testPath(gameState.levelFilePath || null)
    if (result.success) {
      showNotification('路径测试结果：' + result.message, 'info')
    } else {
      showNotification('测试失败：' + result.error, 'error')
    }
  } catch (error) {
    console.error('测试路径连接失败：', error)
    showNotification('测试失败：' + error.message, 'error')
  }
}

// 保存路径配置
async function savePathConfig() {
  try {
    // 保存路径到本地存储
    if (gameState.levelFilePath) {
      localStorage.setItem('levelFilePath', gameState.levelFilePath)
    }

    // 尝试从新路径加载数据
    const success = await loadLevelsFromPath()

    if (success) {
      gameState.showPathConfig = false
      initGame(0) // 重新初始化游戏
      showNotification('路径配置保存成功！关卡数据已加载。', 'success')
    } else {
      showNotification('无法从配置的路径加载数据，使用默认配置。', 'warning')
    }
  } catch (error) {
    console.error('保存路径配置失败：', error)
    showNotification('保存配置失败：' + error.message, 'error')
  }
}

function initEditor() {
  const currentLevelData = levels[gameState.editingLevel]
  if (!currentLevelData) {
    console.error('Invalid level index:', gameState.editingLevel)
    return
  }
  gameState.editorRows = currentLevelData.length
  gameState.editorCols = currentLevelData[0] ? currentLevelData[0].length : 8
  gameState.editorMap = currentLevelData.map(row => [...row])
}

function updateEditorSize() {
  gameState.editorMap = Array(gameState.editorRows).fill(null).map(() =>
      Array(gameState.editorCols).fill(0)
  )
}

function setCellType(row, col, cellType) {
  gameState.editorMap[row][col] = cellType
}

// 拖拽事件处理函数
function onDragStart(event, cellType) {
  gameState.draggingType = cellType
  // 设置拖拽数据
  event.dataTransfer.setData('text/plain', cellType.toString())
  event.dataTransfer.effectAllowed = 'copy'

  // 添加拖拽中的视觉反馈
  event.target.style.opacity = '0.7'

  showNotification(`正在拖拽 ${getCellTypeName(cellType)}，拖到地图格子上放置`, 'info', 2000)
}

function onDragEnd(event) {
  // 恢复原始样式
  event.target.style.opacity = '1'
  gameState.draggingType = null
}

function onDragOver(event, row, col) {
  event.preventDefault()
  // 根据拖拽来源确定drop效果
  if (gameState.draggingFromCell) {
    event.dataTransfer.dropEffect = 'move'
  } else {
    event.dataTransfer.dropEffect = 'copy'
  }
  gameState.dragOverCell = `${row}-${col}`
}

function onDragLeave(event, row, col) {
  // 只有当鼠标真正离开该单元格时才清除状态
  const rect = event.target.getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY

  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    if (gameState.dragOverCell === `${row}-${col}`) {
      gameState.dragOverCell = null
    }
  }
}

// 格子拖拽事件处理函数
function onCellDragStart(event, row, col, cellType) {
  if (cellType === 0) return // 空白格子不能拖拽

  gameState.draggingCell = `${row}-${col}`
  gameState.draggingFromCell = { row, col, cellType }

  // 设置拖拽数据，使用JSON格式区分来源
  const sourceInfo = JSON.stringify({ row, col, cellType })
  const dragData = `cell:${sourceInfo}`

  // 使用text/plain格式但添加前缀来区分来源
  event.dataTransfer.setData('text/plain', dragData)
  event.dataTransfer.effectAllowed = 'move'

  // 添加拖拽中的视觉反馈
  event.target.style.opacity = '0.5'

  showNotification(`正在移动 ${getCellTypeName(cellType)}，拖到其他位置放置`, 'info', 2000)
}

function onCellDragEnd(event, row, col) {
  // 恢复原始样式
  event.target.style.opacity = '1'
  gameState.draggingCell = null
  gameState.draggingFromCell = null
}

function onDrop(event, row, col) {
  event.preventDefault()
  gameState.dragOverCell = null

  const dragData = event.dataTransfer.getData('text/plain')

  if (dragData.startsWith('cell:')) {
    // 来自格子的拖拽
    try {
      const sourceInfo = dragData.substring(5) // 移除 "cell:" 前缀
      const source = JSON.parse(sourceInfo)

      // 防止拖拽到自己上面
      if (source.row === row && source.col === col) {
        showNotification('不能拖拽到自己上面', 'warning', 1500)
        return
      }

      setCellType(row, col, source.cellType)
      setCellType(source.row, source.col, 0) // 将原位置设为空白
      showNotification(`已将 ${getCellTypeName(source.cellType)} 从位置 (${source.row + 1}, ${source.col + 1}) 移动到 (${row + 1}, ${col + 1})`, 'success', 2000)
    } catch (error) {
      showNotification('拖拽数据解析失败', 'error', 1500)
    }
  } else {
    // 来自左侧元素类型的拖拽
    const cellType = parseInt(dragData)
    if (!isNaN(cellType)) {
      setCellType(row, col, cellType)
      showNotification(`已将 ${getCellTypeName(cellType)} 放置到位置 (${row + 1}, ${col + 1})`, 'success', 1500)
    } else {
      showNotification('无效的拖拽数据', 'warning', 1500)
    }
  }
}

// 工具集按钮点击后自动关闭
function handleToolkitAction(action) {
  // 如果是打开关卡编辑器，立即隐藏工具集
  if (action === toggleLevelEditor) {
    gameState.showToolkit = false
  }
  // 执行对应的操作
  action()
  // 对于其他操作，延迟关闭工具集，让用户能看到操作效果
  if (action !== toggleLevelEditor) {
    setTimeout(() => {
      gameState.showToolkit = false
    }, 300)
  }
}

// 添加新关卡
function addNewLevel() {
  // 创建一个新的空关卡（默认8x8，周围是墙壁，中间是空地，玩家在左上角）
  const newLevel = Array(gameState.editorRows).fill(null).map((_, row) =>
      Array(gameState.editorCols).fill(null).map((_, col) => {
        // 边界是墙壁
        if (row === 0 || row === gameState.editorRows - 1 ||
            col === 0 || col === gameState.editorCols - 1) {
          return CELL_TYPES.WALL
        }
        // 左上角放玩家
        if (row === 1 && col === 1) {
          return CELL_TYPES.PLAYER
        }
        // 其他地方是空地
        return CELL_TYPES.EMPTY
      })
  )

  // 添加到关卡数组
  levels.push(newLevel)
  gameState.totalLevels = levels.length

  // 切换到新关卡进行编辑
  gameState.editingLevel = levels.length - 1
  initEditor()

  showNotification(`成功添加第 ${levels.length} 关！当前正在编辑新添加的关卡。`, 'success')
}

// 复制当前关卡
function copyCurrentLevel() {
  // 深度复制当前关卡
  const currentLevel = levels[gameState.editingLevel]
  const copiedLevel = currentLevel.map(row => [...row])

  // 添加到关卡数组末尾
  levels.push(copiedLevel)
  gameState.totalLevels = levels.length

  // 切换到复制的关卡进行编辑
  gameState.editingLevel = levels.length - 1
  initEditor()

  showNotification(`第 ${gameState.editingLevel + 1} 关已复制为第 ${levels.length} 关！当前正在编辑复制的关卡。`, 'success')
}

// 在当前位置插入关卡
function insertLevel() {
  // 创建一个新的空关卡
  const newLevel = Array(gameState.editorRows).fill(null).map((_, row) =>
      Array(gameState.editorCols).fill(null).map((_, col) => {
        // 边界是墙壁
        if (row === 0 || row === gameState.editorRows - 1 ||
            col === 0 || col === gameState.editorCols - 1) {
          return CELL_TYPES.WALL
        }
        // 左上角放玩家
        if (row === 1 && col === 1) {
          return CELL_TYPES.PLAYER
        }
        // 其他地方是空地
        return CELL_TYPES.EMPTY
      })
  )

  // 在当前位置后插入新关卡
  levels.splice(gameState.editingLevel + 1, 0, newLevel)
  gameState.totalLevels = levels.length

  // 切换到插入的关卡进行编辑
  gameState.editingLevel = gameState.editingLevel + 1
  initEditor()

  showNotification(`已在第 ${gameState.editingLevel + 1} 关之后插入新关卡！当前正在编辑第 ${gameState.editingLevel + 1} 关。`, 'success')
}

// 删除当前关卡
function deleteCurrentLevel() {
  if (levels.length <= 1) {
    showNotification('至少需要保留一个关卡！', 'warning')
    return
  }

  const levelNumber = gameState.editingLevel + 1
  const confirmDelete = confirm(`确定要删除第 ${levelNumber} 关吗？\n此操作不可恢复！`)

  if (confirmDelete) {
    // 删除关卡
    levels.splice(gameState.editingLevel, 1)
    gameState.totalLevels = levels.length

    // 调整当前编辑的关卡索引
    if (gameState.editingLevel >= levels.length) {
      gameState.editingLevel = levels.length - 1
    }

    // 如果删除的是当前游戏的关卡，也要调整游戏关卡
    if (gameState.currentLevel >= levels.length) {
      gameState.currentLevel = levels.length - 1
    }

    // 重新初始化编辑器
    initEditor()

    showNotification(`第 ${levelNumber} 关已删除！当前编辑第 ${gameState.editingLevel + 1} 关。`, 'success')
  }
}

async function saveLevel() {
  levels[gameState.editingLevel] = gameState.editorMap.map(row => [...row])
  gameState.totalLevels = levels.length

  // 尝试保存到自定义路径，如果失败则使用备用方案
  const success = await saveLevelsToPath()
  if (!success) {
    // 如果保存到自定义路径失败，提供下载选项
    if (confirm('无法保存到配置的路径。是否要下载文件？')) {
      saveLevelsToServer()
    }
  }

  gameState.showLevelEditor = false
  initGame(gameState.editingLevel)
}

// 从配置的文件路径加载关卡数据
async function loadLevelsFromPath() {
  if (!isElectron) return false
  try {
    const result = await window.electronAPI.loadLevels(gameState.levelFilePath || null)
    if (result.success && result.levels && Array.isArray(result.levels)) {
      levels.splice(0, levels.length, ...result.levels)
      gameState.totalLevels = levels.length
      return true
    }
    return false
  } catch (error) {
    console.error('加载关卡数据失败：', error)
    return false
  }
}

// 从服务器加载关卡数据（备用方案）
async function loadLevelsFromServer() {
  if (!isElectron) {
    useDefaultLevels()
    return
  }
  try {
    const result = await window.electronAPI.loadLevels(null)
    if (result.success && result.levels && Array.isArray(result.levels)) {
      levels.splice(0, levels.length, ...result.levels)
      gameState.totalLevels = levels.length
    } else {
      useDefaultLevels()
    }
  } catch (error) {
    console.error('加载关卡数据失败：', error)
    useDefaultLevels()
  }
}

// 使用默认关卡数据（备用）
function useDefaultLevels() {
  levels.splice(0, levels.length,
      [
        [1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 4, 1],
        [1, 0, 1, 2, 0, 1],
        [1, 2, 5, 3, 2, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1]
      ]
  )
  gameState.totalLevels = levels.length
}

// 保存关卡到配置路径
async function saveLevelsToPath() {
  if (!isElectron) {
    saveLevelsToServer()
    return false
  }
  const levelData = {
    levels: levels,
    timestamp: new Date().toISOString()
  }

  try {
    const filePath = (gameState.levelFilePath && gameState.levelFilePath.trim()) ? gameState.levelFilePath : null
    const result = await window.electronAPI.saveLevels(levelData, filePath)

    if (result.success) {
      showNotification('关卡数据保存成功！', 'success')
      return true
    } else {
      showNotification('保存失败：' + result.error, 'error')
      return false
    }
  } catch (error) {
    console.error('保存关卡数据失败：', error)
    showNotification('保存失败：' + error.message, 'error')
    return false
  }
}

// 保存关卡到服务器（备用方案 - 下载文件）
async function saveLevelsToServer() {
  const levelData = {
    levels: levels,
    timestamp: new Date().toISOString()
  }

  try {
    const dataStr = JSON.stringify(levelData, null, 2)
    const dataBlob = new Blob([dataStr], {type: 'application/json'})
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'levels.json'
    link.click()

    URL.revokeObjectURL(url)

    showNotification('关卡数据已下载！请将下载的 levels.json 文件替换到游戏目录的 public/levels.json，然后刷新页面即可看到更新的关卡。', 'success', 5000)
  } catch (error) {
    console.error('保存关卡数据失败：', error)
    showNotification('保存失败：' + error.message, 'error')
  }
}

function loadLevels(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.levels && Array.isArray(data.levels)) {
          levels.splice(0, levels.length, ...data.levels)
          gameState.totalLevels = levels.length
          initGame(0)
          showNotification('关卡数据加载成功！', 'success')
        }
      } catch (error) {
        showNotification('加载关卡数据失败：' + error.message, 'error')
      }
    }
    reader.readAsText(file)
  }
}

function getCellTypeName(cellType) {
  const names = {
    [CELL_TYPES.EMPTY]: '空地',
    [CELL_TYPES.WALL]: '墙壁',
    [CELL_TYPES.TARGET]: '目标',
    [CELL_TYPES.BOX]: '箱子',
    [CELL_TYPES.PLAYER]: '玩家',
    [CELL_TYPES.BOX_ON_TARGET]: '箱子在目标',
    [CELL_TYPES.PLAYER_ON_TARGET]: '玩家在目标'
  }
  return names[cellType] || '未知'
}

function getEditorCellStyle(cellType) {
  const backgroundImages = {
    [CELL_TYPES.EMPTY]: '',
    [CELL_TYPES.WALL]: 'url(images/wall.png)',
    [CELL_TYPES.TARGET]: 'url(images/target.png)',
    [CELL_TYPES.BOX]: 'url(images/box.png)',
    [CELL_TYPES.PLAYER]: 'url(images/character_front.png)',
    [CELL_TYPES.BOX_ON_TARGET]: 'url(images/success.png)',
    [CELL_TYPES.PLAYER_ON_TARGET]: 'url(images/character_front.png), url(images/target.png)'
  }

  const colors = {
    [CELL_TYPES.EMPTY]: '#f5f5f5',
    [CELL_TYPES.WALL]: '#666666',
    [CELL_TYPES.TARGET]: '#ff6b6b',
    [CELL_TYPES.BOX]: '#4dabf7',
    [CELL_TYPES.PLAYER]: '#ffd43b',
    [CELL_TYPES.BOX_ON_TARGET]: '#40c057',
    [CELL_TYPES.PLAYER_ON_TARGET]: '#ff922b'
  }

  return {
    backgroundColor: colors[cellType] || '#ffffff',
    backgroundImage: backgroundImages[cellType] || '',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    border: '1px solid #ddd',
    color: cellType === CELL_TYPES.WALL ? '#ffffff' : '#333333'
  }
}

function getCellTypeButtonStyle(cellType) {
  const backgroundImages = {
    [CELL_TYPES.EMPTY]: '',
    [CELL_TYPES.WALL]: 'url(images/wall.png)',
    [CELL_TYPES.TARGET]: 'url(images/target.png)',
    [CELL_TYPES.BOX]: 'url(images/box.png)',
    [CELL_TYPES.PLAYER]: 'url(images/character_front.png)',
    [CELL_TYPES.BOX_ON_TARGET]: 'url(images/success.png)',
    [CELL_TYPES.PLAYER_ON_TARGET]: 'url(images/character_front.png), url(images/target.png)'
  }

  const colors = {
    [CELL_TYPES.EMPTY]: '#f5f5f5',
    [CELL_TYPES.WALL]: '#666666',
    [CELL_TYPES.TARGET]: '#ff6b6b',
    [CELL_TYPES.BOX]: '#4dabf7',
    [CELL_TYPES.PLAYER]: '#ffd43b',
    [CELL_TYPES.BOX_ON_TARGET]: '#40c057',
    [CELL_TYPES.PLAYER_ON_TARGET]: '#ff922b'
  }

  return {
    backgroundColor: colors[cellType] || '#ffffff',
    backgroundImage: backgroundImages[cellType] || '',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  }
}

// 获取按钮背景样式（只包含背景色）
function getCellTypeBackgroundStyle(cellType) {
  const colors = {
    [CELL_TYPES.EMPTY]: '#f5f5f5',
    [CELL_TYPES.WALL]: '#666666',
    [CELL_TYPES.TARGET]: '#ff6b6b',
    [CELL_TYPES.BOX]: '#4dabf7',
    [CELL_TYPES.PLAYER]: '#ffd43b',
    [CELL_TYPES.BOX_ON_TARGET]: '#40c057',
    [CELL_TYPES.PLAYER_ON_TARGET]: '#ff922b'
  }

  return {
    backgroundColor: colors[cellType] || '#ffffff'
  }
}

// 获取图标样式（只包含背景图片）
function getCellTypeIconStyle(cellType) {
  const backgroundImages = {
    [CELL_TYPES.EMPTY]: '',
    [CELL_TYPES.WALL]: 'url(images/wall.png)',
    [CELL_TYPES.TARGET]: 'url(images/target.png)',
    [CELL_TYPES.BOX]: 'url(images/box.png)',
    [CELL_TYPES.PLAYER]: 'url(images/character_front.png)',
    [CELL_TYPES.BOX_ON_TARGET]: 'url(images/success.png)',
    [CELL_TYPES.PLAYER_ON_TARGET]: 'url(images/character_front.png), url(images/target.png)'
  }

  return {
    backgroundImage: backgroundImages[cellType] || '',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  }
}

function startSuccessCountdown() {
  gameState.showSuccessModal = true
  gameState.countdown = 3

  gameState.countdownInterval = setInterval(() => {
    gameState.countdown--
    if (gameState.countdown <= 0) {
      clearInterval(gameState.countdownInterval)
      gameState.countdownInterval = null
      if (gameState.currentLevel < gameState.totalLevels - 1) {
        nextLevel()
      }
    }
  }, 1000)

  // 同时设置自动跳转计时器作为备份
  gameState.autoAdvanceTimer = setTimeout(() => {
    if (gameState.countdownInterval) {
      clearInterval(gameState.countdownInterval)
      gameState.countdownInterval = null
    }
    if (gameState.currentLevel < gameState.totalLevels - 1) {
      nextLevel()
    }
  }, 3000)
}

const isLevelComplete = computed(() => {
  // 计算原始关卡中目标点的数量
  let targetCount = 0
  for (let row = 0; row < gameState.originalLevel.length; row++) {
    for (let col = 0; col < gameState.originalLevel[row].length; col++) {
      if (gameState.originalLevel[row][col] === CELL_TYPES.TARGET ||
          gameState.originalLevel[row][col] === CELL_TYPES.PLAYER_ON_TARGET ||
          gameState.originalLevel[row][col] === CELL_TYPES.BOX_ON_TARGET) {
        targetCount++
      }
    }
  }

  // 计算当前地图中已完成的目标点数量（只计算BOX_ON_TARGET）
  let completedTargets = 0
  for (let row = 0; row < gameState.map.length; row++) {
    for (let col = 0; col < gameState.map[row].length; col++) {
      if (gameState.map[row][col] === CELL_TYPES.BOX_ON_TARGET) {
        completedTargets++
      }
    }
  }

  return completedTargets === targetCount
})

// 监听关卡完成状态变化
watch(isLevelComplete, (newValue) => {
  if (newValue && !gameState.levelCompleted && !gameState.showSuccessModal && !gameState.justSwitchedLevel) {
    gameState.levelCompleted = true

    // 延迟500ms显示成功弹框，让玩家看到最后一步操作的结果
    gameState.successTimeout = setTimeout(() => {
      if (gameState.levelCompleted && !gameState.showSuccessModal) {
        startSuccessCountdown()
      }
    }, 500)
  }
})

onMounted(async () => {
  // 获取环境信息
  const envInfo = await getEnvironmentInfo()
  if (envInfo) {
    console.log('环境信息:', envInfo)
    // 如果没有保存的自定义路径，显示默认路径信息
    if (!localStorage.getItem('levelFilePath')) {
      showNotification(`使用默认路径: ${envInfo.paths.defaultLevelsFile}`, 'info', 5000)
    }
  }

  // 加载保存的路径配置
  const savedPath = localStorage.getItem('levelFilePath')
  if (savedPath) {
    gameState.levelFilePath = savedPath
  }

  // 尝试从配置路径加载，如果失败则使用备用方案
  const success = await loadLevelsFromPath()
  if (!success) {
    await loadLevelsFromServer()
  }

  initGame()
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>
