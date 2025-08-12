<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title class="text-center">Quizz</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <transition name="fade">
        <div
          v-if="showSuccessAnimation"
          class="fixed inset-0 z-50 bg-green-200 bg-opacity-90 flex items-center justify-center"
        >
          <div class="text-center">
            <h1 class="text-5xl font-bold text-green-800 mb-4">
              🎉 مبروك! راك جبتها 20/20 🎉
            </h1>
            <h1 class="text-5xl font-bold text-green-800 mb-4">
              🎉 راك تعلمت 20 كلمة قبيلية  🎉
            </h1>
            <ion-button expand="block" @click="goOn"
              >كمل</ion-button
            >
          </div>
        </div>
      </transition>
      <ion-title class="text-center">{{ score }}/20</ion-title>
      <ion-progress-bar :value="progress" slot="fixed"></ion-progress-bar>
      <div v-if="!isOnline" class="bg-red-100 text-red-600 text-center p-2">
        ⚠️ ماركش مكونكتي لنترنات
      </div>
      <div class="text-center text-gray-700">
        <h1>خير الكلمة الي توالم التصويرة</h1>
      </div>
      <div class="flex justify-center mt-10">
        <ion-img
          :src="`${apiBase}/public/1/1.1/images/${exercise[currentExercise]?.image}`"
        ></ion-img>
      </div>
      <div class="text-center m-5 text-3xl">
        <span>______&nbsp &nbsp </span
        ><span class="mb-5">{{ exercise[currentExercise]?.startWord }} </span>
      </div>

      <div class="m-10">
        <ion-radio-group @ion-change="handleChange($event)">
          <div class="flex flex-row justify-between mt-5">
            <div v-for="item in exercise[currentExercise]?.choice">
              <ion-radio
                :value="item"
                label-placement="stacked"
                alignment="center"
                class="text-3xl"
                :disabled="!isOnline"
                >{{ item }}
              </ion-radio>
            </div>
          </div>
        </ion-radio-group>
      </div>
      <div class="m-5">
        <ion-button
          expand="block"
          :disabled="buttonDisabled || !isOnline"
          @click="checkResponse"
          >ابعت</ion-button
        >
      </div>
      <ion-modal
        :initial-breakpoint="1"
        :breakpoints="[0, 1]"
        :can-dismiss="falseModalCanDissmiss"
        :isOpen="falseModalIsOpen"
        @didDismiss="
          falseModalIsOpen = false;
          falseModalCanDissmiss = false;
        "
      >
        <div class="bg-yellow-500">
          <div class="flex flex-col justify-end mx-4 my-10 text-red-600">
            <h1 class="text-right">ما جبتهاش. ماعليش</h1>
            <h1 class="text-right">لازم تعاود مالول</h1>
          </div>
          <div class="my-8 mx-5" id="failButton">
            <ion-button expand="block" @click="falseGoOn">كمل</ion-button>
          </div>
        </div>
      </ion-modal>
      <ion-modal
        :initial-breakpoint="1"
        :breakpoints="[0, 1]"
        :can-dismiss="trueModalCanDissmiss"
        :isOpen="trueModalIsOpen"
        @didDismiss="
          trueModalIsOpen = false;
          trueModalCanDissmiss = false;
        "
      >
        <div class="bg-lime-300">
          <div class="flex flex-col mx-4 my-10 text-green-600">
            <h1 class="text-center">مليحا كمل هاڨدا</h1>
            <h1 class="text-right text-red-400">
              {{ exercise[currentExercise]?.meaning }}
            </h1>
          </div>
          <div class="my-8 mx-5" id="failButton">
            <ion-button
              :disabled="isPlaying || !isOnline"
              expand="block"
              @click="trueGoOn"
              >كمل</ion-button
            >
          </div>
        </div>
      </ion-modal>
    </ion-content>
    <audio
      ref="audioRef"
      :src="audioUrl"
      preload="auto"
      @canplaythrough="onCanPlayThrough"
      @ended="onEnded"
      @loadstart="onLoadStart"
    >
      Your browser does not support the audio element.
    </audio>
  </ion-page>
</template>
<script setup lang="ts">
import { Network } from "@capacitor/network";

const apiBase = useRuntimeConfig().public.apiBase;

