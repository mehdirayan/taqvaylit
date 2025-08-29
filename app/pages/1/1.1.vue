<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title class="text-center">Quizz</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <transition name="fade">
        <div v-if="showSuccessAnimation"
          class="fixed inset-0 z-50 bg-green-200 bg-opacity-90 flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-5xl font-bold text-green-800 mb-4">
              🎉 مبروك! راك جبتها 20/20 🎉
            </h1>
            <h1 class="text-5xl font-bold text-green-800 mb-4">
              🎉 راك تعلمت 20 كلمة قبيلية 🎉
            </h1>
            <ion-button expand="block" @click="goOn">كمل</ion-button>
          </div>
        </div>
      </transition>
      <ion-title class="text-center">{{ score }}/{{ shuffledExercises.length }}</ion-title>
      <ion-progress-bar :value="progress" slot="fixed" color="success"></ion-progress-bar>
      <div v-if="!isOnline" class="bg-red-100 text-red-600 text-center p-2">
        ⚠️ ماركش مكونكتي لنترنات
      </div>
      <div class="text-center text-gray-700">
        <h1>خير الكلمة الي توالم التصويرة</h1>
      </div>
      <div class="flex justify-center mt-10">
        <ion-img :src="imgSrc"></ion-img>
      </div>
      <div class="text-center m-5 text-3xl">
        <span>{{ shuffledExercises[currentExercise]?.startWord }}
          {{ displayedResponse }}
        </span>
      </div>

      <div class="">
        <ion-radio-group @ion-change="handleChange($event)">
          <div class="flex flex-row flex-wrap justify-center mt-5 gap-4">
            <div v-for="item in shuffledExercises[currentExercise]?.choice" class="">
              <ion-radio :value="item" label-placement="stacked" alignment="center" class="text-5xl"
                :disabled="!isOnline">{{ item }}
              </ion-radio>
            </div>
          </div>
        </ion-radio-group>
      </div>
      <div class="m-5 pb-16">
        <ion-button expand="block" :disabled="buttonDisabled || !isOnline" @click="checkResponse">ابعت</ion-button>
      </div>
      <ion-modal :initial-breakpoint="1" :breakpoints="[0, 1]" :can-dismiss="falseModalCanDissmiss"
        :isOpen="falseModalIsOpen" @didDismiss="
          falseModalIsOpen = false;
        falseModalCanDissmiss = false;
        ">
        <div class="bg-yellow-500">
          <div class="flex flex-col justify-end mx-4 my-10 text-red-600">
            <h1 class="text-right">ما جبتهاش. ماعليش</h1>
            <h1 class="text-right">لازم تعاود مالول</h1>
          </div>
          <div class="my-8 mx-5 pb-16">
            <ion-button expand="block" @click="falseGoOn">كمل</ion-button>
          </div>
        </div>
      </ion-modal>
      <ion-modal :initial-breakpoint="1" :breakpoints="[0, 1]" :can-dismiss="trueModalCanDissmiss"
        :isOpen="trueModalIsOpen" @didDismiss="
          trueModalIsOpen = false;
        trueModalCanDissmiss = false;
        ">
        <div class="bg-lime-300">
          <div class="flex flex-col mx-4 my-10 text-green-600">
            <h1 class="text-center">مليحا كمل هاڨدا</h1>
            <h1 class="text-right text-red-400">
              {{ shuffledExercises[currentExercise]?.meaning }}
            </h1>
          </div>
          <div class="my-8 mx-5 pb-16">
            <ion-button :disabled="isPlaying || !isOnline" expand="block" @click="trueGoOn">كمل</ion-button>
          </div>
        </div>
      </ion-modal>
    </ion-content>
    <audio ref="audioRef" :src="audioUrl" preload="auto" @canplaythrough="onCanPlayThrough" @ended="onEnded"
      @loadstart="onLoadStart">
      Your browser does not support the audio element.
    </audio>
      <canvas id="my-canvas"></canvas>
  </ion-page>
</template>
<script setup lang="ts">
import { Network } from "@capacitor/network";
import ConfettiGenerator from "confetti-js";

