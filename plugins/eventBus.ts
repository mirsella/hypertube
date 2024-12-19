import mitt from 'mitt';

const emitter = mitt();

export default defineNuxtPlugin((nuxtApp) => {
    
  nuxtApp.provide('eventBus', emitter);
});
