<template>
  <date-picker
    style="width: 100%; height: 50px"
    value-type="format"
    format="YYYY-MM-DD"
    type="date"
    v-model="time3"
    @change="CustomFilter()"
    range
    :class="height ? 'small-text' : ''"
  ></date-picker>
</template>

<script>
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
export default {
  components: {
    DatePicker,
  },
  props: ["defaultFilterType", "height"],
  data() {
    return {
      // -------------------end chart ----------------
      time3: null,
      from_date: "",
      from_menu: false,

      to_date: "",
      to_menu: false,
      loading: false,
      showTimePanel: false,
    };
  },

  mounted() {
    // document.querySelector(".mx-input").focus();
  },
  created() {
    const today = new Date();

    // Calculate from_date as today - 7 days
    const from_date = new Date(today);
    from_date.setDate(today.getDate());

    // Calculate to_date as today + 7 days
    const to_date = new Date(today);
    to_date.setDate(today.getDate());

    this.from_date = from_date.toISOString().slice(0, 10);
    this.to_date = to_date.toISOString().slice(0, 10);

    this.time3 = [this.from_date, this.to_date];
  },

  methods: {
    CustomFilter() {
      this.from_date = this.time3[0];
      this.to_date = this.time3[1];
      if (this.from_date && this.to_date) {
        let data = {
          from: this.from_date,
          to: this.to_date,
        };

        this.$emit("filter-attr", data);
      }
    },

    formatDate(date) {
      var day = date.getDate();
      var month = date.getMonth() + 1; // Months are zero-based
      var year = date.getFullYear();
      return (
        year +
        "-" +
        (month < 10 ? "0" : "") +
        month +
        "-" +
        (day < 10 ? "0" : "") +
        day
      );
    },
  },
};
</script>

<style>
.small-text .mx-input {
  height: 30px !important;
  border: 1px solid #9e9e9e !important;
  color: black !important;
}

.mx-table-date td,
.mx-table-date th {
  text-align: center !important;
}
</style>
