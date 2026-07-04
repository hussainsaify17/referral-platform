/**
 * Google Apps Script Webhook Handler
 * 
 * Paste this code into your Google Sheets Apps Script Editor:
 * Extensions > Apps Script
 * 
 * It handles updating referrals, adding feedback, and generating email & calendar event reminders for expiring offers.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // --- 1. HANDLE EXPIRY ALERTS ---
    if (data.type === "expiry_alert") {
      var emailRecipient = "itssaify.17@gmail.com";
      var offerName = data.name;
      var code = data.code || "Link-Only";
      var expiryStr = data.expiry; // Date string format, e.g. "6/29/2027" or ISO
      var category = data.category || "General";
      var slug = data.slug || "";
      var referralLink = data.link || "";
      var hoursLeft = data.hoursLeft || 24;
      
      var expiryDate = new Date(expiryStr);
      if (isNaN(expiryDate.getTime())) {
        expiryDate = new Date(); // fallback
      }
      
      var formattedDate = Utilities.formatDate(expiryDate, Session.getScriptTimeZone(), "EEEE, MMM d, yyyy");
      var livePageUrl = "https://referbenefits.co.in/" + slug;
      
      // A. Create Google Calendar Event (Checking for duplicates first)
      var calendar = CalendarApp.getDefaultCalendar();
      var eventTitle = "⏳ Update " + offerName + " Referral Code";
      
      // Check if event already exists on that day to avoid spamming duplicates
      var eventsOnDay = calendar.getEvents(
        new Date(expiryDate.getTime() - 12 * 60 * 60 * 1000), // 12 hours before
        new Date(expiryDate.getTime() + 12 * 60 * 60 * 1000)  // 12 hours after
      );
      var isDuplicate = false;
      for (var i = 0; i < eventsOnDay.length; i++) {
        if (eventsOnDay[i].getTitle() === eventTitle) {
          isDuplicate = true;
          break;
        }
      }
      
      var calendarEventId = "";
      if (!isDuplicate) {
        var eventDescription = 
          "⚠️ REFERRAL CODE EXPIRING SOON\n\n" +
          "Offer: " + offerName + "\n" +
          "Category: " + category + "\n" +
          "Coupon/Referral Code: " + code + "\n" +
          "Expiration Date: " + formattedDate + "\n\n" +
          "🔗 Live Page: " + livePageUrl + "\n" +
          "🔗 Direct Partner Link: " + referralLink + "\n\n" +
          "Please update the coupon code in your Google Sheet spreadsheet: https://docs.google.com/spreadsheets/d/1vTe_um3XpIobNDndeDPmo1-gpIjM6LX7zBmS8A119sZpqK8raAIMp3m5UMmhMxQcCdVBibCIog-_JEa/edit";
          
        var event = calendar.createAllDayEvent(eventTitle, expiryDate, {
          description: eventDescription
        });
        calendarEventId = event.getId();
      }
      
      // B. Send Email Alert with Details & Calendar Event Confirmation
      var emailSubject = "⚠️ Action Required: " + offerName + " Referral Code Expiring in " + hoursLeft + " Hours!";
      
      var htmlBody = 
        "<div style='font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; color: #1f1f1f;'>" +
          "<h2 style='color: #dc2626; margin-top: 0;'>⏳ Referral Code Expiration Alert</h2>" +
          "<p>Hello,</p>" +
          "<p>The referral code/offer for <strong>" + offerName + "</strong> is expiring in approximately <strong>" + hoursLeft + " hours</strong> (on " + formattedDate + ").</p>" +
          
          "<div style='background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px; margin: 18px 0;'>" +
            "<table style='width: 100%; font-size: 14px; border-collapse: collapse;'>" +
              "<tr><td style='padding: 4px 0; font-weight: bold; width: 140px;'>Offer Name:</td><td>" + offerName + "</td></tr>" +
              "<tr><td style='padding: 4px 0; font-weight: bold;'>Category:</td><td>" + category + "</td></tr>" +
              "<tr><td style='padding: 4px 0; font-weight: bold;'>Referral Code:</td><td><code>" + code + "</code></td></tr>" +
              "<tr><td style='padding: 4px 0; font-weight: bold;'>Expiry Date:</td><td>" + formattedDate + "</td></tr>" +
            "</table>" +
          "</div>" +
          
          "<p style='margin-bottom: 24px;'>A calendar event has been added to your Google Calendar for this date to remind you.</p>" +
          
          "<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>" +
            "<tr>" +
              "<td><a href='" + livePageUrl + "' style='display: inline-block; background-color: #0f172a; color: #ffffff; padding: 10px 16px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;'>View Live Page</a></td>" +
              "<td><a href='https://docs.google.com/spreadsheets/d/1vTe_um3XpIobNDndeDPmo1-gpIjM6LX7zBmS8A119sZpqK8raAIMp3m5UMmhMxQcCdVBibCIog-_JEa/edit' style='display: inline-block; background-color: #f1f5f9; color: #0f172a; padding: 10px 16px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; border: 1px solid #cbd5e1;'>Open Google Sheet</a></td>" +
            "</tr>" +
          "</table>" +
          
          "<p style='font-size: 12px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px;'>" +
            "Sent automatically by ReferBenefits Webhook Bot. If you already updated this code, you can ignore this email." +
          "</p>" +
        "</div>";

      MailApp.sendEmail({
        to: emailRecipient,
        subject: emailSubject,
        htmlBody: htmlBody
      });
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Expiry alert processed.",
        calendarEventCreated: !isDuplicate,
        eventId: calendarEventId
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // --- 2. EXISTING CODE (update_referral) ---
    if (data.type === "update_referral") {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      var range = sheet.getDataRange();
      var values = range.getValues();
      var headers = values[0];
      
      var slugColIndex = headers.indexOf("slug");
      var codeColIndex = headers.indexOf("referral_code");
      var linkColIndex = headers.indexOf("referral_link");
      
      if (slugColIndex === -1) {
        throw new Error("Could not find 'slug' column in header row.");
      }
      
      var targetSlug = data.updates.slug || data.slug;
      var rowIndex = -1;
      for (var r = 1; r < values.length; r++) {
        if (values[r][slugColIndex] === targetSlug) {
          rowIndex = r + 1; // 1-based index
          break;
        }
      }
      
      if (rowIndex === -1) {
        // If not found by slug, try finding by matching code or link
        for (var r = 1; r < values.length; r++) {
          if ((codeColIndex !== -1 && values[r][codeColIndex] === data.referral_code) ||
              (linkColIndex !== -1 && values[r][linkColIndex] === data.referral_link)) {
            rowIndex = r + 1;
            break;
          }
        }
      }
      
      if (rowIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Referral row not found."
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Update the fields present in data.updates
      for (var key in data.updates) {
        var colIndex = headers.indexOf(key);
        if (colIndex !== -1) {
          var val = data.updates[key];
          sheet.getRange(rowIndex, colIndex + 1).setValue(val);
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Referral updated successfully"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // --- 3. EXISTING CODE (feedback) ---
    if (data.type === "feedback") {
      var doc = SpreadsheetApp.getActiveSpreadsheet();
      var feedbackSheet = doc.getSheetByName("Feedback") || doc.insertSheet("Feedback");
      
      if (feedbackSheet.getLastRow() === 0) {
        feedbackSheet.appendRow(["Timestamp", "Score", "Comment", "Page Slug", "User Agent"]);
        feedbackSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#f1f5f9");
      }
      
      feedbackSheet.appendRow([
        new Date(),
        data.score,
        data.comment || "",
        data.slug || "home",
        data.userAgent || ""
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Feedback submitted successfully"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
