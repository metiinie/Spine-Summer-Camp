const fs = require('fs');

function updateJson(filename, locale) {
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const root = data[locale];
  
  if (!root.payment.submittedTitle) {
    if (locale === 'en') {
      root.payment.submittedTitle = "Registration Submitted!";
      root.payment.submittedSubtitle = "{firstName}, your registration has been received. Complete your payment below to secure your spot.";
      root.payment.saveNumber = "Save this number to check your registration status";
      root.payment.sessionLabel = "Session";
      root.payment.halfDay = "Session 1 – Half Day";
      root.payment.fullDay = "Session 2 – Full Day";
      root.payment.clickToBrowse = "or click to browse files";
      root.payment.fileTooLarge = "File is too large. Maximum size is 5MB.";
      root.payment.invalidFileType = "Invalid file type. Please upload JPG, PNG, or PDF.";
      root.payment.uploadFailed = "Upload failed. Please try again.";
      root.payment.reviewNote = "We will review and confirm within 24 hours.";
    } else {
      root.payment.submittedTitle = "ምዝገባዎ ደርሷል!";
      root.payment.submittedSubtitle = "{firstName}፣ ምዝገባዎ ተቀባይነት አግኝቷል። ቦታዎን ለማረጋገጥ ከዚህ በታች ክፍያዎን ያጠናቅቁ።";
      root.payment.saveNumber = "የምዝገባ ሁኔታዎን ለማረጋገጥ ይህንን ቁጥር ያስቀምጡ";
      root.payment.sessionLabel = "ክፍለ ጊዜ";
      root.payment.halfDay = "ክፍለ ጊዜ 1 – ግማሽ ቀን";
      root.payment.fullDay = "ክፍለ ጊዜ 2 – ሙሉ ቀን";
      root.payment.clickToBrowse = "ወይም ፋይሎችን ለመምረጥ ጠቅ ያድርጉ";
      root.payment.fileTooLarge = "ፋይሉ በጣም ትልቅ ነው። ከፍተኛ መጠን 5MB ነው።";
      root.payment.invalidFileType = "ትክክለኛ ያልሆነ ፋይል። እባክዎ JPG, PNG ወይም PDF ያስጫኑ።";
      root.payment.uploadFailed = "ማስጫን አልተሳካም። እባክዎ እንደገና ይሞክሩ።";
      root.payment.reviewNote = "ውስጥ 24 ሰዓታት ገምግመን እናረጋግጣለን።";
    }
  }
  
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}

updateJson('messages/en.json', 'en');
updateJson('messages/am.json', 'am');
console.log("Added new keys successfully.");
