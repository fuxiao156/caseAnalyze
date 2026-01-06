<template>
  <div v-if="visible" class="data-correction-modal-mask" @click.self="$emit('close')">
    <div class="data-correction-modal-container slide-in">
      <div class="modal-header">
        <div class="header-title">
          <span class="icon-pulse"></span>
          <span class="title-text">数据校正 - {{ sectionName }}</span>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body scrollbar-tech">
        <!-- 动态渲染不同的校正面板 -->
        <div v-if="sectionId === 'event-description'" class="correction-panel">
          <div class="panel-group">
            <div class="panel-label">事件标题</div>
            <input 
              v-model="localData.title" 
              class="tech-input" 
              placeholder="请输入事件标题..."
            />
          </div>
          <div class="panel-group">
            <div class="panel-label">事件详情描述</div>
            <textarea 
              v-model="localData.detail" 
              class="tech-textarea custom-scrollbar" 
              placeholder="请输入详细的事件描述..."
            ></textarea>
          </div>
        </div>

        <!-- 未来可以在这里添加其他模块的面板 -->
        <div v-else class="placeholder-text">
          {{ sectionName }} 的校正面板正在开发中...
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">取消</button>
        <button class="submit-btn" @click="handleUpdate" :disabled="submitting">
          <span v-if="submitting" class="loading-icon">⏳</span>
          {{ submitting ? '正在保存修改...' : '提交数据校正' }}
        </button>
      </div>

      <!-- 提示信息 -->
      <Transition name="fade">
        <div v-if="message.text" :class="['toast-message', message.type]">
          {{ message.text }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';

const props = defineProps({
  visible: Boolean,
  sectionName: String,
  sectionId: String,
  allData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'update-all']);

const submitting = ref(false);
const message = reactive({ text: '', type: '' });
const localData = ref({});

// 监听 visible，打开时拷贝一份数据
watch(() => props.visible, (newVal) => {
  if (newVal) {
    localData.value = JSON.parse(JSON.stringify(props.allData));
  }
}, { immediate: true });

const showMessage = (text, type = 'success') => {
  message.text = text;
  message.type = type;
  setTimeout(() => {
    message.text = '';
  }, 3000);
};

// 模拟 API 接口
const mockUpdateApi = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟成功或失败
      const isSuccess = Math.random() > 0.1; 
      if (isSuccess) {
        resolve({ code: 200, message: '数据同步成功' });
      } else {
        reject(new Error('网络传输异常，请稍后重试'));
      }
    }, 1500);
  });
};

const handleUpdate = async () => {
  submitting.value = true;
  try {
    const response = await mockUpdateApi(localData.value);
    showMessage(response.message, 'success');
    
    // 通知父组件更新全局数据
    emit('update-all', localData.value);
    
    // 延迟关闭，让用户看到成功提示
    setTimeout(() => {
      emit('close');
    }, 1000);
  } catch (error) {
    showMessage(error.message, 'error');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.data-correction-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(4, 10, 25, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2500;
}

.data-correction-modal-container {
  width: 600px;
  max-height: 80vh;
  background: linear-gradient(145deg, #1a3a7a 0%, #0d1b3e 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 242, 255, 0.3);
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 50px rgba(0, 242, 255, 0.2);
  position: relative;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid rgba(0, 242, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title { display: flex; align-items: center; gap: 12px; }
.icon-pulse {
  width: 10px; height: 10px; background: #00f2ff; border-radius: 50%;
  box-shadow: 0 0 10px #00f2ff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.title-text { color: #fff; font-size: 18px; font-weight: bold; letter-spacing: 1px; }

.modal-body {
  flex: 1;
  padding: 25px;
  overflow-y: auto;
}

.panel-group {
  margin-bottom: 20px;
}

.panel-label {
  color: #00f2ff;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  border-left: 3px solid #00f2ff;
  padding-left: 10px;
}

.tech-input, .tech-textarea {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 242, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  padding: 12px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.tech-input:focus, .tech-textarea:focus {
  border-color: #00f2ff;
  box-shadow: 0 0 8px rgba(0, 242, 255, 0.2);
}

.tech-textarea {
  height: 200px;
  resize: vertical;
  line-height: 1.6;
}

.modal-footer {
  padding: 20px 25px;
  display: flex;
  gap: 15px;
  border-top: 1px solid rgba(0, 242, 255, 0.1);
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: #88b0ea;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.submit-btn {
  flex: 2;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #0066ff, #00f2ff);
  color: white;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.close-btn { background: none; border: none; color: #88b0ea; font-size: 20px; cursor: pointer; }
.close-btn:hover { color: #fff; }

.placeholder-text {
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  padding: 40px 0;
  font-style: italic;
}

/* Toast Message */
.toast-message {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

.toast-message.success {
  background: #52c41a;
  color: #fff;
}

.toast-message.error {
  background: #ff4d4f;
  color: #fff;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s, transform 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, -20px); }

/* 滚动条美化 */
.scrollbar-tech::-webkit-scrollbar,
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-tech::-webkit-scrollbar-thumb,
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 242, 255, 0.2);
  border-radius: 10px;
}
.scrollbar-tech::-webkit-scrollbar-track,
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.slide-in { animation: slideIn 0.3s ease-out; }
</style>
