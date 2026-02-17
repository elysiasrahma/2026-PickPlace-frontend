import "./src/style.css";

const API_URL = "http://localhost:5250/api";

async function loadRooms() {
  try {
    const response = await fetch(`${API_URL}/rooms`);
    const rooms = await response.json();
    const roomTable = document.getElementById("room-table");

    if (!roomTable) return;

    roomTable.innerHTML = rooms
      .map(
        (room) => `
      <tr class="hover text-center">
        <td class="text-left">
            <div class="font-bold text-lg">${room.RoomName}</div>
            <div class="text-xs text-gray-500">${room.Building || '-'}</div>
        </td>
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
          <button class="btn btn-sm btn-primary text-white" onclick="openBookingModal(${room.Id}, '${room.RoomName}')">
            Pinjam
          </button>
        </td>
      </tr>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loadRooms:", error);
    const table = document.getElementById("room-table");
    if(table) table.innerHTML = `<tr><td colspan="4" class="text-error text-center p-4">Gagal koneksi ke Server! Cek Backend.</td></tr>`;
  }
}

async function loadRequests(keyword = "") {
  try {
    let url = `${API_URL}/bookings?isHistory=false`;
    if (keyword) {
      url += `&search=${keyword}`;
    }

    const response = await fetch(url);
    const allActive = await response.json();
    
    const bookings = allActive.filter(b => b.Status === 'Pending' || b.Status === 'Approved');

    const requestTable = document.getElementById("active-table");

    if (!requestTable) return;

    if (bookings.length === 0) {
      requestTable.innerHTML = `<tr><td colspan="3" class="text-center italic text-gray-500 p-4">Tidak ada peminjaman aktif.</td></tr>`;
      return;
    }

    requestTable.innerHTML = bookings
      .map((item) => {
        const editButton =
          item.Status === "Pending"
            ? `<button class="btn btn-xs btn-outline btn-info ml-2 btn-edit" 
        data-id="${item.Id}"
        data-borrower="${item.BorrowerName}"
        data-org="${item.Organization}"
        data-start="${item.StartTime}"
        data-end="${item.EndTime}"
        data-purpose="${item.Purpose}"
        data-roomid="${item.RoomId}"
        data-roomname="${item.Room?.RoomName || "Ruangan"}">
        Edit
      </button>`
            : "";

        return `
        <tr class="hover">
          <td>
              <div class="font-bold">${item.Organization}</div>
              <div class="text-xs text-gray-500">${item.BorrowerName}</div>
          </td>
          <td>
            <div class="font-bold text-sm">${item.Room ? item.Room.RoomName : "Unknown"}</div>
            <div class="text-xs text-gray-500">${new Date(item.StartTime).toLocaleDateString()}</div>
          </td>
          <td>
            <div class="flex items-center justify-between">
              <span class="badge ${getStatusColor(item.Status)} text-white">
                ${item.Status}
              </span>
              ${editButton}
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  } catch (error) {
    console.error("Gagal memuat request:", error);
  }
}

async function loadHistory() {
    try {
        const resActive = await fetch(`${API_URL}/bookings?isHistory=false`);
        const resHistory = await fetch(`${API_URL}/bookings?isHistory=true`);
        
        const dataActive = await resActive.json();
        const dataHistory = await resHistory.json();
        
        const bookings = [...dataActive, ...dataHistory]
            .filter(b => b.Status !== 'Pending' && b.Status !== 'Approved') 
            .sort((a, b) => new Date(b.StartTime) - new Date(a.StartTime));
        
        const table = document.getElementById("history-table");

        if(!table) return;

        if (bookings.length === 0) {
             table.innerHTML = `<tr><td colspan="3" class="text-center p-4 text-gray-400 italic">Belum ada riwayat arsip.</td></tr>`;
             return;
        }

        table.innerHTML = bookings.map(b => `
            <tr>
                <td><div class="font-bold text-xs">${b.Organization}</div></td>
                <td><div class="text-xs">${b.Room?.RoomName || '-'}</div></td>
                <td><span class="badge ${getStatusColor(b.Status)} badge-sm text-white">${b.Status}</span></td>
            </tr>
        `).join("");
    } catch (err) { console.error(err); }
}

function getStatusColor(status) {
    if (status === 'Approved') return 'badge-success';
    if (status === 'Pending') return 'badge-warning';
    if (status === 'Rejected' || status === 'Canceled') return 'badge-error';
    if (status === 'Completed') return 'badge-neutral';
    return 'badge-ghost';
}

window.openDetailModal = (name, building, facilities, issues) => {
  document.getElementById("detail-title").innerText = name;
  const contentDiv = document.getElementById("detail-content");

  const issuesDisplay =
    issues && issues !== "null" && issues !== ""
      ? `<p class="text-error font-bold text-sm">⚠️ ${issues}</p>`
      : `<p class="text-success italic text-sm">✓ Tidak ada kerusakan</p>`;

  contentDiv.innerHTML = `
    <div class="flex flex-col gap-3">
      <div class="bg-base-200 p-3 rounded-lg">
        <h4 class="font-bold text-xs text-gray-500 uppercase mb-1">Lokasi</h4>
        <p class="text-gray-800 font-medium text-sm">${building}</p>
      </div>
      <div class="bg-base-200 p-3 rounded-lg">
        <h4 class="font-bold text-xs text-gray-500 uppercase mb-1">Fasilitas</h4>
        <p class="text-gray-700 italic text-sm">${facilities}</p>
      </div>
      <div class="bg-red-50 p-3 rounded-lg border border-red-100">
        <h4 class="font-bold text-xs text-red-400 uppercase mb-1">Laporan Kerusakan</h4>
        ${issuesDisplay}
      </div>
    </div>
  `;
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

const bookingForm = document.getElementById("booking-form");
if(bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
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
        const res = await fetch(`${API_URL}/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          alert("Berhasil! Request peminjaman sudah dikirim.");
          document.getElementById("booking_modal").close();
          bookingForm.reset();
          loadRequests();
          loadHistory();
        } else {
          const errorText = await res.text();
          alert("Gagal mengirim request: " + errorText);
        }
      } catch (err) { console.error(err); }
    });
}

const editForm = document.getElementById("edit-form");
if(editForm){
    editForm.addEventListener("submit", async (e) => {
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
        const res = await fetch(`${API_URL}/bookings/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          alert("Perubahan berhasil disimpan!");
          document.getElementById("edit_modal").close();
          loadRequests(); 
          loadHistory();
        } else {
          const errorText = await res.text();
          alert("Gagal mengedit: " + errorText);
        }
      } catch (err) { console.error(err); }
    });
}

document.addEventListener("click", function (e) {
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
});

const searchInput = document.getElementById("search-input");
if(searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      loadRequests(e.target.value);
    });
}

loadRooms();
loadRequests();
loadHistory();