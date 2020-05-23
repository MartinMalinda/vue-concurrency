<script lang="ts">
import { defineComponent, ref, onMounted } from "@vue/composition-api";
import useTask, { Task } from "../../../src/Task";

function timeout(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

const wikiArticleText = `The Grand Canyon is a river valley in the Colorado Plateau that exposes uplifted Proterozoic and Paleozoic strata, and is also one of the six distinct physiographic sections of the Colorado Plateau province. Even though It is not the deepest canyon in the world (Kali Gandaki Gorge in Nepal is much deeper), the Grand Canyon is known for its visually overwhelming size and its intricate and colorful landscape. Geologically, it is significant because of the thick sequence of ancient rocks that are well preserved and exposed in the walls of the canyon. These rock layers record much of the early geologic history of the North American continent.

Uplift associated with mountain formation later moved these sediments thousands of feet upward and created the Colorado Plateau. The higher elevation has also resulted in greater precipitation in the Colorado River drainage area, but not enough to change the Grand Canyon area from being semi-arid.[12] The uplift of the Colorado Plateau is uneven, and the Kaibab Plateau that the Grand Canyon bisects is over one thousand feet (300 m) higher at the North Rim than at the South Rim. Almost all runoff from the North Rim (which also gets more rain and snow) flows toward the Grand Canyon, while much of the runoff on the plateau behind the South Rim flows away from the canyon (following the general tilt). The result is deeper and longer tributary washes and canyons on the north side and shorter and steeper side canyons on the south side.

Temperatures on the North Rim are generally lower than those on the South Rim because of the greater elevation (averaging 8,000 feet or 2,400 metres above sea level).[13] Heavy rains are common on both rims during the summer months. Access to the North Rim via the primary route leading to the canyon (State Route 67) is limited during the winter season due to road closures.

The Grand Canyon is part of the Colorado River basin which has developed over the past 70 million years,[15] in part based on apatite (U-Th)/He thermochronometry showing that Grand Canyon reached a depth near to the modern depth by 20 Ma.[16] A recent study examining caves near Grand Canyon places their origins beginning about 17 million years ago. Previous estimates had placed the age of the canyon at 5–6 million years.[17] The study, which was published in the journal Science in 2008, used uranium-lead dating to analyze calcite deposits found on the walls of nine caves throughout the canyon.[18] There is a substantial amount of controversy because this research suggests such a substantial departure from prior widely supported scientific consensus.[19] In December 2012, a study published in the journal Science claimed new tests had suggested the Grand Canyon could be as old as 70 million years.[20] However, this study has been criticized by those who support the "young canyon" age of around six million years as "[an] attempt to push the interpretation of their new data to their limits without consideration of the whole range of other geologic data sets."[17]

The canyon is the result of erosion which exposes one of the most complete geologic columns on the planet.

The major geologic exposures in the Grand Canyon range in age from the 2-billion-year-old Vishnu Schist at the bottom of the Inner Gorge to the 230-million-year-old Kaibab Limestone on the Rim. There is a gap of about a billion years between the 500-million-year-old stratum and the level below it, which dates to about 1.5 billion years ago. This large unconformity indicates a long period for which no deposits are present.

Many of the formations were deposited in warm shallow seas, near-shore environments (such as beaches), and swamps as the seashore repeatedly advanced and retreated over the edge of a proto-North America. Major exceptions include the Permian Coconino Sandstone, which contains abundant geological evidence of aeolian sand dune deposition. Several parts of the Supai Group also were deposited in non–marine environments.

The great depth of the Grand Canyon and especially the height of its strata (most of which formed below sea level) can be attributed to 5–10 thousand feet (1,500 to 3,000 m) of uplift of the Colorado Plateau, starting about 65 million years ago (during the Laramide Orogeny). This uplift has steepened the stream gradient of the Colorado River and its tributaries, which in turn has increased their speed and thus their ability to cut through rock (see the elevation summary of the Colorado River for present conditions).

Weather conditions during the ice ages also increased the amount of water in the Colorado River drainage system. The ancestral Colorado River responded by cutting its channel faster and deeper.

The base level and course of the Colorado River (or its ancestral equivalent) changed 5.3 million years ago when the Gulf of California opened and lowered the river's base level (its lowest point). This increased the rate of erosion and cut nearly all of the Grand Canyon's current depth by 1.2 million years ago. The terraced walls of the canyon were created by differential erosion.[21]

Between 100,000 and 3 million years ago, volcanic activity deposited ash and lava over the area which at times completely obstructed the river. These volcanic rocks are the youngest in the canyon.`;

function getSuggestionsFromText(text, value) {
  return wikiArticleText
    .split(".")
    .map(sentence => sentence.split(","))
    .flat()
    .filter(sentence => sentence.toLowerCase().includes(value.toLowerCase()))
    .map(sentence =>
      sentence.replace(
        new RegExp("(^|)(" + value + ")(|$)", "ig"),
        "$1<b>$2</b>$3"
      )
    )
    .map(sentence =>
      sentence.length > 40 ? sentence.substring(0, 40) + "..." : sentence
    )
    .sort((a, b) => a.length - b.length);
}

export default defineComponent({
  setup() {
    const suggestions = ref<string[]>([]);
    const searchTask = useTask(function*(signal, event) {
      const { value } = event.target;
      yield timeout(500);
      if (!value) {
        suggestions.value = [];
        return;
      }

      suggestions.value = getSuggestionsFromText(wikiArticleText, value);

      suggestions.value.length = 20;
    }).keepLatest();

    return { searchTask, suggestions };
  }
});
</script>

<template>
  <div>
    <br />
    <div :style="{ display: 'flex' }">
      <input placeholder="Search..." :style="{ height: '20px' }" @input="searchTask.perform" />
      <span v-if="searchTask.isRunning">&nbsp;☁️</span>
    </div>
    <div v-for="suggestion in suggestions" v-html="suggestion"></div>
  </div>
</template>

<style>
</style>
