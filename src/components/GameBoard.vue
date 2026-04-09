<template>
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
</template>

<script setup>
defineProps({
  gameState: {
    type: Object,
    required: true
  },
  getCellStyle: {
    type: Function,
    required: true
  }
})
</script>

<style scoped>
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.game-title {
  font-size: 2.5rem;
  color: #00ffff;
  margin-bottom: 20px;
  font-weight: 700;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 4px;
  text-align: center;
}

.game-board {
  display: inline-block;
  border: 3px solid #00ffff;
  background: rgba(0, 50, 100, 0.8);
  margin: 25px 0;
  gap: 3px;
  padding: 12px;
  border-radius: 12px;
  box-shadow:
    0 0 25px rgba(0, 255, 255, 0.4),
    inset 0 0 25px rgba(0, 255, 255, 0.1);
}

.game-row {
  display: flex;
  margin: 0;
  padding: 0;
  gap: 3px;
}

.game-cell {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  background-color: rgba(0, 40, 80, 0.6);
  transition: all 0.2s ease;
}

.game-cell:hover {
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.6);
}

@media (max-width: 1024px) {
  .right-panel {
    flex: none;
    order: 1;
  }
}

@media (max-width: 768px) {
  .game-title {
    font-size: 2rem;
  }
}
</style>
