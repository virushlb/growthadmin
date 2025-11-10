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
const descriptionInput = document.getElementById("description");
const fileInput = document.getElementById("fileInput");

// --- SUBMIT --- //
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) return alert("Please choose an image.");

  try {
    const fileName = `${Date.now()}-${file.name}`;
    
    // Upload to Supabase Storage bucket "product-images"
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

    const imageUrl = publicData.publicUrl;

    // Insert product into DB
    const { error: insertError } = await supabase
      .from("products")
      .insert({
        name: nameInput.value.trim(),
        stock: Number(stockInput.value),
        price: Number(priceInput.value),
        category: categoryInput.value.trim(),
        description: descriptionInput.value.trim(),
        image_path: imageUrl   // ✅ matches your table
      });

    if (insertError) throw insertError;

    alert("✅ Product saved successfully!");
    form.reset();

  } catch (err) {
    console.error(err);
    alert("❌ Failed to save product. Check console for details.");
  }
});