const audioUrl: Ref<string> = ref(""); // Placeholder, will be set later
const audioRef = ref<HTMLAudioElement | null>(null);

let isPlaying = ref(false);

const isOnline = ref(true);

const showSuccessAnimation = ref(false);
const score = ref(0);

watch(score, (newScore) => {
  if (newScore === 20) {
    showSuccessAnimation.value = true;
   
    playVictory()
  }
});

const exercise = [
  {
    image: "table.png",
    choice: ["اَمْشِشْ", "أَطَّجْرَ", "أَطَّبْلَ"],
    trueResponse: 2,
    startWord: "ثَڨِ ذْ",
    meaning: "هادي طابلا",
  },
  {
    image: "verre.png",
    choice: ["أَلْكَسْ", "أَخَمْ", "أَعُذِوْ"],
    trueResponse: 0,
    startWord: "وَڨِ ذْ",
    meaning: "هادا كاس",
  },

  {
    image: "chair.png",
    choice: ["أَذْرَرْ", "أَكُرْسِ", "أَمَنْ"],
    trueResponse: 1,
    startWord: "وَڨِ ذْ",
    meaning: "هادا كرسي",
  },
  {
    image: "cup.png",
    choice: ["إِڨَّنِ", "لَبْحَرْ", "أَفَنْجَلْ"],
    trueResponse: 2,
    startWord: "وَڨِ ذْ",
    meaning: "هادا فنجال",
  },
  {
    image: "fork.png",
    choice: ["ثَفَرْشِطْ", "أَبَحْرِ", "أَبْرِذْ"],
    trueResponse: 0,
    startWord: "ثَڨِ تْ",
    meaning: "هادي فرشيطا",
  },
  {
    image: "spoon.png",
    choice: ["ثَعَّبُطْ", "ثَغَنْجَوْثْ", "أَطْرُطْوَرْ"],
    trueResponse: 1,
    startWord: "ثَڨِ تْ",
    meaning: "هادي مغرفا",
  },
  {
    image: "knife.png",
    choice: ["أَلْمُسْ", "لَحْشِشْ", "ثَيَزِطْ"],
    trueResponse: 0,
    startWord: "وَڨِ ذْ",
    meaning: "هادا موس",
  },
  {
    image: "plate.png",
    choice: ["أَلْغَبَ", "أَقْجُنْ", "ثَضَّبْسِتّْ"],
    trueResponse: 2,
    startWord: "ثَڨِ تْ",
    meaning: "هادا طبسي",
  },
  {
    image: "bottle.png",
    choice: ["ثَقَرْعَتّْ", "إِكَّرِ", "ثَكَّرُسْثْ"],
    trueResponse: 0,
    startWord: "ثَڨِ تْ",
    meaning: "هادي قرعا",
  },
  {
    image: "bed.png",
    choice: ["إِثْرِ", "أُسُ", "أَسَّبَضْ"],
    trueResponse: 1,
    startWord: "وَڨِ ذْ",
    meaning: "هادا فراش",
  },
  {
    image: "door.png",
    choice: ["ثَبُرْثْ", "أَزْنِقْ", "أَدْرُجْ"],
    trueResponse: 0,
    startWord: "ثَڨِ تْ",
    meaning: "هادي باب",
  },
  {
    image: "window.png",
    choice: ["أَذْفَلْ", "أَڨُرْ", "أَطَّقْ"],
    trueResponse: 2,
    startWord: "وَڨِ ذْ",
    meaning: " هادي تاقا",
  },
  {
    image: "phone.png",
    choice: ["أَزِّثْ", "أَغْرُمْ", "أَتِّلِفُنْ"],
    trueResponse: 2,
    startWord: "وَڨِ ذْ",
    meaning: "هادا تيليفون",
  },

  {
    image: "mountain.png",
    choice: ["أَلْحِضْ", "أَذْرَرْ", "أَمَرْشِ"],
    trueResponse: 1,
    startWord: "وَڨِ ذْ",
    meaning: "هادا جبل",
  },

  {
    image: "pen.png",
    choice: ["أَسْتِلُ", "ثَدَّرْثْ", "أَتْرِسِتِ"],
    trueResponse: 0,
    startWord: "وَڨِ ذْ",
    meaning: "هادا ستيلو",
  },

  {
    image: "olive.png",
    choice: ["أَلْڨَزْ", "أَزُمُرْ", "ثَوَرْقَتّْ"],
    trueResponse: 1,
    startWord: "وَڨِ ذْ",
    meaning: "هادا زيتون",
  },

  {
    image: "hospital.png",
    choice: ["أَسْبِتَرْ", "أَسْقِفْ", "أَلْقَهْوَ"],
    trueResponse: 0,
    startWord: "وَڨِ ذْ",
    meaning: "هادا سبيطار",
  },

  {
    image: "school.png",
    choice: ["كَسْكْرُطْ", "ثَمُرْثْ", "أَلَّكُلْ"],
    trueResponse: 2,
    startWord: "وَڨِ ذْ",
    meaning: "هادا ليكول",
  },
  {
    image: "stadium.png",
    choice: ["لِفْرِتْ", "أَنَّرْ", "أَلْمِزَنْ"],
    trueResponse: 1,
    startWord: "وَڨِ ذْ",
    meaning: "هادا سطاد",
  },
  {
    image: "train.png",
    choice: ["ثَمَشِنْتْ", "أَرْڨَزْ", "أَلْعِذْ"],
    trueResponse: 0,
    startWord: "ثَڨِ تْ",
    meaning: "هادي مشينا",
  },
];

