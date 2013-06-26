define(['jquery', 'sdcard'], function ($) {

  var updateStatus = function(status) {
      $("#backup-status").html(status);
  };

  var saveContactsToSdcard = function(contacts) {

    // Do not accept empty contact list
    if (contacts.length <= 0)
      return;

    var vcard = "";
    
    for(index = 0; index < contacts.length; index++) {
      var contact = contacts[index];
      console.log(contact);
      console.log(contact.tel);
      vcard += "BEGIN:VCARD"+"\n"+
        "VERSION:4.0"+"\n"+
        "N:" + contact.givenName.toString() + ";" + contact.familyName.toString() + ";;;"+"\n"+
        "FN:" + contact.name.toString()  + ""+"\n"+
        "ORG:" + contact.org.toString() + ""+"\n";

      var dataset = contact.tel;
      var hasData = dataset && dataset.length;
      var numOfData = hasData ? dataset.length : 0;
      switch (numOfData) {
        case 0:
          break;
        case 1:
          vcard += "TEL;TYPE=" + dataset[0].type.toString() + ",voice;VALUE=uri:tel:" + dataset[0].value.toString() + ""+"\n";
          break;
        default:
          for (var i = 0; i < dataset.length; i++) {
            vcard += "TEL;TYPE=" + dataset[i].type.toString() + ",voice;VALUE=uri:tel:" + dataset[i].value.toString() + ""+"\n";
          }
      }

      dataset = contact.adr;
      hasData = dataset && dataset.length;
      numOfData = hasData ? dataset.length : 0;
      switch (numOfData) {
        case 0:
          break;
        case 1:
          vcard += "ADR;TYPE=" + dataset[0].type.toString() + ";LABEL='" + dataset[0].streetAddress.toString() + "\n" + dataset[0].locality.toString() + ", " + dataset[0].region.toString() + " " + dataset[0].postalCode + "\n" + dataset[0].country + "'"+"\n";
          vcard += " :;;" + dataset[0].streetAddress.toString() + ";" + dataset[0].locality.toString() + ";" + dataset[0].region.toString() + ";" + dataset[0].postalCode.toString() + ";" + dataset[0].country.toString() + ""+"\n";
          break;
        default:
          for (var i = 0; i < dataset.length; i++) {
            vcard += "ADR;TYPE=" + dataset[i].type.toString() + ";LABEL='" + dataset[i].streetAddress.toString() + "\n" + dataset[i].locality.toString() + ", " + dataset[i].region.toString() + " " + dataset[i].postalCode + "\n" + dataset[i].country + "'"+"\n";
            vcard += " :;;" + dataset[i].streetAddress.toString() + ";" + dataset[i].locality.toString() + ";" + dataset[i].region.toString() + ";" + dataset[i].postalCode.toString() + ";" + dataset[i].country.toString() + ""+"\n";
          }
      }

      dataset = contact.email;
      hasData = dataset && dataset.length;
      numOfData = hasData ? dataset.length : 0;
      switch (numOfData) {
        case 0:
          break;
        case 1:
          vcard += "EMAIL:" + dataset[0].value.toString() + ""+"\n";
          break;
        default:
          for (var i = 0; i < dataset.length; i++) {
            vcard += "EMAIL:" + dataset[i].value.toString() + ""+"\n";
          }
      }

      vcard += "REV:20080424T195243Z"+"\n"+
               "END:VCARD" + "\n";
    }
    console.log(vcard);

    var filename = "fos-contact-backup.vcf";
    var sdcard = navigator.getDeviceStorage("sdcard");
    var request = sdcard.delete(filename);
    var file = new Blob([vcard], {type: "text/plain"});
    var request = sdcard.addNamed(file, filename);

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
