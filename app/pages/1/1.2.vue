<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title class="text-center">Listening</ion-title>

            </ion-toolbar>
        </ion-header>
        <ion-content :fullscreen="true" class="ion-padding">
            <transition name="fade">
                <div v-if="showSuccessAnimation"
                    class="fixed inset-0 z-50 bg-green-200 bg-opacity-90 flex items-center justify-center">
                    <div class="text-center">
                        <h1 class="text-5xl font-bold text-green-800 mb-4"> 🎉 مبروك عليك 20/20 🎉 </h1>
                        <h1 class="text-5xl font-bold text-green-800 mb-4"> 🎉 بزاف فوووووووور🎉 </h1> <ion-button
                            expand="block" @click="goOnNextStage">كمل</ion-button>
                    </div>
                </div>
            </transition>

            <ion-title class="text-center">{{ score }}/{{ shuffledExercises.length }}</ion-title>
            <ion-progress-bar :value="progress" slot="fixed" color="success"></ion-progress-bar>
            <div v-if="!isOnline" class="bg-red-100 text-red-600 text-center p-2">
                ⚠️ ماركش مكونكتي لنترنات
            </div>
            <div class="text-center text-gray-700">
                <h1>"اسمع ؤ خير الكلمات"</h1>
            </div>
            <div class="flex justify-center pt-10">
                <ion-button fill="solid" :disabled="isPlaying || !isOnline" @click="playSound()">
                    <ion-icon slot="icon-only" size="large" :icon="ioniconsVolumeHigh"></ion-icon>
                </ion-button>
            </div>
            <div class="h-10 w-8/12 pt-20 mx-auto border-b border-gray-900 " v-if="response.length === 0">
                <h1 class="text-center text-gray-400">عبّز على الكلمات باش تبني الجملة</h1>


            </div>
            <div class="flex flex-row-reverse justify-center pt-8">
                <div v-for="word in response">
                    <div class=" border-b border-gray-900 text-3xl 
                    font-bold text-center m-2 pt-10" @click="removeWord(word)">
                        {{ word }}
                    </div>

                </div>
            </div>

            <div class="flex flex-row flex-wrap justify-center pt-20">
                <div v-for="word in shuffledExercises[currentExercise]?.propositions">
                    <div class="border border-gray-300 text-3xl font-bold text-center
                     m-2 p-2 shadow-lg rounded-lg m-2 p-2 " @click="move(word)">
                        {{ word }}
                    </div>

                </div>
            </div>


            <div class=" m-5 pb-16">
                <ion-button expand="block" :disabled="buttonDisabled || !isOnline"
                    @click="checkResponse">ابعت</ion-button>
            </div>
            <ion-modal :initial-breakpoint="1" :breakpoints="[0, 1]" :can-dismiss="falseModalCanDissmiss"
                :isOpen="falseModalIsOpen" @didDismiss="
                    falseModalIsOpen = false;
                falseModalCanDissmiss = false;
                ">
                <div class="bg-yellow-500">
                    <div class="flex flex-col justify-end mx-4 my-10 text-red-600">
                        <h1 class="text-right">ما جبتهاش. ماعليش</h1>
                        <h1 class="text-right">ما ديكوراجيش. عاود</h1>
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
                        <div>
                          <h1 class="text-right text-red-600">
                            {{ shuffledExercises[currentExercise]?.sentence.join(" ") }}
                          </h1>  
                        </div>
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
//----------- confetiei --------------

const showSuccessAnimation = ref(false);

watch(showSuccessAnimation, () => {
    if (showSuccessAnimation.value) {
        var confettiSettings = { target: 'my-canvas' };
        var confetti = new ConfettiGenerator(confettiSettings);
        confetti.render();
        // Launch confetti when modal opens

    }
});


//------------------------------------------


const score = ref(0);
const progress = ref(0);
const trueModalCanDissmiss = ref(false);
const falseModalCanDissmiss = ref(false);
const currentExercise = ref(0);

