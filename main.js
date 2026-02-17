import "./src/style.css";

async function loadRooms() {
  try {
    const response = await fetch("http://localhost:5250/api/rooms");
    const rooms = await response.json();
    const roomTable = document.getElementById("room-table");

    roomTable.innerHTML = rooms
      .map(
        (room) => `
      <tr class="hover text-center">
        <td class="font-bold text-left">${room.RoomName}</td>
        <td><div class="badge badge-ghost">${room.Capacity} Orang</div></td>
        <td>
          <button class="btn btn-ghost btn-xs text-info underline" 
            onclick="openDetailModal(
              '${room.RoomName}', 
              '${room.Building || "Gedung Utama"}', 
              '${room.Facilities || "-"}', 
              '${room.Issues || ""}'
            )">
            Lihat Detail
          </button>
        </td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="openBookingModal(${room.Id}, '${room.RoomName}')">
            Pinjam
          </button>
        </td>
      </tr>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loadRooms:", error);
    document.getElementById("room-table").innerHTML =
      `<tr><td colspan="4" class="text-error text-center p-4">Gagal koneksi ke Server! Cek Backend.</td></tr>`;
  }
}

async function loadActiveRequests(keyword = "") {
  try {
    let url = "http://localhost:5250/api/bookings";
    if (keyword) url += `?search=${keyword}`;

    const response = await fetch(url);
    const bookings = await response.json();
    const activeTable = document.getElementById("active-table");

    const activeData = bookings.filter(item => 
        ['Pending', 'Approved', 'On Going'].includes(item.Status)
    );

    if (activeData.length === 0) {
      activeTable.innerHTML = `<tr><td colspan="3" class="text-center italic text-gray-500 p-4">Tidak ada peminjaman aktif.</td></tr>`;
      return;
    }

    activeTable.innerHTML = activeData.map((item) => {
        const editButton = item.Status === "Pending"
          ? `<button class="btn btn-xs btn-outline btn-info ml-2 btn-edit" 
                data-id="${item.Id}"
                data-borrower="${item.BorrowerName}"
                data-org="${item.Organization}"
                data-start="${item.StartTime}"
                data-end="${item.EndTime}"
                data-purpose="${item.Purpose}"
                data-roomid="${item.RoomId}"
                data-roomname="${item.Room?.RoomName || "Ruangan"}">Edit</button>` : "";

        const cancelButton = item.Status === "Pending"
          ? `<button class="btn btn-xs btn-outline btn-error ml-1 btn-delete" data-id="${item.Id}">Cancel</button>` : "";

        return `
        <tr class="hover">
          <td>
              <div class="font-bold">${item.Organization}</div>
              <div class="text-xs text-gray-500">${item.BorrowerName}</div>
          </td>
          <td>${item.Room ? item.Room.RoomName : "-"}</td>
          <td>
            <div class="flex items-center justify-between">
              <span class="badge ${item.Status === 'Approved' ? 'badge-success' : 'badge-warning'}">${item.Status}</span>
              <div class="flex">${editButton}${cancelButton}</div>
            </div>
          </td>
        </tr>`;
      }).join("");

  } catch (error) {
    console.error("Gagal load active:", error);
  }
}

async function loadHistoryRequests(keyword = "") {
  try {
    const searchParam = keyword ? `&search=${keyword}` : "";
    const searchParamFuture = keyword ? `?search=${keyword}` : "";

    const resPast = await fetch(`http://localhost:5250/api/bookings?isHistory=true${searchParam}`);
    const dataPast = await resPast.json();

    const resFuture = await fetch(`http://localhost:5250/api/bookings${searchParamFuture}`);
    const dataFuture = await resFuture.json();
    
    const futureHistory = dataFuture.filter(item => 
        ['Rejected', 'Cancelled'].includes(item.Status)
    );

    const allHistory = [...dataPast, ...futureHistory];
    const historyTable = document.getElementById("history-table");

    if (allHistory.length === 0) {
      historyTable.innerHTML = `<tr><td colspan="3" class="text-center italic text-gray-400 p-4">Riwayat tidak ditemukan.</td></tr>`;
      return;
    }

    historyTable.innerHTML = allHistory.map(item => `
      <tr class="opacity-60 hover:opacity-100 transition">
        <td>
            <div class="font-bold line-through decoration-gray-400">${item.Organization}</div>
            <div class="text-xs">${item.BorrowerName}</div>
        </td>
        <td>${item.Room ? item.Room.RoomName : '-'}</td>
        <td>
          <span class="badge ${
            item.Status === 'Completed' ? 'badge-neutral' : 'badge-error'
          }">
            ${item.Status}
          </span>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error("Gagal load history:", error);
  }
}

window.openDetailModal = (name, building, facilities, issues) => {
  document.getElementById("detail-title").innerText = name;
  const contentDiv = document.getElementById("detail-content");
  const issuesDisplay = issues && issues !== "null" && issues !== ""
      ? `<p class="text-error font-bold">⚠️ ${issues}</p>`
      : `<p class="text-success italic">✓ Tidak ada kerusakan</p>`;

  contentDiv.innerHTML = `
    <div class="flex flex-col gap-4">
      <div class="bg-base-200 p-3 rounded-lg">
        <h4 class="font-bold text-xs text-gray-500 uppercase mb-1">Lokasi</h4>
        <p class="text-gray-800 font-medium">${building}</p>
      </div>
      <div class="bg-base-200 p-3 rounded-lg">
        <h4 class="font-bold text-xs text-gray-500 uppercase mb-1">Fasilitas</h4>
        <p class="text-gray-700 italic">${facilities}</p>
      </div>
      <div class="bg-red-50 p-3 rounded-lg border border-red-100">
        <h4 class="font-bold text-xs text-red-400 uppercase mb-1">Laporan</h4>
        ${issuesDisplay}
      </div>
    </div>`;
  document.getElementById("detail_modal").showModal();
};

window.openBookingModal = (roomId, roomName) => {
  document.getElementById("modal-room-name").innerText = roomName;
  document.getElementById("booking-room-id").value = roomId;
  document.getElementById("booking_modal").showModal();
};

window.openEditModal = (id, borrower, org, start, end, purpose, roomId, roomName) => {
  document.getElementById("edit-booking-id").value = id;
  document.getElementById("edit-room-id").value = roomId;

  document.getElementById("edit-room-display").innerText = roomName;
  document.getElementById("edit-org-display").innerText = org;
  document.getElementById("edit-purpose-display").innerText = purpose;

  document.getElementById("edit-borrower-name").value = borrower;
  document.getElementById("edit-start-time").value = start.substring(0, 16);
  document.getElementById("edit-end-time").value = end.substring(0, 16);

  document.getElementById("edit-org-name").value = org;
  document.getElementById("edit-purpose").value = purpose;

  document.getElementById("edit_modal").showModal();
};

document.getElementById("booking-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      BorrowerName: document.getElementById("borrower-name").value,
      Organization: document.getElementById("org-name").value,
      RoomId: parseInt(document.getElementById("booking-room-id").value),
      StartTime: document.getElementById("start-time").value,
      EndTime: document.getElementById("end-time").value,
      Purpose: document.getElementById("purpose").value,
      Status: "Pending",
    };
    try {
      const res = await fetch("http://localhost:5250/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("Berhasil! Request peminjaman sudah dikirim.");
        document.getElementById("booking_modal").close();
        document.getElementById("booking-form").reset();
        
        document.getElementById("tab-requests").checked = true; 
        loadActiveRequests();
      } else {
        alert("Gagal mengirim request: " + await res.text());
      }
    } catch (err) { console.error(err); alert("Terjadi kesalahan koneksi."); }
});

document.getElementById("edit-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("edit-booking-id").value;
  const payload = {
    Id: parseInt(id),
    BorrowerName: document.getElementById("edit-borrower-name").value,
    Organization: document.getElementById("edit-org-name").value, 
    RoomId: parseInt(document.getElementById("edit-room-id").value),
    StartTime: document.getElementById("edit-start-time").value,
    EndTime: document.getElementById("edit-end-time").value,
    Purpose: document.getElementById("edit-purpose").value, 
    Status: "Pending" 
  };
  try {
    const res = await fetch(`http://localhost:5250/api/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      alert("Perubahan berhasil disimpan!");
      document.getElementById("edit_modal").close();
      loadActiveRequests(); 
    } else {
      alert("Gagal mengedit: " + await res.text());
    }
  } catch (err) { console.error(err); alert("Terjadi kesalahan koneksi."); }
});

