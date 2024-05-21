$(document).ready(function(){
    getOfficersNameID();
}); 

// Generate 
async function generateComplaintsTable(tbodyId) {

    $("#"+tbodyId).empty();


    const complintsList = await ccrsAPI("/complaints");
    
    if (complintsList.length > 0){
        
        const officers = await ccrsAPI("/officers") 
        const complainants = await ccrsAPI("/complainants") 
        
        for (let index = 0; index < complintsList.length; index++) {
            const complaint = complintsList[index];
            
            const complainant = complainants.find(temp => temp["complainant_id"] === complaint.complainant_id);
            const officer = officers.find(temp => temp["officer_id"] === complaint.complaint_incharge_id);

            let status_text = "";

            if (complaint.status == "dismissed"){
                status_text = `<i class="bi bi-circle-fill text-danger"></i>`
            }
            else if(complaint.status == "solved"){
                status_text = `<i class="bi bi-circle-fill text-success"></i>`
            }
            else if(complaint.status == "In Progress"){
                status_text = `<i class="bi bi-circle-fill text-sanatani"></i>`
            }
            else if(complaint.status == "registered"){
                status_text = `<i class="bi bi-circle-fill text-info"></i>`
            }

            let priority_icon = ""
            if (complaint.priority == "low"){
                priority_icon = `<i class="bi bi-arrow-down-circle-fill text-secondary"></i>`
            }
            else if (complaint.priority == "medium"){
                priority_icon = `<i class="bi bi-arrow-right-circle-fill text-primary"></i>`
            }
            else if (complaint.priority == "high"){
                priority_icon = `<i class="bi bi-arrow-up-circle-fill text-danger"></i>`
            }

            const tr =  `<tr>
            <td>${index + 1}</td>
            <td>${complaint.complaint_id}</td>
            <td>${complainant.first_name}  ${complainant.last_name}</td>
            <td>${officer.first_name} ${officer.last_name}</td>
            <td>${complaint.complaint_categories}</td>
            <td>${priority_icon} ${complaint.priority}</td>
            <td>${status_text} ${complaint.status}</td>
            </tr>
            `;
    
            $("#"+tbodyId).append(tr)
        }
    }
    else{
        $("#"+tbodyId).append(`<tr><td colspan="7" class="fs-4 text-center">No Complaints Registered</td></tr>`)   
        }
}

// Getting List of Officer with their name and id 
async function getOfficersNameID(){
    try{

        const officersList = await ccrsAPI("/officers");

        officersList.forEach(officer => {
            const option = `
            <option value="${officer.officer_id}">${officer.first_name} ${officer.last_name} (${officer.officer_id})</option>
            `;
            $('#selectOfficer').append(option);
        });
        
    }
    catch (error) {
        console.error(error);
    }
}




// For Sortable box and accordian and dynamic generation 

// $(document).ready(function () {
//      const sorting = {
//          "Complainants": ["Name", "DOB", "Gender", "Address", "Emails"],
//          "Complaints": ["Priority", "Categories", "Incident-Datetime", "Registration-Datetime"],
//          "Officers": ["Name", "DOB", "Gender", "Address", "Emails", "Position", "Expertise"]
//      };
 
//      const sectionsContainer = $('#sections');
//      const tableHeadersContainer = $('#tableHeaders');
 
//      Object.keys(sorting).forEach(section => {
//          const accordian = $(` <div class="accordion-item">
//          <h2 class="accordion-header">
//            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${section.toLowerCase()}" aria-expanded="false" aria-controls="${section.toLowerCase()}">
//                 ${section}
//            </button>
//          </h2>
//          </div>`);
//          const accordianCollapse = $(`<div id="${section.toLowerCase()}" class="accordion-collapse collapse" data-bs-parent="#sections"></div>`);
         
//          const accordianBody = $(` <div class="accordion-body"></div>`)

//          const sectionDiv = $('<div class="row section"></div>');
//         //  sectionDiv.append(`<h3>${section}</h3>`);
 