const apiBase = useRuntimeConfig().public.apiBase;

const shuffledExercises = ref<any[]>([]);
const currentExercise = ref(0);

const audioUrl: Ref<string> = ref(""); // Placeholder, will be set later
const audioRef = ref<HTMLAudioElement | null>(null);

let isPlaying = ref(false);

const isOnline = ref(true);

const score = ref(0);

let response = "";
const trueModalCanDissmiss = ref(false);
const falseModalCanDissmiss = ref(false);

const progress = ref(0);

const buttonDisabled = ref(true);
const falseModalIsOpen = ref(false);
const trueModalIsOpen = ref(false);

const displayedResponse = ref("______  ");


const showSuccessAnimation = ref(false);

watch(showSuccessAnimation, () => {
    if (showSuccessAnimation.value) {
        var confettiSettings = { target: 'my-canvas' };
        var confetti = new ConfettiGenerator(confettiSettings);
        confetti.render();
        // Launch confetti when modal opens

    }
});

watch(score, (newScore) => {
  if (newScore === shuffledExercises.value.length) {
    showSuccessAnimation.value = true;

    playVictory().catch((err) => {
      console.error("Failed to play victory sound:", err);
      isPlaying.value = false;
    });
  }
});

watch(
  currentExercise,
  () => {
    displayedResponse.value = "______  ";
  },
  { immediate: true }
);

watch(isOnline, (newStatus) => {
  if (newStatus) {
    reloadImage();
  }
});

const reloadImageFlag = ref(false);

const imgSrc = computed(() => {
  const image = shuffledExercises.value[currentExercise.value]?.image;
  console.log("Current exercise image:", image);
  return `${apiBase}/public/1/1.1/images/${image}?v=${reloadImageFlag.value ? Date.now() : ""
    }`;
});