const buttonDisabled = ref(true);
const falseModalIsOpen = ref(false);
const trueModalIsOpen = ref(false);
const response: Ref<string[]> = ref([])

const audioUrl: Ref<string> = ref(""); // Placeholder, will be set later
const audioRef = ref<HTMLAudioElement | null>(null);

let isPlaying = ref(false);

const isOnline = ref(true);

watch(score, (newScore) => {
    if (newScore === shuffledExercises.value.length) {
        showSuccessAnimation.value = true;

        playVictory().catch((err) => {
            console.error("Failed to play victory sound:", err);
            isPlaying.value = false;
        });
    }
});

const assetPathAudio = `https://www.barakaelectronics.com/public/1/1.2/audio`;

const exercises = [
    {
        sentence: ["أَنْوَ", "وَڨِ"],
        sound: "1.2.1",
        meaning: "شكون هادا",
        propositions: ["أَنْوَ", "وَڨِ", "أَمِّ", "أَفْرُخْ"],
    },
    {
        sentence: ["أَوِ", "دْ", "أَمَنْ"],
        sound: "1.2.2",
        meaning: "جيب الماء",
        propositions: ["أَخَّمْ", "أَوِ", "أَمَنْ", "سَوْ", "دْ"],
    },
    {
        sentence: ["وَڨِ", "ذْ", "أَكَرْسِ"],
        sound: "1.2.3",
        meaning: "هادا كرسي",
        propositions: ["ثَبُرْثْ", "وَڨِ", "أَذْرَرْ", "أَكَرْسِ", "ذْ"],
    },
    {
        sentence: ["أَفْكِيِ", "دْ", "ثَغَنْجَوْثْ", "نِّ"],
        sound: "1.2.4",
        meaning: "اعطيني هاديك لمغرفا",
        propositions: ["أَفْكِيِ", "إِثْرِ", "نِّ", "أَسَرْوَلْ", "أَطَّبْلَ", "دْ", "ثَغَنْجَوْثْ",],
    },
    {
        sentence: ["أُلِسْ", "ذْ", "أَمْلَلْ"],
        sound: "1.2.5",
        meaning: "قلبو بيظ",
        propositions: ["أَلِ", "أُلِسْ", "أَمْلَلْ", "ثَكَرُسْثْ", "أَطَّبْلَ", "ذْ", "أَزْڨَرْ"],
    },

    {
        sentence: ["يُلِ", "وْ", "أَسْ"],
        sound: "1.2.6",
        meaning: "طلع النهار",
        propositions: ["أَفَرْمَجْ", "يُلِ", "أَسْ", "أَلَمْبَ", "وْ", "ثَخَمْتْ"],
    },

    {
        sentence: ["ثَڨِ", "ذْ", "يِمَ"],
        sound: "1.2.7",
        meaning: "هادي يما",
        propositions: ["ذْ", "ثَڨِ", "أَسْ", "يِمَ", "أَڨُرْ", "ثَمَطُثْ"],
    },

    {
        sentence: ["أَسَّ", "ذْ", "أَسُمِضْ"],
        sound: "1.2.8",
        meaning: "اليوم البرد",
        propositions: ["أَمْشِشْ", "إِطِجْ", "أَسُمِضْ", "إِڨُنِ", "ذْ", "أَسَّ"],
    },

    {
        sentence: ["حَمْلَغْ", "أَغْرُمْ", "سْ", "وْ", "أُذِ"],
        sound: "1.2.9",
        meaning: "نحب الخبز بزبدا",
        propositions: ["أَغْرُمْ", "أُذِ", "حَمْلَغْ", "ثِمَسْ", "وْ", "سْ"],
    },

    {
        sentence: ["أَشّْ", "أَغْرُمْ"],
        sound: "1.2.10",
        meaning: "كول الخبز",
        propositions: ["أَغْرُمْ", "ثِغَرْغَرْثْ", "أَطَّقْ", "أَشّْ",],
    },

      {
        sentence: ["أَلْخِرْ","أَ","دَّ", "عْلِ"],
        sound: "1.2.11",
        meaning: "صباح الخير دا (دادا) عليي",
        propositions: ["دَّ", "أَلْخِرْ", "نَنَ","أَ", "عْلِ",],
    },

    {
        sentence: ["جِغْكُنْ", "ذَڨْ", "لَهْنَ"],
        sound: "1.2.12",
        meaning: "تبقاو علي خير(خليتكم فلهنا)",
        propositions: ["لَهْنَ", "أَسِفْ", "ذْ", "ذَڨْ", "جِغْكُنْ"],
    },
      {
        sentence: ["أَسْمِرِيِ", "دْ", "أَلْكَسْ","نْ","وَ","أَمَنْ"],
        sound: "1.2.13",
        meaning: "عمر لي كاس ما",
        propositions: ["نْ", "أَسْمِرِيِ", "أَلْكَسْ", "أَمَنْ", "دْ","وَ"],
    },
       {
        sentence: ["أَشْحَلْ", "أَسُّمَسْ", "تِلِفُنْ","أَڨِ"],
        sound: "1.2.14",
        meaning: "اشحال سومتو، هاد التيليفون",
        propositions: ["تِلِفُنْ", "أَشْحَلْ", "أَڨِ", "أَغْرُمْ", "أَسُّمَسْ"],
    },




]



