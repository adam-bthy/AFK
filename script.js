// === CONFIG: HIER EINTRAGEN ===
const SUPABASE_URL = "https://hsptoucqycfptkumewzh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzcHRvdWNxeWNmcHRrdW1ld3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0Mzg0MzYsImV4cCI6MjA4MjAxNDQzNn0.hQI6eEfxy7_IsweZxBD_NvBE5u14QXGXD7cw9GFbu64";
// ==============================

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const msg = document.getElementById("msg");
const setMsg = (t) => (msg.textContent = t);

// Tabs
document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".pane").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
    setMsg("");
  });
});

async function refreshDashboard() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    document.getElementById("dash_user").textContent = "—";
    document.getElementById("dash_profile").textContent = "Nicht eingeloggt.";
    return;
  }

  document.getElementById("dash_user").textContent = session.user.id;

  const { data, error } = await supabase
    .from("profiles")
    .select("ic_id, ic_name, discord_user_id, created_at")
    .eq("id", session.user.id)
    .maybeSingle();

  document.getElementById("dash_profile").textContent = error
    ? ("Fehler: " + error.message)
    : JSON.stringify(data, null, 2);
}

// REGISTER
document.getElementById("btn_register").addEventListener("click", async () => {
  setMsg("⏳ Registrierung…");

  const code = document.getElementById("reg_code").value.trim();
  const ic_id = document.getElementById("reg_ic_id").value.trim();
  const ic_name = document.getElementById("reg_ic_name").value.trim();
  const password = document.getElementById("reg_pw").value;

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/register-with-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ code, ic_id, ic_name, password })
    });

    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "Register failed");

    setMsg("✅ Registriert! Jetzt einloggen.");
    // auf Login Tab wechseln
    document.querySelector('[data-tab="login"]').click();
  } catch (e) {
    setMsg("❌ " + (e.message || "Fehler"));
  }
});

// LOGIN
document.getElementById("btn_login").addEventListener("click", async () => {
  setMsg("⏳ Login…");

  const ic_id = document.getElementById("login_ic_id").value.trim();
  const password = document.getElementById("login_pw").value;

  try {
    const email = `${ic_id.toLowerCase()}@law.local`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    setMsg("✅ Eingeloggt!");
    document.querySelector('[data-tab="dashboard"]').click();
    await refreshDashboard();
  } catch (e) {
    setMsg("❌ " + (e.message || "Login fehlgeschlagen"));
  }
});

// LOGOUT
document.getElementById("btn_logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  setMsg("👋 Ausgeloggt.");
  await refreshDashboard();
  document.querySelector('[data-tab="login"]').click();
});

// Initial
refreshDashboard();
