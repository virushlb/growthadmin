// GROWTH ADMIN – PRODUCTS (multi-images with delete)

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
const clearBtn = document.getElementById("clear-btn");

// we keep a JS copy of the current images for this product
let currentImages = [];

// =====================
// IMAGE GALLERY (existing images with delete button)
// =====================
function syncHiddenImages() {
  oldImagesInput.value = currentImages.length ? JSON.stringify(currentImages) : "";
}

function renderExistingImages() {
  if (!imagePreview) return;
  imagePreview.innerHTML = "";

  if (!currentImages || !currentImages.length) {
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = "No images saved yet. You can choose files below to upload.";
    imagePreview.appendChild(hint);
    return;
  }

  currentImages.forEach((url, index) => {
    const wrap = document.createElement("div");
    wrap.className = "img-pill";

    const img = document.createElement("img");
    img.src = url;
    img.className = "thumb";

    const del = document.createElement("button");
    del.type = "button";
    del.className = "img-remove-btn";
    del.textContent = "✕";
    del.title = "Remove this image";
    del.addEventListener("click", () => {
      currentImages.splice(index, 1);
      syncHiddenImages();
      renderExistingImages();
    });

    wrap.appendChild(img);
    wrap.appendChild(del);
    imagePreview.appendChild(wrap);
  });
}

// We don't override the gallery when choosing new files;
// new files will be uploaded on save, we only show existing images here.
if (imageInput) {
  imageInput.addEventListener("change", () => {
    // Optional: you could show a small note that X new files are selected.
    // For now we keep the UI simple and rely on the existing gallery.
    // console.log(imageInput.files.length, "new files selected");
  });
}

// =====================
// MULTI IMAGE UPLOAD
// =====================
async function uploadImagesIfNeeded() {
  // start with whatever images are currently kept
  let images = Array.isArray(currentImages) ? [...currentImages] : [];

  const files = imageInput.files;
  if (!files || files.length === 0) {
    return images;
  }

  for (const file of files) {
    const ext = file.name.split(".").pop();
    const path = `products/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      alert("Failed to upload one of the images.");
      throw uploadError;
    }

    const { data } = supabase.storage.from("products").getPublicUrl(path);
    if (data && data.publicUrl) {
      images.push(data.publicUrl);
    }
  }

  return images;
}

// =====================
// LOAD PRODUCTS
// =====================
async function loadProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Failed to load products.");
      return;
    }

    renderProducts(data || []);
  } catch (e) {
    console.error("Load products exception:", e);
    alert("Error loading products.");
  }
}

function renderProducts(products) {
  productsBody.innerHTML = "";

  products.forEach((p) => {
    const tr = document.createElement("tr");

    const cover =
      Array.isArray(p.images) && p.images.length
        ? p.images[0]
        : p.image_path || null;

    const imgHtml = cover
      ? `<img src="${cover}" class="thumb" alt="${p.name || ""}" onerror="this.style.display='none';" />`
      : "";

    tr.innerHTML = `
      <td>${imgHtml}</td>
      <td>${p.name || ""}</td>
      <td>${p.category || ""}</td>
      <td>${p.price ?? ""}</td>
      <td>${p.discount_price ?? ""}</td>
      <td>${p.stock ?? ""}</td>
      <td>
        <button class="btn small secondary" data-action="edit">Edit</button>
        <button class="btn small danger" data-action="delete">Delete</button>
      </td>
    `;

    tr.dataset.product = JSON.stringify(p);
    productsBody.appendChild(tr);
  });

  productsBody.querySelectorAll("button[data-action]").forEach((btn) => {
    const action = btn.dataset.action;
    const row = btn.closest("tr");
    if (!row) return;
    let product;
    try {
      product = JSON.parse(row.dataset.product || "{}");
    } catch {
      product = {};
    }

    if (action === "edit") {
      btn.addEventListener("click", () => fillForm(product));
    } else if (action === "delete") {
      btn.addEventListener("click", () => deleteProduct(product.id));
    }
  });
}

function fillForm(p) {
  idInput.value = p.id || "";
  nameInput.value = p.name || "";
  categoryInput.value = (p.category || "").toLowerCase();
  priceInput.value = p.price ?? "";
  discountInput.value = p.discount_price ?? "";
  descInput.value = p.description || "";
  stockInput.value = p.stock ?? 0;

  const imgs =
    Array.isArray(p.images) && p.images.length
      ? p.images
      : p.image_path
      ? [p.image_path]
      : [];

  currentImages = imgs.slice();
  syncHiddenImages();
  renderExistingImages();

  if (imageInput) {
    imageInput.value = "";
  }
}

function clearForm() {
  idInput.value = "";
  nameInput.value = "";
  categoryInput.value = "socks";
  priceInput.value = "";
  discountInput.value = "";
  descInput.value = "";
  stockInput.value = 0;
  if (imageInput) {
    imageInput.value = "";
  }
  currentImages = [];
  syncHiddenImages();
  renderExistingImages();
}

// =====================
// DELETE PRODUCT
// =====================
async function deleteProduct(id) {
  if (!id) return;
  if (!confirm("Delete this product?")) return;

  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error(error);
      alert("Failed to delete product.");
      return;
    }
    await loadProducts();
  } catch (e) {
    console.error("Delete product exception:", e);
    alert("Error deleting product.");
  }
}

// =====================
// SUBMIT FORM
// =====================
async function handleSubmit(e) {
  e.preventDefault();

  const name = nameInput.value.trim();
  const priceVal = priceInput.value;
  const price = priceVal !== "" ? Number(priceVal) : NaN;

  if (!name || Number.isNaN(price)) {
    alert("Name and price are required.");
    return;
  }

  try {
    const images = await uploadImagesIfNeeded();
    currentImages = images.slice();
    syncHiddenImages();

    const payload = {
      name,
      category: categoryInput.value || null,
      price,
      discount_price:
        discountInput.value !== "" ? Number(discountInput.value) : null,
      description: descInput.value.trim() || null,
      stock: stockInput.value !== "" ? Number(stockInput.value) : 0,
      image_path: images.length ? images[0] : null,
      images,
    };

    const id = idInput.value;
    if (id) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", id);
      if (error) {
        console.error(error);
        alert("Failed to update product.");
        return;
      }
      alert("Product updated.");
    } else {
      const { error } = await supabase.from("products").insert([payload]);
      if (error) {
        console.error(error);
        alert("Failed to add product.");
        return;
      }
      alert("Product added.");
    }

    clearForm();
    await loadProducts();
  } catch (err) {
    console.error(err);
    alert("Error saving product.");
  }
}

if (form) {
  form.addEventListener("submit", handleSubmit);
}

if (clearBtn) {
  clearBtn.addEventListener("click", clearForm);
}

// initial load
loadProducts();
renderExistingImages();
