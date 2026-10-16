<template>
  <span>
    <!-- <v-row>
      <v-col cols="3" v-for="(stat, index) in stats" :key="index">
        <v-card outlined>
          <v-card-text>
            <div class="d-flex justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-medium mb-2">
                  {{ stat.label }}
                </div>
                <div
                  class="font-weight"
                  :class="`${stat.color}--text`"
                  style="font-size: 18px"
                >
                  {{ stat.value }}
                </div>
              </div>
              <div>
                <v-btn fab :class="stat.color" text small
                  ><v-icon color="white">{{ stat.icon }}</v-icon></v-btn
                >
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row> -->
    <v-row>
      <v-col>
        <v-card>
          <v-container fluid>
            <v-row>
              <v-col cols="1">Orders</v-col>
              <v-col>
                <v-text-field
                  class=""
                  label="Search..."
                  dense
                  outlined
                  flat
                  v-model="filters.search"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col>
                <v-autocomplete
                  v-model="filters.customer_id"
                  :items="customer_list"
                  item-text="customer_with_phone"
                  item-value="id"
                  label="Customers"
                  outlined
                  dense
                  hide-details
                ></v-autocomplete>
              </v-col>
              <v-col>
                <v-autocomplete
                  :items="statusList"
                  item-text="name"
                  item-value="id"
                  label="Status"
                  dense
                  outlined
                  flat
                  v-model="filters.order_status"
                  hide-details
                ></v-autocomplete>
              </v-col>
              <v-col>
                <v-autocomplete
                  v-model="filters.business_source_id"
                  :items="business_sources"
                  item-text="name"
                  item-value="id"
                  label="Business Source"
                  outlined
                  dense
                  hide-details
                ></v-autocomplete>
              </v-col>
              <v-col>
                <v-autocomplete
                  v-model="filters.delivery_service_id"
                  :items="delivery_services"
                  item-text="name"
                  item-value="id"
                  label="Deliver Service"
                  outlined
                  dense
                  hide-details
                ></v-autocomplete>
              </v-col>
              <v-col>
                <v-autocomplete
                  v-model="filters.payment_method"
                  :items="payment_modes"
                  item-text="name"
                  item-value="id"
                  label="Payment Mode"
                  outlined
                  dense
                  hide-details
                ></v-autocomplete>
              </v-col>
              <v-col cols="2">
                <FiltersDateRange
                  @filter-attr="
                    ({ from, to }) => {
                      filters['from'] = from;
                      filters['to'] = to;
                    }
                  "
                />
              </v-col>
              <v-col
                ><v-btn
                  :loading="loading"
                  block
                  small
                  class="primary"
                  @click="getDataFromApi"
                  >Submit</v-btn
                ></v-col
              >
            </v-row>
          </v-container>
        </v-card>
        <v-card class="mt-5">
          <v-data-table
            dense
            :headers="headers"
            :items="items"
            :loading="loading"
            :options.sync="options"
            :footer-props="{
              itemsPerPageOptions: [10, 30, 50, 100],
              showFirstLastPage: true,
              itemsPerPageText: 'Rows per page',
              pageText: `{0}-{1} of {2}`,
            }"
            :server-items-length="totalItems"
            class="elevation-1 pa-3"
          >
            <template v-slot:top>
              <v-toolbar flat dense class="mb-5">
                <v-btn
                  small
                  color="red darken-1"
                  dark
                  :loading="pdfLoading"
                  @click="downloadOrdersPdf"
                >
                  <v-icon size="15" left>mdi-file-pdf-box</v-icon> PDF
                </v-btn>
                <v-spacer></v-spacer>
                <OrderCreate
                  :model="Model"
                  :endpoint="endpoint"
                  @response="getDataFromApi"
                />
              </v-toolbar>
            </template>

            <template v-slot:item.payment="{ item }">
              <div>
                {{ item.payment_method }}
              </div>
              <div>
                {{ item.payment_method_title }}
              </div>
            </template>

            <template v-slot:item.invoice="{ item }">
              <div>
                {{ item?.invoice?.reference_id || "Pending" }}
              </div>
              <div v-if="item?.invoice?.reference_id">
                {{ item?.invoice?.date_time }}
              </div>
            </template>

            <template v-slot:item.special_instructions="{ item }">
              <div>
                {{
                  item?.special_instructions &&
                  item.special_instructions.length > 30
                    ? item.special_instructions.slice(0, 30) + "..."
                    : item?.special_instructions
                }}
              </div>
            </template>

            <template v-slot:item.order_status="{ item }">
              <v-btn
                dark
                text
                :class="getStatusClass(item)"
                x-small
                class="ma-1"
              >
                {{ getStatusText(item) }}
              </v-btn>
            </template>

            <template v-slot:item.options="{ item }">
              <v-menu bottom left>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <v-list dense>
                  <!-- <v-list-item>
                    <v-list-item-title>
                      <OrderBillSlip :key="invoiceCompKey" :model="Model" :item="item" />
                    </v-list-item-title>
                  </v-list-item> -->
                  <v-list-item>
                    <v-list-item-title>
                      <OrderEdit
                        :key="`${item.id}-${item.order_status}-${invoiceCompKey}`"
                        :model="Model"
                        :endpoint="endpoint"
                        :item="item"
                        @response="
                          () => {
                            invoiceCompKey++;
                            getDataFromApi();
                          }
                        "
                      />
                    </v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-title>
                      <OrderInvoice
                        :key="invoiceCompKey"
                        :model="Model"
                        :endpoint="endpoint"
                        :item="item"
                        @response="getDataFromApi"
                      />
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>
                      <OrderReturn
                        :key="invoiceCompKey"
                        :model="Model"
                        :endpoint="endpoint"
                        :item="item"
                        @response="
                          () => {
                            invoiceCompKey++;
                            getDataFromApi();
                          }
                        "
                      />
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-if="
                      ['completed', 'cancelled'].includes(item.order_status)
                    "
                  >
                    <v-list-item-title>
                      <OrderRevertToProcessing
                        :key="invoiceCompKey"
                        :model="Model"
                        :endpoint="endpoint"
                        :item="item"
                        @response="
                          () => {
                            invoiceCompKey++;
                            getDataFromApi();
                          }
                        "
                      />
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>
                      <OrderCancel
                        :model="Model"
                        :endpoint="endpoint"
                        :order_id="item.order_id"
                        :invoice_id="item?.invoice?.id || null"
                        @response="
                          () => {
                            invoiceCompKey++;
                            getDataFromApi();
                          }
                        "
                      />
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>
                      <OrderDelete
                        :id="item.id"
                        :endpoint="endpoint"
                        @response="getDataFromApi"
                      />
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </span>
</template>

