define(['jquery', 'sdcard'], function ($) {

  var updateStatus = function(status) {
      $("#backup-status").html(status);
  };

  var saveContactsToSdcard = function(contacts) {

    // Do not accept empty contact list
    if (contacts.length <= 0)
      return;

    if (SdCard.checkStorageCard()) {

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
