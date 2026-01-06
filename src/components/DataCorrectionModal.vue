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

        <div v-else-if="sectionId === 'event-factor'" class="correction-panel">
          <div class="panel-group">
            <div class="panel-label">事件画像 (Profiling)</div>
            <div class="factor-edit-list">
              <div v-for="(item, index) in localData.事件画像" :key="'profile-' + index" class="factor-edit-item">
                <input v-model="item.tag" class="tech-input small" placeholder="标签名称" />
                <button class="remove-btn" @click="localData.事件画像.splice(index, 1)">✕</button>
              </div>
              <button class="add-btn" @click="localData.事件画像.push({ tag: '', percentage: 0 })">+ 添加画像标签</button>
            </div>
          </div>

          <div class="panel-group">
            <div class="panel-label">核心成因分析 (Causes)</div>
            <div class="factor-edit-list">
              <div v-for="(item, index) in localData.核心成因分析" :key="'cause-' + index" class="factor-edit-item">
                <input v-model="item.tag" class="tech-input small" placeholder="成因标签" />
                <button class="remove-btn" @click="localData.核心成因分析.splice(index, 1)">✕</button>
              </div>
              <button class="add-btn" @click="localData.核心成因分析.push({ tag: '', percentage: 0 })">+ 添加成因标签</button>
            </div>
          </div>
        </div>

        <div v-else-if="sectionId === 'time-dimension'" class="correction-panel">
          <div class="panel-group">
            <div class="panel-label">时间维度总结</div>
            <textarea 
              v-model="localData.时间维度数据.summary" 
              class="tech-textarea custom-scrollbar small-height" 
              placeholder="请输入时间维度总结..."
            ></textarea>
          </div>
          <div class="panel-group">
            <div class="panel-label">事件时间轴 (Timeline)</div>
            <div class="timeline-edit-list">
              <div v-for="(node, index) in localData.时间维度数据.timeline" :key="'node-' + index" class="timeline-edit-card">
                <div class="card-header">
                  <span class="node-index">节点 {{ index + 1 }}</span>
                  <button class="remove-btn small" @click="localData.时间维度数据.timeline.splice(index, 1)">✕</button>
                </div>
                <div class="card-body">
                  <div class="input-row">
                    <input v-model="node.date" class="tech-input small" placeholder="时间 (如: 2024-01)" />
                    <input v-model="node.event" class="tech-input small" placeholder="事件简称" />
                  </div>
                  
                  <!-- 节点下要素校正 -->
                  <div class="node-factors-edit">
                    <div class="sub-label">影响要素 (Factors)</div>
                    <div v-for="(factor, fIdx) in node.nodeFactors" :key="'f-' + fIdx" class="factor-row">
                      <div class="factor-header">
                        <input v-model="factor.name" class="tech-input small" placeholder="要素名称" />
                        <button class="remove-btn mini" @click="node.nodeFactors.splice(fIdx, 1)">✕</button>
                      </div>
                      <textarea v-model="factor.content" class="tech-textarea custom-scrollbar tiny-height" placeholder="要素分析内容..."></textarea>
                    </div>
                    <button class="add-btn mini" @click="node.nodeFactors.push({ id: Date.now(), name: '', content: '' })">+ 添加影响要素</button>
                  </div>
                </div>
              </div>
              <button class="add-btn" @click="localData.时间维度数据.timeline.push({ date: '', event: '', nodeFactors: [] })">+ 添加时间节点</button>
            </div>
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
  padding-right: 15px;
}

.tech-textarea.small-height {
  height: 80px;
}

.tech-textarea.tiny-height {
  height: 60px;
  font-size: 12px;
  margin-top: 5px;
}

/* 要素编辑列表样式 */
.factor-edit-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.factor-edit-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.tech-input.small {
  padding: 8px 10px;
  font-size: 13px;
}

.add-btn {
  background: rgba(0, 242, 255, 0.05);
  border: 1px dashed rgba(0, 242, 255, 0.3);
  color: #00f2ff;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.add-btn:hover {
  background: rgba(0, 242, 255, 0.1);
  border-color: #00f2ff;
}

.remove-btn {
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: #ff4d4f;
  color: #fff;
}

.remove-btn.small {
  width: 20px;
  height: 20px;
  font-size: 10px;
}

.remove-btn.mini {
  width: 18px;
  height: 18px;
  font-size: 8px;
  padding: 0;
}

.add-btn.mini {
  padding: 4px 8px;
  font-size: 11px;
  margin-top: 5px;
}

/* 时间轴编辑样式 */
.timeline-edit-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.timeline-edit-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 242, 255, 0.1);
  border-radius: 6px;
  padding: 12px;
}

.timeline-edit-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 8px;
}

.node-index {
  font-size: 12px;
  color: #88b0ea;
  font-weight: bold;
}

.timeline-edit-card .input-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.node-factors-edit {
  background: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 4px;
  border: 1px solid rgba(0, 242, 255, 0.05);
}

.sub-label {
  font-size: 11px;
  color: #00f2ff;
  margin-bottom: 8px;
  opacity: 0.8;
  text-transform: uppercase;
}

.factor-row {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
}

.factor-row:last-of-type {
  border-bottom: none;
}

.factor-header {
  display: flex;
  gap: 8px;
  align-items: center;
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
  border-radius: 2px;
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
