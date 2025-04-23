<template>
  <span>
    <v-card>
      <v-container fluid>
        <v-row>
          <v-col cols="1">Invoices</v-col>
          <v-col>
            <v-text-field
              type="number"
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
              item-text="full_name"
              item-value="id"
              label="Customers"
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
              label="Delivery Service"
              outlined
              dense
              hide-details
            ></v-autocomplete>
          </v-col>
          <v-col>
            <v-autocomplete
              :items="[
                { id: null, name: 'Select All' },
                { id: 'Paid', name: 'Paid' },
                { id: 'Unpaid', name: 'Unpaid' },
                { id: 'Cancelled', name: 'Cancelled' },
              ]"
              item-text="name"
              item-value="id"
              label="Status"
              dense
              outlined
              flat
              v-model="filters.status"
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
    <v-dialog v-model="paymentDialog" width="600">
      <AssetsIconClose left="590" @click="paymentDialog = false" />
      <v-card v-if="paymentItem && paymentItem.id">
        <v-alert flat class="grey lighten-3" dense>
          <span>Payment Slip</span>
        </v-alert>

        <v-card-text>
          <v-card>
            <v-container>
              <v-row class="mb-5">
                <v-col cols="5" class="text-right">
                  <v-avatar tile size="100">
                    <img
                      style="height: 50px"
                      src="/invoice-logo-1.png"
                      alt=""
                    />
                  </v-avatar>
                </v-col>
                <v-col cols="6" class="text-left">
                  <div class="caption">Roze Skincare LLC</div>
                  <div class="caption">
                    P.O.Box : 83481, Dubai, United Arab Emirates<br />
                    +971 4 3939 562 / +971 55 330 3991<br />
                    <a href="mailto:rozeskincaredubai@gmail.com"
                      >rozeskincaredubai@gmail.com </a
                    ><br />
                    TRN : 100391417100003
                  </div>
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <v-row class="mt-5">
                <v-col class="text-center">
                  <span class="pb-1" style="border-bottom: 1px solid #ddd">
                    PAYMENT RECEIPT
                  </span>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="9">
                  <table>
                    <tr>
                      <td>Payment Date</td>
                      <td>
                        {{ paymentItem?.date_time }}
                      </td>
                    </tr>
                    <tr>
                      <td>Reference</td>
                      <td>
                        {{ paymentItem?.payment_reference }}
                      </td>
                    </tr>
                    <tr>
                      <td>Payment Mode</td>
                      <td>
                        {{ paymentItem?.payment_mode?.name }}
                      </td>
                    </tr>
                    <tr>
                      <td>Amount Received</td>
                      <td>
                        {{ paymentItem?.paid_amount }}
                      </td>
                    </tr>
                  </table>
                </v-col>
                <v-col cols="3">
                  <div
                    class="green white--text"
                    style="
                      min-height: 100px;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                    "
                  >
                    {{ paymentItem?.paid_amount }}
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-card class="mt-5">
      <v-row class="px-1">
        <v-col v-if="isShortView" cols="3">
          <div style="border: 1px solid #dfdfdfdf">
            <v-simple-table dense>
              <tbody>
                <tr
                  v-for="item in items"
                  :key="item.id"
                  @click="selectedItem = item"
                  :style="{
                    backgroundColor:
                      selectedItem?.id === item.id ? '#dfdfdf' : '',
                  }"
                >
                  <td class="py-2">
                    <div class="caption font-color" style="cursor: pointer">
                      <b>
                        {{ item?.customer?.full_name || "---" }}
                      </b>
                    </div>
                    <div class="body-2" style="cursor: pointer">
                      {{ item?.id || "---" }} -
                      {{ item?.reference_id || "---" }}
                    </div>
                    <div>
                      <span :class="statusColor(item?.status)">{{
                        item?.status
                      }}</span>
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="body-1 font-color" style="cursor: pointer">
                      <b>{{
                        $utils.currency_format(
                          parseFloat(item?.order?.total || 0) -
                            parseFloat(item?.order?.total_paid_amount || 0)
                        )
                      }}</b>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </div>
        </v-col>

        <v-col v-if="isShortView" cols="9">
          <style scoped>
            .hover-bold:hover {
              font-weight: bold;
            }
            .hover-bold:hover .ml-1 {
              color: black !important;
            }
          </style>
          <v-alert class="primary" flat dense dark>
            <v-row>
              <v-col>
                <span>
                  <InvoiceEdit
                    :key="InvoicePayComponentKey"
                    :item="selectedItem"
                    :endpoint="endpoint"
                    @response="
                      () => {
                        getDataFromApi();
                        InvoicePayComponentKey++;
                      }
                    "
                  />
                </span>
                <InvoicePayForShortView
                  :key="InvoicePayComponentKey"
                  :item="selectedItem"
                  :endpoint="endpoint"
                  @response="
                    () => {
                      getDataFromApi();
                      InvoicePayComponentKey++;
                    }
                  "
                />
                <v-menu bottom right>
                  <template v-slot:activator="{ on, attrs }">
                    <span
                      class="hover-bold ml-5"
                      text
                      style="
                        background: none;
                        border: none !important;
                        font-size: 13px;
                        cursor: pointer;
                      "
                      small
                      v-bind="attrs"
                      v-on="on"
                    >
                      Print/PDF <v-icon>mdi-chevron-down</v-icon>
                    </span>
                  </template>

                  <v-list width="140" dense>
                    <v-list-item>
                      <v-list-item-title
                        @click="captureAndViewPDF"
                        style="cursor: pointer"
                        >Print
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title
                        @click="captureAndDownloadPDF"
                        style="cursor: pointer"
                        >PDF
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>

                <v-menu bottom right>
                  <template v-slot:activator="{ on, attrs }">
                    <span
                      class="hover-bold ml-5"
                      text
                      style="
                        background: none;
                        border: none !important;
                        font-size: 13px;
                        cursor: pointer;
                      "
                      small
                      v-bind="attrs"
                      v-on="on"
                    >
                      Payments <v-icon>mdi-chevron-down</v-icon>
                    </span>
                  </template>

                  <v-list>
                    <v-list-item>
                      <style scoped>
                        .payment-table {
                          font-family: arial, sans-serif;
                          border-collapse: collapse;
                          width: 100%;
                        }

                        .payment-table td {
                          border: 1px solid #dddddd;
                          text-align: left;
                          padding: 5px;
                        }

                        .flat-expansion-panels {
                          box-shadow: none !important;
                          border: none !important;
                        }

                        .v-expansion-panel {
                          box-shadow: none !important;
                          margin: 0 !important;
                        }

                        .v-expansion-panel-header {
                          padding: 8px 12px;
                          font-weight: bold;
                        }

                        .v-expansion-panel-content {
                          padding: 8px 12px;
                        }
                      </style>
                      <table class="payment-table">
                        <tr>
                          <td>ID</td>
                          <td>Payment Mode</td>
                          <td>Payment Reference</td>
                          <td class="text-right">Paid Amount</td>
                          <td>Created At</td>
                          <td class="text-center">Action</td>
                        </tr>
                        <tr
                          v-for="(item, i) in selectedItem?.payments"
                          :key="i"
                        >
                          <td>
                            {{ item.id }}
                          </td>
                          <td>
                            {{ item?.payment_mode?.name }}
                          </td>
                          <td>
                            {{ item.payment_reference }}
                          </td>
                          <td class="text-right">
                            {{ item.paid_amount }}
                          </td>
                          <td>
                            {{ item.created_at }}
                          </td>
                          <td class="text-center">
                            <v-btn
                              x-small
                              text
                              class="blue--text"
                              @click="openPaymentDialog(item)"
                              >View</v-btn
                            >
                          </td>
                        </tr>
                      </table>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-col>
              <v-col>
                <div class="text-right">
                  <v-icon small @click="isShortView = false"
                    >mdi-close</v-icon
                  >
                </div>
              </v-col>
            </v-row>
          </v-alert>
          <v-container>
            <v-card id="capture" class="pa-5 mx-auto" max-width="750">
              <v-row class="">
                <v-col>
                  <v-avatar tile size="100">
                    <img
                      style="height: 30px"
                      src="/invoice-logo-1.png"
                      alt=""
                    />
                  </v-avatar>
                  <br />
                  <div class="caption">Roze Skincare LLC</div>
                  <div class="caption">
                    P.O.Box : 83481, Dubai, United Arab Emirates<br />
                    +971 4 3939 562 / +971 55 330 3991<br />
                    <a href="mailto:rozeskincaredubai@gmail.com"
                      >rozeskincaredubai@gmail.com</a
                    ><br />
                    TRN : 100391417100003
                  </div>
                </v-col>
                <v-col class="text-right pt-10">
                  <div class="text-h4 text-grey-darken-4">INVOICE</div>
                  <div class=""># {{ selectedItem?.reference_id }}</div>
                  <br />
                  <div class="caption">Balance Due</div>
                  <div class="caption">
                    {{
                      $utils.currency_format(
                        parseFloat(selectedItem?.order?.total) -
                          parseFloat(selectedItem?.order?.total_paid_amount)
                      )
                    }}
                  </div>
                  <div class="caption">
                    {{ $dateFormat.dmy(selectedItem?.created_at) }}
                  </div>
                </v-col>
                <v-col cols="8">
                  <div class="caption">Invoice To</div>
                  <div class="caption">
                    {{ selectedItem?.customer?.full_name }}
                  </div>
                  <div class="caption">{{ selectedItem?.customer?.phone }}</div>
                </v-col>
                <v-col cols="4" class="text-right">
                  <div class="caption">
                    <b>Shipping Address:</b>
                    {{ selectedItem?.customer.shipping_address?.full_address }}
                  </div>
                </v-col>
                <v-col cols="12">
                  <style scoped>
                    .order-table {
                      font-family: arial, sans-serif;
                      border-collapse: collapse;
                      width: 100%;
                    }

                    .order-table td,
                    .order-table th {
                      border: 1px solid #dddddd;
                      text-align: left;
                      padding: 8px;
                    }
                    .right-align-input .v-text-field__slot > input {
                      text-align: right !important;
                    }
                  </style>
                  <table class="order-table">
                    <tr class="grey lighten-3">
                      <td width="200px">Product</td>
                      <td class="text-right">Qty</td>
                      <td class="text-right">Rate</td>
                      <td class="text-right">Tax</td>
                      <td class="text-right">Total</td>
                    </tr>

                    <tr
                      v-for="(item, index) in selectedItem?.order?.items"
                      :key="index"
                    >
                      <td>
                        {{ item?.item }}
                      </td>
                      <td class="text-right">
                        {{ item?.quantity }}
                      </td>
                      <td class="text-right">
                        {{ $utils.currency_format(item?.rate) }}
                      </td>
                      <td class="text-right">
                        {{ $utils.currency_format(item?.tax) }}
                      </td>
                      <td class="text-right">
                        {{ $utils.currency_format(item?.total) }}
                      </td>
                    </tr>
                    <tr>
                      <td colspan="4" class="text-right">Shipping Charges</td>
                      <td class="text-right">
                        {{
                          $utils.currency_format(
                            selectedItem?.order?.shipping_charges
                          )
                        }}
                      </td>
                    </tr>
                    <tr>
                      <td colspan="4" class="text-right">Total</td>
                      <td class="text-right">
                        {{ $utils.currency_format(selectedItem?.order?.total) }}
                      </td>
                    </tr>
                  </table>
                </v-col>
                <v-col cols="6">
                  <div class="my-2">Terms & Conditions</div>
                  <div style="font-size: 10px !important; line-height: 1.5">
                    One Year Warranty for all products except Accessories and
                    power adaptor Above goods received and in the absence of an
                    L.P.O from us. The mentioned goods received in good
                    condition and as per specification Rozeskin L.L.C
                  </div>
                </v-col>
                <v-col
                  cols="12"
                  class="text-center mt-2 pt2 caption text-grey"
                  style="border-top: 1px solid #ddd"
                >
                  System-generated invoice. No signature required.
                </v-col>
              </v-row>
            </v-card>
          </v-container>
        </v-col>
        <v-col cols="12" v-if="!isShortView">
          <v-data-table
            dense
            :headers="headers"
            :items="items"
            :loading="loading"
            :options.sync="options"
            :footer-props="{
              itemsPerPageOptions: [100, 500, 1000],
            }"
            class="pa-3"
            @click:row="onRowClick"
          >
            <template v-slot:item.customer="{ item }">
              <small>
                {{ item?.customer?.full_name }}
              </small>
              <br />
              <small>
                {{ item?.customer?.phone }}
              </small>
            </template>
            <template v-slot:item.date_time="{ item }">
              <small>
                {{ item.date_time }}
              </small>
            </template>
            <template v-slot:item.reference_id="{ item }">
              <small class="blue--text">
                {{ item.reference_id }}
              </small>
            </template>
            <template v-slot:item.order_id="{ item }">
              <small>
                {{ item?.order?.order_id }}
              </small>
            </template>
            <template v-slot:item.tracking_number="{ item }">
              <small>
                {{ item?.order?.tracking_number }}
              </small>
            </template>
            <template v-slot:item.total="{ item }">
              <small>
                {{ item?.order?.total }}
              </small>
            </template>
            <template v-slot:item.total_paid_amount="{ item }">
              <small>
                {{ item?.order?.total_paid_amount }}
              </small>
            </template>

            <template v-slot:item.status="{ item }">
              <small :class="statusColor(item.status)">
                {{ item.status }}
              </small>
            </template>
            <template v-slot:item.customer="{ item }">
              <small>
                {{ item?.customer?.full_name }}
              </small>
              <br />
              <small>
                {{ item?.customer?.phone }}
              </small>
            </template>

            <template v-slot:item.options="{ item }">
              <v-menu bottom left>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <v-list dense>
                  <v-list-item>
                    <v-list-item-title
                      @click="captureAndViewPDF"
                      style="cursor: pointer"
                      ><v-icon color="primary" small class="mr-1"
                        >mdi-printer</v-icon
                      >Print
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title
                      @click="captureAndDownloadPDF"
                      style="cursor: pointer"
                      ><v-icon color="primary" small class="mr-1"
                        >mdi-file</v-icon
                      >PDF
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>
                      <InvoicePay
                        :key="InvoicePayComponentKey"
                        :item="item"
                        :endpoint="endpoint"
                        @response="
                          () => {
                            getDataFromApi();
                            InvoicePayComponentKey++;
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
        </v-col>
      </v-row>
    </v-card>
  </span>
</template>

<script>
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default {
  data: () => ({
    paymentDialog: false,
    paymentItem: null,
    selectedItem: null,
    InvoicePayComponentKey: 1,
    Model: "Invoices",
    endpoint: "invoices",
    filters: {
      search: null,
      status: null,
      customer_id: null,
      from: null,
      to: null,
    },
    options: {},
    loading: false,
    response: "",
    items: [],
    errors: [],
    isShortView: false,
    selectedItem: null,
    logo: null,
    headers: [
      {
        text: "Invoice #",
        value: "reference_id",
      },
      {
        text: "Date Time",
        value: "date_time",
      },

      {
        text: "Customer",
        value: "customer",
      },
      {
        text: "Delivery Service",
        value: "delivery_service.name",
      },
      {
        text: "Order Ref #",
        value: "order_id",
      },

      {
        text: "Tracking Id",
        value: "tracking_number",
      },
      {
        text: "Total",
        value: "total",
      },
      // {
      //   text: "Paid Amount",
      //   value: "total_paid_amount",
      // },
      {
        text: "Status",
        value: "status",
      },
      // {
      //   text: "Action",
      //   align: "center",
      //   sortable: false,
      //   value: "options",
      // },
    ],
    componentKey: 1,
    customer_list: [],
    delivery_services: [],
  }),

  async created() {
    let { data } = await this.$axios.get(`customer-list`);
    this.customer_list = [{ id: null, full_name: "Select All" }, ...data];

    let { data: delivery_services } = await this.$axios.get(
      `delivery-service-list`
    );
    this.delivery_services = [
      { id: null, name: "Select All" },
      ...delivery_services,
    ];
  },
  watch: {
    options: {
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
  },
  methods: {
    statusColor(status) {
      switch (status) {
        case "Pending":
          return "orange--text";
        case "Paid":
          return "green--text";
        case "Dispatched":
          return "blue--text";
        case "Unpaid":
          return "red--text";
        case "Cancelled":
          return "red--text";
        default:
          return "grey--text"; // fallback
      }
    },
    openPaymentDialog(item) {
      this.paymentDialog = true;
      this.paymentItem = item;
    },
    onRowClick(item) {
      this.selectedItem = item;
      this.isShortView = true;
    },
    captureAndDownloadPDF() {
      this.invoiceLoader = true;
      // Select the element to capture
      const captureElement = document.getElementById("capture");

      // Use html2canvas to take a screenshot of the element
      html2canvas(captureElement, {
        scale: 2, // Increase the scale for better resolution
        useCORS: true, // If you have images or fonts from different origins, allow cross-origin requests
        logging: false, // Disable logging for cleaner console output
      }).then((canvas) => {
        // Convert the screenshot canvas into an image
        const imgData = canvas.toDataURL("image/png");

        // Create a new PDF instance with portrait orientation
        const pdf = new jsPDF("p", "mm", "a4"); // 'p' for portrait, 'mm' for millimeters, 'a4' for A4 size

        // A4 page dimensions in mm (portrait)
        const imgWidth = 210; // Width of A4 paper in mm (portrait)
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

        // Add the captured image to the PDF
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

        // Save the generated PDF
        pdf.save("invoice.pdf"); // Save the PDF

        this.invoiceLoader = false;
      });
    },
    captureAndViewPDF() {
      this.invoiceLoader = true;

      const captureElement = document.getElementById("capture");

      html2canvas(captureElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

        // Open the PDF in a new tab instead of downloading
        const pdfBlob = pdf.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);

        this.invoiceLoader = false;

        window.open(pdfUrl, "_blank");
      });
    },
    captureAndSendPDF() {
      // Select the element to capture
      const captureElement = document.getElementById("capture");

      // Use html2canvas to take a screenshot of the element
      html2canvas(captureElement, {
        scale: 2, // Increase the scale for better resolution
        useCORS: true, // Allow cross-origin requests for images or fonts
        logging: false, // Disable logging
      }).then((canvas) => {
        // Convert the screenshot canvas into an image (PNG format)
        const imgData = canvas.toDataURL("image/png");

        // Create FormData object to send the image data to the server
        const formData = new FormData();
        formData.append("image", imgData); // Sending image data as a string
        formData.append("email", this.email); // Sending image data as a string

        // Send the image to the Laravel backend using axios
        this.$axios
          .post("/upload-image", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((response) => {
            console.log("Image uploaded successfully", response);
            this.mailDialog = false;
          })
          .catch((error) => {
            console.error("Error uploading image", error);
          });
      });
    },
    async getDataFromApi() {
      this.loading = true;
      try {
        const { sortBy = [], sortDesc = [], page, itemsPerPage } = this.options;

        const params = {
          page,
          sortBy: sortBy[0] || "",
          sortDesc: sortDesc[0] || "",
          per_page: itemsPerPage,
          ...this.filters,
        };

        const { data } = await this.$axios.get(this.endpoint, { params });
        this.items = data?.data || [];
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Optionally handle user notification or fallback
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