<script>
export default {
  data: () => ({
    stats: [],
    invoiceCompKey: 1,
    Model: "Orders",
    endpoint: "orders",
    pdfLoading: false,
    filters: {
      search: null,
      status: null,
      order_status: null,
      business_source_id: null,
      delivery_service_id: null,
      customer_id: null,
      payment_method: null,
      from: null,
      to: null,
    },
    options: {
      page: 1,
      itemsPerPage: 10,
      sortBy: [],
      sortDesc: [],
      groupBy: [],
      groupDesc: [],
      multiSort: false,
      mustSort: false,
    },
    loading: false,
    response: "",
    items: [],
    statusList: [],
    errors: [],
    headers: [
      {
        text: "Order Ref",
        value: "order_id",
      },
      {
        text: "Tracking Id",
        value: "tracking_number",
      },
      {
        text: "Customer",
        value: "customer.full_name",
      },
      {
        text: "Date Time",
        value: "date_time",
      },

      {
        text: "Payment",
        value: "payment",
      },

      {
        text: "Business Source",
        value: "business_source.name",
      },
      {
        text: "Delivery Service",
        value: "delivery_service.name",
      },
      {
        text: "Shipping Charges",
        value: "shipping_charges",
      },
      {
        text: "Discount",
        value: "discount",
      },
      {
        text: "Total",
        value: "total",
      },
      {
        text: "Invoice",
        value: "invoice",
      },
      {
        text: "Status",
        value: "order_status",
      },
      {
        text: "Action",
        align: "center",
        sortable: false,
        value: "options",
      },
    ],
    componentKey: 1,
    customer_list: [],
    payment_modes: [],
    business_sources: [],
    delivery_services: [],
    totalItems: 0,
  }),

  async created() {
    // await this.getStats();

    let { data: payment_modes } = await this.$axios.get(`payment-mode-list`);

    this.customer_list = await this.$axios.$get(`customer-list`);

    let result = payment_modes.map((e) => ({
      id: e.name,
      name: e.name,
    }));
    this.payment_modes = [{ id: null, name: "Select All" }, ...result];

    let { data: business_sources } = await this.$axios.get(
      `business-source-list`
    );
    this.business_sources = [
      { id: null, name: "Select All" },
      ...business_sources,
    ];

    let { data: delivery_services } = await this.$axios.get(
      `delivery-service-list`
    );

    this.delivery_services = [
      { id: null, name: "Select All" },
      ...delivery_services,
    ];

    let { data: statusList } = await this.$axios.get(`status-list`);

    this.statusList = [{ id: null, name: "Select All" }, ...statusList];
  },
  mounted() {},
  watch: {
    options: {
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
  },
  methods: {
    async getDataFromApi() {
      this.loading = true;
      try {
        const { sortBy = [], sortDesc = [], page, itemsPerPage } = this.options;

        let params = {
          page,
          per_page: itemsPerPage,
          ...this.filters,
        };

        // Optionally add sorting
        if (sortBy && sortBy.length) {
          params.sort_by = sortBy[0];
          params.sort_desc = sortDesc[0] || false;
        }

        const { data } = await this.$axios.get(this.endpoint, { params });
        this.items = data?.data || [];
        this.totalItems = data.total || data.meta?.total || this.items.length;
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Optionally handle user notification or fallback
      } finally {
        this.loading = false;
      }
    },
    /**
     * Every order matching the filters, not just the page on screen.
     *
     * The API caps per_page, so a date range needs paging. Capped at 50 pages
     * as a guard: a runaway loop would hammer the API, and 5,000 orders is
     * already far more than anyone prints.
     */
    async fetchAllForPdf() {
      const rows = [];
      let page = 1;

      while (page <= 50) {
        const { data } = await this.$axios.get(this.endpoint, {
          params: { ...this.filters, page, per_page: 100 },
        });

        const batch = data?.data || [];
        rows.push(...batch);

        if (batch.length < 100) {
          break;
        }

        page++;
      }

      return rows;
    },

    async downloadOrdersPdf() {
      this.pdfLoading = true;

      try {
        // jsPDF and the table plugin are ~400 KB together; loaded only when
        // someone actually presses the button rather than on every page view.
        const jsPDF = (await import("jspdf")).default;

        // Depending on how the bundler interops this CommonJS plugin, the
        // callable can arrive as the default export, a named one, or hang off
        // the module object. Resolve whichever is actually a function.
        const mod = await import("jspdf-autotable");
        const autoTable =
          typeof mod.default === "function"
            ? mod.default
            : typeof mod.autoTable === "function"
            ? mod.autoTable
            : mod.default && mod.default.autoTable;

        if (typeof autoTable !== "function") {
          throw new Error("PDF table plugin did not load.");
        }

        const rows = await this.fetchAllForPdf();

        if (!rows.length) {
          alert("No orders match these filters, so there is nothing to print.");
          return;
        }

        const money = (n) =>
          Number(n || 0).toLocaleString("en-AE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

        const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        const pageW = pdf.internal.pageSize.getWidth();

        // What the reader needs in order to trust the figures: which filters
        // produced this list. A report that does not say what it excludes is
        // worse than no report.
        const f = this.filters;
        const some = (v, d) => (v === null || v === undefined || v === "" ? d : v);
        const named = (list, id) =>
          id ? ((list || []).find((x) => x.id === id) || {}).name || id : "all";

        const criteria = [
          `Dates: ${some(f.from, "today")} to ${some(f.to, "today")}`,
          `Status: ${some(f.order_status, "all")}`,
          `Source: ${named(this.business_sources, f.business_source_id)}`,
          `Delivery: ${named(this.delivery_services, f.delivery_service_id)}`,
          `Payment: ${named(this.payment_modes, f.payment_method)}`,
          f.search ? `Search: ${f.search}` : null,
        ].filter(Boolean);

        pdf.setFontSize(15);
        pdf.setFont(undefined, "bold");
        pdf.text("ROZE SKIN - ORDER REPORT", pageW / 2, 13, { align: "center" });

        pdf.setFontSize(9);
        pdf.setFont(undefined, "normal");
        pdf.setTextColor(90);
        pdf.text(criteria.join("   |   "), pageW / 2, 19, { align: "center" });
        pdf.text(
          `${rows.length} order(s)   |   generated ${new Date().toLocaleString("en-GB", {
            timeZone: "Asia/Dubai",
          })}`,
          pageW / 2,
          24,
          { align: "center" }
        );
        pdf.setTextColor(0);

        let total = 0;

        const body = rows.map((r, i) => {
          total += Number(r.total || 0);

          return [
            i + 1,
            r.order_id || "",
            r.tracking_number && r.tracking_number !== "0" ? r.tracking_number : "",
            (r.customer || {}).full_name || "",
            (r.customer || {}).phone || "",
            r.date_time || "",
            r.payment_method_title || r.payment_method || "",
            (r.business_source || {}).name || "",
            (r.delivery_service || {}).name || "",
            money(r.total),
            r.invoice && r.invoice.id ? "Yes" : "No",
            (r.order_status || "").toUpperCase(),
          ];
        });

        autoTable(pdf, {
          startY: 28,
          head: [
            [
              "#",
              "Order Ref",
              "Tracking Id",
              "Customer",
              "Phone",
              "Date Time",
              "Payment",
              "Source",
              "Delivery",
              "Total AED",
              "Invoiced",
              "Status",
            ],
          ],
          body,
          foot: [["", "", "", "", "", "", "", "", "TOTAL", money(total), "", ""]],
          theme: "grid",
          styles: { fontSize: 7.5, cellPadding: 1.6, overflow: "linebreak" },
          headStyles: {
            fillColor: [219, 113, 55],
            textColor: 255,
            fontSize: 7.5,
            halign: "center",
          },
          footStyles: { fillColor: [245, 240, 236], textColor: 0, fontStyle: "bold" },
          columnStyles: {
            0: { cellWidth: 8, halign: "right" },
            1: { cellWidth: 24 },
            2: { cellWidth: 28 },
            3: { cellWidth: 38 },
            4: { cellWidth: 28 },
            5: { cellWidth: 30 },
            6: { cellWidth: 28 },
            7: { cellWidth: 20 },
            8: { cellWidth: 17 },
            9: { cellWidth: 19, halign: "right" },
            10: { cellWidth: 16, halign: "center" },
            11: { cellWidth: 23, halign: "center" },
          },
          // autotable reports an overflow when the declared width and the
          // column widths disagree, so this must equal their sum.
          tableWidth: 279,
          margin: { left: 9, right: 9 },
          didDrawPage: () => {
            pdf.setFontSize(8);
            pdf.setTextColor(120);
            pdf.text(
              `Page ${pdf.internal.getNumberOfPages()}`,
              pageW - 10,
              pdf.internal.pageSize.getHeight() - 5,
              { align: "right" }
            );
            pdf.setTextColor(0);
          },
        });

        const slug = [f.order_status || "all", f.from || "today", f.to || "today"].join("_");

        pdf.save(`roze-orders-${slug}.pdf`);
      } catch (e) {
        alert("Could not build the PDF: " + (e && e.message ? e.message : e));
      } finally {
        this.pdfLoading = false;
      }
    },

    async getStats() {
      try {
        const { data } = await this.$axios.get(this.endpoint + "-stats");

        console.log("🚀 ~ getStats ~ data:", data);
        this.stats = data;
      } catch (error) {
        this.items = [];
      }
    },
    getStatusText(item) {
      // Show "Complete" for processing orders with invoice reference
      if (item?.invoice?.reference_id && item?.order_status === "processing") {
        return "Complete";
      }
      return item?.order_status;
    },

    getStatusClass(item) {
      // If processing with invoice, show green
      if (item?.invoice?.reference_id && item?.order_status === "processing") {
        return "green lighten-1";
      }

      // Fallback color mapping for each status
      const statusColors = {
        completed: "green lighten-1",
        processing: "blue lighten-1",
        pending: "red lighten-1",
        cancelled: "grey lighten-1",
      };

      return statusColors[item?.order_status] || "grey lighten-1";
    },
  },
};
</script>
