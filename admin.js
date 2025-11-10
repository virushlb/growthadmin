import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ngtzknecstzlxcpeelth.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY_HERE"; // keep as is

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("productForm");
const nameInput = document.getElementById("name");
const stockInput = document.getElementById("stock");
const priceInput = document.getElementById("price");
const catInput = document.getElementById("category");
const descInput = document.getElementById("description");
const fileInput = document.getElementById("fileInput");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value);
  const category = catInput.value.trim().toLowerCase();
  const description = descInput.value.trim();
  const stock = parseInt(stockInput.value, 10);

  // image upload
  let image_path = "";
  const file = fileInput.files[0];

  if (file) {
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      alert("Image upload failed");
      return;
    }

    image_path = fileName;
  }

  // Insert into DB
  const { error } = await supabase.from("products").insert({
    name,
    price,
    category,
    description,
    image_path,
    stock,
  });

  if (error) {
    console.error(error);
    alert("Failed to save product");
  } else {
    alert("Product saved!");
    form.reset();
  }
});

