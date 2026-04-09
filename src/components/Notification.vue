<template>
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
</template>

<script setup>
defineProps({
  gameState: {
    type: Object,
    required: true
  },
  hideNotification: {
    type: Function,
    required: true
  }
})
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  min-width: 300px;
  max-width: 400px;
  border-radius: 12px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(0, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.notification:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.6),
    0 0 30px rgba(0, 255, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.notification-content {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  gap: 12px;
}

.notification-icon {
  font-size: 18px;
  font-weight: bold;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.notification-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 500;
}

.notification-close {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  opacity: 0.8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.notification-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Success */
.notification-success {
  background: linear-gradient(135deg,
    rgba(16, 185, 129, 0.2) 0%,
    rgba(5, 150, 105, 0.2) 100%);
  border-color: rgba(16, 185, 129, 0.6);
  color: #ffffff;
}

.notification-success .notification-icon {
  background: rgba(16, 185, 129, 0.3);
  color: #ffffff;
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
}

.notification-success .notification-message {
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Error */
.notification-error {
  background: linear-gradient(135deg,
    rgba(239, 68, 68, 0.2) 0%,
    rgba(220, 38, 38, 0.2) 100%);
  border-color: rgba(239, 68, 68, 0.6);
  color: #ffffff;
}

.notification-error .notification-icon {
  background: rgba(239, 68, 68, 0.3);
  color: #ffffff;
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.8);
}

.notification-error .notification-message {
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Warning */
.notification-warning {
  background: linear-gradient(135deg,
    rgba(245, 158, 11, 0.2) 0%,
    rgba(217, 119, 6, 0.2) 100%);
  border-color: rgba(245, 158, 11, 0.6);
  color: #ffffff;
}

.notification-warning .notification-icon {
  background: rgba(245, 158, 11, 0.3);
  color: #ffffff;
  text-shadow: 0 0 8px rgba(245, 158, 11, 0.8);
}

.notification-warning .notification-message {
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Info */
.notification-info {
  background: linear-gradient(135deg,
    rgba(59, 130, 246, 0.2) 0%,
    rgba(37, 99, 235, 0.2) 100%);
  border-color: rgba(59, 130, 246, 0.6);
  color: #ffffff;
}

.notification-info .notification-icon {
  background: rgba(59, 130, 246, 0.3);
  color: #ffffff;
  text-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
}

.notification-info .notification-message {
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

@media (max-width: 480px) {
  .notification {
    top: 10px;
    right: 10px;
    left: 10px;
    min-width: auto;
    max-width: none;
  }

  .notification-content {
    padding: 12px 16px;
  }

  .notification-message {
    font-size: 13px;
  }
}
</style>
