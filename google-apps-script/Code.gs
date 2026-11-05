/**
 * Catalyst 7.0 — The Samurai's Journey Registration Backend
 * Google Apps Script (doPost)
 *
 * Instructions:
 * 1. Open Google Sheets -> Extensions -> Apps Script.
 * 2. Replace all code in Code.gs with this file.
 * 3. (Optional) Set FOLDER_ID below to a specific Google Drive Folder ID.
 *    If left blank, the script automatically creates a folder named "Catalyst 7.0 Delegate CVs" in your Drive.
 * 4. Click Deploy -> New deployment -> Select type: Web app.
 *    - Description: Catalyst 7.0 Registration API
 *    - Execute as: Me (your Google account)
 *    - Who has access: Anyone (anonymous users can register)
 * 5. Click Deploy, Authorize access, and copy the Web App URL into your React application's ENDPOINT variable.
 */

// OPTIONAL: Paste your specific Google Drive Folder ID here, or leave empty to auto-create
var FOLDER_ID = "";

var HEADERS = [
  "Timestamp",
  "Full Name",
  "Gender",
  "NIC Number",
  "AIESEC Email",
  "Personal Email",
  "Contact Number",
  "Clan / University",
  "Year of Study",
  "Current Semester",
  "Faculty",
  "AIESEC Programme",
  "Current Rank",
  "Inner Circle / Function",
  "Warrior Persona",
  "What You Seek",
  "What Drives You",
  "Food Preference",
  "Dietary Restrictions / Allergies",
  "Safety & Wellbeing Notes",
  "Emergency Contact Name",
  "Emergency Contact Phone",
  "Final Note",
  "CV Drive Link",
  "CV File Name"
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);

  try {
    var data = {};

    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        // Fallback for form-encoded payload
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Auto-create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#8F0C26");
      headerRange.setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }

    // Process CV File Upload (Base64)
    var cvUrl = "No file uploaded";
    var cvName = data.cvFileName || "None";

    if (data.cvBase64) {
      var folder = getOrCreateFolder();
      var base64Data = data.cvBase64;

      // Strip data URI prefix if present (e.g., "data:application/pdf;base64,")
      if (base64Data.indexOf(",") > -1) {
        base64Data = base64Data.split(",")[1];
      }

      var decodedBytes = Utilities.base64Decode(base64Data);
      var contentType = data.cvMimeType || "application/octet-stream";
      var safeName = (data.name ? data.name.replace(/[^a-zA-Z0-9]/g, "_") : "Delegate") + "_CV_" + cvName;

      var blob = Utilities.newBlob(decodedBytes, contentType, safeName);
      var file = folder.createFile(blob);

      // Allow anyone with link to view the CV
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (shareErr) {
        // Fallback if domain policy prevents public sharing
      }

      cvUrl = file.getUrl();
    }

    // Combine specified options if any
    var clanVal = data.clan || "";
    if (data["clan-sp"]) clanVal += " (" + data["clan-sp"] + ")";

    var facultyVal = data.faculty || "";
    if (data["faculty-sp"]) facultyVal += " (" + data["faculty-sp"] + ")";

    var circleVal = data.circle || "";
    if (data["circle-sp"]) circleVal += " (" + data["circle-sp"] + ")";

    var allergyVal = data.allergy || "";
    if (data["allergy-sp"]) allergyVal += ": " + data["allergy-sp"];

    var safetyVal = data.safety || "";
    if (data["safety-sp"]) safetyVal += ": " + data["safety-sp"];

    var newRow = [
      new Date(),
      data.name || "",
      data.gender || "",
      data.nic || "",
      data.aiesecEmail || "",
      data.email || "",
      data.phone || "",
      clanVal,
      data.year || "",
      data.sem || "",
      facultyVal,
      data.path || "",
      data.rank || "",
      circleVal,
      data.type || "",
      data.seek || "",
      data.drive || "",
      data.diet || "",
      allergyVal,
      safetyVal,
      data.ecName || "",
      data.ecPhone || "",
      data.note || "",
      cvUrl,
      cvName
    ];

    sheet.appendRow(newRow);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Registration recorded successfully",
      cvUrl: cvUrl
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function getOrCreateFolder() {
  if (FOLDER_ID && FOLDER_ID.trim().length > 0) {
    return DriveApp.getFolderById(FOLDER_ID.trim());
  }

  var folderName = "Catalyst 7.0 Delegate CVs";
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }

  return DriveApp.createFolder(folderName);
}
