<template>
  <div class="node-wrapper" :class="{ 'is-root': isRoot }">
    <div class="node-main">
      <div 
        class="node-box" 
        :class="{ 'has-children': node.children && node.children.length > 0, 'expanded': node.expanded, 'is-root-node': isRoot }"
        @click="toggleExpand"
        @mousedown.stop
      >
        <span class="node-text">{{ node.name }}</span>
        <span v-if="node.children && node.children.length > 0" class="toggle-icon">
          {{ node.expanded ? '−' : '+' }}
        </span>
      </div>
      
      <div v-if="node.children && node.children.length > 0 && node.expanded" class="connect-line"></div>
    </div>

    <div v-if="node.children && node.children.length > 0 && node.expanded" class="children-container">
      <div v-for="(child, index) in node.children" :key="index" class="child-item">
        <div class="h-line"></div>
        <AttributionNode :node="child" :is-root="false" />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  isRoot: {
    type: Boolean,
    default: false
  }
});

const toggleExpand = () => {
  if (props.node.children && props.node.children.length > 0) {
    props.node.expanded = !props.node.expanded;
  }
};
</script>

<style scoped>
.node-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.node-main {
  display: flex;
  align-items: center;
  position: relative;
}

.node-box {
  padding: 10px 20px;
  background: rgba(26, 58, 122, 0.8);
  border: 1px solid rgba(0, 242, 255, 0.3);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  cursor: default;
  white-space: nowrap;
  position: relative;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 120px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.node-box.has-children {
  cursor: pointer;
}

.node-box.has-children:hover {
  border-color: #00f2ff;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.4);
  transform: translateY(-2px);
}

.is-root-node {
  background: linear-gradient(135deg, rgba(0, 242, 255, 0.2) 0%, rgba(0, 242, 255, 0.05) 100%);
  border: 2px solid #00f2ff;
  font-weight: bold;
  font-size: 16px;
  padding: 15px 30px;
}

.toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: rgba(0, 242, 255, 0.2);
  border-radius: 4px;
  font-size: 16px;
  color: #00f2ff;
  font-family: monospace;
}

.connect-line {
  width: 40px;
  height: 2px;
  background: rgba(0, 242, 255, 0.3);
}

.children-container {
  display: flex;
  flex-direction: column;
  position: relative;
  padding-left: 0;
  border-left: 2px solid rgba(0, 242, 255, 0.2);
}

.child-item {
  display: flex;
  align-items: center;
  position: relative;
  padding: 10px 0;
}

.h-line {
  width: 30px;
  height: 2px;
  background: rgba(0, 242, 255, 0.2);
  flex-shrink: 0;
}

/* 装饰性连接线优化 */
.child-item::before {
  content: "";
  position: absolute;
  left: -2px;
  top: 0;
  width: 2px;
  height: 100%;
  background: rgba(0, 242, 255, 0.2);
}

.child-item:first-child::before {
  height: 50%;
  top: 50%;
}

.child-item:last-child::before {
  height: 50%;
  bottom: 50%;
  top: 0;
}

.child-item:only-child::before {
  display: none;
}
</style>

