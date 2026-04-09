<template>
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
</template>

<script setup>
defineProps({
  gameState: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.left-panel {
  margin-top: 60px;
  flex: 0 0 280px;
  display: flex;
  flex-direction: column;
}

.game-info-panel {
  background: rgba(0, 30, 60, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 15px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: inset 0 0 20px rgba(0, 255, 255, 0.1);
}

.level-display, .steps-display {
  text-align: center;
  padding: 15px;
  background: rgba(0, 50, 100, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.level-title, .steps-title {
  font-size: 16px;
  color: #00ffff;
  margin: 0 0 10px 0;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.level-number, .steps-number {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
  margin: 5px 0;
}

.controls-info {
  padding: 15px;
  background: rgba(0, 40, 80, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.controls-title {
  font-size: 14px;
  color: #00ffff;
  margin: 0 0 8px 0;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
  text-transform: uppercase;
}

.controls-desc {
  font-size: 12px;
  color: #ffffff;
  margin: 0;
  opacity: 0.8;
}

.shortcuts-info {
  flex: 1;
  padding: 15px;
  background: rgba(0, 20, 40, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
}

.shortcuts-title {
  font-size: 14px;
  font-weight: bold;
  color: #00ffff;
  margin: 0 0 12px 0;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
  text-transform: uppercase;
}

.shortcuts-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 11px;
  flex: 1;
}

.shortcuts-grid span {
  background: rgba(0, 40, 80, 0.8);
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  color: #ffffff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
  transition: all 0.2s ease;
  text-align: center;
  cursor: default;
}

.shortcuts-grid span:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.5);
  transform: translateX(2px);
}

@media (max-width: 1024px) {
  .left-panel {
    flex: none;
    order: 2;
  }

  .game-info-panel {
    flex-direction: row;
    height: auto;
    gap: 15px;
    flex-wrap: wrap;
  }

  .level-display, .steps-display, .controls-info {
    flex: 1;
    min-width: 150px;
  }

  .shortcuts-info {
    flex: 100%;
  }

  .shortcuts-grid {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }

  .shortcuts-grid span {
    flex: 1;
    min-width: 120px;
  }
}

@media (max-width: 768px) {
  .shortcuts-grid span {
    min-width: 100px;
    font-size: 10px;
  }

  .level-number, .steps-number {
    font-size: 20px;
  }
}
</style>