const exercise = [
  {
    image: "table.png",
    choice: ["اَمْشِشْ", "أَطَّجْرَ", "أَطَّبْلَ"],
    trueResponse: 2,
    startWord: "ثَڨِ ذْ",
    meaning: "هادي طابلا",
    sound: "tabla_long",
  },
  {
    image: "verre.png",
    choice: ["أَلْكَسْ", "أَخَمْ", "أَعُذِوْ"],
    trueResponse: 0,
    startWord: "وَڨِ ذْ",
    meaning: "هادا كاس",
    sound: "elkass_long",
  },

  {
    image: "chair.png",
    choice: ["أَذْرَرْ", "أَكُرْسِ", "أَمَنْ"],
    trueResponse: 1,
    startWord: "وَڨِ ذْ",
    meaning: "هادا كرسي",
    sound: "akersi_long",
  },
  {
    image: "cup.png",
    choice: ["إِڨَّنِ", "لَبْحَرْ", "أَفَنْجَلْ"],
    trueResponse: 2,
    startWord: "وَڨِ ذْ",
    meaning: "هادا فنجال",
    sound: "afenjal_long",
  },
  {
    image: "fork.png",
    choice: ["ثَفَرْشِطْ", "أَبَحْرِ", "أَبْرِذْ"],
    trueResponse: 0,
    startWord: "ثَڨِ تْ",
    meaning: "هادي فرشيطا",
    sound: "tafercit_long",
  },
  {
    image: "spoon.png",
    choice: ["ثَعَّبُطْ", "أَسَرْوَلْ", "ثَغَنْجَوْثْ"],
    trueResponse: 2,
    startWord: "ثَڨِ تْ",
    meaning: "هادي مغرفا",
    sound: "tagenjaut_long",
  },
  {
    image: "knife.png",
    choice: ["أَلْمُسْ", "لَحْشِشْ", "ثَيَزِطْ"],
    trueResponse: 0,
    startWord: "وَڨِ ذْ",
    meaning: "هادا موس",
    sound: "elmus_long",
  },
  {
    image: "plate.png",
    choice: ["أَلْغَبَ", "أَقْجُنْ", "ثَضَّبْسِتّْ"],
    trueResponse: 2,
    startWord: "ثَڨِ تْ",
    meaning: "هادا طبسي",
    sound: "tadebsit_long",
  },
  {
    image: "bottle.png",
    choice: ["ثَقَرْعَتّْ", "إِكَّرِ", "ثَكَّرُسْثْ"],
    trueResponse: 0,
    startWord: "ثَڨِ تْ",
    meaning: "هادي قرعا",
    sound: "taqeraat_long",
  },
  {
    image: "bed.png",
    choice: ["إِثْرِ", "أُسُ", "أَسَّبَضْ"],
    trueResponse: 1,
    startWord: "وَڨِ ذْ",
    meaning: "هادا فراش",
    sound: "usu_long",
  },
  {
    image: "door.png",
    choice: ["ثَبُرْثْ", "أَزْنِقْ", "أَدْرُجْ"],
    trueResponse: 0,
    startWord: "ثَڨِ تْ",
    meaning: "هادي باب",
    sound: "taburt_long",
  },
  {
    image: "window.png",
    choice: ["أَذْفَلْ", "أَڨُرْ", "أَطَّقْ"],
    trueResponse: 2,
    startWord: "وَڨِ ذْ",
    meaning: " هادي تاقا",
    sound: "etaq_long",
  },
  {
    image: "phone.png",
    choice: ["أَزِّثْ", "أَغْرُمْ", "أَتِّلِفُنْ"],
    trueResponse: 2,
    startWord: "وَڨِ ذْ",
    meaning: "هادا تيليفون",
    sound: "tilifun_long",
  },

  {
    image: "mountain.png",
    choice: ["أَلْحِضْ", "أَذْرَرْ", "أَمَرْشِ"],
    trueResponse: 1,
    startWord: "وَڨِ ذْ",
    meaning: "هادا جبل",
    sound: "adrar_long",
  },

  {
    image: "pen.png",
    choice: ["أَسْتِلُ", "ثَدَّرْثْ", "أَتْرِسِتِ"],
    trueResponse: 0,
    startWord: "وَڨِ ذْ",
    meaning: "هادا ستيلو",
    sound: "astilu_long",
  },

  {
    image: "olive.png",
    choice: ["أَلْڨَزْ", "أَزُمُرْ", "ثَوَرْقَتّْ"],
    trueResponse: 1,
    startWord: "وَڨِ ذْ",
    meaning: "هادا زيتون",
    sound: "azemur_long",
  },

  {
    image: "hospital.png",
    choice: ["أَسْبِتَرْ", "أَسْقِفْ", "أَلْقَهْوَ"],
    trueResponse: 0,
    startWord: "وَڨِ ذْ",
    meaning: "هادا سبيطار",
    sound: "sbitar_long",
  },

  {
    image: "school.png",
    choice: ["كَسْكْرُطْ", "ثَمُرْثْ", "أَلَّكُلْ"],
    trueResponse: 2,
    startWord: "وَڨِ ذْ",
    meaning: "هادا ليكول",
    sound: "elakul_long",
  },
  {
    image: "stadium.png",
    choice: ["لِفْرِتْ", "أَنَّرْ", "أَلْمِزَنْ"],
    trueResponse: 1,
    startWord: "وَڨِ ذْ",
    meaning: "هادا سطاد",
    sound: "anner_long",
  },
  {
    image: "train.png",
    choice: ["ثَمَشِنْتْ", "أَرْڨَزْ", "أَلْعِذْ"],
    trueResponse: 0,
    startWord: "ثَڨِ تْ",
    meaning: "هادي مشينا",
    sound: "tamacint_long",
  },
];

function shuffleArray(array: any[]) {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function startNewGame() {
  shuffledExercises.value = shuffleArray(exercise);
  currentExercise.value = 0;
  progress.value = 0;
  score.value = 0;
  buttonDisabled.value = true;
}

const assetPathAudio = `https://www.barakaelectronics.com/public/1/1.1/audio`;

const playSuccess = () => {
  return new Promise<void>((resolve, reject) => {
    audioUrl.value = `${assetPathAudio}/success.mp3`;
    nextTick(() => {
      const audio = audioRef.value;
      if (!audio) {
        return resolve(); // fallback: nothing to play
      }

      audio.onended = () => resolve();
      audio.onerror = (e) => {
        console.error("Audio failed to load or play:", e);
        reject(new Error(`Failed to play success sound`));
      };

      try {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.catch((err) => {
            console.error("Playback failed:", err);
            reject(err);
          });
        }
      } catch (err) {
        console.error("Audio exception:", err);
        reject(err);
      }
    });
  });
};

