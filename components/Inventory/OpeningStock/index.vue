<template>
  <v-card class="pa-4" outlined>
    <div class="d-flex align-center mb-3 flex-wrap">
      <v-icon left color="primary">mdi-database-plus-outline</v-icon>
      <span class="text-h6">Opening Stock</span>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        placeholder="Search name / SKU"
        dense
        outlined
        hide-details
        clearable
        prepend-inner-icon="mdi-magnify"
        style="max-width: 280px"
        class="mr-3"
      ></v-text-field>
      <v-btn color="primary" :loading="saving" @click="save">
        <v-icon left>mdi-content-save</v-icon> Save
      </v-btn>
    </div>

    <v-alert
      dense
      text
      :type="stockSync ? 'success' : 'warning'"
      class="mb-3 d-flex align-center"
    >
      <div class="d-flex align-center flex-wrap">
        <v-switch
          v-model="stockSync"
          :loading="syncLoading"
          hide-details
          dense
          class="mt-0 mr-3"
          @change="toggleStockSync"
        ></v-switch>
        <span>
          <strong>Stock linking {{ stockSync ? "enabled" : "disabled" }}.</strong>
          {{
            stockSync
              ? "Converting an order to an invoice will deduct stock; returns/cancels add it back."
              : "Invoices, returns and cancels will NOT change stock. Enter your opening stock first, then turn this on."
          }}
        </span>
      </div>
    </v-alert>

    <v-data-table
      :headers="headers"
      :items="filtered"
      :loading="loading"
      :items-per-page="100"
      hide-default-footer
      dense
      class="elevation-0"
    >
      <template v-slot:item.opening="{ item }">
        <v-text-field
          v-model.number="item.opening"
          type="number"
          min="0"
          dense
          hide-details
          outlined
          style="max-width: 120px"
          class="my-1 mx-auto"
        ></v-text-field>
      </template>
      <template v-slot:no-data>
        <span class="grey--text">No inventory items found.</span>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    loading: false,
    saving: false,
    syncLoading: false,
    stockSync: false,
    search: "",
    items: [],
    headers: [
      { text: "SKU", value: "sku" },
      { text: "Item", value: "name" },
      { text: "Opening Qty", value: "opening", align: "center", sortable: false },
    ],
  }),
  computed: {
    filtered() {
      const q = (this.search || "").toLowerCase().trim();
      if (!q) return this.items;
      return this.items.filter(
        (i) =>
          (i.name || "").toLowerCase().includes(q) ||
          (i.sku || "").toLowerCase().includes(q)
      );
    },
  },
  async created() {
    await Promise.all([this.load(), this.loadStockSync()]);
  },
  methods: {
    async loadStockSync() {
      try {
        const { data } = await this.$axios.get("inventory-stock-sync");
        this.stockSync = !!data.enabled;
      } catch (e) {
        console.error("Failed to load stock sync status", e);
      }
    },
    async toggleStockSync(value) {
      this.syncLoading = true;
      try {
        await this.$axios.post("inventory-stock-sync", { enabled: value });
        this.notify(
          "success",
          value ? "Stock linking enabled" : "Stock linking disabled"
        );
      } catch (e) {
        // revert the toggle if the save failed
        this.stockSync = !value;
        this.notify("error", "Failed to update stock linking");
      } finally {
        this.syncLoading = false;
      }
    },
    async load() {
      this.loading = true;
      try {
        const { data } = await this.$axios.get("inventory-list");
        // Pre-fill each opening qty with the current balance so the user edits
        // absolute values; untouched rows produce no movement on save.
        this.items = (data || []).map((i) => ({
          ...i,
          sellable_qty: Number(i.sellable_qty) || 0,
          opening: Number(i.sellable_qty) || 0,
        }));
      } catch (e) {
        console.error("Failed to load items", e);
      } finally {
        this.loading = false;
      }
    },
    async save() {
      const payload = {
        items: this.items.map((i) => ({
          product_id: i.id,
          quantity: Math.max(0, parseInt(i.opening) || 0),
        })),
      };

      this.saving = true;
      try {
        const { data } = await this.$axios.post(
          "inventory-opening-stock",
          payload
        );
        this.notify("success", data.message || "Opening stock saved");
        await this.load();
      } catch (e) {
        const msg =
          e?.response?.data?.message || "Failed to save opening stock";
        this.notify("error", msg);
      } finally {
        this.saving = false;
      }
    },
    notify(icon, title) {
      if (this.$swal) {
        this.$swal.fire({
          toast: true,
          position: "top-end",
          timer: 2500,
          showConfirmButton: false,
          icon,
          title,
        });
      }
    },
  },
};
</script>
