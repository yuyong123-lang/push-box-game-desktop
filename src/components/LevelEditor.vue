<template>
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

      <div class="editor-main">
        <!-- Left tool panel -->
        <div class="editor-left-panel">
          <!-- Cell type selector -->
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

          <!-- Level management -->
          <div class="level-management">
            <h4 class="level-mgmt-title">关卡管理</h4>
            <div class="level-mgmt-buttons">
              <button @click="addNewLevel" class="btn-level-mgmt btn-success" title="新关卡">+</button>
              <button @click="copyCurrentLevel" class="btn-level-mgmt btn-info" title="复制">📋</button>
              <button @click="insertLevel" class="btn-level-mgmt btn-secondary" title="插入">➕</button>
              <button @click="deleteCurrentLevel" class="btn-level-mgmt btn-danger" title="删除" :disabled="levels.length <= 1">🗑</button>
            </div>
          </div>

          <!-- File operations -->
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

        <!-- Right editing area -->
        <div class="editor-right-panel">
          <!-- Top controls -->
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

          <!-- Editor grid -->
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
</template>

<script setup>
import {CELL_TYPES} from '../composables/useGameState.js'

defineProps({
  gameState: {
    type: Object,
    required: true
  },
  levels: {
    type: Array,
    required: true
  },
  getCellTypeName: {
    type: Function,
    required: true
  },
  getCellTypeButtonStyle: {
    type: Function,
    required: true
  },
  getEditorCellStyle: {
    type: Function,
    required: true
  },
  initEditor: {
    type: Function,
    required: true
  },
  updateEditorSize: {
    type: Function,
    required: true
  },
  setCellType: {
    type: Function,
    required: true
  },
  onDragStart: {
    type: Function,
    required: true
  },
  onDragEnd: {
    type: Function,
    required: true
  },
  onDragOver: {
    type: Function,
    required: true
  },
  onDragLeave: {
    type: Function,
    required: true
  },
  onCellDragStart: {
    type: Function,
    required: true
  },
  onCellDragEnd: {
    type: Function,
    required: true
  },
  onDrop: {
    type: Function,
    required: true
  },
  addNewLevel: {
    type: Function,
    required: true
  },
  copyCurrentLevel: {
    type: Function,
    required: true
  },
  insertLevel: {
    type: Function,
    required: true
  },
  deleteCurrentLevel: {
    type: Function,
    required: true
  },
  saveLevel: {
    type: Function,
    required: true
  },
  loadLevels: {
    type: Function,
    required: true
  }
})
</script>

<style scoped>
.level-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1500;
  backdrop-filter: blur(8px);
}

.level-editor-modal {
  background: rgba(0, 20, 40, 0.95);
  border: 2px solid #00ffff;
  border-radius: 15px;
  padding: 20px;
  width: 95vw;
  height: 95vh;
  box-shadow:
    0 0 40px rgba(0, 255, 255, 0.5),
    inset 0 0 40px rgba(0, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-main {
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

.editor-left-panel {
  flex: 0 0 280px;
  background: rgba(0, 40, 80, 0.7);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 15px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: inset 0 0 20px rgba(0, 255, 255, 0.1);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  max-width: 280px;
}

.cell-type-selector {
  background: rgba(0, 30, 60, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 10px;
  padding: 8px;
  margin-bottom: 0;
}

.selector-title {
  font-size: 13px;
  color: #00ffff;
  margin: 0 0 8px 0;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
  text-transform: uppercase;
  text-align: center;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  padding-bottom: 4px;
}

.cell-type-buttons-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  justify-content: space-around;
}

.cell-type-btn-grid {
  width: 60px;
  height: 60px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-size: 48px 48px;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: #ffffff;
  box-sizing: border-box;
  overflow: hidden;
  flex-shrink: 0;
}

.cell-type-btn-grid:hover {
  border-color: rgba(0, 255, 255, 0.6);
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

.cell-type-btn-grid.active {
  border-color: #00ffff;
  box-shadow:
    0 0 20px rgba(0, 255, 255, 0.5),
    inset 0 0 20px rgba(0, 255, 255, 0.1);
  transform: scale(1.1);
}

.level-management {
  background: rgba(0, 30, 60, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 10px;
  padding: 8px;
}

.level-mgmt-title {
  font-size: 13px;
  color: #00ffff;
  margin: 0 0 8px 0;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
  text-transform: uppercase;
  text-align: center;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  padding-bottom: 4px;
}

.level-mgmt-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: space-between;
}

.btn-level-mgmt {
  width: 55px;
  height: 40px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-sizing: border-box;
}

.btn-level-mgmt.btn-success {
  background: rgba(64, 192, 87, 0.2);
  border-color: rgba(64, 192, 87, 0.5);
  color: #40c057;
}

.btn-level-mgmt.btn-info {
  background: rgba(77, 171, 247, 0.2);
  border-color: rgba(77, 171, 247, 0.5);
  color: #4dabf7;
}

.btn-level-mgmt.btn-secondary {
  background: rgba(134, 142, 150, 0.2);
  border-color: rgba(134, 142, 150, 0.5);
  color: #868e96;
}

.btn-level-mgmt.btn-danger {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.5);
  color: #ff6b6b;
}

.btn-level-mgmt:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2);
}

.btn-level-mgmt:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
}

