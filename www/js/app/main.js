define(['jquery', 'sdcard'], function ($) {

  var updateStatus = function(status) {
      $("#backup-status").html(status);
  };

  var saveContactsToSdcard = function(contacts) {

    // Do not accept empty contact list
    if (contacts.length <= 0)
      return;

var vcard = "BEGIN:VCARD"+"\n"+
"VERSION:4.0"+"\n"+
"N:Gump;Forrest;;;"+"\n"+
"FN:Forrest Gump"+"\n"+
"ORG:Bubba Gump Shrimp Co."+"\n"+
"TITLE:Shrimp Man"+"\n"+
"PHOTO;MEDIATYPE=image/gif:http://www.example.com/dir_photos/my_photo.gif"+"\n"+
"TEL;TYPE=work,voice;VALUE=uri:tel:+1-111-555-1212"+"\n"+
"TEL;TYPE=home,voice;VALUE=uri:tel:+1-404-555-1212"+"\n"+
"ADR;TYPE=work;LABEL='100 Waters Edge\nBaytown, LA 30314\nUnited States of America'"+"\n"+
" :;;100 Waters Edge;Baytown;LA;30314;United States of America"+"\n"+
"ADR;TYPE=home;LABEL='42 Plantation St.\nBaytown, LA 30314\nUnited States of America'"+"\n"+
" :;;42 Plantation St.;Baytown;LA;30314;United States of America"+"\n"+
"EMAIL:forrestgump@example.com"+"\n"+
"REV:20080424T195243Z"+"\n"+
"END:VCARD";
var sdcard = navigator.getDeviceStorage("sdcard");
var file = new Blob([vcard], {type: "text/plain"});
var request = sdcard.addNamed(file, "test/my-file.vcf");
request.onsuccess = function () {
var name = this.result;
alert('File "' + name + '" successfully wrote on the sdcard storage area');
}
// An error typically occur if a file with the same name already exist
request.onerror = function () {
alert('Unable to write the file: ' + this.error.name);
}

  };


  $(document).ready(function () {

    $(".btn-done").click(function() {

      var cursor = navigator.mozContacts.getAll({});
      var contacts = [];

      cursor.onsuccess = function onsuccess(evt) {

        var contact = evt.target.result;

        if (contact) {

          contacts.push(contact);
          cursor.continue();

        } else {

          if (contacts.length > 0) {
            updateStatus(contacts.length + " contacts");
            saveContactsToSdcard(contacts);
          } else {
            updateStatus("No contact found.");
          }

        }
      };

    });

  });
  
});
