// file: ~/middleware/authentication.global.ts
import { navigateTo } from "#app";

export default defineNuxtRouteMiddleware(async (to) => {
  try {
    // console.log('to.meta', to.meta);
    if (to.meta?.disableAuth) { // If the route is disable for authentication
      return; 
    }
    
    const { status } = useAuth();
    // console.log("status ==== ", status);

    
    if (status.value === 'unauthenticated' && to.path !== '/') {
      return navigateTo('/'); 
    }
  
  } catch (error) {
    console.error(error);
  }
});
