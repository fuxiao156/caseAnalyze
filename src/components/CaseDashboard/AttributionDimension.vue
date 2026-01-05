<template>
  <div class="attribution-dimension dashboard-card">
    <div class="card-title-row">
      <div class="card-title">全局归因图谱 (Global Attribution Map)</div>
      <button class="eval-trigger-btn" @click="$emit('open-eval', '归因图谱', 'attribution-map')">
        <span class="eval-icon">📊</span> 评测
      </button>
    </div>

    <div 
      class="mindmap-container scrollbar-tech" 
      ref="containerRef"
      @mousedown="startDragging"
      @mousemove="moveDragging"
      @mouseup="stopDragging"
      @mouseleave="stopDragging"
      :class="{ 'is-dragging': isDragging }"
    >
      <div class="mindmap-content">
        <AttributionNode :node="mindMapData" :is-root="true" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AttributionNode from './AttributionNode.vue';

const props = defineProps({
  caseTitle: {
    type: String,
    default: '案件归因分析'
  }
});

defineEmits(['open-eval']);

// --- 拖拽逻辑 ---
const containerRef = ref(null);
const isDragging = ref(false);
let startX, startY, scrollLeft, scrollTop;

const startDragging = (e) => {
  // 只有左键点击才触发拖拽
  if (e.button !== 0) return;
  isDragging.value = true;
  startX = e.pageX - containerRef.value.offsetLeft;
  startY = e.pageY - containerRef.value.offsetTop;
  scrollLeft = containerRef.value.scrollLeft;
  scrollTop = containerRef.value.scrollTop;
};

const stopDragging = () => {
  isDragging.value = false;
};

const moveDragging = (e) => {
  if (!isDragging.value) return;
  e.preventDefault();
  const x = e.pageX - containerRef.value.offsetLeft;
  const y = e.pageY - containerRef.value.offsetTop;
  const walkX = (x - startX) * 1.5; // 滚动倍速
  const walkY = (y - startY) * 1.5;
  containerRef.value.scrollLeft = scrollLeft - walkX;
  containerRef.value.scrollTop = scrollTop - walkY;
};

// 定义新的变量存储归因数据
const mindMapData = ref({
  name: props.caseTitle,
  expanded: true,
  children: [
    {
      name: "时间维度 (Time)",
      expanded: true,
      children: [
        { name: "2014-06: 肺结核诊断 (致因起点)" },
        { name: "2015-12: 肆级伤残鉴定 (诉求成型)" },
        { name: "2016-02: 协议未兑现 (矛盾激化点)" },
        { name: "2018-12: 调解介入 (转折契机)" }
      ]
    },
    {
      name: "人物维度 (Person)",
      expanded: true,
      children: [
        { 
          name: "刘某 (生存焦虑型)", 
          expanded: false,
          children: [
            { name: "高度生存恐惧" },
            { name: "社保依赖心理" },
            { name: "对既往协议的不信任" }
          ]
        },
        { 
          name: "选厂方 (合规防御型)", 
          expanded: false,
          children: [
            { name: "法务逻辑优先" },
            { name: "同理心缺失" },
            { name: "行政障碍预设" }
          ]
        }
      ]
    },
    {
      name: "信息维度 (Information)",
      expanded: true,
      children: [
        { name: "认知偏差: 故意推诿 vs 政策限制" },
        { name: "权益认知: 剥削行为 vs 法律空白" },
        { name: "路径偏差: 上访迷思 vs 变通收益" }
      ]
    },
    {
      name: "权责维度 (Duty)",
      expanded: true,
      children: [
        { name: "博弈死结: 诉求过重与执行受阻" },
        { name: "平衡变量: 引入失地养老保险政策" },
        { name: "最终均衡: 补偿金+变通投保实现和解" }
      ]
    }
  ]
});
</script>

<style scoped>
.attribution-dimension {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dashboard-card {
  background: rgba(26, 58, 122, 0.6);
  border: 1px solid rgba(0, 242, 255, 0.2);
  border-radius: 8px;
  padding: 20px;
  position: relative;
  box-shadow: inset 0 0 20px rgba(0, 242, 255, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
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


.mindmap-container {
  flex: 1;
  overflow: auto;
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 0;
  cursor: grab;
  user-select: none;
  /* 网格背景，增强画布感 */
  background-image: 
    radial-gradient(rgba(0, 242, 255, 0.1) 1px, transparent 1px),
    linear-gradient(rgba(0, 242, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 242, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px, 20px 20px, 20px 20px;
  background-position: center center;
}

.mindmap-container.is-dragging {
  cursor: grabbing;
}

.mindmap-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px; /* 增加四周缓冲空间，让画布更像画布 */
  min-width: max-content;
}

/* 隐藏滚动条，完全依靠拖拽，增强画布感 */
.scrollbar-tech::-webkit-scrollbar {
  display: none;
}
.mindmap-container {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
</style>

