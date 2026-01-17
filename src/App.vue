<script setup>
import DashboardMain from './components/CaseDashboard/DashboardMain.vue'
import { ref } from 'vue';

const isDashboardVisible = ref(false);
const inputText = ref('');
const currentAnalysisId = ref(null);

const handleAnalyze = (id = null) => {
  if (!id && !inputText.value.trim()) return;
  currentAnalysisId.value = id;
  isDashboardVisible.value = true;
};

const handleClose = () => {
  isDashboardVisible.value = false;
  currentAnalysisId.value = null;
};
</script>

<template>
  <div class="app-container">
    <!-- 输入视图 -->
    <div v-if="!isDashboardVisible" class="input-view">
      <div class="input-card">
        <h1 class="title">案件归因深度分析系统</h1>
        <p class="subtitle">输入案件详情，利用大模型技术进行多维度归因分析</p>
        
        <div class="input-group">
          <input type="text" v-model="currentAnalysisId" placeholder="请输入案件ID（可选）" class="id-input" />
        </div>
        
        <textarea 
          v-model="inputText" 
          placeholder="请在此输入或粘贴案件详情（如调解记录、案情描述等）..."
          class="case-textarea"
        ></textarea>
        
        <button 
          @click="handleAnalyze(currentAnalysisId)" 
          class="analyze-btn"
          :disabled="!inputText.trim() && !currentAnalysisId"
        >
          <span>开始智能分析</span>
          <span class="btn-sub">AI Powered Analysis</span>
        </button>
      </div>
    </div>

    <!-- 结果展示面板 -->
    <DashboardMain 
      v-if="isDashboardVisible"
      :visible="isDashboardVisible" 
      :id="currentAnalysisId"
      :content="inputText"
      @close="handleClose"
    />
  </div>
</template>

<style>
/* 全局样式重置 */
body {
  margin: 0;
  padding: 0;
  background: #050a19;
  color: #fff;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
</style>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  background: radial-gradient(circle at center, #0a1b3e 0%, #050a19 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-view {
  width: 100%;
  max-width: 800px;
  padding: 20px;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.input-card {
  background: rgba(16, 32, 64, 0.8);
  border: 1px solid rgba(0, 242, 255, 0.2);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 242, 255, 0.05);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 32px;
  color: #00f2ff;
  margin: 0 0 10px 0;
  letter-spacing: 2px;
  text-shadow: 0 0 15px rgba(0, 242, 255, 0.4);
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 30px;
}

.input-group {
  width: 100%;
  margin-bottom: 20px;
}

.id-input {
  width: 100%;
  background: rgba(5, 10, 25, 0.6);
  border: 1px solid rgba(0, 242, 255, 0.3);
  border-radius: 8px;
  padding: 12px 20px;
  color: #fff;
  font-size: 16px;
  outline: none;
  transition: all 0.3s;
}

.id-input:focus {
  border-color: #00f2ff;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.2);
}

.case-textarea {
  width: 100%;
  height: 300px;
  background: rgba(5, 10, 25, 0.6);
  border: 1px solid rgba(0, 242, 255, 0.3);
  border-radius: 8px;
  padding: 20px;
  color: #fff;
  font-size: 16px;
  line-height: 1.6;
  resize: none;
  outline: none;
  transition: all 0.3s;
  margin-bottom: 30px;
}

.case-textarea:focus {
  border-color: #00f2ff;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.2);
}

.analyze-btn {
  background: linear-gradient(135deg, #00f2ff 0%, #0072ff 100%);
  border: none;
  border-radius: 30px;
  padding: 15px 60px;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 20px rgba(0, 114, 255, 0.3);
}

.analyze-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(0, 114, 255, 0.5);
  filter: brightness(1.1);
}

.analyze-btn:active:not(:disabled) {
  transform: translateY(0);
}

.analyze-btn:disabled {
  background: #333;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.5;
}

.btn-sub {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.7;
  margin-top: 4px;
}
</style>
