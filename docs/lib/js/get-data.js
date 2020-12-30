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

function randomValue(){
  var randbili = Math.floor(Math.random() * (50 - 1) + 1);
  var randcreat = Math.floor(Math.random() * (4 - 1) + 1);
  var randinr = Math.floor(Math.random() * (4 - 1) + 1);
  var randsod = Math.floor(Math.random() * (137 - 125) + 125);
  document.getElementById('bilirubin').innerHTML = randbili;
  document.getElementById('creatinine').innerHTML = randcreat;
  document.getElementById('INR').innerHTML = randinr;
  document.getElementById('Sodium').innerHTML = randsod;
  
  var meld = Math.round(0.957*Math.log(randcreat)+0.378*Math.log(randbili)+1.120*Math.log(randinr)+0.643)*10;    
  if (meld > 11){
    meld = Math.round(meld+1.32*(137-randsod)-(0.033*meld*(137-randsod)));
      if (meld > 40){
        meld = 40;
      }
  }
  var mort = 0;
  if (meld == 0){
    mort = "0";
  }else if (meld < 10){
    mort = "1.9%";
  }else if (meld < 20){
    mort = "6.0%";
  }else if (meld < 30){
    mort = "19.6%";
  }else if (meld < 40){
    mort = "52.6%";
  }else{
    mort = "71.3%";
  }

  document.getElementById('Meld').innerHTML = meld;
  document.getElementById('Mortality').innerHTML = mort;
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
  query.set("_count", 100);
  query.set("_sort", "-date");
  query.set("code", [
    //'http://loinc.org|42719-5',
    //'http://loinc.org|14682-9',
    //'http://loinc.org|46418-0',
    //'http://loinc.org|2947-0',

    'http://loinc.org|1975-2', // bilirubin
    'http://loinc.org|2160-0', // creatininine
    'http://loinc.org|38483-4', // creatininine
    'http://loinc.org|34714-6', //INR
    'http://loinc.org|2951-2', // Sodium
    'http://loinc.org|2947-0', // sodium

  ].join(","));

  client.request("Observation?" + query, {
    pageLimit: 0,
    flat: true
  }).then(
    function(ob) {
      // group all of the observation resoruces by type into their own
      var byCodes = client.byCodes(ob, 'code');
      var bili = byCodes('1975-2');
      var creat = byCodes('2160-0');
      var inr = byCodes('34714-6');
      var Sod = byCodes('2951-2');
      
      
      
      if (creat == ""){
        creat = byCodes('38483-4');
      }
      if (Sod == ""){
        Sod = byCodes('2947-0');
      }

      var bilirubin = getQuantityValueAndUnit(bili[0]);
      var creatinine = getQuantityValueAndUnit(creat[0]);
      var INR = getQuantityValueAndUnit(inr[0]);
      var Sodium = getQuantityValueAndUnit(Sod[0]);

      var bilinum = getQuantityValue(bili[0]);
      var creanum = getQuantityValue(creat[0]);
      var INRnum = getQuantityValue(inr[0]);
      var sodinum = getQuantityValue(Sod[0]);

      // create patient object
      var p = defaultPatient();

      // set patient value parameters to the data pulled from the observation resoruce
      if (typeof bilinum != 'undefined' && bilinum < 1.0) {
        p.bilirubin = '1.0';
      } else if (typeof bilirubin != 'undefined'){
        p.bilirubin = bilinum;
      } else {
        p.bilirubin = 'undefined';
      }

      if (typeof creatinine != 'undefined' && creanum < 1.0) {
        p.creatinine = 1.0;
      } else if (typeof creatinine != 'undefined' && creanum > 4.0){
        p.creatinine = 4.0;
      } else if (typeof creatinine != 'undefined'){
        p.creatinine = creanum;
      } else {
        p.creatinine = 'undefined';
      }

      if (typeof INR != 'undefined' && INRnum < 1.0) {
        p.INR = 1.0;
      } else if (typeof INR != 'undefined'){
        p.INR = INRnum;
      } else {
        p.INR = 'undefined';
      }

      if (typeof Sodium != 'undefined' && sodinum < 125) {
        p.Sodium = 125;
      } else if (typeof Sodium != 'undefined' && sodinum > 137){
        p.Sodium = 137;
      } else if (typeof Sodium != 'undefined'){
        p.Sodium = sodinum;
      } else {
        p.Sodium = 'undefined';
      }

      //TEST DATA
      //p.bilirubin = 10000;
      //p.creatinine = 10000;
      //p.INR = 10000;
      //p.Sodium = 125;
      //p.Meld = 0;
      if (typeof INR == 'undefined' || typeof creatinine == 'undefined' || typeof bilirubin == 'undefined'){
      //if (1==0){
        p.Meld = 'undefined';
      } else{
        p.Meld = Math.round(0.957*Math.log(p.creatinine)+0.378*Math.log(p.bilirubin)+1.120*Math.log(p.INR)+0.643)*10;
      }

      if (p.Meld > 11){
        if (typeof Sodium == 'undefined'){
          p.Meld = 'undefined'
        }else {
          p.Meld = Math.round(p.Meld+1.32*(137-p.Sodium)-(0.033*p.Meld*(137-p.Sodium)));
          if (p.Meld > 40){
            p.Meld = 40;
          }
        }
      }

      if (p.Meld == 'undefined'){
        p.Mortality = 'undefined';
      }else if (p.Meld == 0){
        p.Mortality = "0";
      }else if (p.Meld < 10){
        p.Mortality = "1.9%";
      }else if (p.Meld < 20){
        p.Mortality = "6.0%";
      }else if (p.Meld < 30){
        p.Mortality = "19.6%";
      }else if (p.Meld < 40){
        p.Mortality = "52.6%";
      }else{
        p.Mortality = "71.3%";
      }

      document.getElementById('bilirubin').innerHTML = p.bilirubin;
      document.getElementById('creatinine').innerHTML= p.creatinine;
      document.getElementById('INR').innerHTML = p.INR;
      document.getElementById('Sodium').innerHTML = p.Sodium;
      document.getElementById('Meld').innerHTML = p.Meld;
      document.getElementById('Mortality').innerHTML = p.Mortality;
      document.getElementById('bilirubinactual').innerHTML = bilirubin;
      document.getElementById('creatinineactual').innerHTML= creatinine;
      document.getElementById('INRactual').innerHTML = INR;
      document.getElementById('Sodiumactual').innerHTML = Sodium;
      if(p.Meld == 'undefined'){
        alert("At least one piece of required data not found in patients EHR :( \nUse Randomize! button to test functionality.");
      }
    });
  //event listner when the add button is clicked to call the function that will add the note to the weight observation
 document.getElementById('bilibut').addEventListener('click', randomValue);






}).catch(console.error);
