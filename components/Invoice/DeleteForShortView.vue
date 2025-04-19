<template>
  <span @click="submit"
    v-bind="attrs"
    v-on="on"
    class="hover-bold"
    text
    style="
      background: none;
      border: none !important;
      font-size: 13px;
      cursor: pointer;
    "
    small
  >
  Delete <v-icon small class="ml-1">mdi-delete</v-icon>
  </span>
</template>
<script>
export default {
  props: ["id", "endpoint"],
  methods: {
    async submit() {
      try {
        await this.$axios.delete(this.endpoint + "/" + this.id);
        this.$emit("response", "Record has been delete");
      } catch ({ response }) {
        console.log(response);
        // console.error("Error adding income:", response.data.message);
      }
    },
  },
};
</script>
