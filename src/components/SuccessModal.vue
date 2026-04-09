<template>
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
</template>

<script setup>
defineProps({
  gameState: {
    type: Object,
    required: true
  },
  nextLevel: {
    type: Function,
    required: true
  },
  restart: {
    type: Function,
    required: true
  },
  goToLevel: {
    type: Function,
    required: true
  }
})
</script>

<style scoped>
.success-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
}

.success-modal {
  background: linear-gradient(135deg, rgba(0, 20, 60, 0.95) 0%, rgba(0, 40, 80, 0.95) 100%);
  border: 3px solid #00ffff;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  min-width: 400px;
  max-width: 90vw;
  box-shadow:
    0 0 50px rgba(0, 255, 255, 0.6),
    inset 0 0 50px rgba(0, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.success-modal::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: linear-gradient(45deg, #00ffff, #0080ff, #00ffff, #0080ff);
  border-radius: 20px;
  z-index: -1;
  animation: glow-border 2s linear infinite;
}

@keyframes glow-border {
  0% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
  100% { opacity: 0.8; transform: scale(1); }
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounce 1s ease-in-out infinite alternate;
}

@keyframes bounce {
  0% { transform: translateY(0px) scale(1); }
  100% { transform: translateY(-10px) scale(1.1); }
}

.success-title {
  color: #00ffff;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 25px;
  text-shadow: 0 0 25px rgba(0, 255, 255, 1);
  font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.success-info {
  margin-bottom: 30px;
  color: #00ff88;
  font-size: 16px;
  line-height: 1.6;
}

.success-info p {
  margin: 8px 0;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.6);
}

.success-actions {
  margin-top: 30px;
}

.countdown-display {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.countdown-number {
  font-size: 2rem;
  font-weight: 700;
  color: #ff6b35;
  text-shadow: 0 0 20px rgba(255, 107, 53, 0.8);
  animation: pulse-number 1s ease-in-out infinite;
}

@keyframes pulse-number {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.countdown-text {
  color: #00ffff;
  font-size: 14px;
  font-weight: 500;
}

.success-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.final-success {
  text-align: center;
}

.final-icon {
  font-size: 5rem;
  margin-bottom: 25px;
  animation: rotate-trophy 3s ease-in-out infinite;
}

@keyframes rotate-trophy {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-10deg) scale(1.1); }
  75% { transform: rotate(10deg) scale(1.1); }
}

.final-title {
  color: #ffa500;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 15px;
  text-shadow: 0 0 25px rgba(255, 165, 0, 0.8);
  font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
}

.final-message {
  color: #00ffff;
  font-size: 18px;
  margin-bottom: 30px;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .success-modal {
    padding: 30px 20px;
    min-width: 320px;
  }

  .success-title {
    font-size: 2rem;
  }

  .success-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>
