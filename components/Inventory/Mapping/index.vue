<template>
  <v-card style="background: none">
    <!-- Edit mapping dialog -->
    <v-dialog v-model="dialog" width="640" persistent content-class="inv-dialog">
      <v-card v-if="form">
        <div class="inv-dialog__header">
          <v-icon small>mdi-link-variant</v-icon> Map WordPress Product
          <span class="inv-dialog__hint">#{{ form.wp_product_id }}</span>
        </div>
        <v-card-text class="pt-4">
          <div class="mb-2">
            <strong>{{ form.wp_name || "(no name)" }}</strong>
          </div>

          <v-checkbox
            v-model="form.skip_stock"
            dense hide-details
            label="No stock impact (virtual line — e.g. a bundle parent whose items arrive as separate lines)"
            class="mb-3 mt-0"
          />

          <template v-if="!form.skip_stock">
            <div class="text-caption grey--text mb-2">
              Which inventory item(s) does one of this product reduce? Packs reduce several.
            </div>

            <v-row
              v-for="(row, idx) in form.items"
              :key="idx"
              dense align="center"
            >
              <v-col cols="8">
                <v-autocomplete
                  v-model="row.inventory_item_id"
                  :items="inventoryItems"
                  item-value="id"
                  :item-text="itemLabel"
                  label="Inventory item"
                  dense outlined hide-details clearable
                />
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model.number="row.qty"
                  type="number" min="1"
                  label="Qty" dense outlined hide-details
                />
              </v-col>
              <v-col cols="1" class="text-center">
                <v-btn icon small color="red" @click="form.items.splice(idx, 1)">
                  <v-icon small>mdi-close</v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-btn small text color="primary" class="mt-2" @click="addRow">
              <v-icon left small>mdi-plus</v-icon>Add inventory item
            </v-btn>
          </template>

          <div class="d-flex align-center mt-4">
            <v-spacer></v-spacer>
            <span v-if="error" class="red--text mr-3">{{ error }}</span>
            <AssetsButton :options="{ label: 'Cancel', color: 'red' }" @click="dialog = false" />
            &nbsp;
            <AssetsButton :options="{ label: 'Save', color: 'green' }" @click="save" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-data-table
      dense
      :headers="headers"
      :items="filteredRows"
      :loading="loading"
      :items-per-page="25"
      :footer-props="{ itemsPerPageOptions: [25, 50, 100, -1] }"
      class="elevation-1 pa-3 inv-table"
    >
      <template v-slot:top>
        <div class="inv-toolbar d-flex align-center flex-wrap">
          <span class="inv-title mr-4">Stock Mapping</span>
          <v-text-field
            v-model="search"
            class="inv-search mr-3"
            placeholder="Search product / id"
            dense outlined hide-details clearable
          />
          <v-btn-toggle v-model="filter" dense mandatory class="mr-3">
            <v-btn small value="all">All</v-btn>
            <v-btn small value="unmapped">Unmapped</v-btn>
            <v-btn small value="mapped">Mapped</v-btn>
          </v-btn-toggle>
          <v-chip small outlined color="red" v-if="unmappedCount">
            {{ unmappedCount }} unmapped
          </v-chip>
          <v-spacer></v-spacer>
          <v-btn small icon color="primary" @click="load"><v-icon>mdi-reload</v-icon></v-btn>
        </div>
      </template>

      <template v-slot:item.wp_name="{ item }">
        <div>{{ item.wp_name || "(no name)" }}</div>
        <div class="text-caption grey--text">
          id {{ item.wp_product_id }} · {{ item.order_lines }} order line(s)
        </div>
      </template>

      <template v-slot:item.mapped="{ item }">
        <v-chip x-small dark :color="item.mapped ? 'green' : 'red'">
          {{ item.skip_stock ? "virtual" : item.mapped ? "mapped" : "unmapped" }}
        </v-chip>
      </template>

      <template v-slot:item.items="{ item }">
        <span v-if="item.skip_stock" class="grey--text">— no stock —</span>
        <span v-else-if="!item.items.length" class="red--text">not set</span>
        <span v-else>
          <v-chip
            v-for="(c, i) in item.items"
            :key="i"
            x-small outlined class="mr-1 mb-1"
          >{{ c.name || ("#" + c.inventory_item_id) }} × {{ c.qty }}</v-chip>
        </span>
      </template>

      <template v-slot:item.options="{ item }">
        <v-btn icon small color="primary" @click="openEdit(item)">
          <v-icon small>mdi-pencil</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    loading: false,
    rows: [],
    inventoryItems: [],
    search: null,
    filter: "all",
    dialog: false,
    form: null,
    error: null,
    headers: [
      { text: "WordPress Product", value: "wp_name" },
      { text: "Status", value: "mapped", align: "center", width: 110 },
      { text: "Inventory Item(s)", value: "items", sortable: false },
      { text: "Action", value: "options", sortable: false, align: "center", width: 70 },
    ],
  }),

  computed: {
    unmappedCount() {
      return this.rows.filter((r) => !r.mapped).length;
    },
    filteredRows() {
      let rows = this.rows;
      if (this.filter === "unmapped") rows = rows.filter((r) => !r.mapped);
      if (this.filter === "mapped") rows = rows.filter((r) => r.mapped);
      const q = (this.search || "").toLowerCase().trim();
      if (q) {
        rows = rows.filter(
          (r) =>
            String(r.wp_product_id).includes(q) ||
            (r.wp_name || "").toLowerCase().includes(q)
        );
      }
      return rows;
    },
  },

  created() {
    this.load();
  },

  methods: {
    itemLabel(i) {
      const sku = i.sku ? `${i.sku} · ` : "";
      return `${sku}${i.name} (stock ${i.sellable_qty})`;
    },
    async load() {
      this.loading = true;
      try {
        const [products, inv] = await Promise.all([
          this.$axios.get("wp-product-map-products"),
          this.$axios.get("inventory-list"),
        ]);
        this.rows = products.data || [];
        this.inventoryItems = inv.data || [];
      } finally {
        this.loading = false;
      }
    },
    addRow() {
      this.form.items.push({ inventory_item_id: null, qty: 1 });
    },
    openEdit(item) {
      this.error = null;
      this.form = {
        wp_product_id: item.wp_product_id,
        wp_name: item.wp_name,
        skip_stock: !!item.skip_stock,
        items: item.items.length
          ? item.items.map((c) => ({ inventory_item_id: c.inventory_item_id, qty: c.qty }))
          : [{ inventory_item_id: null, qty: 1 }],
      };
      this.dialog = true;
    },
    async save() {
      this.error = null;
      const skip = this.form.skip_stock;
      const items = skip
        ? []
        : this.form.items.filter((r) => r.inventory_item_id);

      if (!skip && !items.length) {
        this.error = "Add at least one inventory item, or tick 'No stock impact'.";
        return;
      }
      try {
        await this.$axios.post("wp-product-map", {
          wp_product_id: this.form.wp_product_id,
          wp_name: this.form.wp_name,
          skip_stock: skip,
          items: items.map((r) => ({ inventory_item_id: r.inventory_item_id, qty: r.qty || 1 })),
        });
        this.dialog = false;
        this.$swal &&
          this.$swal.fire({ toast: true, position: "top-end", timer: 1800, showConfirmButton: false, icon: "success", title: "Mapping saved" });
        this.load();
      } catch (e) {
        this.error = e?.response?.data?.message || "Failed to save";
      }
    },
  },
};
</script>
