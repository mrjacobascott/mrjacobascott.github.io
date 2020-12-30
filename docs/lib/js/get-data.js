//adapted from the cerner smart on fhir guide. updated to utalize client.js v2 library and FHIR R4

// helper function to process fhir resource to get the patient name.
function getPatientName(pt) {
  if (pt.name) {
    var names = pt.name.map(function(name) {
      return name.given.join(" ") + " " + name.family;
    });
    return names.join(" / ")
  } else {
    return "anonymous";
  }
}

// display the patient name gender and dob in the index page
function displayPatient(pt) {
  document.getElementById('patient_name').innerHTML = getPatientName(pt);
  document.getElementById('gender').innerHTML = pt.gender;
  document.getElementById('dob').innerHTML = pt.birthDate;
}

//helper function to get quanity and unit from an observation resoruce.
function getQuantityValueAndUnit(ob) {
  if (typeof ob != 'undefined' &&
    typeof ob.valueQuantity != 'undefined' &&
    typeof ob.valueQuantity.value != 'undefined' &&
    typeof ob.valueQuantity.unit != 'undefined') {
    return Number(parseFloat((ob.valueQuantity.value)).toFixed(2)) + ' ' + ob.valueQuantity.unit;
  } else {
    return undefined;
  }
}

function getQuantityValue(ob) {
  if (typeof ob != 'undefined' &&
    typeof ob.valueQuantity != 'undefined' &&
    typeof ob.valueQuantity.value != 'undefined' &&
    typeof ob.valueQuantity.unit != 'undefined') {
    return Number(parseFloat((ob.valueQuantity.value)).toFixed(2));
  } else {
    return undefined;
  }
}

// create a patient object to initalize the patient
function defaultPatient() {
  return {
    bilirubin: {
      value: ''
    },
    creatinine: {
      value: ''
    },
    INR: {
      value: ''
    },
    Sodium: {
      value: ''
    },
    Meld: {
      value: ''
    },
    Mortality: {
      value: ''
    },
  };
}

//function to display the observation values you will need to update this
function displayObservation(obs) {
  bilirubin.innerHTML = obs.hdl;
  creatinine.innerHTML = obs.ldl;
  INR.innerHTML = obs.sys;
  Sodium.innerHTML = obs.dia;
}
function getValue(bili, creat, inr, sod){
  //alert(bili + " " + creat + " " + inr);
  if (bili != "" && bili < 1.0) {
    bili = '1.0';
  } else if (bili != ""){
    bili = bilinum;
  } else {
    bili = "undefined";
  }

  if (creat != "" && creat < 1.0) {
    creat = 1.0;
  } else if (creat != "" && creat > 4.0){
    creat = 4.0;
  } else if (creat != "" ){
    creat = creat;
  } else {
    creat = "undefined";
  }

  if (inr != "" && inr < 1.0) {
    inr = 1.0;
  } else if (inr != ""){
    inr = inr;
  } else {
    inr = "undefined";
  }

  if (sod != "" && sod < 125) {
    sod = 125;
  } else if (sod != "" && sod > 137){
    sod = 137;
  } else if (sod != ""){
    sod = sod;
  } else {
    sod = "undefined";
  }

  if (inr == "undefined" || creat == "undefined" || bili == "undefined"){
    var meld = 0;
  } else{
    var meld = Math.round(0.957*Math.log(creat)+0.378*Math.log(bili)+1.120*Math.log(inr)+0.643)*10;
  }

  if (meld > 11 && sod != "undefined"){
    meld = Math.round(meld+1.32*(137-sod)-(0.033*meld*(137-sod)));
      if (meld > 40){
        meld = 40;
      }
  } else if (meld > 11){
    meld = 0;
  }
  //alert("meld " + meld);
  return meld;
}

