<template>
  <div class="toolkit-container">
    <!-- Trigger button -->
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

    <!-- Panel -->
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
      <!-- Level controls -->
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

      <!-- Game controls -->
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

      <!-- Editor -->
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

      <!-- Close button -->
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

    <!-- Overlay -->
    <div
        v-if="gameState.showToolkit"
        class="toolkit-overlay"
        @click="gameState.showToolkit = false"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  gameState: {
    type: Object,
    required: true
  },
  prevLevel: {
    type: Function,
    required: true
  },
  nextLevel: {
    type: Function,
    required: true
  },
  undo: {
    type: Function,
    required: true
  },
  restart: {
    type: Function,
    required: true
  },
  toggleLevelSelector: {
    type: Function,
    required: true
  },
  toggleLevelEditor: {
    type: Function,
    required: true
  },
  togglePathConfig: {
    type: Function,
    required: true
  },
  handleToolkitAction: {
    type: Function,
    required: true
  }
})
</script>

<style scoped>
.toolkit-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
  pointer-events: auto;
}

.toolkit-trigger {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0064c8 0%, #0096ff 100%);
  border: 2px solid #00ffff;
  color: #ffffff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 20px rgba(0, 255, 255, 0.3),
    0 0 30px rgba(0, 150, 255, 0.2);
  position: relative;
  z-index: 10001;
  pointer-events: auto;
}

.toolkit-trigger:hover {
  box-shadow:
    0 6px 25px rgba(0, 255, 255, 0.4),
    0 0 40px rgba(0, 150, 255, 0.3);
  transform: translateY(-2px);
}

.toolkit-trigger.active {
  background: linear-gradient(135deg, #0096ff 0%, #00c8ff 100%);
  box-shadow:
    0 6px 25px rgba(0, 255, 255, 0.5),
    0 0 50px rgba(0, 200, 255, 0.4);
}

.toolkit-icon {
  display: block;
  transform: scale(1);
  transition: transform 0.3s ease;
  pointer-events: none;
}

.toolkit-trigger.active .toolkit-icon {
  transform: scale(1.1) rotate(45deg);
}

.toolkit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 9998;
  pointer-events: auto;
}

.toolkit-panel {
  position: absolute;
  bottom: 65px;
  right: 0;
  width: 260px;
  max-height: 60vh;
  background: linear-gradient(135deg, #001428 0%, #001e3c 50%, #001428 100%);
  border: 2px solid #00ffff;
  border-radius: 12px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 0 40px rgba(0, 255, 255, 0.4);
  padding: 16px;
  overflow-y: auto;
  z-index: 10000;
  pointer-events: auto;
}

.toolkit-section {
  margin-bottom: 16px;
}

.toolkit-section:last-of-type {
  margin-bottom: 0;
}

.toolkit-section-title {
  color: #00ffff;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px 0;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.toolkit-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.toolkit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #00ffff;
  border-radius: 8px;
  background: #003264;
  color: #ffffff;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  font-family: inherit;
  pointer-events: auto;
  position: relative;
  z-index: 10001;
}

.toolkit-btn:hover:not(:disabled) {
  background: #004578;
  border-color: #00ffff;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.3);
}

.toolkit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  background: #1a1a1a;
  border-color: #333333;
}

.toolkit-btn .btn-icon {
  font-size: 12px;
  min-width: 16px;
  text-align: center;
  pointer-events: none;
}

.toolkit-btn .btn-text {
  flex: 1;
  pointer-events: none;
}

/* Button type variants */
.toolkit-btn-primary {
  border-color: #3b82f6;
  background: #1e40af;
}

.toolkit-btn-primary:hover:not(:disabled) {
  background: #2563eb;
  border-color: #60a5fa;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.toolkit-btn-secondary {
  border-color: #64748b;
  background: #475569;
}

.toolkit-btn-secondary:hover:not(:disabled) {
  background: #64748b;
  border-color: #94a3b8;
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.4);
}

.toolkit-btn-success {
  border-color: #22c55e;
  background: #166534;
}

.toolkit-btn-success:hover:not(:disabled) {
  background: #16a34a;
  border-color: #4ade80;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.toolkit-btn-warning {
  border-color: #f59e0b;
  background: #d97706;
}

.toolkit-btn-warning:hover:not(:disabled) {
  background: #f59e0b;
  border-color: #fbbf24;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.toolkit-btn-danger {
  border-color: #ef4444;
  background: #dc2626;
}

.toolkit-btn-danger:hover:not(:disabled) {
  background: #ef4444;
  border-color: #f87171;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.toolkit-btn-info {
  border-color: #0ea5e9;
  background: #0284c7;
}

.toolkit-btn-info:hover:not(:disabled) {
  background: #0ea5e9;
  border-color: #38bdf8;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
}

.toolkit-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #dc2626;
  border: 1px solid #ef4444;
  color: #ffffff;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10002;
  pointer-events: auto;
}

.toolkit-close:hover {
  background: #ef4444;
  border-color: #f87171;
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}

/* Responsive */
@media (max-width: 1024px) {
  .toolkit-container {
    bottom: 20px;
    right: 20px;
  }

  .toolkit-panel {
    width: 240px;
    bottom: 60px;
    right: -10px;
    max-height: 50vh;
  }
}

@media (max-width: 768px) {
  .toolkit-container {
    bottom: 15px;
    right: 15px;
  }

  .toolkit-trigger {
    width: 45px;
    height: 45px;
    font-size: 16px;
  }

  .toolkit-panel {
    width: 220px;
    bottom: 55px;
    right: -15px;
    max-height: 45vh;
    padding: 12px;
  }

  .toolkit-section {
    margin-bottom: 12px;
  }

  .toolkit-btn {
    padding: 6px 10px;
    font-size: 10px;
    gap: 6px;
  }

  .toolkit-btn .btn-icon {
    font-size: 11px;
    min-width: 14px;
  }

  .toolkit-section-title {
    font-size: 10px;
    margin: 0 0 6px 0;
  }

  .toolkit-close {
    top: 6px;
    right: 6px;
    width: 20px;
    height: 20px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .toolkit-container {
    bottom: 10px;
    right: 10px;
  }

  .toolkit-trigger {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }

  .toolkit-panel {
    width: 200px;
    bottom: 50px;
    right: -20px;
    max-height: 40vh;
    padding: 10px;
  }

  .toolkit-section {
    margin-bottom: 10px;
  }

  .toolkit-section-title {
    font-size: 9px;
  }

  .toolkit-btn {
    padding: 5px 8px;
    font-size: 9px;
    gap: 5px;
  }

  .toolkit-btn .btn-icon {
    font-size: 10px;
    min-width: 12px;
  }
}

@media (max-width: 360px) {
  .toolkit-panel {
    width: calc(100vw - 40px);
    right: -15px;
    left: auto;
  }
}
</style>
