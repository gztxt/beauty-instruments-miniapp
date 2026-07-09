Component({
  properties: {
    banners: {
      type: Array,
      value: []
    },
    activeSwiper: {
      type: Number,
      value: 0
    }
  },

  methods: {
    onSwiperChange(e) {
      this.triggerEvent('change', { current: e.detail.current })
    }
  }
})
