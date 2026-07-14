Component({
  properties: {
    options: {
      type: Array,
      value: [],
      observer(newVal) {
        this._initSelection(newVal);
      }
    }
  },

  data: {
    selected: {},
    summary: []
  },

  lifetimes: {
    attached() {
      this._initSelection(this.data.options);
    }
  },

  methods: {
    _initSelection(options) {
      const selected = {};
      (options || []).forEach(dim => {
        if (dim.required && dim.values && dim.values.length) {
          selected[dim.key] = dim.values[0].id;
        }
      });
      this.setData({ selected }, () => {
        this._emitChange();
      });
    },

    onSelect(e) {
      const { key, id } = e.currentTarget.dataset;
      const selected = Object.assign({}, this.data.selected, { [key]: id });
      this.setData({ selected }, () => {
        this._emitChange();
      });
    },

    _buildSummary() {
      const summary = [];
      (this.data.options || []).forEach(dim => {
        const vid = this.data.selected[dim.key];
        if (!vid) return;
        const v = (dim.values || []).find(x => x.id === vid);
        if (v) summary.push({ key: dim.key, name: dim.name, label: v.label });
      });
      return summary;
    },

    _emitChange() {
      const summary = this._buildSummary();
      this.setData({ summary });
      this.triggerEvent('change', {
        selection: this.data.selected,
        summary
      });
    }
  }
});
