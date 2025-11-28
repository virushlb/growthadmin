// Example WhatsApp message WITHOUT items list (for your checkout.js)

const SHOP_WHATSAPP = "96171209028";
const DELIVERY_FEE = 4;

function buildCheckoutWhatsAppMessage(name, phone, address, note, subtotal) {
  const total = subtotal + DELIVERY_FEE;
  return `
New Growth order
Name: ${name}
Phone: ${phone}
Address: ${address}
Note: ${note || ""}

Subtotal: ${subtotal.toFixed(1)}$
Delivery: ${DELIVERY_FEE.toFixed(1)}$
Total: ${total.toFixed(1)}$
`;
}
