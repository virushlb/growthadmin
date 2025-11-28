// GROWTH ADMIN – PROMO

const SUPABASE_URL = "https://ngtzknecstzlxcpeelth.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndHprbmVjc3R6bHhjcGVlbHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTQ5NjksImV4cCI6MjA3ODE5MDk2OX0.IXvn2GvftKM96DObzCzA1Nvaye9dHri7t5SZfER0eDg";
const PROMO_TABLE = "promo_settings";

const supabasePromo = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const promoForm = document.getElementById("promoForm");
const codeInput = document.getElementById("promoCode");
const discountInput = document.getElementById("promoDiscount");
const activeInput = document.getElementById("promoActive");

async function loadPromo() {
  try {
    const { data, error } = await supabasePromo
      .from(PROMO_TABLE)
      .select("*")
      .limit(1);

    if (error) {
      console.error("Promo load error:", error);
      return;
    }

    if (data && data.length) {
      const p = data[0];
      codeInput.value = p.code || "";
      discountInput.value = p.discount ?? "";
      activeInput.value = p.is_active ? "true" : "false";

      if (p.is_active) {
        localStorage.setItem("growth_promo_code", (p.code || "").toUpperCase());
        localStorage.setItem("growth_promo_discount", String(p.discount || 0));
      } else {
        localStorage.removeItem("growth_promo_code");
        localStorage.removeItem("growth_promo_discount");
      }
    }
  } catch (e) {
    console.error("Promo load exception:", e);
  }
}

async function savePromo(e) {
  e.preventDefault();
  const code = codeInput.value.trim().toUpperCase();
  const discount = Number(discountInput.value || "0");
  const isActive = activeInput.value === "true";

  if (!code || !discount) {
    alert("Code and discount are required.");
    return;
  }

  const payload = {
    id: 1,
    code,
    discount,
    is_active: isActive,
  };

  try {
    const { error } = await supabasePromo
      .from(PROMO_TABLE)
      .upsert(payload, { onConflict: "id" });

    if (error) {
      console.error("Promo save error:", error);
      alert("Saving promo failed. Make sure 'discount' and 'is_active' columns exist.");
      return;
    }

    if (isActive) {
      localStorage.setItem("growth_promo_code", code);
      localStorage.setItem("growth_promo_discount", String(discount));
    } else {
      localStorage.removeItem("growth_promo_code");
      localStorage.removeItem("growth_promo_discount");
    }

    alert("Promo saved.");
  } catch (e) {
    console.error("Promo save exception:", e);
    alert("Promo error.");
  }
}

promoForm.addEventListener("submit", savePromo);
loadPromo();
