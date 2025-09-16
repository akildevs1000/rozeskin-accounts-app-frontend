<template>
  <v-container fluid>
    <div>
      <v-row>
        <!-- hwo to download from result below header  -->
        <v-col cols="12">
          <v-container fluid>
            <v-row>
              <v-col>
                <div class="d-flex">
                  <div>
                    <v-icon color="primary" @click="downloadPDF"
                      >mdi-download</v-icon
                    >
                  </div>
                </div>
              </v-col>
              <v-col>
                <div class="d-flex justify-end" style="gap: 10px; width: 100%">
                  <div>
                    <FiltersDateRange
                      @filter-attr="
                        ({ from, to }) => {
                          tempFilters.from = from;
                          tempFilters.to = to;
                        }
                      "
                    />
                  </div>
                  <v-btn color="primary" @click="applyFilters" small
                    >Submit</v-btn
                  >
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
      <v-container ref="reportArea" class="pa-15">
        <v-row>
          <v-col
            class="text-center pa-5"
            style="font-size: 32px; font-weight: normal"
          >
            Order
          </v-col>
          <v-col cols="12">
            <v-card flat class="rounded-card">
              <div>
                <div
                  class="d-flex align-center px-3 py-1"
                  style="background: #1f2937; justify-content: space-between"
                >
                  <div class="text-center flex-grow-1 white--text">
                    Products
                  </div>
                  <v-icon color="#fff" @click="downloadProductsExcel">
                    mdi-file-excel
                  </v-icon>
                </div>

                <AccountsProduct
                  ref="childComponentForProduct"
                  :filters="filters"
                />
              </div>
            </v-card>
          </v-col>

          <v-col cols="6">
            <v-card flat class="rounded-card">
              <div>
                <div
                  class="d-flex align-center px-3 py-1"
                  style="background: #a7f3d0; justify-content: space-between"
                >
                  <div class="text-center flex-grow-1">Source</div>
                  <v-icon color="#618b77" @click="downloadSourceExcel">
                    mdi-file-excel
                  </v-icon>
                </div>

                <AccountsSource ref="childComponentForSource" :filters="filters" />
              </div>
            </v-card>
          </v-col>

          <v-col cols="6">
            <v-card flat class="rounded-card">
              <div>
                <div
                  class="d-flex align-center px-3 py-1"
                  style="background: #e9d5ff; justify-content: space-between"
                >
                  <div class="text-center flex-grow-1">Payment Mode</div>
                  <v-icon color="#a37ccf" @click="downloadPaymentModeExcel">
                    mdi-file-excel
                  </v-icon>
                </div>

                <AccountsPaymentMode ref="childComponentForPaymentMode" :filters="filters" />
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </v-container>
</template>

<script>
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
export default {
  data() {
    return {
      filters: {
        from: null,
        to: null,
      },
      tempFilters: {
        from: null,
        to: null,
      },
    };
  },
  methods: {
    applyFilters() {
      this.filters = { ...this.tempFilters };
    },
    downloadProductsExcel() {
      this.$refs.childComponentForProduct.exportToExcel();
    },
    downloadSourceExcel() {
      this.$refs.childComponentForSource.exportToExcel();
    },
     downloadPaymentModeExcel() {
      this.$refs.childComponentForPaymentMode.exportToExcel();
    },
    downloadPDF() {
      const reportArea = this.$refs.reportArea;

      html2canvas(reportArea, {
        scale: 2, // improves resolution
        useCORS: true, // handles cross-origin images if any
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // If content is longer than one page, add pages
        while (heightLeft > 0) {
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          if (heightLeft > 0) {
            pdf.addPage();
            position = -pageHeight;
          }
        }

        pdf.save("report.pdf");
      });
    },
  },
};
</script>
