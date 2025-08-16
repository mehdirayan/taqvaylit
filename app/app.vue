<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>
<script lang="ts" setup>
import { App } from '@capacitor/app';

App.addListener('backButton', ({ canGoBack }) => {
  if (!canGoBack) {
    App.minimizeApp(); // or App.exitApp()
  }
});
</script>