const playVictory = () => {
  return new Promise<void>((resolve, reject) => {
    audioUrl.value = `${assetPathAudio}/victory.mp3`;
    nextTick(() => {
      const audio = audioRef.value;
      if (!audio) {
        return resolve(); // fallback: nothing to play
      }

      audio.onended = () => resolve();
      audio.onerror = (e) => {
        console.error("Audio failed to load or play:", e);
        reject(new Error(`Failed to play victory sound`));
      };

      try {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.catch((err) => {
            console.error("Playback failed:", err);
            reject(err);
          });
        }
      } catch (err) {
        console.error("Audio exception:", err);
        reject(err);
      }
    });
  });
};

const playFail = () => {
  return new Promise<void>((resolve, reject) => {
    audioUrl.value = `${assetPathAudio}/fail.mp3`;
    nextTick(() => {
      const audio = audioRef.value;
      if (!audio) {
        return resolve(); // fallback: nothing to play
      }

      audio.onended = () => resolve();
      audio.onerror = (e) => {
        console.error("Audio failed to load or play:", e);
        reject(new Error(`Failed to play fail sound`));
      };
      try {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.catch((err) => {
            console.error("Playback failed:", err);
            reject(err);
          });
        }
      } catch (err) {
        console.error("Audio exception:", err);
        reject(err);
      }
    });
  });
};

const playSound = async (soundName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    audioUrl.value = `${assetPathAudio}/${soundName}.wav`;
    nextTick(() => {
      const audio = audioRef.value;
      if (!audio) {
        return resolve(); // fallback: nothing to play
      }

      audio.onended = () => resolve();
      audio.onerror = (e) => {
        console.error("Audio failed to load or play:", e);
        reject(new Error(`Failed to play ${soundName}.wav`));
      };
      try {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.catch((err) => {
            console.error("Playback failed:", err);
            reject(err);
          });
        }
      } catch (err) {
        console.error("Audio exception:", err);
        reject(err);
      }
    });
  });
};

