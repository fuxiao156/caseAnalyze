<template>
  <div v-if="visible" class="accuracy-modal-mask" @click.self="$emit('close')">
    <div class="accuracy-modal-container slide-in">
      <div class="modal-header">
        <div class="header-title">
          <span class="icon-pulse"></span>
          <span class="title-text">归因分析数据概览</span>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body scrollbar-tech">
        <!-- 顶部核心数值 -->
        <div class="metrics-grid">
          <div class="metric-card highlight">
            <div class="metric-label">总案件数</div>
            <div class="metric-value">12,480</div>
          </div>
          <div class="metric-card highlight">
            <div class="metric-label">综合介入率</div>
            <div class="metric-value">8.2%</div>
          </div>
          <div class="metric-card highlight">
            <div class="metric-label">分析覆盖率</div>
            <div class="metric-value">99.4%</div>
          </div>
        </div>

        <!-- 人工介入率统计表 -->
        <div class="table-section">
          <div class="section-label">各类案件人工介入率统计</div>
          <div class="tech-table-wrapper">
            <table class="tech-table">
              <thead>
                <tr>
                  <th>事件画像</th>
                  <th>案件数</th>
                  <th>介入率</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in tableData" :key="item.type">
                  <td>{{ item.type }}</td>
                  <td>{{ item.count }}</td>
                  <td class="rate-cell">
                    <span class="rate-text">{{ item.rate }}%</span>
                    <div class="rate-bar-bg">
                      <div class="rate-bar-fill" :style="{ width: item.rate + '%' }"></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 准确率计算方式描述 -->
        <div class="info-section">
          <div class="section-label">计算方式说明</div>
          <p class="description-text">
            系统的<span class="highlight">综合介入率</span>是通过对各类案件中人工参与处理的案件数量与总案件量的比值进行加权统计而得。该指标反映了平台在不同领域的自动化处理效能与人工干预强度。介入率越低，代表系统的自动化归因与处理能力越强。
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="confirm-btn" @click="$emit('close')">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  visible: Boolean
});

defineEmits(['close']);

const tableData = ref([
  { type: '矛盾纠纷', count: 3240, rate: 12.5 },
  { type: '劳动纠纷', count: 2150, rate: 8.2 },
  { type: '家庭纠纷', count: 1860, rate: 5.4 },
  { type: '医疗纠纷', count: 420, rate: 25.8 },
  { type: '合同纠纷', count: 1580, rate: 6.1 },
  { type: '物业纠纷', count: 920, rate: 10.3 },
  { type: '赔偿纠纷', count: 1100, rate: 14.2 },
  { type: '损害公共安全', count: 210, rate: 38.5 }
]);
</script>

<style scoped>
.accuracy-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(4, 10, 25, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.accuracy-modal-container {
  width: 700px;
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
  max-height: 75vh;
  overflow-y: auto;
}

/* 顶部数值卡片 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.metric-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 242, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
}

.metric-card:hover {
  background: rgba(0, 242, 255, 0.08);
  border-color: rgba(0, 242, 255, 0.5);
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(0, 242, 255, 0.2);
}

.metric-card.highlight {
  border-color: rgba(0, 242, 255, 0.4);
  background: rgba(0, 242, 255, 0.05);
}

.metric-card.highlight:hover {
  background: rgba(0, 242, 255, 0.12);
  border-color: #00f2ff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 242, 255, 0.4);
}

.metric-label {
  color: #88b0ea;
  font-size: 13px;
  margin-bottom: 8px;
}

.metric-value {
  color: #00f2ff;
  font-size: 24px;
  font-weight: bold;
  font-family: 'D-DIN', monospace;
}

.section-label {
  color: #00f2ff;
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 15px;
  border-left: 3px solid #00f2ff;
  padding-left: 12px;
}

/* 表格样式 */
.tech-table-wrapper {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 242, 255, 0.1);
}

.tech-table {
  width: 100%;
  border-collapse: collapse;
  color: #c8ddfb;
  font-size: 14px;
}

.tech-table th {
  background: rgba(0, 242, 255, 0.1);
  text-align: left;
  padding: 12px 15px;
  color: #00f2ff;
  font-weight: bold;
}

.tech-table td {
  padding: 10px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.tech-table tr:last-child td {
  border-bottom: none;
}

.tech-table tr:hover td {
  background: rgba(0, 242, 255, 0.05);
}

.rate-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 150px;
}

.rate-text {
  width: 45px;
  flex-shrink: 0;
}

.rate-bar-bg {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.rate-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #0066ff, #00f2ff);
  border-radius: 3px;
}

.info-section {
  margin: 30px 0 10px 0;
}

.description-text {
  color: #c8ddfb;
  font-size: 14px;
  line-height: 1.8;
  background: rgba(0, 242, 255, 0.05);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(0, 242, 255, 0.1);
}

.highlight {
  color: #00f2ff;
  font-weight: bold;
}

.modal-footer {
  padding: 20px 25px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid rgba(0, 242, 255, 0.1);
}

.confirm-btn {
  padding: 10px 30px;
  border-radius: 6px;
  border: none;
  background: linear-gradient(135deg, #0066ff, #00f2ff);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.confirm-btn:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.4);
}

.close-btn { background: none; border: none; color: #88b0ea; font-size: 20px; cursor: pointer; }
.close-btn:hover { color: #fff; }

.scrollbar-tech::-webkit-scrollbar { width: 4px; }
.scrollbar-tech::-webkit-scrollbar-thumb { background: rgba(0, 242, 255, 0.2); border-radius: 2px; }
.scrollbar-tech::-webkit-scrollbar-track { background: transparent; }

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.slide-in { animation: slideIn 0.3s ease-out; }
</style>
