define(['jquery', 'sdcard'], function ($) {

  var updateStatus = function(status) {
      $("#backup-status").html(status);
  };

	const FILL_IF_MISSING = 1;
	const LIMIT_TO_SINGLE_INSTANCE = 2;
	/**
	 * The cardinality of a property, which defines that the poperty must exist exactly once.
	 */
	const CARDINALITY_ONE = FILL_IF_MISSING | LIMIT_TO_SINGLE_INSTANCE;
	/**
	 * The cardinality of a property, which defines that the poperty must exist exactly once or not at all.
	 */
	const CARDINALITY_STAR_ONE = LIMIT_TO_SINGLE_INSTANCE;
	/**
	 * The cardinality of a property, which defines that the poperty must exist either once or more than once.
	 */
	const CARDINALITY_ONE_STAR = FILL_IF_MISSING;
	/**
	 * The cardinality of a property, which defines that the poperty may exist any number of times.
	 */
	const CARDINALITY_STAR = 0;

	/**
	 * Creates a vCard property string, such as "N:Hogeling;Pimm;;;" from the properties in a contact object. Alternatively,
	 * creates multiple vCard property strings if the parentPropertyNameInData is passed.
	 */
	const createVcardProperty = (function defineCreateVcardProperty() {
		function getPropertyFromData(data, propertyInData) {
			// If the property description is a string, it is the name.
			var propertyNameInData;
			var valuePrefix;
			if ("string" == typeof propertyInData) {
				propertyNameInData = propertyInData;
				valuePrefix = "";
			// Otherwise, it is expected to be an object with a name and a prefix field.
			} else {
				propertyNameInData = propertyInData.name;
				valuePrefix = propertyInData.prefix;
			}
			if (undefined !== data[propertyNameInData] && null !== data[propertyNameInData]) {
				var value = data[propertyNameInData];
				// If the property is an array, join them with a comma (and no space).
				while (Array.isArray(value)) {
					return value.join(",");
				}
				try {
				valuePrefix + value.toString()
				} catch (error) {
				alert(JSON.stringify(data) + " " + propertyNameInData);
				}
				return valuePrefix + value.toString();
			}
			return "";
		}
		function convertPropertyParametersToString(input) {
			// The first value in the array is empty, as the first semicolon separates the property name from the parameters.
			const result = [, ];
			result.push.apply(result, Object.keys(input).map(function constructKeyValuePair(key) {
				return key + "=" + input[key];
			}));
			return result.join(";");
		}
		return function createVcardProperty(data, propertiesInData, propertyNameInVcard, propertyParameters, propertyCardinality, parentPropertyNameInData) {
			if (undefined != parentPropertyNameInData) {
				if (undefined !== data[parentPropertyNameInData] && null !== data[parentPropertyNameInData]) {
					// TODO Respect the LIMIT_TO_SINGLE_INSTANCE bit of the cardinality here.
					return data[parentPropertyNameInData].map(function(data) {
						return createVcardProperty(data, propertiesInData, propertyNameInVcard, propertyParameters, propertyCardinality & FILL_IF_MISSING);
					}).join("");
				} else {
					// TODO Respect the FILL_IF_MISSING bit of the cardinality here.
					return "";
				}
			}
			const value = propertiesInData.map(getPropertyFromData.bind(this, data)).join(";");
			// If the value ends up being only semicolons, and the property is not required as defined by the cardinality, return an
			// empty string. Note that this empty string does not even contain the property name.
			if (0 == (propertyCardinality & FILL_IF_MISSING) && propertiesInData.length - 1 == value.length) {
				return "";
			}
			// If property parameters are defined, include them in the resulting string.
			if (undefined != propertyParameters) {
				return propertyNameInVcard + convertPropertyParametersToString(propertyParameters) + ":" + value + "\n";
			}
			return propertyNameInVcard + ":" + value + "\n";
		};
	})();

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
        // Identification.
        createVcardProperty(contact, ["name"], "FN", undefined, CARDINALITY_STAR_ONE) +
        createVcardProperty(contact, ["familyName", "givenName", "additionalName", "honorificPrefix", "honorificSuffix"], "N", undefined, CARDINALITY_ONE_STAR) +
        createVcardProperty(contact, ["nickname"], "NICKNAME", undefined, CARDINALITY_STAR) +
        // Delivery Addressing.
        createVcardProperty(contact, [,, "streetAddress", "locality", "region", "postalCode", "countryName"], "ADR", undefined, CARDINALITY_STAR, "adr") +
        // Communication.
        createVcardProperty(contact, [{"name": "value", "prefix": "tel:"}], "TEL", {"VALUE": "uri"}, CARDINALITY_STAR, "tel") +
        createVcardProperty(contact, ["value"], "EMAIL", undefined, CARDINALITY_STAR, "email") +
        // Organisational.
        createVcardProperty(contact, ["org"], "ORG", undefined, CARDINALITY_STAR);

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
    // TODO An error may occur if the phone is plugged in, as the SD card is then shared and cannot be written to.
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
