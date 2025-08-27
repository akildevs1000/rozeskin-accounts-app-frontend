<canvas ref="canvas"></canvas>

<script>
// components/BarOrdersSumChart.js
import { Bar } from "vue-chartjs";

export default {
  extends: Bar,
  props: {
    chartData: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: true,
          labels: { fontColor: "#555" }
        },
        tooltips: {
          mode: "index",
          intersect: false,
          backgroundColor: "#1976D2",
          titleFontSize: 14,
          bodyFontSize: 13,
          cornerRadius: 6
        },
        scales: {
          xAxes: [
            {
              gridLines: { display: false },
              ticks: { fontColor: "#666" }
            }
          ],
          yAxes: [
            {
              ticks: { beginAtZero: true, precision: 0, fontColor: "#666" },
              gridLines: { color: "rgba(0,0,0,0.05)" }
            }
          ]
        }
      })
    }
  },
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
  watch: {
    chartData: {
      deep: true,
      handler(newVal) {
        if (this.$data._chart) {
          this.$data._chart.destroy();
        }
        this.renderChart(newVal, this.options);
      }
    }
  }
};
</script>
<style scoped>
.v-card {
  border-radius: 16px;
}
canvas {
  max-height: 100%;
}
</style>
