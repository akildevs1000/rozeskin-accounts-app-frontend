<template>
  <v-card flat class="po-form">
    <!-- Header bar -->
    <div class="d-flex align-center px-6 py-4" style="border-bottom: 1px solid #eef1f5">
      <v-icon left>mdi-bag-personal-outline</v-icon>
      <span class="text-h6 font-weight-medium">{{ isEdit ? "Edit Purchase Order" : "New Purchase Order" }}</span>
      <v-spacer></v-spacer>
      <v-btn icon @click="goBack"><v-icon>mdi-close</v-icon></v-btn>
    </div>

    <v-card-text class="pa-0">
      <!-- Vendor row -->
      <div class="po-section">
        <v-row align="center" no-gutters>
          <v-col cols="12" md="2"><div class="po-label red--text">Vendor Name<span class="ml-1">*</span></div></v-col>
          <v-col cols="12" md="6">
            <div class="d-flex align-center">
              <v-autocomplete
                v-model="form.vendor_id"
                :items="vendors"
                item-text="display_name"
                item-value="id"
                placeholder="Select a Vendor"
                dense outlined hide-details clearable
                no-data-text="No vendors — add one under Inventory › Vendors"
              />
              <v-btn color="primary" depressed class="ml-2 po-search-btn" @click="goToVendors" title="Manage vendors">
                <v-icon small>mdi-magnify</v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Delivery address + meta -->
      <div class="po-section grey lighten-5">
        <v-row no-gutters>
          <v-col cols="12" md="2"><div class="po-label red--text">Delivery Address<span class="ml-1">*</span></div></v-col>
          <v-col cols="12" md="6">
            <div v-if="deliveryName" class="po-address-card">
              <div class="font-weight-medium mb-1">{{ deliveryName }}</div>
              <div v-for="(l, i) in deliveryLines" :key="i" class="text-caption grey--text text--darken-1">{{ l }}</div>
            </div>
            <a class="po-link mt-2 d-inline-block">Change destination to deliver</a>
          </v-col>
        </v-row>

        <v-row no-gutters class="mt-4">
          <v-col cols="12" md="2"><div class="po-label red--text">Purchase Order#<span class="ml-1">*</span></div></v-col>
          <v-col cols="12" md="4"><v-text-field :value="poNumber" dense outlined hide-details readonly /></v-col>
        </v-row>
        <v-row no-gutters class="mt-3">
          <v-col cols="12" md="2"><div class="po-label">Reference#</div></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="form.reference" placeholder="Auto-generated if blank" dense outlined hide-details /></v-col>
        </v-row>
        <v-row no-gutters class="mt-3">
          <v-col cols="12" md="2"><div class="po-label">Date</div></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="form.order_date" type="date" dense outlined hide-details /></v-col>
        </v-row>
        <v-row no-gutters class="mt-3">
          <v-col cols="12" md="2"><div class="po-label">Delivery Date</div></v-col>
          <v-col cols="12" md="4"><v-text-field v-model="form.expected_date" type="date" placeholder="dd MMM yyyy" dense outlined hide-details /></v-col>
          <v-col cols="12" md="2" class="d-flex align-center pl-md-6"><div class="po-label">Payment Terms</div></v-col>
          <v-col cols="12" md="4"><v-autocomplete v-model="form.payment_terms" :items="paymentTerms" dense outlined hide-details clearable /></v-col>
        </v-row>
        <v-row no-gutters class="mt-3">
          <v-col cols="12" md="2"><div class="po-label">Shipment Preference</div></v-col>
          <v-col cols="12" md="4">
            <v-combobox v-model="form.shipment_preference" :items="shipmentOptions" placeholder="Choose the shipment preference" dense outlined hide-details clearable />
          </v-col>
        </v-row>
      </div>

      <!-- Item table -->
      <div class="po-section">
        <div class="d-flex align-center mb-2">
          <span class="font-weight-medium">Item Table</span>
        </div>

        <v-simple-table dense class="inv-lines po-items">
          <thead>
            <tr>
              <th style="width: 38%">ITEM DETAILS</th>
              <th style="width: 13%" class="text-right">QUANTITY</th>
              <th style="width: 15%" class="text-right">RATE</th>
              <th style="width: 16%">TAX</th>
              <th style="width: 14%" class="text-right">AMOUNT</th>
              <th style="width: 40px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(line, i) in form.items" :key="i">
              <td>
                <div class="d-flex align-center">
                  <v-avatar tile size="36" class="mr-2 po-thumb">
                    <img v-if="productOf(line) && productOf(line).display_image" :src="productOf(line).display_image" alt="item" />
                    <v-icon v-else small color="grey lighten-1">mdi-image-outline</v-icon>
                  </v-avatar>
                  <v-autocomplete
                    v-model="line.product_id"
                    :items="products"
                    item-text="name"
                    item-value="id"
                    placeholder="Type or click to select an item"
                    dense outlined hide-details
                    @change="onSelectItem(line)"
                  >
                    <template #item="{ item }">
                      <v-list-item-content>
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                        <v-list-item-subtitle v-if="item.sku">SKU: {{ item.sku }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </template>
                  </v-autocomplete>
                </div>
              </td>
              <td><v-text-field v-model.number="line.qty_ordered" type="number" min="1" dense outlined hide-details reverse /></td>
              <td><v-text-field v-model.number="line.unit_cost" type="number" min="0" dense outlined hide-details reverse /></td>
              <td>
                <v-autocomplete
                  v-model="line.tax_name"
                  :items="taxOptions"
                  item-text="label"
                  item-value="name"
                  placeholder="Select a Tax"
                  dense outlined hide-details clearable
                  @change="onTax(line)"
                />
              </td>
              <td class="text-right pr-3 font-weight-medium">{{ money(lineAmount(line)) }}</td>
              <td class="text-center"><v-icon small color="red lighten-1" @click="removeLine(i)">mdi-close</v-icon></td>
            </tr>
            <tr v-if="!form.items.length">
              <td colspan="6" class="text-center grey--text py-4">No items yet. Add a row below.</td>
            </tr>
          </tbody>
        </v-simple-table>

        <div class="mt-2">
          <v-btn text small color="primary" @click="addLine"><v-icon left small>mdi-plus</v-icon> Add New Row</v-btn>
        </div>

        <!-- notes + totals -->
        <v-row class="mt-6">
          <v-col cols="12" md="6">
            <div class="po-label">Notes</div>
            <v-textarea v-model="form.notes" rows="3" dense outlined hide-details placeholder="Will be displayed on purchase order" />
          </v-col>
          <v-col cols="12" md="6">
            <v-card outlined class="pa-4 grey lighten-5">
              <div class="d-flex justify-space-between mb-2">
                <span>Sub Total</span><span class="font-weight-medium">{{ money(subTotal) }}</span>
              </div>
              <div class="d-flex align-center justify-space-between mb-2">
                <span>Discount</span>
                <div class="d-flex align-center" style="max-width: 220px">
                  <v-text-field v-model.number="form.discount" type="number" min="0" dense outlined hide-details style="width: 90px" reverse />
                  <v-autocomplete v-model="form.discount_type" :items="[{text:'%',value:'percentage'},{text:'AED',value:'amount'}]" dense outlined hide-details style="width: 80px" class="ml-2" />
                </div>
              </div>
              <div class="d-flex justify-space-between text-caption grey--text mb-2">
                <span></span><span>- {{ money(discountAmount) }}</span>
              </div>
              <div v-if="taxTotal > 0" class="d-flex justify-space-between mb-2">
                <span>Tax ({{ form.tax_mode === 'inclusive' ? 'Inclusive' : 'Exclusive' }})</span><span>{{ money(taxTotal) }}</span>
              </div>
              <v-divider class="my-2"></v-divider>
              <div class="d-flex justify-space-between text-h6"><span>Total</span><span>{{ money(total) }}</span></div>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Terms + attachments -->
      <div class="po-section grey lighten-5">
        <v-row>
          <v-col cols="12" md="7">
            <div class="po-label">Terms &amp; Conditions</div>
            <v-textarea v-model="form.terms" rows="4" dense outlined hide-details placeholder="Enter the terms and conditions of your business to be displayed in your transaction" />
          </v-col>
          <v-col cols="12" md="5">
            <div class="po-label">Attach File(s) to Purchase Order</div>
            <input ref="fileInput" type="file" multiple class="d-none" @change="onFilesPicked" />
            <div class="po-upload" @click="$refs.fileInput.click()">
              <v-icon small color="primary" class="mr-2">mdi-tray-arrow-up</v-icon>
              <span class="primary--text font-weight-medium">Upload File</span>
            </div>
            <div class="text-caption grey--text mt-1">You can upload a maximum of 10 files, 10MB each</div>

            <div v-if="newFiles.length || existingAttachments.length" class="mt-3 po-file-list">
              <div v-for="a in existingAttachments" :key="'e' + a.id" class="po-file-row">
                <v-icon x-small class="mr-2 grey--text">mdi-file-outline</v-icon>
                <a :href="a.url" target="_blank" class="po-link text-truncate">{{ a.original_name }}</a>
                <v-spacer></v-spacer>
                <v-icon x-small color="grey" @click.stop="deleteAttachment(a)">mdi-close</v-icon>
              </div>
              <div v-for="(f, i) in newFiles" :key="'n' + i" class="po-file-row">
                <v-icon x-small class="mr-2 grey--text">mdi-file-outline</v-icon>
                <span class="text-truncate">{{ f.name }}</span>
                <v-spacer></v-spacer>
                <v-icon x-small color="grey" @click.stop="removeFile(i)">mdi-close</v-icon>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>

      <div v-if="error" class="red--text px-6 pb-2">{{ error }}</div>
    </v-card-text>

    <!-- Footer actions -->
    <div class="d-flex align-center px-6 py-3 po-footer">
      <v-btn small depressed :loading="saving === 'draft'" @click="submit('draft')">Save as Draft</v-btn>
      <v-btn small depressed color="primary" class="ml-2" :loading="saving === 'pending'" @click="submit('pending')">{{ isEdit ? "Save" : "Save and Send" }}</v-btn>
      <v-btn small text class="ml-2" @click="goBack">Cancel</v-btn>
      <v-spacer></v-spacer>
      <span class="text-caption grey--text">PDF Template: <b>Standard Template</b></span>
    </div>
  </v-card>
</template>

<script>
export default {
  props: ["id"],
  data: () => ({
    saving: null, // 'draft' | 'pending' | null
    error: null,
    products: [],
    vendors: [],
    warehouses: [],
    paymentTerms: ["Due on Receipt", "Net 15", "Net 30", "Net 45", "Net 60"],
    shipmentOptions: ["Road", "Air", "Sea", "Courier", "Pickup"],
    taxOptions: [
      { label: "Standard Rate (5%)", name: "VAT 5%", rate: 5 },
      { label: "Zero Rate (0%)", name: "VAT 0%", rate: 0 },
      { label: "Exempt", name: "Exempt", rate: 0 },
      { label: "Non-Taxable", name: "Non-Taxable", rate: 0 },
    ],
    poNumber: "Auto-generated",
    newFiles: [],
    existingAttachments: [],
    form: {
      vendor_id: null,
      delivery_type: "warehouse",
      warehouse_id: null,
      customer_id: null,
      reference: null,
      order_date: new Date().toISOString().slice(0, 10),
      expected_date: null,
      payment_terms: "Due on Receipt",
      shipment_preference: null,
      tax_mode: "exclusive",
      discount_level: "transaction",
      discount: 0,
      discount_type: "percentage",
      notes: null,
      terms: null,
      items: [],
    },
  }),

  computed: {
    isEdit() { return !!this.id; },
    subTotal() { return this.form.items.reduce((s, l) => s + this.lineNet(l), 0); },
    taxTotal() { return this.form.items.reduce((s, l) => s + this.lineTax(l), 0); },
    discountAmount() {
      const d = Number(this.form.discount) || 0;
      return this.form.discount_type === "amount" ? d : Math.round(this.subTotal * d) / 100;
    },
    total() { return Math.max(0, this.subTotal - this.discountAmount + this.taxTotal); },
    deliveryWarehouse() {
      return this.warehouses.find((w) => w.id === this.form.warehouse_id) || this.warehouses.find((w) => w.is_default) || this.warehouses[0];
    },
    deliveryName() {
      const e = this.deliveryWarehouse;
      return e ? e.name : null;
    },
    deliveryLines() {
      const e = this.deliveryWarehouse;
      if (!e) return [];
      return [
        e.address,
        [e.city, e.state].filter(Boolean).join(", "),
        e.country,
        e.phone,
        e.trn ? "TRN : " + e.trn : null,
      ].filter(Boolean);
    },
  },

  async created() {
    const [p, v, w] = await Promise.all([
      this.$axios.get("inventory-list"),
      this.$axios.get("vendor-list"),
      this.$axios.get("warehouse-list"),
    ]);
    this.products = p.data;
    this.vendors = v.data;
    this.warehouses = w.data;

    // Delivery is always the default warehouse.
    const def = this.warehouses.find((x) => x.is_default) || this.warehouses[0];
    if (def) this.form.warehouse_id = def.id;

    if (!this.isEdit) {
      try {
        const { data } = await this.$axios.get("purchase-orders-next-number");
        this.poNumber = data.number;
      } catch (e) {
        this.poNumber = "Auto-generated";
      }
    } else {
      const { data } = await this.$axios.get(`purchase-orders/${this.id}`);
      this.poNumber = data.reference_id;
      this.existingAttachments = data.attachments || [];
      this.form = {
        vendor_id: data.vendor_id,
        delivery_type: data.delivery_type || "warehouse",
        warehouse_id: data.warehouse_id,
        customer_id: data.customer_id,
        reference: data.reference,
        order_date: (data.order_date || "").slice(0, 10),
        expected_date: data.expected_date ? data.expected_date.slice(0, 10) : null,
        payment_terms: data.payment_terms,
        shipment_preference: data.shipment_preference,
        tax_mode: data.tax_mode || "exclusive",
        discount_level: data.discount_level || "transaction",
        discount: Number(data.discount) || 0,
        discount_type: data.discount_type || "percentage",
        notes: data.notes,
        terms: data.terms,
        items: (data.items || []).map((it) => ({
          product_id: it.product_id,
          qty_ordered: it.qty_ordered,
          unit_cost: Number(it.unit_cost),
          tax_name: it.tax_name,
          tax_rate: Number(it.tax_rate) || 0,
        })),
      };
    }
    if (!this.form.items.length) this.addLine();
  },

  methods: {
    money(v) { return this.$utils ? this.$utils.currency_format(v || 0, "AED", false) : Number(v || 0).toFixed(2); },
    productOf(line) { return this.products.find((p) => p.id === line.product_id); },
    lineAmount(line) { return (Number(line.qty_ordered) || 0) * (Number(line.unit_cost) || 0); },
    lineNet(line) {
      const gross = this.lineAmount(line);
      const rate = Number(line.tax_rate) || 0;
      if (rate <= 0) return gross;
      return this.form.tax_mode === "inclusive" ? gross / (1 + rate / 100) : gross;
    },
    lineTax(line) {
      const gross = this.lineAmount(line);
      const rate = Number(line.tax_rate) || 0;
      if (rate <= 0) return 0;
      return this.form.tax_mode === "inclusive" ? gross - gross / (1 + rate / 100) : (gross * rate) / 100;
    },
    addLine() { this.form.items.push({ product_id: null, qty_ordered: 1, unit_cost: 0, tax_name: null, tax_rate: 0 }); },
    removeLine(i) { this.form.items.splice(i, 1); if (!this.form.items.length) this.addLine(); },
    onFilesPicked(e) {
      const picked = Array.from(e.target.files || []);
      this.newFiles = [...this.newFiles, ...picked].slice(0, 10);
      e.target.value = "";
    },
    removeFile(i) { this.newFiles.splice(i, 1); },
    onSelectItem(line) {
      const p = this.productOf(line);
      if (p && (!line.unit_cost || line.unit_cost === 0)) line.unit_cost = Number(p.unit_cost) || 0;
    },
    onTax(line) {
      const t = this.taxOptions.find((o) => o.name === line.tax_name);
      line.tax_rate = t ? t.rate : 0;
    },
    goToVendors() { this.$router.push("/inventory/vendors"); },
    goBack() { this.$router.push("/inventory/purchase-orders"); },
    async deleteAttachment(a) {
      await this.$axios.delete(`purchase-order-attachments/${a.id}`);
      this.existingAttachments = this.existingAttachments.filter((x) => x.id !== a.id);
    },
    async uploadFiles(poId) {
      if (!this.newFiles || !this.newFiles.length) return;
      const fd = new FormData();
      this.newFiles.forEach((f) => fd.append("files[]", f));
      await this.$axios.post(`purchase-orders/${poId}/attachments`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    async submit(status) {
      this.error = null;
      if (!this.form.vendor_id) { this.error = "Select a vendor."; return; }
      const items = this.form.items.filter((l) => l.product_id && l.qty_ordered > 0);
      if (!items.length) { this.error = "Add at least one item."; return; }
      this.saving = status;
      try {
        const payload = { ...this.form, status, items };
        let poId = this.id;
        if (this.isEdit) await this.$axios.put(`purchase-orders/${this.id}`, payload);
        else {
          const { data } = await this.$axios.post("purchase-orders", payload);
          poId = data.id;
        }
        await this.uploadFiles(poId);
        this.$swal && this.$swal.fire({ toast: true, position: "top-end", timer: 2000, showConfirmButton: false, icon: "success", title: status === "draft" ? "Saved as draft" : this.isEdit ? "Purchase order updated" : "Purchase order created" });
        this.goBack();
      } catch (e) {
        this.error = e?.response?.data?.message || "Failed to save";
        this.saving = null;
      }
    },
  },
};
</script>

<style scoped>
.po-form { border-radius: 12px; max-width: 1320px; margin: 16px 0 24px 16px; background: #fff; }
.po-section { padding: 20px 24px; border-bottom: 1px solid #eef1f5; }
.po-label { font-size: 13px; color: #41464b; margin-bottom: 4px; font-weight: 500; }
.po-link { color: #2a7ade; font-size: 12px; cursor: pointer; text-decoration: none; }
.po-link:hover { text-decoration: underline; }
.po-search-btn { min-width: 40px !important; height: 40px; padding: 0 !important; }
.po-address-card { background: #f1f4f8; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; max-width: 420px; }
.po-items >>> th { background: #f7f9fc !important; color: #6b7a90 !important; font-size: 11px !important; letter-spacing: 0.4px; border-bottom: 1px solid #eef1f5 !important; }
.po-items >>> td { border-bottom: 1px solid #f4f6f9 !important; vertical-align: middle; padding-top: 6px !important; padding-bottom: 6px !important; }
.po-thumb { border: 1px solid #eef1f5; border-radius: 6px; background: #fafbfc; flex: 0 0 36px; }
.po-thumb img { object-fit: contain; }
.po-upload { display: flex; align-items: center; justify-content: center; border: 1px dashed #b9c6d6; border-radius: 6px; background: #fff; padding: 11px 14px; cursor: pointer; transition: background 0.15s, border-color 0.15s; }
.po-upload:hover { background: #f5f9ff; border-color: #2a7ade; }
.po-file-list { border: 1px solid #eef1f5; border-radius: 6px; overflow: hidden; max-width: 420px; }
.po-file-row { display: flex; align-items: center; padding: 7px 12px; font-size: 12px; border-bottom: 1px solid #f4f6f9; }
.po-file-row:last-child { border-bottom: none; }
.po-footer { border-top: 1px solid #eef1f5; position: sticky; bottom: 0; background: #fff; z-index: 2; }
</style>
