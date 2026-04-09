<template>
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
</template>

<script setup>
defineProps({
  gameState: {
    type: Object,
    required: true
  },
  testPathConnection: {
    type: Function,
    required: true
  },
  savePathConfig: {
    type: Function,
    required: true
  }
})
</script>

<style scoped>
.path-config-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1600;
  backdrop-filter: blur(8px);
}

.path-config-modal {
  background: rgba(0, 20, 40, 0.95);
  border: 2px solid #00ffff;
  border-radius: 15px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow:
    0 0 40px rgba(0, 255, 255, 0.5),
    inset 0 0 40px rgba(0, 255, 255, 0.1);
}

.path-config-title {
  color: #00ffff;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 25px;
  text-align: center;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.path-config-content {
  margin-bottom: 25px;
}

.path-input-group {
  margin-bottom: 20px;
}

.path-input-group label {
  display: block;
  color: #00ffff;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
}

.path-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #00ffff;
  border-radius: 8px;
  background: rgba(0, 50, 100, 0.8);
  color: #00ffff;
  font-size: 14px;
  font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.path-input:focus {
  outline: none;
  border-color: #00ccff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
  background: rgba(0, 70, 140, 0.8);
}

.path-config-info {
  background: rgba(0, 30, 60, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  padding: 15px;
  margin-top: 15px;
}

.path-config-info h4 {
  color: #00ffff;
  font-size: 16px;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
}

.path-config-info ul {
  color: #88ddff;
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
  padding-left: 20px;
}

.path-config-info li {
  margin-bottom: 5px;
}

.path-config-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