//          sorting[section].forEach(field => {
//              const fieldType = getFieldType(field);
//              const idSelector = {
//                  "Complainants": "cmplnant",
//                  "Complaints": "cmpt",
//                  "Officers": "offcr"
//              };
//              const fieldInputId = `${idSelector[section]}_${field.toLowerCase()}_input`;
 
//              const sortableRow = $('<div class="col-md-6 sortable-row"></div>');
 
//              const innerRow = $('<div class="row"></div>');
             
//              const sortableInput = $('<div class="col-md-12 mb-1 sortable-input"></div>');
//              sortableInput.append(`<label for="${fieldInputId}">${field}</label>`);
 
//              if (fieldType === 'text') {
//                  sortableInput.append(`<input type="text" class="form-control" id="${fieldInputId}" placeholder="Enter ${field}">`);
//              } else if (fieldType === 'date') {
//                  sortableInput.append(`<input type="date" class="form-control" id="${fieldInputId}" required>`);
//              } else if (fieldType === 'datetime-local') {
//                  sortableInput.append(`<div class="datetime-group">
//                      <input type="datetime-local" class="form-control" id="${fieldInputId}_from" required>
//                      <input type="datetime-local" class="form-control" id="${fieldInputId}" required>
//                  </div>`);
//              }
             
//              const sortableCol = $(`<div class="col-md-12 p-1"></div>`);
 
//              const sortableBox = $(`<div class="sortable-box" id="sortableBox_${field.toLowerCase()}"></div>`);
             
//              sortableCol.append(sortableBox)
//              innerRow.append(sortableInput);
//              innerRow.append(sortableCol);
 
//              sortableRow.append(innerRow);
//              sectionDiv.append(sortableRow);
 
//              $("#" + fieldInputId).on("keypress", function (event) {
//                  if (event.key == "Enter") {
//                      addName(fieldInputId, `sortableBox_${field.toLowerCase()}`)
//                  }
//              });
//          });
 
//          accordianBody.append(sectionDiv);
//          accordianCollapse.append(accordianBody);
//          accordian.append(accordianCollapse);
//          sectionsContainer.append(accordian);

//      });
 
//      // Create table headers dynamically
//      const tableHeaders = sorting['Complainants'].concat(sorting['Complaints'], sorting['Officers']);
//      tableHeaders.forEach(header => {
//          tableHeadersContainer.append(`<th class="sortable-header" data-sort="${header.toLowerCase()}">${header}</th>`);
//      });
 
//      Object.keys(sorting).forEach(section => {
//          const idSelector = {
//              "Complainants": "cmplnant",
//              "Complaints": "cmpt",
//              "Officers": "offcr"
//          };
 
//          sorting[section].forEach(field => {
//              const fieldInputId = `${idSelector[section]}_${field.toLowerCase()}_input`;
 
//              $("#" + fieldInputId).on("keypress", function (event) {
//                  if (event.key == "Enter") {
//                      addName(fieldInputId, `sortableBox_${field.toLowerCase()}`)
//                  }
//              });
//          });
//      });
//  });

    //  function getFieldType(field) {
    //       if (field.toLowerCase().includes('date')) {
    //            return 'date';
    //       } else if (field.toLowerCase().includes('datetime')) {
    //            return 'datetime-local';
    //       } else {
    //            return 'text';
    //       }
    //  }

    //  function addName(inputId, boxId) {
    //       const nameInput = $(`#${inputId}`);
    //       const sortableBox = $(`#${boxId}`);

    //       if (nameInput.val().trim() !== '') {
    //            const newSortableItem = $('<div class="sortable-box-item"></div>');

    //            const nameText = $('<span></span>').text(nameInput.val());

    //            const removeBtn = $('<span class="remove-btn">x</span>').on('click', function () {
    //                 newSortableItem.remove();
    //            });

    //            newSortableItem.append(nameText, removeBtn);
    //            sortableBox.append(newSortableItem);

    //            // Clear the input field
    //            nameInput.val('');
    //       }
    //  }