<canvas ref="canvas"></canvas>

<script>
import { Line } from "vue-chartjs";

export default {
  extends: Line,
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  mounted() {
    this.renderChart(this.withGradient(this.chartData), this.options);
  },
  watch: {
    chartData: {
      deep: true,
      handler(newVal) {
        if (this.$data._chart) {
          this.$data._chart.destroy();
        }
        this.renderChart(this.withGradient(newVal), this.options);
      },
    },
    options: {
      deep: true,
      handler() {
        if (this.$data._chart) {
          this.$data._chart.destroy();
        }
        this.renderChart(this.withGradient(this.chartData), this.options);
      },
    },
  },
  methods: {
    // Build a vertical gradient fill for any dataset that opts in via `_gradient`.
    withGradient(data) {
      const ctx = this.$refs.canvas ? this.$refs.canvas.getContext("2d") : null;
      if (!ctx) return data;
      const datasets = (data.datasets || []).map((ds) => {
        if (!ds._gradient) return ds;
        const [from, to] = ds._gradient;
        const g = ctx.createLinearGradient(0, 0, 0, 260);
        g.addColorStop(0, from);
        g.addColorStop(1, to);
        return { ...ds, backgroundColor: g };
      });
      return { ...data, datasets };
    },
  },
};
</script>
