<template>
  <div class="factor-carousel dashboard-card">
    <div class="card-title-row">
      <div class="card-title">要素详细拆解 (Factor Details)</div>
      <button class="eval-trigger-btn" @click="$emit('open-eval', '要素详细拆解', 'factor-details')">
        <span class="eval-icon">📊</span> 评测
      </button>
    </div>
    
    <div class="accordion-container">
      <div class="accordion-wrapper">
        <div 
          v-for="factor in factors" 
          :key="factor.id"
          :class="['accordion-item', openIds.includes(factor.id) ? 'open' : '', activeFactorName === factor.name ? 'active-highlight' : '']"
          @click="toggleId(factor.id)"
        >
          <!-- 侧边/头部标签（折叠时可见） -->
          <div class="item-tab">
            <span class="tab-icon">📋</span>
            <span class="tab-title">{{ factor.name }}</span>
          </div>

          <!-- 内容区域（展开时可见） -->
          <div class="item-content-wrapper scrollbar-tech" v-show="openIds.includes(factor.id)">
            <div class="block-header">
              <span class="block-title">{{ factor.name }} 详细分析</span>
            </div>
            
            <div class="block-content">
              <!-- 通用要素展示 -->
              <p class="generic-content">{{ factor.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  factors: {
    type: Array,
    default: () => []
  },
  activeFactorName: String
});

const emit = defineEmits(['open-eval']);

const openIds = ref([]);

// 初始化时默认展开第一个
onMounted(() => {
  if (props.factors && props.factors.length > 0) {
    openIds.value = [props.factors[0].id];
  }
});

// 当外部选中要素时，自动展开对应模块
watch(() => props.activeFactorName, (newName) => {
  if (newName) {
    const factor = props.factors.find(f => f.name === newName);
    if (factor && !openIds.value.includes(factor.id)) {
      toggleId(factor.id, true); // 强制打开
    }
  }
});

const toggleId = (id, forceOpen = false) => {
  const index = openIds.value.indexOf(id);
  if (index > -1 && !forceOpen) {
    // 如果已经打开且不是强制打开，则关闭
    openIds.value.splice(index, 1);
  } else if (index === -1) {
    // 如果未打开，则添加
    openIds.value.push(id);
    // 最多允许同时张开三个模块，打开第四个时，关闭最早打开的模块
    if (openIds.value.length > 3) {
      openIds.value.shift();
    }
  }
};
</script>

<style scoped>
.dashboard-card {
  background: rgba(26, 58, 122, 0.6);
  border: 1px solid rgba(0, 242, 255, 0.2);
  border-radius: 8px;
  padding: 15px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止内容溢出导致高度跳变 */
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex: 0 0 auto;
}

.card-title {
  color: #00f2ff;
  font-size: 16px;
  font-weight: bold;
  border-left: 4px solid #00f2ff;
  padding-left: 12px;
  margin-bottom: 0;
}

.eval-trigger-btn {
  background: rgba(0, 242, 255, 0.1);
  border: 1px solid rgba(0, 242, 255, 0.3);
  color: #00f2ff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.eval-trigger-btn:hover {
  background: rgba(0, 242, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.2);
}

.eval-icon {
  font-size: 14px;
}

.accordion-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
}

.accordion-wrapper {
  display: flex;
  height: 100%;
  gap: 10px;
}

.accordion-item {
  flex: 0 0 50px;
  height: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  position: relative;
}

.accordion-item.open {
  flex: 1;
  min-width: 260px;
  background: rgba(255, 255, 255, 0.05);
  cursor: default;
}

.accordion-item.active-highlight {
  border-color: #00f2ff;
  background: rgba(0, 242, 255, 0.08);
  box-shadow: inset 0 0 15px rgba(0, 242, 255, 0.1);
}

/* 侧边标签/折叠状态 */
.item-tab {
  width: 50px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 20px;
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.tab-icon {
  font-size: 20px;
  margin-bottom: 15px;
}

.tab-title {
  writing-mode: vertical-lr;
  color: #88b0ea;
  font-size: 13px;
  letter-spacing: 4px;
  text-transform: uppercase;
  opacity: 0.7;
}

.open .tab-title {
  color: #00f2ff;
  opacity: 1;
}

/* 内容区域 */
.item-content-wrapper {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  opacity: 0;
  animation: fadeIn 0.3s forwards 0.3s;
}

.scrollbar-tech::-webkit-scrollbar { width: 4px; }
.scrollbar-tech::-webkit-scrollbar-thumb { background: rgba(0, 242, 255, 0.2); border-radius: 10px; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}

.block-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 242, 255, 0.1);
}

.block-title {
  font-size: 14px;
  font-weight: bold;
  color: #00f2ff;
}

.generic-content {
  font-size: 13px;
  color: #cfd9e5;
  line-height: 1.6;
  margin: 0;
}
</style>