const handleChange = (event: any) => {
  buttonDisabled.value = false;
  response = event.detail.value;
  if (response == "اَمْشِشْ")
    playSound("amcic").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَطَّجْرَ")
    playSound("tejra").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَطَّبْلَ")
    playSound("tabla").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "أَخَمْ")
    playSound("axam").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَلْكَسْ")
    playSound("elkass").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَعُذِوْ")
    playSound("audiw").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "أَمَنْ")
    playSound("aman").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَذْرَرْ")
    playSound("adrar").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَكُرْسِ")
    playSound("akersi").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "أَفَنْجَلْ")
    playSound("afenjal").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "لَبْحَرْ")
    playSound("lebhar").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "إِڨَّنِ")
    playSound("igeni").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "أَبْرِذْ")
    playSound("abrid").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَبَحْرِ")
    playSound("abehri").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "ثَفَرْشِطْ")
    playSound("tafercit").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "ثَعَّبُطْ")
    playSound("taabut").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَسَرْوَلْ")
    playSound("aserwal").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "ثَغَنْجَوْثْ")
    playSound("tagenjaut").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "أَلْمُسْ")
    playSound("elmus").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "ثَيَزِطْ")
    playSound("tayazit").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "لَحْشِشْ")
    playSound("lahcic").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "ثَضَّبْسِتّْ")
    playSound("tadebsit").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَقْجُنْ")
    playSound("aqjun").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَلْغَبَ")
    playSound("elghaba").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "ثَقَرْعَتّْ")
    playSound("taqeraat").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "إِكَّرِ")
    playSound("ikeri").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "ثَكَّرُسْثْ")
    playSound("takarust").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "أُسُ")
    playSound("usu").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "إِثْرِ")
    playSound("itri").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَسَّبَضْ")
    playSound("asebadh").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "ثَبُرْثْ")
    playSound("taburt").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَزْنِقْ")
    playSound("azniq").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَدْرُجْ")
    playSound("edruj").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "أَذْفَلْ")
    playSound("adfel").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَڨُرْ")
    playSound("agur").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَطَّقْ")
    playSound("etaq").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "أَتِّلِفُنْ")
    playSound("tilifun").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَغْرُمْ")
    playSound("aghrum").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَزِّثْ")
    playSound("ezit").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "أَمَرْشِ")
    playSound("amarci").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَذْرَرْ")
    playSound("adrar").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَلْحِضْ")
    playSound("elhidh").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "أَتْرِسِتِ")
    playSound("trisiti").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَسْتِلُ")
    playSound("astilu").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "ثَدَّرْثْ")
    playSound("taddart").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "أَزُمُرْ")
    playSound("azemur").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "ثَوَرْقَتّْ")
    playSound("tawarqat").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَلْڨَزْ")
    playSound("elgaz").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "أَسْبِتَرْ")
    playSound("sbitar").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَسْقِفْ")
    playSound("asqif").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَلْقَهْوَ")
    playSound("elqahwa").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "ثَمُرْثْ")
    playSound("tamurt").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "كَسْكْرُطْ")
    playSound("kaskrut").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَلَّكُلْ")
    playSound("elakul").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "لِفْرِتْ")
    playSound("lifrit").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَنَّرْ")
    playSound("anner").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَلْمِزَنْ")
    playSound("elmizan").catch((err) => {
      console.error("Failed to play sound:", err);
    });

  if (response == "ثَمَشِنْتْ")
    playSound("tamacint").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَرْڨَزْ")
    playSound("argaz").catch((err) => {
      console.error("Failed to play sound:", err);
    });
  if (response == "أَلْعِذْ")
    playSound("elaid").catch((err) => {
      console.error("Failed to play sound:", err);
    });
};

const checkResponse = async () => {
  const current = shuffledExercises.value[currentExercise.value];

  if (
    response ===
    shuffledExercises.value[currentExercise.value]?.choice[
    shuffledExercises.value[currentExercise.value]?.trueResponse || 0
    ]
  ) {
    displayedResponse.value = response;
    trueModalIsOpen.value = true;
    await playSuccess().catch((err) => {
      console.error("Failed to play success sound:", err);
      isPlaying.value = false;
    });

    if (current.sound) {
      playSound(current.sound).catch((err) => {
        console.error("Failed to play sound:", err);
        isPlaying.value = false;
      });
    }
  } else {
    falseModalIsOpen.value = true;
    playFail().catch((err) => {
      console.error("Failed to play fail sound:", err);
      isPlaying.value = false;
    });
  }
};

const trueGoOn = () => {
  if (score.value < shuffledExercises.value.length) {
    score.value++;
    progress.value = progress.value + 1 / shuffledExercises.value.length;
    currentExercise.value++;
  }
  trueModalCanDissmiss.value = true;
  trueModalIsOpen.value = false;
  
  buttonDisabled.value = true;
};

const falseGoOn = () => {
  falseModalCanDissmiss.value = true;
  falseModalIsOpen.value = false;
  currentExercise.value = 0;
  progress.value = 0;
  score.value = 0;
  buttonDisabled.value = true;
  startNewGame();
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
  startNewGame();

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

const router = useRouter();
const goOn = () => {
  showSuccessAnimation.value = false;
  currentExercise.value = 0;
  progress.value = 0;
  score.value = 0;
  buttonDisabled.value = true;
  router.push("/welcome");
};

const reloadImage = () => {
  console.log("Reloading image");
  reloadImageFlag.value = !reloadImageFlag.value;
};
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

ion-radio::part(label) {
  overflow: visible;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.text-center span {
  direction: rtl;
  unicode-bidi: plaintext;
}
</style>