//once fhir client is authorized then the following functions can be executed
FHIR.oauth2.ready().then(function(client) {

  // get patient object and then display its demographics info in the banner
  client.request(`Patient/${client.patient.id}`).then(
    function(patient) {
      displayPatient(patient);
      console.log(patient);
    }
  );

  var query = new URLSearchParams();

  query.set("patient", client.patient.id);
  query.set("_count", 1000);
  query.set("_sort", "-date");
  query.set("code", [
    'http://loinc.org|1975-2', // bilirubin
    'http://loinc.org|2160-0', // creatininine
    'http://loinc.org|38483-4', // creatininine
    'http://loinc.org|34714-6', //INR
    'http://loinc.org|6301-6', //INR
    'http://loinc.org|92891-1', //INR
    'http://loinc.org|2951-2', // Sodium
    'http://loinc.org|2947-0', // sodium

  ].join(","));

  client.request("Observation?" + query, {
    pageLimit: 5,
    flat: true
  }).then(
    function(ob) {
      // group all of the observation resoruces by type into their own
      var byCodes = client.byCodes(ob, 'code');
      var bili = byCodes('1975-2');
      var creat = byCodes('2160-0');
      var inr = byCodes('6301-6');
      var Sod = byCodes('2951-2');
      
      
      
      if (creat == ""){
        creat = byCodes('38483-4');
      }
      if (Sod == ""){
        Sod = byCodes('2947-0');
      }
      //if (inr = ""){
      //  inr = byCodes('46418-0');
      //}

      //if (inr = ""){
      //  inr = byCodes('34714-6');
      //}
      var bilirubin = getQuantityValueAndUnit(bili[0]);
      var creatinine = getQuantityValueAndUnit(creat[0]);
      var INR = getQuantityValueAndUnit(inr[0]);
      var Sodium = getQuantityValueAndUnit(Sod[0]);

      var bilinum = getQuantityValue(bili[0]);
      var creanum = getQuantityValue(creat[0]);
      var INRnum = getQuantityValue(inr[0]);
      var sodinum = getQuantityValue(Sod[0]);

      var creatDict = {} 
      var encounters = {}
       
      for (meas in creat){
        measure = creat[meas].encounter.reference.substring(10);
        if (measure in encounters) {
          
        } else {
          encounters[measure] = {"edate": "","creat": "", "bili" : "", "inr" : "", "Sod" : ""};;
          encounters[measure]["edate"] = (creat[meas].effectiveDateTime.substring(0,10));
        }
        creatDict[creat[meas].effectiveDateTime.substring(0,10)] = getQuantityValue(creat[meas]);
        encounters[measure]["creat"] =  getQuantityValue(creat[meas]);
      }

      var biliDict = {}
      for (meas in bili){
        measure = bili[meas].encounter.reference.substring(10);
        if (measure in encounters) {
          
        } else {
          encounters[measure] = {"edate": "","creat": "", "bili" : "", "inr" : "", "Sod" : ""};;
          encounters[measure]["edate"] = (bili[meas].effectiveDateTime.substring(0,10));
        }
        biliDict[bili[meas].effectiveDateTime.substring(0,10)] = getQuantityValue(bili[meas]);
        encounters[measure]["bili"] =  getQuantityValue(bili[meas]);
      }

      var inrDict = {}
      for (meas in inr){
        measure = inr[meas].encounter.reference.substring(10);
        if (measure in encounters) {
          
        } else {
          encounters[measure] = {"edate": "","creat": "", "bili" : "", "inr" : "", "Sod" : ""};;
          encounters[measure]["edate"] = (inr[meas].effectiveDateTime.substring(0,10));
        }
        inrDict[inr[meas].effectiveDateTime.substring(0,10)] = getQuantityValue(inr[meas]);
        encounters[measure]["inr"] =  getQuantityValue(inr[meas]);
      }

      var SodDict = {}
      for (meas in Sod){
        measure = Sod[meas].encounter.reference.substring(10);
        if (measure in encounters) {
          
        } else {
          encounters[measure] = {"edate": "","creat": "", "bili" : "", "inr" : "", "Sod" : ""};;
          encounters[measure]["edate"] = (Sod[meas].effectiveDateTime.substring(0,10));
        }
        SodDict[Sod[meas].effectiveDateTime.substring(0,10)] = getQuantityValue(Sod[meas]);
        encounters[measure]["Sod"] =  getQuantityValue(Sod[meas]);
      }

      var table = document.getElementById("meastable")

      for (enc in encounters){
        //alert(enc);
        var row= document.createElement("tr");

        var mdate = document.createElement("td");
        var bildata = document.createElement("td");
        var creatdata = document.createElement("td"); 
        var inrdata = document.createElement("td");
        var sodidata = document.createElement("td");
        var melddata = document.createElement("td"); 

        sstring = "<input type=\"text\" size=\"7.5\" oninput = \"update(this, this.value)\" value=\""
        estring = "\"/>"
        mdate.innerHTML = sstring + encounters[enc]["edate"] + estring;
        bildata.innerHTML = sstring + encounters[enc]["bili"] + estring;
        creatdata.innerHTML = sstring + encounters[enc]["creat"] + estring;
        inrdata.innerHTML = sstring + encounters[enc]["inr"] + estring;
        sodidata.innerHTML = sstring + encounters[enc]["Sod"] + estring;
        meldvalue = getValue(encounters[enc]["bili"], encounters[enc]["creat"], encounters[enc]["inr"], encounters[enc]["Sod"]);
        melddata.innerHTML = sstring + meldvalue + estring;

        row.appendChild(mdate);
        row.appendChild(bildata);
        row.appendChild(creatdata);
        row.appendChild(inrdata);
        row.appendChild(sodidata);
        row.appendChild(melddata);

        table.children[0].appendChild(row);
      }

      function update(id, val){
        id.textContent = val;
      }
    });
}).catch(console.error);
