<template>
  <div
      v-motion
      :initial="{ opacity: 0, scale: 0.8 }"
      :enter="{ opacity: 1, scale: 1 }"
      :transition="{ duration: 500, type: 'spring' }"
      class="game-container"
  >
    <GameInfoPanel :gameState="gameState" />

    <GameBoard :gameState="gameState" :getCellStyle="getCellStyle" />

    <SuccessModal
        :gameState="gameState"
        :nextLevel="nextLevel"
        :restart="restart"
        :goToLevel="goToLevel"
    />

    <LevelSelector
        :gameState="gameState"
        :levels="levels"
        :goToLevel="goToLevel"
    />

    <LevelEditor
        :gameState="gameState"
        :levels="levels"
        :getCellTypeName="getCellTypeName"
        :getCellTypeButtonStyle="getCellTypeButtonStyle"
        :getEditorCellStyle="getEditorCellStyle"
        :initEditor="initEditor"
        :updateEditorSize="updateEditorSize"
        :setCellType="setCellType"
        :onDragStart="onDragStart"
        :onDragEnd="onDragEnd"
        :onDragOver="onDragOver"
        :onDragLeave="onDragLeave"
        :onCellDragStart="onCellDragStart"
        :onCellDragEnd="onCellDragEnd"
        :onDrop="onDrop"
        :addNewLevel="addNewLevel"
        :copyCurrentLevel="copyCurrentLevel"
        :insertLevel="insertLevel"
        :deleteCurrentLevel="deleteCurrentLevel"
        :saveLevel="saveLevel"
        :loadLevels="loadLevels"
    />

    <PathConfig
        :gameState="gameState"
        :testPathConnection="testPathConnection"
        :savePathConfig="savePathConfig"
    />

    <Toolkit
        :gameState="gameState"
        :prevLevel="prevLevel"
        :nextLevel="nextLevel"
        :undo="undo"
        :restart="restart"
        :toggleLevelSelector="toggleLevelSelector"
        :toggleLevelEditor="toggleLevelEditor"
        :togglePathConfig="togglePathConfig"
        :handleToolkitAction="handleToolkitAction"
    />

    <Notification
        :gameState="gameState"
        :hideNotification="hideNotification"
    />
  </div>
</template>

<script setup>
import {useGameState} from './composables/useGameState.js'
import GameInfoPanel from './components/GameInfoPanel.vue'
import GameBoard from './components/GameBoard.vue'
import SuccessModal from './components/SuccessModal.vue'
import LevelSelector from './components/LevelSelector.vue'
import LevelEditor from './components/LevelEditor.vue'
import PathConfig from './components/PathConfig.vue'
import Toolkit from './components/Toolkit.vue'
import Notification from './components/Notification.vue'

const {
  gameState,
  levels,
  hideNotification,
  nextLevel,
  prevLevel,
  restart,
  goToLevel,
  toggleLevelSelector,
  toggleLevelEditor,
  togglePathConfig,
  initEditor,
  updateEditorSize,
  setCellType,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onCellDragStart,
  onCellDragEnd,
  onDrop,
  handleToolkitAction,
  addNewLevel,
  copyCurrentLevel,
  insertLevel,
  deleteCurrentLevel,
  saveLevel,
  loadLevels,
  testPathConnection,
  savePathConfig,
  getCellStyle,
  getCellTypeName,
  getCellTypeButtonStyle,
  getEditorCellStyle,
  setupLifecycle
} = useGameState()

setupLifecycle()
</script>

<style scoped>
.game-container {
  background: linear-gradient(135deg,
    rgba(0, 20, 40, 0.95) 0%,
    rgba(0, 30, 60, 0.9) 50%,
    rgba(0, 20, 40, 0.95) 100%);
  border: 2px solid #00ffff;
  border-radius: 20px;
  box-shadow:
    0 0 40px rgba(0, 255, 255, 0.3),
    0 0 80px rgba(0, 255, 255, 0.1),
    inset 0 0 30px rgba(0, 255, 255, 0.1),
    inset 0 2px 0 rgba(255, 255, 255, 0.1);
  padding: 20px;
  backdrop-filter: blur(15px);
  position: relative;
  overflow: hidden;
  width: 95vw;
  height: 95vh;
  max-width: 95vw;
  max-height: 95vh;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  gap: 20px;
  align-items: stretch;
  box-sizing: border-box;
}

.game-container::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #00ffff, #0080ff, #00ffff);
  border-radius: 15px;
  z-index: -1;
  animation: glow 2s linear infinite;
}

@keyframes glow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

@media (max-width: 1024px) {
  .game-container {
    flex-direction: column;
    min-width: 600px;
    min-height: auto;
    gap: 20px;
  }
}
</style>
