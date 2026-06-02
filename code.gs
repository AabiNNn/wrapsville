// ============================================================
//  Wrapsville - Google Apps Script
//  Urutan kolom sheet:
//  Timestamp | Nama_Pemesan | No_Telp |
//  Hot_Slaw_Ori | Hot_Slaw_Lvl1 | Hot_Slaw_Lvl2 | Hot_Slaw_Lvl3 |
//  Hot_Classic_Ori | Hot_Classic_Lvl1 | Hot_Classic_Lvl2 | Hot_Classic_Lvl3 |
//  HotNFries_Ori | HotNFries_Lvl1 | HotNFries_Lvl2 | HotNFries_Lvl3 |
//  Opsi Pengiriman | Additional Sauce |
//  Total_Pesanan | Alamat | Catatan | Total_Harga | Bukti_Transfer
// ============================================================

var SHEET_NAME = "Sheet1";
var FOLDER_NAME = "Bukti Transfer Wrapsville";

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var params = e.parameters;

    function get(key, def) {
      return (params[key] && params[key][0] !== undefined) ? params[key][0] : (def !== undefined ? def : "");
    }

    var timestamp      = get("timestamp") || new Date().toLocaleString('id-ID');
    var nama           = get("nama");
    var whatsapp       = get("whatsapp");
    var alamat         = get("alamat");
    var catatan        = get("catatan");
    var opsiPengiriman = get("opsiPengiriman");
    var totalPesanan   = get("totalPesanan");
    var totalHarga     = get("totalHarga");

    // Menu — default 0 jika tidak dikirim
    var hotSlawOri     = get("hotSlawOri",     "0");
    var hotSlawLvl1    = get("hotSlawLvl1",    "0");
    var hotSlawLvl2    = get("hotSlawLvl2",    "0");
    var hotSlawLvl3    = get("hotSlawLvl3",    "0");
    var hotClassicOri  = get("hotClassicOri",  "0");
    var hotClassicLvl1 = get("hotClassicLvl1", "0");
    var hotClassicLvl2 = get("hotClassicLvl2", "0");
    var hotClassicLvl3 = get("hotClassicLvl3", "0");

    // Upload bukti transfer ke Google Drive
    var buktiUrl = "";
    try {
      var fileData = params["buktiTransfer"];
      if (fileData && fileData[0]) {
        var folder = getOrCreateFolder(FOLDER_NAME);
        var decoded = Utilities.base64Decode(fileData[0]);
        var blob = Utilities.newBlob(decoded, "image/jpeg", "bukti_" + nama + "_" + Date.now() + ".jpg");
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        buktiUrl = file.getUrl();
      }
    } catch (fileErr) {
      buktiUrl = "Gagal upload: " + fileErr.message;
    }

    // Tulis ke sheet — kolom lama diisi "" agar urutan tidak geser
    sheet.appendRow([
      timestamp,       // Timestamp
      nama,            // Nama_Pemesan
      whatsapp,        // No_Telp
      hotSlawOri,      // Hot_Slaw_Ori
      hotSlawLvl1,     // Hot_Slaw_Lvl1
      hotSlawLvl2,     // Hot_Slaw_Lvl2
      hotSlawLvl3,     // Hot_Slaw_Lvl3
      hotClassicOri,   // Hot_Classic_Ori
      hotClassicLvl1,  // Hot_Classic_Lvl1
      hotClassicLvl2,  // Hot_Classic_Lvl2
      hotClassicLvl3,  // Hot_Classic_Lvl3
      "0",             // HotNFries_Ori     (tidak dipakai, diisi 0)
      "0",             // HotNFries_Lvl1    (tidak dipakai, diisi 0)
      "0",             // HotNFries_Lvl2    (tidak dipakai, diisi 0)
      "0",             // HotNFries_Lvl3    (tidak dipakai, diisi 0)
      opsiPengiriman,  // Opsi Pengiriman
      "",              // Additional Sauce  (tidak dipakai)
      totalPesanan,    // Total_Pesanan
      alamat,          // Alamat
      catatan,         // Catatan
      totalHarga,      // Total_Harga
      buktiUrl         // Bukti_Transfer
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Pesanan berhasil dikirim!" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(folderName);
}

function testSheetConnection() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (sheet) {
    Logger.log("OK - Sheet: " + sheet.getName() + ", Baris: " + sheet.getLastRow());
  } else {
    Logger.log("GAGAL - Sheet tidak ditemukan. Cek SHEET_NAME.");
  }
}