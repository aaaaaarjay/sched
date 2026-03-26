function doGet(e) {
  return handleRequest(e || {});
}

function doPost(e) {
  const jsonData = JSON.parse(e.postData.contents);
  return handleRequest(jsonData);
}

function handleRequest(params) {
  const action = params?.action;
  const sheetName = params?.sheet;
  const data = params?.data;
  
  try {
    const sheetId = '17cKxYPpqYT5AzzynZ4fdmx-bmtYNKwpn6R6dfb-GAQU';
    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName(sheetName);
    
    if (action === 'GET') {
      const value = sheet.getRange('A1').getValue();
      const defaultValue = sheetName === 'Schedule' ? [] : {};
      const result = value || defaultValue;
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
    } 
    if (action === 'POST' && data) {
      sheet.getRange('A1').setValue(data);
      return ContentService
        .createTextOutput('OK')
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*'
      });
  }
  
  return ContentService.createTextOutput('Invalid request').setMimeType(ContentService.MimeType.TEXT);
}
