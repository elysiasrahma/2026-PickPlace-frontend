import "./src/style.css";

const API_URL = "http://localhost:5250/api";

async function loadAdminDashboard() {
  try {
    const resActive = await fetch(`${API_URL}/bookings?isHistory=false`);
    const dataActive = await resActive.json();
    const resHistory = await fetch(`${API_URL}/bookings?isHistory=true`);
    const dataHistory = await resHistory.json();

    const allBookings = [...dataActive, ...dataHistory];

    const pending = allBookings.filter(b => b.Status === "Pending");
    const approvedToday = allBookings.filter(b => b.Status === "Approved"); 
    
    document.getElementById("count-pending").innerText = pending.length;
    document.getElementById("count-approved").innerText = approvedToday.length;

    renderPendingTable(pending);
    renderAllTable(allBookings);

  } catch (error) {
    console.error("Gagal load admin:", error);
  }
}

function renderPendingTable(data) {
  const table = document.getElementById("admin-pending-table");
  
  if (data.length === 0) {
    table.innerHTML = `<tr><td colspan="4" class="text-center p-8 text-gray-400 italic">Tidak ada request baru.</td></tr>`;
    return;
  }

  table.innerHTML = data.map(item => {
    const startDate = new Date(item.StartTime);
    const endDate = new Date(item.EndTime);
    const startStr = startDate.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    
    let endStr;
    if (startDate.getDate() === endDate.getDate() && startDate.getMonth() === endDate.getMonth()) {
        endStr = endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } else {
        endStr = endDate.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }

    return `
      <tr class="hover">
        <td>
            <div class="font-bold text-lg">${item.Organization}</div>
            <div class="text-sm text-gray-500">${item.BorrowerName}</div>
        </td>
        <td>
            <div class="badge badge-neutral mb-1">${item.Room?.RoomName || "Unknown"}</div>
            <div class="text-xs font-semibold text-gray-600">${startStr} s/d ${endStr}</div>
        </td>
        <td>
            <p class="text-sm italic text-gray-600 max-w-xs truncate">${item.Purpose}</p>
        </td>
        <td class="text-center">
            <div class="join">
                <button class="btn btn-sm btn-success join-item text-white btn-action" 
                    data-id="${item.Id}" data-action="Approved">✓</button>
                <button class="btn btn-sm btn-error join-item text-white btn-action" 
                    data-id="${item.Id}" data-action="Rejected">✕</button>
            </div>
        </td>
      </tr>
    `;
  }).join("");
}

function renderAllTable(data) {
    const table = document.getElementById("admin-all-table");
    
    table.innerHTML = data.map(item => `
        <tr>
            <td><span class="badge ${getStatusColor(item.Status)} badge-xs">${item.Status}</span></td>
            <td><div class="font-bold text-xs">${item.Organization}</div></td>
            <td><div class="text-xs text-gray-600">${item.BorrowerName}</div></td>
            <td><div class="text-xs">${item.Room?.RoomName || "-"}</div></td>
            <td><div class="text-xs">${new Date(item.StartTime).toLocaleDateString('id-ID')}</div></td>
        </tr>
    `).join("");
}

function getStatusColor(status) {
    if(status === 'Approved') return 'badge-success';
    if(status === 'Pending') return 'badge-warning';
    if(status === 'Rejected') return 'badge-error';
    return 'badge-ghost';
}

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-action")) {
        const id = e.target.getAttribute("data-id");
        const action = e.target.getAttribute("data-action");
        
        const confirmMsg = action === "Approved" 
            ? "Setujui peminjaman ini?" 
            : "Tolak peminjaman ini?";

        if (confirm(confirmMsg)) {
            await updateStatus(id, action);
        }
    }
});

async function updateStatus(id, newStatus) {
    try {
        const res = await fetch(`${API_URL}/bookings/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newStatus)
        });

        if (res.ok) loadAdminDashboard();
        else alert("Gagal update status.");
    } catch (err) {
        console.error(err);
        alert("Error koneksi backend.");
    }
}

const addRoomForm = document.getElementById("add-room-form");
if (addRoomForm) {
    addRoomForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const payload = {
            RoomName: document.getElementById("new-room-name").value,
            Capacity: parseInt(document.getElementById("new-room-capacity").value),
            Building: document.getElementById("new-room-building").value,
            Facilities: document.getElementById("new-room-facilities").value,
            Issues: document.getElementById("new-room-issues").value,
            IsDeleted: false // Penting untuk Backend
        };

        try {
            const res = await fetch(`${API_URL}/rooms`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Ruangan berhasil ditambahkan!");
                document.getElementById("add_room_modal").close();
                document.getElementById("add-room-form").reset();
            } else {
                alert("Gagal menyimpan ruangan.");
            }
        } catch (err) { console.error(err); }
    });
}

loadAdminDashboard();