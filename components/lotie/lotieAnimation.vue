<template>
  <div ref="lottieContainer" class="lottie-animation"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import lottie from "lottie-web";

const props = defineProps({
  animationData: {
    type: Object,
    required: true,
  },
  loop: {
    type: Boolean,
    default: true,
  },
  autoplay: {
    type: Boolean,
    default: true,
  },
});

const lottieContainer = ref(null);
let lottieInstance = null;

onMounted(() => {
  if (lottieContainer.value) {
    lottieInstance = lottie.loadAnimation({
      container: lottieContainer.value,
      renderer: "svg",
      loop: props.loop,
      autoplay: props.autoplay,
      animationData: props.animationData,
    });
  }
});

onBeforeUnmount(() => {
  if (lottieInstance) {
    lottieInstance.destroy(); // Clean up Lottie instance when the component is unmounted
  }
});
</script>

<style scoped>
.lottie-animation {
  width: 20%;
  height: 20%;
}
</style>