document.addEventListener("click", async function (e) {
  if (e.target && e.target.classList.contains("btn-edit")) {
    const btn = e.target;
    window.openEditModal(
        btn.getAttribute("data-id"),
        btn.getAttribute("data-borrower"),
        btn.getAttribute("data-org"),
        btn.getAttribute("data-start"),
        btn.getAttribute("data-end"),
        btn.getAttribute("data-purpose"),
        btn.getAttribute("data-roomid"),
        btn.getAttribute("data-roomname")
    );
  }

  if (e.target && e.target.classList.contains("btn-delete")) {
    const id = e.target.getAttribute("data-id");
    if (confirm("Apakah Anda yakin ingin membatalkan pengajuan ini?")) {
        try {
            const res = await fetch(`http://localhost:5250/api/bookings/${id}`, { method: "DELETE" });
            if (res.ok) {
                alert("Pengajuan berhasil dibatalkan.");
                loadActiveRequests();
            } else {
                alert("Gagal membatalkan.");
            }
        } catch (err) { console.error(err); }
    }
  }
});

document.getElementById("search-input").addEventListener("keyup", (e) => {
  loadActiveRequests(e.target.value);
});
document.getElementById("search-history").addEventListener("keyup", (e) => {
  loadHistoryRequests(e.target.value);
});

document.getElementById('tab-history').addEventListener('click', () => loadHistoryRequests());
document.getElementById('tab-requests').addEventListener('click', () => loadActiveRequests());

loadRooms();
loadActiveRequests();