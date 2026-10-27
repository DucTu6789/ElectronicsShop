// Axios instance: mọi request sẽ gọi tới /api/... của ASP.NET Core
const api = axios.create({ baseURL: "/api" });

const $ = (sel) => document.querySelector(sel);
const money = (n) => Number(n).toLocaleString("vi-VN") + " ₫";
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

let products = [];

// ---------- GET: lấy danh sách ----------
async function loadProducts(search = "") {
  try {
    const res = await api.get("/products", { params: { search } });
    products = res.data;
    render();
  } catch (err) {
    $("#status").textContent = "Không kết nối được API. Hãy kiểm tra backend đang chạy.";
  }
}

function render() {
  $("#status").textContent = products.length ? `${products.length} sản phẩm` : "Chưa có sản phẩm nào.";
  $("#grid").innerHTML = products.map((p) => {
    const img = /^https?:\/\//i.test(p.imageUrl || "")
      ? `<img src="${esc(p.imageUrl)}" alt="${esc(p.name)}">` : "🔌";
    return `
      <article class="card">
        <div class="thumb">${img}</div>
        <div class="info">
          <div class="brand">${esc(p.brand)}</div>
          <h3>${esc(p.name)}</h3>
          <div class="price">${money(p.price)}</div>
          <div class="stock">Còn ${p.stock} sản phẩm</div>
          <p class="desc">${esc(p.description)}</p>
        </div>
        <div class="actions">
          <button class="btn" data-edit="${p.id}">Sửa</button>
          <button class="btn danger" data-delete="${p.id}">Xóa</button>
        </div>
      </article>`;
  }).join("");
}

// ---------- POST / PUT: thêm và sửa ----------
async function saveProduct(e) {
  e.preventDefault();
  const id = $("#id").value;
  const data = {
    name: $("#name").value.trim(),
    brand: $("#brand").value.trim(),
    price: Number($("#price").value),
    stock: Number($("#stock").value),
    imageUrl: $("#imageUrl").value.trim() || null,
    description: $("#description").value.trim() || null,
  };
  try {
    if (id) await api.put(`/products/${id}`, { id: Number(id), ...data }); // PUT
    else await api.post("/products", data);                               // POST
    $("#dlg").close();
    loadProducts($("#search").value);
  } catch (err) {
    alert(err.response?.data?.title || "Lưu thất bại, hãy kiểm tra lại dữ liệu.");
  }
}

// ---------- DELETE: xóa ----------
async function deleteProduct(id) {
  if (!confirm("Xóa sản phẩm này?")) return;
  try {
    await api.delete(`/products/${id}`);
    loadProducts($("#search").value);
  } catch (err) {
    alert("Xóa thất bại.");
  }
}

function openForm(p) {
  $("#dlgTitle").textContent = p ? "Sửa sản phẩm" : "Thêm sản phẩm";
  $("#id").value = p?.id ?? "";
  $("#name").value = p?.name ?? "";
  $("#brand").value = p?.brand ?? "";
  $("#price").value = p?.price ?? "";
  $("#stock").value = p?.stock ?? "";
  $("#imageUrl").value = p?.imageUrl ?? "";
  $("#description").value = p?.description ?? "";
  $("#dlg").showModal();
}

// ---------- Sự kiện ----------
$("#btnAdd").addEventListener("click", () => openForm(null));
$("#btnCancel").addEventListener("click", () => $("#dlg").close());
$("#form").addEventListener("submit", saveProduct);
$("#grid").addEventListener("click", (e) => {
  const edit = e.target.closest("[data-edit]");
  const del = e.target.closest("[data-delete]");
  if (edit) openForm(products.find((p) => p.id === Number(edit.dataset.edit)));
  if (del) deleteProduct(Number(del.dataset.delete));
});
let timer;
$("#search").addEventListener("input", (e) => {
  clearTimeout(timer);
  timer = setTimeout(() => loadProducts(e.target.value), 300);
});

loadProducts();
