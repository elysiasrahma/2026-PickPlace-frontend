# 2026-PickPlace-frontend

# PickPlace Frontend

**PickPlace Frontend** adalah antarmuka pengguna (User Interface) untuk sistem peminjaman ruangan **PickPlace**. Aplikasi ini dibangun untuk memudahkan pengguna dalam melihat ketersediaan ruangan, melakukan booking, dan memantau riwayat peminjaman secara *real-time*.

Frontend ini terhubung langsung dengan [PickPlace Backend API](https://github.com/elysiasrahma/2026-PickPlace-backend).

## Fitur Utama

* **Dashboard Peminjaman**: Tampilan kalender/jadwal ketersediaan ruangan yang interaktif.
* **Katalog Ruangan**: Melihat daftar ruangan beserta fasilitas dan kapasitasnya.
* **Form Booking**: Melakukan reservasi ruangan dengan validasi tanggal dan waktu.
* **Riwayat Booking**: Halaman khusus untuk melihat status peminjaman (Active, Completed, Canceled).
* **Responsive Design**: Tampilan yang optimal di Desktop maupun Mobile.

## Teknologi yang Digunakan

* **Styling**: Tailwind CSS / CSS Modules
* **State Management**: Redux / Context API / Pinia
* **HTTP Client**: Axios (untuk integrasi ke ASP.NET Backend)
* **Build Tool**: Vite / Webpack
