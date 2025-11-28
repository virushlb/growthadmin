// GROWTH ADMIN – ORDERS

const SUPABASE_URL = "https://ngtzknecstzlxcpeelth.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndHprbmVjc3R6bHhjcGVlbHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTQ5NjksImV4cCI6MjA3ODE5MDk2OX0.IXvn2GvftKM96DObzCzA1Nvaye9dHri7t5SZfER0eDg";
const SHOP_WHATSAPP = "96171209028";

const supabaseOrders = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ordersBody = document.getElementById("ordersBody");
const ordersStatus = document.getElementById("ordersStatus");
const refreshOrdersBtn = document.getElementById("refreshOrders");

function money(n) {
  if (n === null || n === undefined) return "";
  return n.toFixed(1) + "$";
}

function buildItemsSummary(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return items.map(i => `${i.qty}× ${i.name}`).join(", ");
}

function buildWhatsAppText(order) {
  const lines = [
    "New Growth order",
    `Name: ${order.name || ""}`,
    `Phone: ${order.phone || ""}`,
    `Address: ${order.address || ""}`,
    `Note: ${order.note || ""}`,
    "",
    `Total: ${money(order.total || 0)}`
  ];
  return lines.join("\n");
}

async function loadOrders() {
  ordersStatus.textContent = "Loading...";
  const { data, error } = await supabaseOrders
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    ordersStatus.textContent = "Failed to load orders.";
    return;
  }

  ordersStatus.textContent = data.length ? `${data.length} order(s)` : "No orders yet.";
  renderOrders(data || []);
}

function renderOrders(list) {
  ordersBody.innerHTML = "";

  list.forEach((order) => {
    const tr = document.createElement("tr");

    const created = order.created_at
      ? new Date(order.created_at).toLocaleString()
      : "";

    const itemsSummary = buildItemsSummary(order.items);

    const subtotal = money(order.subtotal || 0);
    const delivery = money(order.delivery || 0);
    const discount = order.discount ? money(order.discount) : "";
    const total = money(order.total || 0);

    const status = order.status || "pending";
    const statusClass = "status-" + status;

    tr.innerHTML = `
      <td>${created}</td>
      <td>${order.name || ""}</td>
      <td>
        <div>${order.phone || ""}</div>
        <div class="hint">${order.address || ""}</div>
      </td>
      <td>${itemsSummary}</td>
      <td>
        <div>Subtotal: ${subtotal}</div>
        <div>Delivery: ${delivery}</div>
        ${discount ? `<div>Discount: -${discount}</div>` : ""}
        <div><strong>Total: ${total}</strong></div>
      </td>
      <td>
        <span class="status-badge ${statusClass}">${status}</span>
      </td>
      <td>
        <button class="btn small" data-action="wa">WhatsApp</button>
        <button class="btn small secondary" data-action="confirm">Confirm</button>
        <button class="btn small danger" data-action="delete">Delete</button>
      </td>
    `;

    tr.dataset.order = JSON.stringify(order);
    ordersBody.appendChild(tr);
  });

  ordersBody.querySelectorAll("button[data-action]").forEach((btn) => {
    const action = btn.dataset.action;
    btn.addEventListener("click", () => {
      const row = btn.closest("tr");
      const order = JSON.parse(row.dataset.order);
      if (action === "wa") {
        const text = encodeURIComponent(buildWhatsAppText(order));
        const url = `https://wa.me/${SHOP_WHATSAPP}?text=${text}`;
        window.open(url, "_blank");
      } else if (action === "confirm") {
        updateOrderStatus(order.id, "confirmed");
      } else if (action === "delete") {
        deleteOrder(order.id);
      }
    });
  });
}

async function updateOrderStatus(id, status) {
  const { error } = await supabaseOrders
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Failed to update status.");
    return;
  }
  loadOrders();
}

async function deleteOrder(id) {
  if (!confirm("Delete this order?")) return;
  const { error } = await supabaseOrders
    .from("orders")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Failed to delete order.");
    return;
  }
  loadOrders();
}

refreshOrdersBtn.addEventListener("click", loadOrders);
loadOrders();
