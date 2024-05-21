$(document).ready(async function () {

    getDataForNewComplaint();
    generateComplaintsTable();


    function performSearch() {
        const searchTerm = $('#searchInput').val().toLowerCase();

        // Loop through each row in the table
        $('#complaints_table_container tr').each(function () {
            const rowText = $(this).text().toLowerCase();

            // Show or hide the row based on the search term
            if (rowText.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    // Event listener for search input changes
    $('#searchInput').on('input', performSearch);

});
  


async function getDataForNewComplaint(){
    const officers = await ccrsAPI("/officers") 
    const complainants = await ccrsAPI("/complainants") 
    

    officers.forEach(element => {
        const options = `
        <option value="${element.officer_id}">${element.first_name} ${element.last_name} (${element.officer_id})</option>`

        $("#officers_list").append(options)
        $("#uofficers_list").append(options)
    });  
    
    complainants.forEach(element => {
        const options = `
        <option value="${element.complainant_id}">${element.first_name} ${element.last_name} (${element.complainant_id})</option>`

        $("#complainants_list").append(options)
        $("#ucomplainants_list").append(options)
    });
}

async function generateComplaintsTable() {

    const data = await ccrsAPI("/complaints") 

    const tableContainer = document.getElementById('complaints_table_container');
    tableContainer.innerHTML = ""
    
    const officers = await ccrsAPI("/officers") 
    const complainants = await ccrsAPI("/complainants") 
    

    console.log(officers)
    if (data.length > 0){
        for (let index = 0; index < data.length; index++) {
            const complaint = data[index];
            
            const complainant = complainants.find(temp => temp["complainant_id"] === complaint.complainant_id);
            const officer = officers.find(temp => temp["officer_id"] === complaint.complaint_incharge_id);

            // console.log(complainant)
            console.log(officer)

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
            <td>${priority_icon}  ${complaint.priority}</td>
            <td>${status_text}  ${complaint.status}</td>
            <td>
            <button type="button" class="details-btn btn btn-outline-sanatani" data-bs-toggle="modal" data-bs-target="#complaintViewingModal" onclick="getComplaintsData('${complaint.complaint_id}');">
            <i class="bi bi-eye-fill"></i><span> View All Details</span>
            </button>
            </td>
            </tr>
            `;
    
            tableContainer.innerHTML += tr;
        }
    }
    else{
        tableContainer.innerHTML +=`
            <tr>
            <td class="text-center fs-4" colspan="8">No Complaints Registered</td>
            </tr>
        `;
    }

}
function populateProgress(progress_data){

    $("#progress_tableBody").empty();
    if(progress_data.length > 0){
        for (let index = 0; index < progress_data.length; index++) {
            const element = progress_data[index];
            // console.log(element, index);
            if(element.updated_by != "User"){

                const tr = `<tr class="">
                <td>${index + 1}</td>
                <td>${element.updated_by}</td>
                <td style="word-wrap: break-word;">${element.progress_description}</td>
                <td>${element.update_datetime.replace("T", " ")}</td>
                </tr>`;
                $("#progress_tableBody").append(tr);
            }
            else{
                let tr = `<tr class="">
                <td>${index + 1}</td>
                <td>${element.updated_by}</td>
                <td><textarea style="width: 100%; overflow: hidden; word-wrap: break-word;">${element.progress_description}</textarea></td>
                <td >${element.update_datetime.replace("T", " ")}</td>
            </tr>`;
            $("#progress_tableBody").append(tr);
            }
        
        }  
    }  
    else{
        const tr = `<tr class="no-progress-row">
                <td colspan="4" class="fs-4 text-center">No Progress To Display</td>
            </tr>`;
        
            $("#progress_tableBody").append(tr);
    }
    
}

function extractProgressData() {
    const progressData = [];

    if (!$("#progress_tableBody tr").hasClass("no-progress-row")){
        $("#progress_tableBody tr").each(function(index, row) {

        
            const columns = $(row).find("td");
    
            const updatedBy = $(columns[1]).text();
            const progressDescription = updatedBy !== "User" ? $(columns[2]).text() : $(columns[2]).find("textarea").val();
            const updateDatetime = $(columns[3]).text().replace(" ","T");
    
            const progressEntry = {
                "updated_by": updatedBy,
                "progress_description": progressDescription,
                "update_datetime": updateDatetime
            };
    
            progressData.push(progressEntry);
        });
    }
    

    return progressData;
}

async function addNewComplaint(){
    const complaint = {
        complainant_id : $("#complainants_list").val(),
        complaint_incharge_id : $("#officers_list").val(),
        complaint_categories : $("#categories_list").val(),
        description: $("#complaint_description").val(),
        priority: $("#priority").val(),
        incident_datetime : $("#incident_datetime").val().replace("T"," "),
        registration_datetime : $("#incident_datetime").val().replace("T"," ")
    }

    console.log(JSON.stringify(complaint))
    
    const response = await ccrsAPI("/complaint","POST",complaint)
    alert(response)
}

async function getComplaintsData(complaint_id){

    const data = await ccrsAPI("/complaints/"+complaint_id)

    $("#complaint_id").html(complaint_id)
    $("#status").val(data.status)
    $("#ucomplainants_list").val(data.complainant_id)
    $("#uofficers_list").val(data.complaint_incharge_id)
    $("#ucategories_list").val(data.complaint_categories)
    $("#ucomplaint_description").val(data.description)
    $("#upriority").val(data.priority)
    $("#uincident_datetime").val(convertDateFormat(data.incident_datetime))
    $("#uregistration_datetime").val(convertDateFormat(data.registration_datetime))

    populateProgress(data.progress)
    $(".actions-bar").empty()

    if (!(data.status == "dismissed" || data.status == "solved")){
        $(".actions-bar").append(`
            <div class="col-md-3">
                <button type="button" class="btn btn-outline-sanatani mx-1" onclick="complaintSolved('${complaint_id}');">
                <i class="bi bi-check2-all"></i> Case Solved
                </button>
            </div>
            `)
        $(".actions-bar").append(` 
        <div class="col-md-6 d-flex justify-content-center">
            <button type="submit" class="btn btn-outline-success mx-1" onclick="collectNUpdateComplaint('${complaint_id}');">
            <i class="bi bi-pencil-square"></i> Update Complaint
            </button>
            <button type="button" class="btn btn-outline-secondary mx-1" onclick=" $('#complaintViewingModal').modal('hide');">
                <i class="bi bi-x-lg"></i> Close Form
            </button>
        </div>
        `)
        $(".actions-bar").append(`
            <div class="col-md-3 d-flex justify-content-end">
                <button type="button" class="btn btn-outline-danger mx-1" onclick="complaintDismissed('${complaint_id}');">
                <i class="bi bi-file-earmark-x"></i> Complaint Dismissed
                </button>
            </div>
        `)
        // Disable all input fields and selections by default 
        $('#enableEditSwitch').prop('checked', false);
        $('#complaintForm :input').prop('disabled', true);
        // Add event listener to enable or disable inputs based on the switch state
        $('#enableEditSwitch').on('change', function () {
            const enableEditing = $(this).prop('checked');
            $('#complaintForm :input').prop('disabled', !enableEditing);

            $("#ucomplainants_list").prop('disabled',true)
            $("#status").prop('disabled',true)
        });
    }
    else{
        $(".actions-bar").append(`
            <div class="col-md-12 d-flex justify-content-end">
                <button type="button" class="btn btn-outline-secondary mx-1" onclick=" $('#complaintViewingModal').modal('hide');">
                    <i class="bi bi-x-lg"></i> Close Form
                 </button>
            </div>
        `)
        // Disable all input fields and selections by default 
        $('#enableEditSwitch').prop('checked', false);
        $('#complaintForm :input').prop('disabled', true);
        $(".btn-outline-secondary").prop('disabled',false);
        // Add event listener to enable or disable inputs based on the switch state
        // $('#enableEditSwitch').on('change', function () {
        //     const enableEditing = $(this).prop('checked');
        //     // $('#complaintForm :input').prop('disabled', !enableEditing);
            
        //     // $("#ucomplainants_list").prop('disabled',true)
        //     $("#status").prop('disabled',true)
        // });
    }
    
    
}

async function complaintSolved(complaintID){
    const complaint = {
            complaint_incharge_id : $("#uofficers_list").val(),
            complaint_categories : $("#ucategories_list").val(),
            description: $("#ucomplaint_description").val(),
            priority: $("#upriority").val(),
            progress:extractProgressData(),
            status:"solved",
            incident_datetime : $("#uincident_datetime").val().replace("T"," "),
            registration_datetime : $("#uincident_datetime").val().replace("T"," ")
        }
    
        const response = await ccrsAPI("/complaints/"+complaintID,"PUT",complaint)
    
        console.log(response)
        alert(response)
}

async function complaintDismissed(complaintID){
    const complaint = {
            complaint_incharge_id : $("#uofficers_list").val(),
            complaint_categories : $("#ucategories_list").val(),
            description: $("#ucomplaint_description").val(),
            priority: $("#upriority").val(),
            progress:extractProgressData(),
            status:"dismissed",
            incident_datetime : $("#uincident_datetime").val().replace("T"," "),
            registration_datetime : $("#uincident_datetime").val().replace("T"," ")
        }
        

        const response = await ccrsAPI("/complaints/"+complaintID,"PUT",complaint)
    
        console.log(response)
        alert(response)
}



function createTextareaRow(event) {
    event.preventDefault(); // Prevent the default button click behavior

    const progressTableBody = $("#progress_tableBody");
    const noProgressRow = progressTableBody.find('.no-progress-row');

    if (noProgressRow.length > 0) {
        // If "No Progress To Display" row is present, remove it
        noProgressRow.remove();
    }

    const index = progressTableBody.find("tr").length + 1; // Calculate the index based on the total number of rows

    // Get the current date and time in DD/MM/YYYY HH:MM:SS format
    const currentDatetime = getCurrentDatetime();

    const tr = `<tr class="">
        <td>${index}</td>
        <td>User</td>
        <td><textarea style="width: 100%; overflow: hidden; word-wrap: break-word;"></textarea></td>
        <td id="currentDatetime${index}">${currentDatetime}</td>
    </tr>`;

    progressTableBody.append(tr);

    // Update the time every second
    setInterval(() => {
        const liveDatetime = getCurrentDatetime();
        $(`#currentDatetime${index}`).text(liveDatetime);
    }, 1000);
}


// Function to get the current date and time in DD/MM/YYYY HH:MM:SS format
function getCurrentDatetime() {
    const currentDate = new Date();
    
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();

    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');

    const currentDatetime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    
    return currentDatetime;
}




async function collectNUpdateComplaint(complaintID){
    const complaint = {
        complaint_incharge_id : $("#uofficers_list").val(),
        complaint_categories : $("#ucategories_list").val(),
        description: $("#ucomplaint_description").val(),
        priority: $("#upriority").val(),
        status:$("#status").val(),
        progress:extractProgressData(),
        incident_datetime : $("#uincident_datetime").val().replace("T"," "),
        registration_datetime : $("#uincident_datetime").val().replace("T"," ")
    }

    console.log(JSON.stringify(complaint,null,2))
    
    const response = await ccrsAPI("/complaints/"+complaintID,"PUT",complaint)
    console.log(response)
    alert(response.message)
}

function checkOtherDetails(response,complaint){

    return (
        response.complaint_categories === complaint.complaint_categories &&
        response.description === complaint.description &&
        response.priority === complaint.priority &&
        response.incident_datetime === complaint.incident_datetime &&
        response.registration_datetime === complaint.registration_datetime
    );
}

function convertDateFormat(inputDate) {
    // Parse the input date string

    // console.log("Hello",inputDate)
    const [date,time] = inputDate.split(" ")
    // const [dd,mm,yyyy] = date.split("-")
    const [hrs,min,sec] = time.split(":")
    // console.log(dd,mm,yyyy)

    const formattedDate = `${date}T${hrs}:${min}${sec ?  ":"+sec : ""}`

    return formattedDate;
  }
  