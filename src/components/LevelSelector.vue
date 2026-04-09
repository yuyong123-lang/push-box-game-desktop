<template>
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
</template>

<script setup>
defineProps({
  gameState: {
    type: Object,
    required: true
  },
  levels: {
    type: Array,
    required: true
  },
  goToLevel: {
    type: Function,
    required: true
  }
})
</script>

<style scoped>
.level-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.level-selector-modal {
  background: rgba(0, 20, 40, 0.95);
  border: 2px solid #00ffff;
  border-radius: 15px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow:
    0 0 40px rgba(0, 255, 255, 0.5),
    inset 0 0 40px rgba(0, 255, 255, 0.1);
}

.level-selector-title {
  color: #00ffff;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
  text-align: center;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.level-button {
  width: 60px;
  height: 60px;
  border: 2px solid #00ffff;
  border-radius: 10px;
  background: rgba(0, 50, 100, 0.8);
  color: #00ffff;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
}

.level-button:hover {
  background: rgba(0, 100, 200, 0.8);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
  transform: scale(1.1);
}

.level-button.current {
  background: linear-gradient(45deg, rgba(255, 100, 0, 0.8), rgba(255, 150, 0, 0.8));
  border-color: #ff8800;
  color: #fff;
  box-shadow: 0 0 25px rgba(255, 136, 0, 0.6);
}

.close-button {
  margin: 0 auto;
  display: block;
}
</style>
