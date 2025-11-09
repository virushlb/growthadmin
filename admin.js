import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- CONFIG --- //
const SUPABASE_URL = "https://ngtzknecstzlxcpeelth.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndHprbmVjc3R6bHhjcGVlbHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTQ5NjksImV4cCI6MjA3ODE5MDk2OX0.IXvn2GvftKM96DObzCzA1Nvaye9dHri7t5SZfER0eDg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- ELEMENTS --- //
const form = document.getElementById("productForm");
const nameInput = document.getElementById("name");
const stockInput = document.getElementById("stock");
const priceInput = document.getElementById("price");
const categoryInput = document.getElementById("category");
const skuInput = document.getElementById("sku");
const descriptionInput = document.getElementById("description");
const fileInput = document.getElementById("fileInput");

// --- SUBMIT --- //
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) return alert("Please choose an image.");

  try {
    // Upload image
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase
      .storage
      .from("product-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicData } = supabase
      .storage
      .from("product-images")
      .getPublicUrl(fileName);

    // Insert product
    const { error: insertError } = await supabase
      .from("products")
      .insert({
        name: nameInput.value,
        stock: Number(stockInput.value),
        price: Number(priceInput.value),
        category: categoryInput.value,
        sku: skuInput.value,
        description: descriptionInput.value,
        image_url: publicData.publicUrl
      });

    if (insertError) throw insertError;

    alert("✅ Product saved successfully!");
    form.reset();

  } catch (err) {
    console.error(err);
    alert("❌ Failed to save product. Check console for details.");
  }
});
