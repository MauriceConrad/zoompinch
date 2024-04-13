# Introduction

Zoompinch let's you scale, translate and rotate any element with native-like multi-touch, mouse, wheel and gesture support.

## Reactive

The `transform` property is fully reactive. {{1 +1}}

<script>
export default {
  data() {
    return {
      dynamicComponent: null
    }
  },

  mounted () {
    
    // import('./lib-that-access-window-on-import').then(module => {
    //   this.dynamicComponent = module.default
    // })
  }
}
</script>