function shuffleArray(array: any[]) {
    return array
        .map((item) => ({ item, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ item }) => item);
}


const shuffledExercises = ref(shuffleArray(exercises));


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

const startNewGame = () => {
    shuffledExercises.value = shuffleArray(exercises);
    currentExercise.value = 0;
    progress.value = 0;
    score.value = 0;
    buttonDisabled.value = true;
};

const router = useRouter();
const goOnNextStage = () => {
    showSuccessAnimation.value = false;
    currentExercise.value = 0;
    progress.value = 0;
    score.value = 0;
    buttonDisabled.value = true;
    router.push("/welcome");
};


const checkResponse = async () => {

    if (response.value.length === 0) {
        falseModalIsOpen.value = true;
        falseModalCanDissmiss.value = true;
        return;
    }

    if (compareArrays(response.value, shuffledExercises.value[currentExercise.value]?.sentence)) {
        trueModalIsOpen.value = true;
       
        await playSuccess().catch((err) => {
            console.error("Failed to play success sound:", err);
            isPlaying.value = false;
        });
    } else {
        falseModalIsOpen.value = true;
       
        playFail().catch((err) => {
            console.error("Failed to play fail sound:", err);
            isPlaying.value = false;
        });
    }
    response.value = []
    buttonDisabled.value = true

}

const compareArrays = (arr1: string[], arr2: string[]) => {

    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
};


//---------------------audio functions---------------------
const onLoadStart = () => {
    console.log("Audio load started");
    // isPlaying.value = true;
};

const onEnded = () => {
    console.log("Audio ended");
    isPlaying.value = false;
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

const move = (word: string) => {
    response.value.push(word)
    buttonDisabled.value = false
};

const removeWord = (word: string) => {
    const index = response.value.indexOf(word);
    if (index > -1) {
        response.value.splice(index, 1);
    }
    if (response.value.length === 0) {
        buttonDisabled.value = true
    }
};




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

const currentSound = computed(() => {

    return shuffledExercises.value[currentExercise.value]?.sound || "";
})



const playSound = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
        audioUrl.value = `${assetPathAudio}/${currentSound.value}.wav`;
        nextTick(() => {
            const audio = audioRef.value;
            if (!audio) {
                return resolve(); // fallback: nothing to play
            }

            audio.onended = () => resolve();
            audio.onerror = (e) => {
                console.error("Audio failed to load or play:", e);
                reject(new Error(`Failed to play ${currentSound.value}.wav`));
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

/*
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.8s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}*/

canvas {
    position: absolute;
    inset: 0;
    pointer-events: none;
}
</style>