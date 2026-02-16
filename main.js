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
    `,
      )
      .join("");
  } catch (error) {
    console.error("Error loadRooms:", error);
    document.getElementById("room-table").innerHTML =
      `<tr><td colspan="4" class="text-error text-center p-4">Gagal koneksi ke Server! Cek Backend.</td></tr>`;
  }
}

// 2. Fungsi Ambil Riwayat Request
// 2. Fungsi Ambil Riwayat Request (Bisa Search)
async function loadRequests(keyword = "") {
  try {
    // Kalau ada keyword search, tambahkan ke URL
    let url = "http://localhost:5250/api/bookings";
    if (keyword) {
      url += `?search=${keyword}`;
    }

    const response = await fetch(url);
    const bookings = await response.json();
    const requestTable = document.getElementById("request-table");

    if (bookings.length === 0) {
      requestTable.innerHTML = `<tr><td colspan="3" class="text-center italic text-gray-500 p-4">Data tidak ditemukan.</td></tr>`;
      return;
    }

    requestTable.innerHTML = bookings
      .map((item) => {
        // Di dalam loop/map loadRequests
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
          <td>${item.Room ? item.Room.RoomName : "Ruangan Tidak Dikenal"}</td>
          <td>
            <div class="flex items-center justify-between">
              <span class="badge ${item.Status === "Approved" ? "badge-success" : "badge-warning"}">
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
    console.error("Gagal memuat riwayat:", error);
    const requestTable = document.getElementById("request-table");
    requestTable.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-error font-bold p-4 bg-red-50">
           Gagal mengambil data!<br>
           <span class="text-xs font-normal text-gray-600">Cek Terminal Backend & Console Browser (F12)</span>
        </td>
      </tr>`;
  }
}

window.openDetailModal = (name, building, facilities, issues) => {
  document.getElementById("detail-title").innerText = name;

  const contentDiv = document.getElementById("detail-content");

  const issuesDisplay =
    issues && issues !== "null" && issues !== ""
      ? `<p class="text-error font-bold">⚠️ ${issues}</p>`
      : `<p class="text-success italic">✓ Tidak ada kerusakan</p>`;

  contentDiv.innerHTML = `
    <div class="flex flex-col gap-4">
      
      <div class="bg-base-200 p-3 rounded-lg">
        <h4 class="font-bold text-xs text-gray-500 uppercase mb-1">Lokasi / Gedung</h4>
        <p class="text-gray-800 font-medium">${building}</p>
      </div>

      <div class="bg-base-200 p-3 rounded-lg">
        <h4 class="font-bold text-xs text-gray-500 uppercase mb-1">Fasilitas Tersedia</h4>
        <p class="text-gray-700 italic">${facilities}</p>
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

document
  .getElementById("booking-form")
  .addEventListener("submit", async (e) => {
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

    console.log("Mengirim data:", payload);

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

        loadRequests();
      } else {
        const errorText = await res.text();
        alert("Gagal mengirim request: " + errorText);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    }
  });

// PASTIKAN pakai window. di depannya
window.openEditModal = (
  id,
  borrower,
  org,
  start,
  end,
  purpose,
  roomId,
  roomName,
) => {
  console.log("Tombol edit dipencet untuk ID:", id); // Untuk tes di F12

  document.getElementById("edit-booking-id").value = id;
  document.getElementById("edit-room-id").value = roomId;

  // tampil aj
  document.getElementById("edit-room-display").innerText = roomName;
  document.getElementById("edit-org-display").innerText = org;
  document.getElementById("edit-purpose-display").innerText = purpose; // Detail tambahan

  // bisa diedit
  document.getElementById("edit-borrower-name").value = borrower;
  document.getElementById("edit-start-time").value = start.substring(0, 16);
  document.getElementById("edit-end-time").value = end.substring(0, 16);

  document.getElementById("edit-org-name").value = org;
  document.getElementById("edit-purpose").value = purpose;

  document.getElementById("edit_modal").showModal();
};

document.getElementById("search-input").addEventListener("keyup", (e) => {
  const keyword = e.target.value;
  loadRequests(keyword);
});

document.addEventListener("click", function (e) {
  if (e.target && e.target.classList.contains("btn-edit")) {
    const btn = e.target;

    const id = btn.getAttribute("data-id");
    const borrower = btn.getAttribute("data-borrower");
    const org = btn.getAttribute("data-org");
    const start = btn.getAttribute("data-start");
    const end = btn.getAttribute("data-end");
    const purpose = btn.getAttribute("data-purpose");
    const roomId = btn.getAttribute("data-roomid");
    const roomName = btn.getAttribute("data-roomname");

    window.openEditModal(id, borrower, org, start, end, purpose, roomId, roomName);
  }
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
      loadRequests(); 
    } else {
      const errorText = await res.text();
      alert("Gagal mengedit: " + errorText);
    }
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan koneksi.");
  }
});

loadRooms();
loadRequests();