let response = "";
const trueModalCanDissmiss = ref(false);
const falseModalCanDissmiss = ref(false);
const currentExercise = ref(0);
const progress = ref(0);

const buttonDisabled = ref(true);
const falseModalIsOpen = ref(false);
const trueModalIsOpen = ref(false);

const sounds = [
  ["tabla", "tejra", "amcic", "tabla_long"],
  ["axam", "audiw", "elkass", "elkass_long"],
  ["akersi", "aman", "adrar", "akersi_long"],
  ["afenjal", "lebhar", "igeni", "afenjal_long"],
  ["abrid", "abehri", "tafercit", "tafercit_long"],
  ["atrutuar", "tagenjaut", "tagenjaut_long", "taabut"],
  ["elmus", "lahcic", "tayazit", "elmus_long"],
];

const assetPathAudio = `https://www.barakaelectronics.com/public/1/1.1/audio`;

const playSuccess = () => {
  return new Promise<void>((resolve) => {
    audioUrl.value = `${assetPathAudio}/success.mp3`;
    nextTick(() => {
      const audio = audioRef.value;
      if (audio) {
        audio.onended = () => resolve();
        audio.play();
      } else {
        resolve(); // fallback
      }
    });
  });
};

const playVictory = () => {
  return new Promise<void>((resolve) => {
    audioUrl.value = `${assetPathAudio}/victory.mp3`;
    nextTick(() => {
      const audio = audioRef.value;
      if (audio) {
        audio.onended = () => resolve();
        audio.play();
      } else {
        resolve(); // fallback
      }
    });
  });
};

const playFail = () => {
  return new Promise<void>((resolve) => {
    audioUrl.value = `${assetPathAudio}/fail.mp3`;
    nextTick(() => {
      const audio = audioRef.value;
      if (audio) {
        audio.onended = () => resolve();
        audio.play();
      } else {
        resolve(); // fallback
      }
    });
  });
};

const playSound = async (soundName: string): Promise<void> => {
  return new Promise((resolve) => {
    audioUrl.value = `${assetPathAudio}/${soundName}.wav`;
    nextTick(() => {
      const audio = audioRef.value;
      if (audio) {
        audio.onended = () => resolve();
        audio.play();
      } else {
        resolve(); // fallback
      }
    });
  });
};

