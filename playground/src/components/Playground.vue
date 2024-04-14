<template>
  <div class="playground">
    <header>
      <section>
        <div class="title">Offset</div>
        <div class="fields-wrapper">
          <div class="field">
            <div class="description">Offset Top</div>
            <div class="value">
              <n-input-number v-model:value="offset.top" />
            </div>
          </div>
          <div class="field">
            <div class="description">Offset Right</div>
            <div class="value">
              <n-input-number v-model:value="offset.right" />
            </div>
          </div>
          <div class="field">
            <div class="description">Offset Bottom</div>
            <div class="value">
              <n-input-number v-model:value="offset.bottom" />
            </div>
          </div>
          <div class="field">
            <div class="description">Offset Left</div>
            <div class="value">
              <n-input-number v-model:value="offset.left" />
            </div>
          </div>
        </div>
      </section>
      <section>
        <div class="title">Transform</div>
        <div class="fields-wrapper">
          <div class="field">
            <div class="description">Translate X</div>
            <div class="value">
              <n-input-number v-model:value="transform.x" @update:value="updateTransform({ x: $event! })" />
            </div>
          </div>
          <div class="field">
            <div class="description">Translate Y</div>
            <div class="value">
              <n-input-number v-model:value="transform.y" />
            </div>
          </div>
          <div class="field">
            <div class="description">Scale</div>
            <div class="value">
              <n-input-number v-model:value="transform.scale" />
            </div>
          </div>
          <div class="field">
            <div class="description">Rotate</div>
            <div class="value">
              <n-input-number v-model:value="transform.rotate" />
            </div>
          </div>
        </div>
      </section>
      <section>
        <div class="title">Events</div>
        <div class="fields-wrapper small">
          <div class="field">
            <div class="description">Wheel</div>
            <div class="value">
              <n-switch v-model:value="wheelEvents" />
            </div>
          </div>
          <div class="field">
            <div class="description">Touch</div>
            <div class="value">
              <n-switch v-model:value="touchEvents" />
            </div>
          </div>
          <div class="field">
            <div class="description">Mouse</div>
            <div class="value">
              <n-switch v-model:value="mouseEvents" />
            </div>
          </div>
          <div class="field">
            <div class="description">Gesture</div>
            <div class="value">
              <n-switch v-model:value="gestureEvents" />
            </div>
          </div>
          <div class="field">
            <div class="description">Rotation</div>
            <div class="value">
              <n-switch v-model:value="rotation" />
            </div>
          </div>
          <div class="field">
            <div class="description">Bounds</div>
            <div class="value">
              <n-switch v-model:value="bounds" />
            </div>
          </div>
        </div>
      </section>
      <section>
        <n-button
          @click="fit(true)"
          :disabled="transform.rotate === 0 && transform.scale === 1 && transform.x === 0 && transform.y === 0"
          type="success"
          style="width: 100%"
        >
          Fit
        </n-button>
      </section>
    </header>
    <div class="projection-wrapper">
      <zoompinch
        ref="zoompinchRef"
        :width="1536"
        :height="2048"
        :offset="offset"
        v-model:transform="transform"
        :min-scale="0.1"
        :max-scale="10"
        :rotation="rotation"
        :bounds="bounds"
        :mouse="mouseEvents"
        :touch="touchEvents"
        :wheel="wheelEvents"
        :gesture="gestureEvents"
      >
        <template #canvas>
          <img
            src="https://imagedelivery.net/mudX-CmAqIANL8bxoNCToA/489df5b2-38ce-46e7-32e0-d50170e8d800/public"
            style="width: 1536px; height: 2048px"
          />
        </template>
        <template #matrix="{ compose }">
          <svg xmlns="http://www.w3.org/2000/svg" @click="handleClickOnLayer">
            <circle :cx="compose(1536 / 2, 2048 / 2)[0]" :cy="compose(1536 / 2, 2048 / 2)[1]" r="5" style="fill: #f00" />
          </svg>
        </template>
      </zoompinch>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Zoompinch } from 'zoompinch';
import 'zoompinch/style.css';
import { onMounted, reactive, ref, watch, watchEffect } from 'vue';
import { NInputNumber, NSwitch, NButton } from 'naive-ui';

// Flicker bug reproducable: 100,0,0.1,180

const rotation = ref(true);
const bounds = ref(false);
watch(bounds, (newValue) => {
  if (newValue) {
    rotation.value = false;
  }
});
watch(rotation, (newValue) => {
  if (newValue) {
    bounds.value = false;
  }
});
const zoompinchRef = ref<InstanceType<typeof Zoompinch>>();

const offset = reactive({ top: 10, right: 10, bottom: 10, left: 10 });
(window as any).offset = offset;

const transform = ref({ x: 0, y: 0, scale: 1, rotate: 0 });
(window as any).transform = transform;
const updateTransform = (newTransform: Partial<typeof transform.value>) => {
  transform.value = { ...transform.value, ...newTransform };
};

(window as any).zoompinchRef = zoompinchRef;

const mouseEvents = ref(true);
const touchEvents = ref(true);
const wheelEvents = ref(true);
const gestureEvents = ref(true);

function handleClickOnLayer(event: MouseEvent) {
  const [x, y] = zoompinchRef.value!.normalizeMatrixCoordinates(event.clientX, event.clientY);

  console.log('clicked at', x, y);
  alert(`clicked at ${x}, ${y}`);
}
function fit(animate: boolean) {
  zoompinchRef.value?.applyTransform(1, [0.5, 0.5], [0.5, 0.5], animate);
}
onMounted(() => {
  setTimeout(() => fit(true));
});
</script>

<style scoped lang="scss">
.playground {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 10px;
  display: flex;
  overflow: hidden;
  flex-direction: row;

  gap: 10px;
  @media screen and (max-width: 700px) {
    flex-direction: column;
  }
  > header {
    border-radius: 10px;
    padding: 20px;
    display: grid;
    flex: none;
    box-sizing: border-box;
    gap: 20px;
    place-content: start stretch;
    //place-content: space-between;
    background-color: #f1f1f1;
    @media screen and (min-width: 701px) {
      width: 400px;
    }
    .title {
      display: none;
    }
    > section + section {
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      padding-top: 10px;
    }
  }
  > .projection-wrapper {
    flex: 1;
  }
  .fields-wrapper {
    width: 100%;
    display: grid;
    gap: 10px;

    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    @media screen and (max-width: 700px) {
      grid-template-columns: repeat(4, 1fr);
    }

    &.small {
      grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
      @media screen and (max-width: 700px) {
        grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
      }
    }
    .field {
      .description {
        font-size: 0.9em;
        opacity: 0.7;
        @media screen and (max-width: 700px) {
          font-size: 0.7em;
        }
      }
      .n-input-number {
        ::v-deep(.n-input__suffix) {
          .n-button {
            @media screen and (max-width: 700px) {
              display: none;
            }
          }
        }
      }
    }
  }
  .zoompinch {
    border-radius: 10px;
    background-color: #f1f1f1;
    @media screen and (max-width: 700px) {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