.file-operations {
  background: rgba(0, 30, 60, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 10px;
  padding: 12px;
}

.file-ops-title {
  font-size: 13px;
  color: #00ffff;
  margin: 0 0 8px 0;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
  text-transform: uppercase;
  text-align: center;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  padding-bottom: 4px;
}

.file-ops-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.btn-file-ops {
  padding: 8px 12px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.btn-file-ops.btn-primary {
  background: rgba(0, 100, 200, 0.2);
  border-color: rgba(0, 100, 200, 0.5);
  color: #4dabf7;
}

.btn-file-ops.btn-secondary {
  background: rgba(134, 142, 150, 0.2);
  border-color: rgba(134, 142, 150, 0.5);
  color: #868e96;
}

.btn-file-ops.btn-danger {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.5);
  color: #ff6b6b;
}

.editor-right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(0, 20, 40, 0.4);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 15px;
  padding: 15px;
  overflow: auto;
  gap: 15px;
  min-height: 600px;
  box-sizing: border-box;
}

.editor-top-controls {
  display: flex;
  gap: 20px;
  background: rgba(0, 40, 80, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 10px;
  padding: 12px;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
}

.top-control-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.top-control-section.level-section {
  flex: 0 0 auto;
  min-width: 200px;
}

.top-control-section.size-section {
  flex: 1;
}

.top-control-title {
  font-size: 12px;
  color: #00ffff;
  margin: 0;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
  text-transform: uppercase;
  text-align: center;
}

.level-select {
  padding: 4px 8px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(0, 40, 80, 0.8);
  color: #ffffff;
  font-size: 12px;
  width: 120px;
  flex-shrink: 0;
}

.level-section-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.level-section .top-control-title {
  margin: 0;
  white-space: nowrap;
}

.size-controls-top {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.size-controls-top label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ffffff;
  font-size: 12px;
}

.size-input {
  width: 50px;
  padding: 3px 5px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 3px;
  background: rgba(0, 40, 80, 0.8);
  color: #ffffff;
  text-align: center;
  font-size: 11px;
}

.editor-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: rgba(0, 255, 255, 0.1);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  flex: 1;
  justify-content: center;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  min-height: 450px;
  position: relative;
}

.editor-row {
  display: flex;
  gap: 2px;
  margin: 2px 0;
  justify-content: center;
}

.editor-cell {
  width: 35px;
  height: 35px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.editor-cell:hover {
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
}

.editor-cell .cell-number {
  font-size: 10px;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  pointer-events: none;
}

.level-editor-title {
  color: #00ffff;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 25px;
  text-align: center;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.level-count {
  font-size: 16px;
  color: #88ddff;
  font-weight: 400;
  margin-left: 10px;
}

/* Drag & Drop styles */
.cell-type-btn-grid[draggable="true"] {
  cursor: grab;
  user-select: none;
}

.cell-type-btn-grid[draggable="true"]:active {
  cursor: grabbing;
}

.editor-cell.drag-over {
  border: 3px solid #00ffff !important;
  box-shadow:
    0 0 15px rgba(0, 255, 255, 0.5),
    inset 0 0 15px rgba(0, 255, 255, 0.2) !important;
  transform: scale(1.05);
  background-color: rgba(0, 255, 255, 0.1) !important;
  z-index: 10;
  animation: dragPulse 1s infinite;
}

.editor-cell.drag-over::after {
  content: "拖到这里放置";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 255, 255, 0.9);
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  white-space: nowrap;
  pointer-events: none;
  z-index: 11;
}

@keyframes dragPulse {
  0%, 100% {
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 25px rgba(0, 255, 255, 0.8);
  }
}

.editor-cell.dragging {
  opacity: 0.5 !important;
  transform: scale(0.95);
  border: 2px dashed rgba(255, 255, 255, 0.5) !important;
  cursor: grabbing !important;
}

.editor-cell[draggable="true"]:not(.dragging) {
  cursor: grab;
}

/* Responsive */
@media (max-width: 1200px) {
  .level-editor-modal {
    width: 98vw;
    height: 98vh;
    padding: 15px;
  }

  .editor-left-panel {
    flex: 0 0 200px;
    padding: 12px;
  }

  .cell-type-buttons-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .cell-type-btn-grid {
    width: 75px;
    height: 55px;
    background-size: 45px 45px;
  }
}

@media (max-width: 900px) {
  .level-editor-modal {
    width: 98vw;
    height: 98vh;
    padding: 10px;
  }

  .editor-main {
    flex-direction: column;
    gap: 10px;
  }

  .editor-left-panel {
    flex: none;
    flex-direction: row;
    gap: 10px;
    overflow-x: hidden;
    height: auto;
    padding: 10px;
    width: 100%;
  }

  .cell-type-selector {
    flex: 0 0 160px;
  }

  .cell-type-buttons-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  .cell-type-btn-grid {
    height: 40px;
    max-width: 70px;
    background-size: 30px 30px;
  }

  .file-operations {
    flex: 1;
  }

  .file-ops-buttons {
    flex-direction: row;
    gap: 4px;
  }

  .btn-file-ops {
    font-size: 10px;
    padding: 6px 8px;
  }

  .editor-right-panel {
    padding: 10px;
  }

  .editor-top-controls {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .level-editor-modal {
    max-width: 95vw;
    padding: 20px;
  }

  .editor-cell {
    width: 30px;
    height: 30px;
  }
}
</style>