const handleChange = (event: any) => {
  buttonDisabled.value = false;
  response = event.detail.value;
  if (response == "اَمْشِشْ") playSound("amcic");
  if (response == "أَطَّجْرَ") playSound("tejra");
  if (response == "أَطَّبْلَ") playSound("tabla");

  if (response == "أَخَمْ") playSound("axam");
  if (response == "أَلْكَسْ") playSound("elkass");
  if (response == "أَعُذِوْ") playSound("audiw");

  if (response == "أَمَنْ") playSound("aman");
  if (response == "أَذْرَرْ") playSound("adrar");
  if (response == "أَكُرْسِ") playSound("akersi");

  if (response == "أَفَنْجَلْ") playSound("afenjal");
  if (response == "لَبْحَرْ") playSound("lebhar");
  if (response == "إِڨَّنِ") playSound("igeni");

  if (response == "أَبْرِذْ") playSound("abrid");
  if (response == "أَبَحْرِ") playSound("abehri");
  if (response == "ثَفَرْشِطْ") playSound("tafercit");

  if (response == "ثَعَّبُطْ") playSound("taabut");
  if (response == "أَطْرُطْوَرْ") playSound("atrutuar");
  if (response == "ثَغَنْجَوْثْ") playSound("tagenjaut");

  if (response == "أَلْمُسْ") playSound("elmus");
  if (response == "ثَيَزِطْ") playSound("tayazit");
  if (response == "لَحْشِشْ") playSound("lahcic");

  if (response == "ثَضَّبْسِتّْ") playSound("tadhebsit");
  if (response == "أَقْجُنْ") playSound("aqjun");
  if (response == "أَلْغَبَ") playSound("elghaba");

  if (response == "ثَقَرْعَتّْ") playSound("taqeraat");
  if (response == "إِكَّرِ") playSound("ikeri");
  if (response == "ثَكَّرُسْثْ") playSound("takarust");

  if (response == "أُسُ") playSound("usu");
  if (response == "إِثْرِ") playSound("itri");
  if (response == "أَسَّبَضْ") playSound("asebadh");

  if (response == "ثَبُرْثْ") playSound("taburt");
  if (response == "أَزْنِقْ") playSound("azniq");
  if (response == "أَدْرُجْ") playSound("edruj");

  if (response == "أَذْفَلْ") playSound("adfel");
  if (response == "أَڨُرْ") playSound("agur");
  if (response == "أَطَّقْ") playSound("etaq");
};

const checkResponse = async () => {
  if (
    response ===
    exercise[currentExercise.value]?.choice[
      exercise[currentExercise.value]?.trueResponse || 0
    ]
  ) {
    trueModalIsOpen.value = true;
    await playSuccess();

    if (currentExercise.value == 0) playSound("tabla_long");
    if (currentExercise.value == 1) playSound("elkass_long");
    if (currentExercise.value == 2) playSound("akersi_long");
    if (currentExercise.value == 3) playSound("afenjal_long");
    if (currentExercise.value == 4) playSound("tafercit_long");
    if (currentExercise.value == 5) playSound("tagenjaut_long");
    if (currentExercise.value == 6) playSound("elmus_long");
    if (currentExercise.value == 7) playSound("tadhebsit_long");
    if (currentExercise.value == 8) playSound("taqeraat_long");
    if (currentExercise.value == 9) playSound("usu_long");
    if (currentExercise.value == 10) playSound("taburt_long");
    if (currentExercise.value == 11) playSound("etaq_long");
  } else {
    falseModalIsOpen.value = true;
    playFail();
  }
};

const trueGoOn = () => {
  score.value++;
  progress.value = progress.value + 0.05;

  trueModalCanDissmiss.value = true;
  trueModalIsOpen.value = false;
  currentExercise.value++;
  buttonDisabled.value = true;
};

const falseGoOn = () => {
  falseModalCanDissmiss.value = true;
  falseModalIsOpen.value = false;
  currentExercise.value = 0;
  progress.value = 0;
  score.value = 0;
  buttonDisabled.value = true;
};

const onCanPlayThrough = () => {
  console.log("Audio can play through");
  if (audioRef.value) {
    try {
      audioRef.value.play();
    } catch (err) {
      console.error("Failed to play audio:", err);
      isPlaying.value = false;
    }
  } else {
    console.warn("audioRef is null");
    isPlaying.value = false;
  }
};

const onLoadStart = () => {
  console.log("Audio load started");
  isPlaying.value = true;
};

const onEnded = () => {
  console.log("Audio ended");
  isPlaying.value = false;
};

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
<style>
.block {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

ion-modal {
  --height: auto;
}

/*ion-radio {
  --border-radius: 4px;
  --inner-border-radius: 4px;

  --color: #ddd;
  --color-checked: #6815ec;

}*/

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.8s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

</style>
