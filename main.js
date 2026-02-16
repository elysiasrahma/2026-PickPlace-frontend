import './src/style.css'

async function loadRooms() {
  try {
    const response = await fetch('http://localhost:5250/api/rooms');
    const rooms = await response.json();
    const roomTable = document.getElementById('room-table');
    
    roomTable.innerHTML = rooms.map(room => `
      <tr class="hover text-center">
        <td class="font-bold text-left">${room.RoomName}</td>
        <td><div class="badge badge-ghost">${room.Capacity} Orang</div></td>
        <td>
          <button class="btn btn-ghost btn-xs text-info underline" 
            onclick="openDetailModal(
              '${room.RoomName}', 
              '${room.Building || 'Gedung Utama'}', 
              '${room.Facilities || '-'}', 
              '${room.Issues || ''}'
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
    `).join('');
  } catch (error) {
    console.error("Error loadRooms:", error);
    document.getElementById('room-table').innerHTML = 
      `<tr><td colspan="4" class="text-error text-center p-4">Gagal koneksi ke Server! Cek Backend.</td></tr>`;
  }
}

// 2. Fungsi Ambil Riwayat Request
async function loadRequests() {
  try {
    const response = await fetch('http://localhost:5250/api/bookings');
    const bookings = await response.json();
    
    console.log("Data Booking dari Backend:", bookings); 

    const requestTable = document.getElementById('request-table');
    
    if (bookings.length === 0) {
      requestTable.innerHTML = `<tr><td colspan="3" class="text-center italic text-gray-500 p-4">Belum ada riwayat peminjaman.</td></tr>`;
      return;
    }
    
    requestTable.innerHTML = bookings.map(item => `
      <tr class="hover">
        <td class="font-bold">${item.Organization}</td>
        
        <td>${item.Room ? item.Room.RoomName : 'Ruangan Tidak Dikenal'}</td>
        
        <td>
          <span class="badge ${item.Status === 'Approved' ? 'badge-success' : 'badge-warning'}">
            ${item.Status}
          </span>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error("Gagal memuat riwayat:", error);
  }
}

window.openDetailModal = (name, building, facilities, issues) => {
  document.getElementById('detail-title').innerText = name;
  
  const contentDiv = document.getElementById('detail-content');

  const issuesDisplay = issues && issues !== 'null' && issues !== ''
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
  
  document.getElementById('detail_modal').showModal();
};

window.openBookingModal = (roomId, roomName) => {
  document.getElementById('modal-room-name').innerText = roomName;
  document.getElementById('booking-room-id').value = roomId;
  document.getElementById('booking_modal').showModal();
};

document.getElementById('booking-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const payload = {
    BorrowerName: document.getElementById('borrower-name').value,
    Organization: document.getElementById('org-name').value,
    RoomId: parseInt(document.getElementById('booking-room-id').value),
    StartTime: document.getElementById('start-time').value,
    EndTime: document.getElementById('end-time').value,
    Purpose: document.getElementById('purpose').value,
    Status: "Pending" 
  };

  console.log("Mengirim data:", payload); 

  try {
    const res = await fetch('http://localhost:5250/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert('Berhasil! Request peminjaman sudah dikirim.');
      document.getElementById('booking_modal').close();
      document.getElementById('booking-form').reset();
      
      if(typeof loadRequests === 'function') loadRequests(); 
    } else {
      const errorText = await res.text();
      alert('Gagal mengirim request: ' + errorText);
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan koneksi.');
  }
});

loadRooms();
loadRequests();