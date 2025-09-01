<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{t("title")}}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div v-if="!isOnline" class="bg-red-100 text-red-600 text-center p-2">
        ⚠️ {{ t("connectionError") }}
      </div>
      <div class="w-svw mt-10">
        <ion-card color="secondary" @click="gotoEx('1/1.1')" class="w-1/2 mx-auto">
          <div class="flex justify-center  bg-white ">
            <ion-img :src="imgSrc1"></ion-img>
          </div>
          <ion-card-header>
            <ion-card-title> {{ t("welcome.1.traduction") }}</ion-card-title>
            <ion-card-subtitle>{{ t("welcome.1.title") }}</ion-card-subtitle>
          </ion-card-header>
        </ion-card>
        <ion-card color="secondary" @click="gotoEx('1/1.2')" class="w-1/2 mx-auto">
          <div class="flex justify-center  bg-white ">
            <ion-img :src="imgSrc2"></ion-img>
          </div>
          <ion-card-header>
            <ion-card-title>{{ t("welcome.2.traduction") }}</ion-card-title>
            <ion-card-subtitle>{{ t("welcome.2.title") }}</ion-card-subtitle>
          </ion-card-header>
        </ion-card>
        <ion-card color="secondary" class="w-1/2 mx-auto disabled-card "> 
          <div class="disabled-overlay">
            <div class="disabled-text">{{ t("welcome.soonMessage") }}</div>
          </div>
          <ion-img :src="image0"></ion-img>
          <ion-card-header>
            <ion-card-title>Coming Soon</ion-card-title>
          </ion-card-header>
        </ion-card>

      </div>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
import { Network } from '@capacitor/network';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()


const assetPathImage = `https://www.barakaelectronics.com/public/welcome/`;

const image1 = `${assetPathImage}1.png`;
const image2 = `${assetPathImage}2.png`;
const image0 = `${assetPathImage}0.png`;
const router = useIonRouter();
const gotoEx = (path: string) => {
  router.push(path);
}

const isOnline = ref(true);
const reloadImageFlag = ref(false);
const reloadImage = () => {
  console.log("Reloading image");
  reloadImageFlag.value = !reloadImageFlag.value;
};
watch(isOnline, (newStatus) => {
  if (newStatus) {
    reloadImage();
  }
});



const imgSrc1 = computed(() => {
  
  return `${image1}?v=${reloadImageFlag.value ? Date.now() : ""
    }`;
});
const imgSrc2 = computed(() => {
  
  return `${image2}?v=${reloadImageFlag.value ? Date.now() : ""
    }`;
});
// On mounted, check initial status
onMounted(async () => {


  const status = await Network.getStatus();
  isOnline.value = status.connected;

  // Listen for changes
  Network.addListener("networkStatusChange", (status) => {
    isOnline.value = status.connected;
  });
});

onBeforeUnmount(() => {
  Network.removeAllListeners();
});




</script>

<style scoped>
ion-toolbar {
  --background: #4e73d8;
  --color: white;

  --min-height: 80px;
  --padding-top: 40px;
  --padding-bottom: 20px;
}

ion-title {
  width: 100%;
  text-align: center;
}

ion-card-title {
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
}

ion-card-subtitle {
  text-align: center;
  font-size: 1.2em;
  color: #666;
}


:root {
  --ion-font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.disabled-card {
  opacity: 0.6;
  cursor: not-allowed;
  position: relative;
}

.disabled-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 10;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.disabled-text {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
}

.card-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

ion-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}

ion-card:not(.disabled-card):active {
  transform: scale(0.98);
}
</style>