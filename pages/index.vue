<template>
  <Order
    :headers="[
      { text: `Order Ref`, value: `order_id` },
      { text: `Tracking Id`, value: `tracking_number` },
      { text: `Customer`, value: `customer.full_name` },
      { text: `Date Time`, value: `date_time` },
      { text: `Payment`, value: `payment` },
      { text: `Business Source`, value: `business_source.name` },
      { text: `Delivery Service`, value: `delivery_service.name` },
      { text: `Shipping Charges`, value: `shipping_charges` },
      { text: `Discount`, value: `discount` },
      { text: `Total`, value: `total` },
      { text: `Invoice`, value: `invoice` },
      { text: `Status`, value: `order_status` },
      { text: `Action`, align: `center`, sortable: false, value: `options` },
    ]"
  />
</template>
