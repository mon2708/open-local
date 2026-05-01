# LCLI (Local CommandLine Interface) 🚀

**LCLI** adalah tool CLI agentik lokal yang memungkinkan kamu berinteraksi dengan AI (via Ollama) langsung dari terminal. Dilengkapi dengan fitur premium ala Gemini CLI, LCLI bisa membantu kamu ngoding, ngeringkas file, hingga browsing internet secara otomatis.

![LCLI Banner](https://github.com/mon2708/open-local/raw/main/assets/banner.png) *(Segera tambahkan screenshot kamu di sini!)*

## ✨ Fitur Utama

- 💻 **Interactive Shell**: Mode shell khusus dengan prompt `LCLI>` dan session tracking.
- 🤖 **Local AI Integration**: Terhubung langsung ke Ollama (default: llama3).
- 🛠️ **Coding Assistant**: Analisis kode dan bantuan pemrograman langsung di folder proyek kamu.
- 🌐 **Browser Agent**: Menggunakan Puppeteer untuk mengunjungi website dan mengambil informasi.
- 📊 **Session Summary**: Laporan performa dan statistik penggunaan setiap kali kamu selesai.

## 🚀 Persiapan & Instalasi

### 1. Install Ollama
Pastikan Ollama sudah terinstall di komputer kamu. Jika belum, jalankan di CMD/PowerShell:
```bash
winget install --id Ollama.Ollama
```

### 2. Download Model
Tarik model yang ingin digunakan (default: llama3):
```bash
ollama pull llama3
```

### 3. Install LCLI
Clone repository ini dan install dependensinya:
```bash
git clone https://github.com/mon2708/open-local.git
cd open-local
npm install
```

### 4. Link Global (Opsional)
Agar bisa dipanggil dengan perintah `lcli` dari folder mana saja:
```bash
npm link
```

## 📖 Cara Penggunaan

### Mode Interaktif (Sangat Disarankan)
Cukup ketik:
```bash
lcli
```

### Perintah dalam Shell (Slash Commands)
- `/help` - Menampilkan bantuan.
- `/code <tugas>` - Meminta bantuan koding.
- `/browse <url> <pertanyaan>` - AI akan mengunjungi URL tersebut.
- `/clear` - Membersihkan layar terminal.
- `/exit` - Keluar dan tampilkan ringkasan sesi.

## ⚙️ Konfigurasi
Kamu bisa mengubah model atau host Ollama di file `.env`:
```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3
```

## 📄 Lisensi
Proyek ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detailnya.

---
Dibuat dengan ❤️ oleh [mon2708](https://github.com/mon2708)
