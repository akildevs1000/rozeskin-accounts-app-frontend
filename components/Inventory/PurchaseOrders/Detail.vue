<template>
  <v-card flat class="po-detail mx-auto" :loading="loading">
    <!-- Receive dialog -->
    <v-dialog v-model="receiveDialog" width="820" persistent content-class="inv-dialog">
      <v-card>
        <div class="inv-dialog__header">
          <v-icon small>mdi-truck-check-outline</v-icon> Receive Goods — {{ po.reference_id }}
          <span class="inv-dialog__hint">stock increases on save</span>
        </div>
        <v-card-text class="pt-4">
          <v-text-field v-model="receiveDate" type="date" label="Received Date" dense outlined hide-details style="max-width: 240px" class="mb-3" />
          <v-simple-table dense class="inv-lines">
            <thead>
              <tr><th style="width:46%">Item</th><th class="text-center" style="width:22%">Ordered / Pending</th><th style="width:16%">Qty Received</th><th style="width:16%">Unit Cost</th></tr>
            </thead>
            <tbody>
              <tr v-for="(l, i) in receiveLines" :key="i">
                <td>{{ l.product_name }}</td>
                <td class="text-center grey--text">{{ l.qty_ordered }} / {{ l.pending }}</td>
                <td><v-text-field v-model.number="l.qty_received" type="number" min="0" dense outlined hide-details /></td>
                <td><v-text-field v-model.number="l.unit_cost" type="number" min="0" dense outlined hide-details /></td>
              </tr>
              <tr v-if="!receiveLines.length"><td colspan="4" class="text-center grey--text">Nothing left to receive.</td></tr>
            </tbody>
          </v-simple-table>
          <div class="d-flex align-center mt-4">
            <v-spacer></v-spacer>
            <span v-if="receiveError" class="red--text mr-3">{{ receiveError }}</span>
            <AssetsButton :options="{ label: 'Cancel', color: 'red' }" @click="receiveDialog = false" />
            &nbsp;
            <AssetsButton :options="{ label: 'Receive Goods', color: 'green' }" @click="submitReceive" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Toolbar -->
    <v-alert class="primary po-toolbar mb-0" flat tile dense dark>
      <div class="d-flex align-center">
        <v-icon dark class="po-back mr-2" @click="$router.push('/inventory/purchase-orders')">mdi-arrow-left</v-icon>
        <span class="font-weight-medium">{{ po.reference_id }}</span>
        <v-spacer></v-spacer>

        <span v-if="canEdit" class="po-act" @click="goEdit">
          Edit <v-icon small>mdi-pencil</v-icon>
        </span>

        <span v-if="canReceive" class="po-act ml-5" @click="openReceive">
          Receive <v-icon small>mdi-truck-check-outline</v-icon>
        </span>

        <span class="po-act ml-5" :class="{ 'po-act--busy': deleting }" @click="confirmDelete">
          Delete <v-icon small>mdi-delete-outline</v-icon>
        </span>

        <v-menu bottom left offset-y>
          <template v-slot:activator="{ on, attrs }">
            <span class="po-act ml-5" :class="{ 'po-act--busy': printing }" v-bind="attrs" v-on="on">
              Print/PDF <v-icon small>mdi-chevron-down</v-icon>
            </span>
          </template>
          <v-list width="140" dense>
            <v-list-item style="cursor: pointer" @click="printView">
              <v-list-item-title><v-icon color="primary" small class="mr-1">mdi-printer</v-icon>Print</v-list-item-title>
            </v-list-item>
            <v-list-item style="cursor: pointer" @click="printDownload">
              <v-list-item-title><v-icon color="primary" small class="mr-1">mdi-file</v-icon>PDF</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-alert>

    <!-- Document -->
    <v-card-text v-if="po.id" class="pa-0">
      <div id="po-doc" class="po-doc px-8 py-8">
        <div class="po-doc-grid">
          <!-- left: title, status, meta -->
          <div class="po-left">
            <div class="po-doc-title">PURCHASE ORDER</div>
            <div class="text-body-2 mb-5">Purchase Order# <b>{{ po.reference_id }}</b></div>

            <div class="po-h">STATUS</div>
            <div class="po-status mt-1">
              <div class="po-status__row">
                <span class="po-status__label">Order</span>
                <v-chip x-small dark :color="statusColor(po.status)">{{ labelize(po.status) }}</v-chip>
              </div>
              <div class="po-status__row">
                <span class="po-status__label">Receive</span>
                <span :class="receiveColor + ' font-weight-medium'">{{ receiveText }}</span>
              </div>
              <div class="po-status__row">
                <span class="po-status__label">Bill</span>
                <span class="grey--text">Not Billed</span>
              </div>
            </div>

            <div class="po-meta mt-5">
              <div><span class="po-h">REFERENCE#</span><span>{{ po.reference || "—" }}</span></div>
              <div><span class="po-h">ORDER DATE</span><span>{{ fmt(po.order_date) }}</span></div>
              <div><span class="po-h">DELIVERY DATE</span><span>{{ po.expected_date ? fmt(po.expected_date) : "—" }}</span></div>
              <div><span class="po-h">PAYMENT TERMS</span><span>{{ po.payment_terms || "—" }}</span></div>
            </div>
          </div>

          <!-- right: addresses -->
          <div class="po-right">
            <div class="po-h">VENDOR ADDRESS</div>
            <div class="primary--text font-weight-medium">{{ po.vendor_name }}</div>
            <div v-for="(l, i) in vendorLines" :key="i" class="text-caption grey--text">{{ l }}</div>
            <div v-if="vendorContact" class="text-caption grey--text">{{ vendorContact }}</div>

            <div class="po-h mt-5">DELIVERY ADDRESS</div>
            <div class="font-weight-medium">{{ deliveryName }}</div>
            <div v-for="(l, i) in deliveryLines" :key="'c' + i" class="text-caption grey--text">{{ l }}</div>
            <div v-if="po.shipment_preference" class="text-caption grey--text mt-1">Shipment: {{ po.shipment_preference }}</div>
          </div>
        </div>

        <!-- items -->
        <table class="po-doc-table mt-8">
          <thead>
            <tr>
              <th>ITEMS &amp; DESCRIPTION</th>
              <th class="text-center">ORDERED</th>
              <th>WAREHOUSE NAME</th>
              <th>STATUS</th>
              <th class="text-right">RATE</th>
              <th class="text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in po.items" :key="line.id">
              <td>
                <div class="d-flex">
                  <v-avatar tile size="42" class="mr-3 po-thumb">
                    <img v-if="line.product && line.product.display_image" :src="line.product.display_image" alt="item" />
                    <v-icon v-else color="grey lighten-1">mdi-image-outline</v-icon>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium primary--text">{{ line.product ? line.product.name : "#" + line.product_id }}</div>
                    <div class="text-caption grey--text">{{ line.product ? line.product.sku : "" }}</div>
                  </div>
                </div>
              </td>
              <td class="text-center">{{ line.qty_ordered }}<div class="text-caption grey--text">PCS</div></td>
              <td class="text-caption">{{ warehouseLabel }}</td>
              <td>
                <span :class="line.qty_received >= line.qty_ordered ? 'green--text' : 'orange--text'">
                  {{ line.qty_received }} Received
                </span>
              </td>
              <td class="text-right">{{ money(line.unit_cost) }}</td>
              <td class="text-right">{{ money(line.qty_ordered * line.unit_cost) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- totals -->
        <div class="d-flex justify-end mt-8">
          <div class="po-totals">
            <div class="d-flex justify-space-between">
              <span class="font-weight-medium">Sub Total</span>
              <span class="font-weight-medium">{{ money(po.sub_total) }}</span>
            </div>
            <div class="text-caption grey--text mb-3">Total Quantity: {{ totalQty }}</div>
            <div class="d-flex justify-space-between mb-2 grey--text">
              <span>Discount</span><span>{{ money(discountAmount) }}</span>
            </div>
            <div v-if="Number(po.tax_total) > 0" class="d-flex justify-space-between mb-2 grey--text">
              <span>Tax ({{ po.tax_mode === 'inclusive' ? 'Inclusive' : 'Exclusive' }})</span><span>{{ money(po.tax_total) }}</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="d-flex justify-space-between text-h6"><span>Total</span><span>{{ money(po.total) }}</span></div>
          </div>
        </div>

        <div v-if="po.notes || po.terms" class="mt-8">
          <template v-if="po.notes"><div class="po-h">NOTES</div><div class="mb-3">{{ po.notes }}</div></template>
          <template v-if="po.terms"><div class="po-h">TERMS &amp; CONDITIONS</div><div>{{ po.terms }}</div></template>
        </div>

        <div v-if="(po.attachments || []).length" class="mt-8">
          <div class="po-h">ATTACHMENTS</div>
          <div v-for="a in po.attachments" :key="a.id" class="text-body-2">
            <v-icon x-small class="mr-1">mdi-file-outline</v-icon>
            <a :href="a.url" target="_blank">{{ a.original_name }}</a>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default {
  props: ["id"],
  data: () => ({
    loading: false,
    printing: false,
    deleting: false,
    po: {},
    receiveDialog: false,
    receiveError: null,
    receiveDate: new Date().toISOString().slice(0, 10),
    receiveLines: [],
    company: {
      name: "Roze Skincare LLC",
      lines: [
        "Khalid bin Waleed Road, Dubai",
        "United Arab Emirates · P.O.Box : 83481",
        "+971 4 3939 562 / +971 55 330 3991",
        "TRN : 100391417100003",
      ],
    },
  }),

  computed: {
    canEdit() { return this.po.status !== "cancelled"; },
    canReceive() { return ["pending", "partially_received"].includes(this.po.status); },
    hasReceipts() { return (Number(this.po.received_qty) || 0) > 0; },
    deliveryEntity() {
      return this.po.delivery_type === "customer" ? this.po.customer : this.po.warehouse;
    },
    deliveryName() {
      const e = this.deliveryEntity;
      if (!e) return this.company.name;
      return e.name || e.customer_with_phone || e.first_name || this.company.name;
    },
    deliveryLines() {
      const e = this.deliveryEntity;
      if (!e) return this.company.lines;
      return [
        e.address,
        [e.city, e.state].filter(Boolean).join(", "),
        e.country,
        e.phone || e.mobile || e.work_phone,
        e.trn ? "TRN : " + e.trn : null,
      ].filter(Boolean);
    },
    warehouseLabel() {
      return (this.po.warehouse && this.po.warehouse.name) || this.company.name;
    },
    discountAmount() {
      const d = Number(this.po.discount) || 0;
      return this.po.discount_type === "amount" ? d : Math.round((Number(this.po.sub_total) || 0) * d) / 100;
    },
    totalQty() { return (this.po.items || []).reduce((s, l) => s + (Number(l.qty_ordered) || 0), 0); },
    receiveText() {
      if (this.po.status === "received") return "Received";
      if (this.po.status === "partially_received") return `${this.po.received_qty} / ${this.po.ordered_qty} Received`;
      if (this.po.status === "cancelled") return "Cancelled";
      return "Pending";
    },
    receiveColor() {
      return { received: "green--text", partially_received: "blue--text", cancelled: "red--text" }[this.po.status] || "orange--text";
    },
    vendorLines() {
      const v = this.po.vendor || {};
      return [v.address, [v.city, v.state].filter(Boolean).join(", "), v.zip_code, v.country].filter(Boolean);
    },
    vendorContact() {
      const v = this.po.vendor || {};
      return [v.mobile || v.work_phone, v.email].filter(Boolean).join(" · ");
    },
  },

  created() { this.load(); },

  watch: { id() { this.load(); } },

  methods: {
    money(v) { return this.$utils ? this.$utils.currency_format(v || 0, "AED", false) : Number(v || 0).toFixed(2); },
    fmt(d) { return this.$dateFormat ? this.$dateFormat.dmy(d) : d; },
    labelize(s) { return (s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); },
    statusColor(s) { return { pending: "orange", partially_received: "blue", received: "green", cancelled: "red" }[s] || "grey"; },
    capturePdf() {
      const el = document.getElementById("po-doc");
      if (!el) return Promise.reject(new Error("Nothing to print"));
      this.printing = true;
      return html2canvas(el, { scale: 2, useCORS: true, logging: false })
        .then((canvas) => {
          const pdf = new jsPDF("p", "mm", "a4");
          const imgWidth = 210;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);
          return pdf;
        })
        .finally(() => { this.printing = false; });
    },
    printView() {
      this.capturePdf().then((pdf) => window.open(URL.createObjectURL(pdf.output("blob")), "_blank")).catch(() => {});
    },
    printDownload() {
      this.capturePdf().then((pdf) => pdf.save(`${this.po.reference_id || "purchase-order"}.pdf`)).catch(() => {});
    },
    async load() {
      this.loading = true;
      try {
        const { data } = await this.$axios.get(`purchase-orders/${this.id}`);
        this.po = data;
      } finally { this.loading = false; }
    },
    async goEdit() {
      // Editing a (partially) received PO reverses the received stock first.
      if (this.hasReceipts && this.$swal) {
        const { isConfirmed } = await this.$swal.fire({
          icon: "warning",
          title: "Edit received PO?",
          html: "This PO already has received goods. Editing it will <b>reverse that stock</b> and reset the PO to pending. Continue?",
          showCancelButton: true,
          confirmButtonText: "Edit anyway",
          confirmButtonColor: "#1976d2",
        });
        if (!isConfirmed) return;
      }
      this.$router.push(`/inventory/purchase-orders/${this.id}/edit`);
    },
    async confirmDelete() {
      if (this.deleting) return;
      const warn = this.hasReceipts
        ? "This PO has received goods. Deleting it will <b>reverse that stock</b> and remove its goods receipts. "
        : "";
      if (this.$swal) {
        const { isConfirmed } = await this.$swal.fire({
          icon: "warning",
          title: "Delete this purchase order?",
          html: warn + "This action cannot be undone.",
          showCancelButton: true,
          confirmButtonText: "Delete",
          confirmButtonColor: "#d32f2f",
        });
        if (!isConfirmed) return;
      } else if (!confirm("Delete this purchase order?")) {
        return;
      }
      await this.deletePo();
    },
    async deletePo() {
      this.deleting = true;
      try {
        await this.$axios.delete(`purchase-orders/${this.id}`);
        this.$swal && this.$swal.fire({ toast: true, position: "top-end", timer: 2000, showConfirmButton: false, icon: "success", title: "Purchase order deleted" });
        this.$router.push("/inventory/purchase-orders");
      } catch (e) {
        const msg = e?.response?.data?.message || "Failed to delete";
        this.$swal ? this.$swal.fire({ icon: "error", title: "Delete failed", text: msg }) : alert(msg);
      } finally { this.deleting = false; }
    },
    openReceive() {
      this.receiveLines = (this.po.items || [])
        .filter((it) => (it.pending_qty || 0) > 0)
        .map((it) => ({
          product_id: it.product_id,
          purchase_order_item_id: it.id,
          product_name: it.product ? it.product.name : "#" + it.product_id,
          qty_ordered: it.qty_ordered,
          pending: it.pending_qty,
          qty_received: it.pending_qty,
          unit_cost: Number(it.unit_cost),
        }));
      this.receiveDate = new Date().toISOString().slice(0, 10);
      this.receiveError = null;
      this.receiveDialog = true;
    },
    async submitReceive() {
      this.receiveError = null;
      if (this.receiveLines.some((l) => l.qty_received > l.pending)) { this.receiveError = "Quantity received cannot exceed pending."; return; }
      const items = this.receiveLines.filter((l) => l.qty_received > 0).map((l) => ({
        product_id: l.product_id, purchase_order_item_id: l.purchase_order_item_id, qty_received: l.qty_received, unit_cost: l.unit_cost,
      }));
      if (!items.length) { this.receiveError = "Enter at least one quantity to receive."; return; }
      try {
        await this.$axios.post("goods-receipts", { purchase_order_id: this.po.id, received_date: this.receiveDate, items });
        this.receiveDialog = false;
        this.$swal && this.$swal.fire({ toast: true, position: "top-end", timer: 2000, showConfirmButton: false, icon: "success", title: "Goods received — stock updated" });
        this.load();
      } catch (e) {
        this.receiveError = e?.response?.data?.message || "Failed to receive";
      }
    },
  },
};
</script>

<style scoped>
.po-detail { border-radius: 12px; max-width: 1140px; }
/* Blue action bar (matches the invoice toolbar). */
.po-toolbar { margin-bottom: 16px !important; box-shadow: 0 4px 10px rgba(25, 118, 210, 0.25) !important; }
.po-toolbar >>> .v-alert__content { width: 100%; }
.po-back { cursor: pointer; border-radius: 50%; transition: background 0.15s; }
.po-back:hover { background: rgba(255, 255, 255, 0.18); }
.po-act { font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; }
.po-act .v-icon { margin-left: 2px; }
.po-act:hover { font-weight: 700; }
.po-act--busy { opacity: 0.6; pointer-events: none; }
/* Center the document sheet within the detail pane (like the invoice page). */
.po-doc { max-width: 840px; margin: 0 auto; }
.po-doc-title { font-size: 22px; font-weight: 700; letter-spacing: 1.5px; color: #2a2f37; }
.po-h { font-size: 11px; color: #8a96a6; letter-spacing: 0.5px; margin-bottom: 2px; }
.po-doc-grid { display: flex; justify-content: space-between; gap: 40px; }
.po-left { flex: 1 1 auto; min-width: 0; }
.po-right { width: 290px; flex: 0 0 290px; }
.po-meta > div { display: flex; padding: 3px 0; }
.po-meta .po-h { width: 140px; flex: 0 0 140px; margin-bottom: 0; line-height: 20px; }
.po-status__row { display: flex; align-items: center; padding: 4px 0; }
.po-status__label { width: 90px; flex: 0 0 90px; color: #5b6776; font-size: 13px; }
.po-doc-table { width: 100%; border-collapse: collapse; }
.po-doc-table thead th { background: #f4f6f9; color: #6b7a90; font-size: 11px; letter-spacing: 0.4px; text-align: left; padding: 10px 12px; font-weight: 700; }
.po-doc-table thead th.text-right { text-align: right; }
.po-doc-table thead th.text-center { text-align: center; }
.po-doc-table tbody td { padding: 14px 12px; border-bottom: 1px solid #f0f4f8; vertical-align: top; }
.po-totals { width: 300px; }
.po-thumb { border: 1px solid #eef1f5; border-radius: 6px; background: #fafbfc; }
.po-thumb img { object-fit: contain; }
</style>
