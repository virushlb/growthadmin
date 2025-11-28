// =====================
// SUPABASE CONFIG
// =====================
const SUPABASE_URL = "https://ngtzknecstzlxcpeelth.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndHprbmVjc3R6bHhjcGVlbHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTQ5NjksImV4cCI6MjA3ODE5MDk2OX0.IXvn2GvftKM96DObzCzA1Nvaye9dHri7t5SZfER0eDg";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =====================
// ELEMENTS
// =====================
const form = document.getElementById("product-form");
const productsBody = document.getElementById("products-body");

const idInput = document.getElementById("product-id");
const oldImagesInput = document.getElementById("old-images");

const nameInput = document.getElementById("name");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const discountInput = document.getElementById("discount_price");
const descInput = document.getElementById("description");
const stockInput = document.getElementById("stock");

const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");


// =====================
// PREVIEW IMAGES
// =====================
imageInput.addEventListener("change", () => {
  imagePreview.innerHTML = "";
  [...imageInput.files].forEach(f => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(f);
    img.className = "thumb";
    imagePreview.appendChild(img);
  });
});


// =====================
// MULTI IMAGE UPLOAD
// =====================
async function uploadImagesIfNeeded() {
  let existing = [];

  if (oldImagesInput.value) {
    try { existing = JSON.parse(oldImagesInput.value); }
    catch { existing = []; }
  }

  const files = imageInput.files;
  if (!files || files.length === 0) return existing;

  const urls = [...existing];

  for (const file of files) {
    const ext = file.name.split(".").pop();
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(path, file, { upsert: true });

    if (error) {
      console.log(error);
      alert("Upload failed");
      throw error;
    }

    const { data } = supabase.storage.from("products").getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}


// =====================
// LOAD PRODUCTS
// =====================
async function loadProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    alert("Failed loading products");
    return;
  }

  renderProducts(data || []);
}


// =====================
// RENDER TABLE
// =====================
function renderProducts(products) {
  productsBody.innerHTML = "";

  products.forEach(p => {
    const tr = document.createElement("tr");

    const firstImg = (p.images && p.images.length)
      ? p.images[0]
      : p.image_path;

    const imgHTML = firstImg
      ? `<img src="${firstImg}" class="thumb">`
      : "";

    tr.innerHTML = `
      <td>${imgHTML}</td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${p.price}</td>
      <td>${p.discount_price ?? ""}</td>
      <td>${p.stock}</td>
      <td>
        <button onclick='editProduct(${JSON.stringify(p)})'>Edit</button>
        <button onclick='deleteProduct("${p.id}")'>Delete</button>
      </td>
    `;

    productsBody.appendChild(tr);
  });
}


// =====================
// EDIT PRODUCT
// =====================
function editProduct(p) {
  idInput.value = p.id;
  nameInput.value = p.name;
  categoryInput.value = p.category;
  priceInput.value = p.price;
  discountInput.value = p.discount_price ?? "";
  descInput.value = p.description;
  stockInput.value = p.stock;

  const imgs = p.images && p.images.length
    ? p.images
    : (p.image_path ? [p.image_path] : []);

  oldImagesInput.value = JSON.stringify(imgs);

  imagePreview.innerHTML = "";
  imgs.forEach(u => {
    const img = document.createElement("img");
    img.src = u;
    img.className = "thumb";
    imagePreview.appendChild(img);
  });
}


// =====================
// DELETE PRODUCT
// =====================
async function deleteProduct(id) {
  if (!confirm("Delete product?")) return;

  await supabase.from("products").delete().eq("id", id);
  loadProducts();
}


// =====================
// SUBMIT FORM
// =====================
form.addEventListener("submit", async e => {
  e.preventDefault();

  const images = await uploadImagesIfNeeded();
  const mainImg = images.length ? images[0] : null;

  const payload = {
    name: nameInput.value,
    category: categoryInput.value,
    price: Number(priceInput.value),
    discount_price: discountInput.value ? Number(discountInput.value) : null,
    description: descInput.value,
    stock: Number(stockInput.value),
    image_path: mainImg,
    images: images
  };

  const id = idInput.value;

  if (id) {
    await supabase.from("products").update(payload).eq("id", id);
  } else {
    await supabase.from("products").insert([payload]);
  }

  form.reset();
  imagePreview.innerHTML = "";
  oldImagesInput.value = "";

  loadProducts();
});


// =====================
loadProducts();
