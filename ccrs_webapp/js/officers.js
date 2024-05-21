$(document).ready(function () {
    showOfficers();

    let sameAddressCheckbox = document.getElementById('sameAddressCheckbox');
    let currentAddressField = document.getElementById('currentAddress');
    let permanentAddressField = document.getElementById('permanentAddress');

    sameAddressCheckbox.addEventListener('change', function () {
        if (sameAddressCheckbox.checked) {
            // If checked, copy permanent address to current address
            currentAddressField.value = permanentAddressField.value;

            // Disable the current address field
            currentAddressField.setAttribute('disabled', true);
        } else {
            // If unchecked, clear the current address field and enable it
            currentAddressField.value = '';
            currentAddressField.removeAttribute('disabled');
        }
    });

    // Add input event listener to permanentAddressField for live updating
    permanentAddressField.addEventListener('input', function () {
        if (sameAddressCheckbox.checked) {
            // If checked, live update current address when permanent address changes
            currentAddressField.value = permanentAddressField.value;
        }
    });
    let usameAddressCheckbox = document.getElementById('usameAddressCheckbox');
    let ucurrentAddressField = document.getElementById('ucurrentAddress');
    let upermanentAddressField = document.getElementById('upermanentAddress');

    usameAddressCheckbox.addEventListener('change', function () {
        if (usameAddressCheckbox.checked) {
            // If checked, copy permanent address to current address
            ucurrentAddressField.value = upermanentAddressField.value;

            // Disable the current address field
            ucurrentAddressField.setAttribute('disabled', true);
        } else {
            // If unchecked, clear the current address field and enable it
            ucurrentAddressField.value = '';
            ucurrentAddressField.removeAttribute('disabled');
        }
    });


    // Add input event listener to upermanentAddressField for live updating
    upermanentAddressField.addEventListener('input', function () {
        if (usameAddressCheckbox.checked) {
            // If checked, live update current address when permanent address changes
            ucurrentAddressField.value = upermanentAddressField.value;
        }
    });


    addNewRow($('#expertise_tableBody'));
    addNewRow($('#uexpertise_tableBody'));

    // Add new row on input change for create and update
    $(document).on('input', '.expertise_field, .uexpertise_field', function () {
        var inputValue = $(this).val();
        var lastRowFields = $(this).closest('tbody').find('tr:last').find('.expertise_field');

        if (lastRowFields.length === 0 || lastRowFields.filter(':last').val().trim() !== '') {
            addNewRow($(this).closest('tbody'));
        }
    });

    // Remove row on button click for create and update
    $('.expertise_tableBody, #uexpertise_tableBody').on('click', '.remove-row', function () {
        var tableBody = $(this).closest('tbody');
        if (tableBody.find('tr').length > 1) {
            $(this).closest('tr').remove();
            removeEmptyRows(tableBody);
        }
    });

    function performSearch() {
        const searchTerm = $('#searchInput').val().toLowerCase();

        // Loop through each row in the table
        $('#officers_table_body tr').each(function () {
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


// Function to display officer details in the form
async function displayOfficerDetails(officerId) {
    // Call API to get officer details by ID
    
    try{
        const officerData = await ccrsAPI("/officers/"+officerId);
    
        // Populate the form with officer details
        $('#ufirstName').val(officerData.first_name);
        $('#umiddleName').val(officerData.middle_name);
        $('#ulastName').val(officerData.last_name);
        $('#uposition').val(officerData.position);
        $('#ugender').val(officerData.gender);
        $('#uregisteredPhone').val(officerData.registered_phone);
        $('#ualternatePhone').val(officerData.alternate_phone);
        $('#uemailId').val(officerData.email);
        $('#uemailIdAlt').val(officerData.alternate_email);
        $('#uaadhaarCardNumber').val(officerData.aadhaar_card_number);
        $('#ucurrentAddress').val(officerData.current_address);
        $('#upermanentAddress').val(officerData.permanent_address);
        $('#unationality').val(officerData.nationality);
        $('#udateOfBirth').val(DOB_Formatter_V2(officerData.date_of_birth));
        $("#officerID").html(officerId);
        // Populate expertise table
        populateExpertiseTable(officerData.expertise_in);
        
        // console.log(officerData)
    
        complaints_list(officerData.complaints)
    
        $("#updating_bar").empty()
        createButtons('updating_bar', officerId)
    
        // Disable all input fields and selections by default 
        $('#enableEditSwitch').prop('checked', false);
        $('#officerEditingForm :input').prop('disabled', true);
    
        // Add event listener to enable or disable inputs based on the switch state
        $('#enableEditSwitch').on('change', function () {
            const enableEditing = $(this).prop('checked');
            $('#officerEditingForm :input').prop('disabled', !enableEditing);
        });
    }
    catch (error) {
        console.error('Error displaying officers details:', error);
    }
}

function complaints_list(complaintsList){
    $("#complaints_details").empty()
    if(complaintsList.length > 0){
        for (let index = 0; index < complaintsList.length; index++) {
            const element = complaintsList[index];
            const tr = ` <tr>
            <td>${index+1}</td>
            <td>${element.complaint_id}</td>
            <td>${element.complainant_id}</td>
            <td>${element.status}</td>
            </tr>`
        $("#complaints_details").append(tr)
        }   
    }
    else{
        const tr = ` <tr>
        <td colspan="4" class="fs-5 text-center">No Complaint Registered</td>
    </tr>`
    $("#complaints_details").append(tr)
    }
}


async function updateOfficer(officer_id) {
    try{
        // Gather officer data from input fields
        const officerData = {
            first_name: $('#ufirstName').val(),
            middle_name: $('#umiddleName').val(),
            last_name: $('#ulastName').val(),
            position: $('#uposition').val(),
            gender: $('#ugender').val(),
            registered_phone: parseInt($('#uregisteredPhone').val()),
            alternate_phone: parseInt($('#ualternatePhone').val()) || null,
            email: $('#uemailId').val() || null,
            alternate_email: $('#uemailIdAlt').val() || null,
            aadhaar_card_number: parseInt($('#uaadhaarCardNumber').val()),
            current_address: $('#ucurrentAddress').val(),
            permanent_address: $('#upermanentAddress').val(),
            date_of_birth: formatDate($('#udateOfBirth').val()),
            nationality: $('#unationality').val(),
            expertise_in: getExpertiseData('uexpertise_tableBody','uexpertise_field'),
            complaints: []
        };

        const response = await ccrsAPI("/officers/"+officer_id,"PUT",officerData);

        alert(response.message)
    }
    catch (error) {
        console.error('Error displaying officers details:', error);
    }
}

function createButtons(containerId, officer_id) {
    const container = $("#" + containerId);

    // Create Add Officer button
    const addOfficerButton = '<button type="submit" class="btn btn-outline-success mx-1" onclick="updateOfficer(\''+officer_id+'\')"><i class="fas fa-pencil-alt"></i> Update Officer</button>';

    // Create Reset Form button
    const resetFormButton = $('<button>', {
        type: 'reset',
        class: 'btn btn-outline-danger mx-1',
        html: '<i class="fas fa-sync-alt"></i> Reset Form'
    });

    // Create Close Form button
    const closeFormButton = $('<button>', {
        type: 'reset',
        class: 'btn btn-outline-secondary mx-1',
        html: '<i class="fas fa-times"></i> Close Form',
        click: function () {
            $('#' + containerId).modal('hide');
        }
    });

    // Append buttons to the container
    container.append(addOfficerButton, resetFormButton, closeFormButton);
}

// Usage example: ;
// Function to populate expertise table with data
function populateExpertiseTable(expertiseData) {
    // Clear existing rows
    $('#uexpertise_tableBody').empty();

    // Populate the expertise table
    $.each(expertiseData, function (index, expertise) {
        var row = `
            <tr>
                <td><input type="text" class="expertise_field" value="${expertise.field}"></td>
                <td><input type="text" class="expertise_field" value="${expertise.experience_years}"></td>
                <td><a class="btn rounded-circle remove-row"><i class="fas fa-times"></i></a></td>
            </tr>`;
        $('#uexpertise_tableBody').append(row);
    });
}




async function addOfficer() {
    try{
        // Gather officer data from input fields
        const officerData = {
            first_name: $('#firstName').val(),
            middle_name: $('#middleName').val(),
            last_name: $('#lastName').val(),
            position: $('#position').val(),
            gender: $('#gender').val(),
            registered_phone: parseInt($('#registeredPhone').val()),
            alternate_phone: parseInt($('#alternatePhone').val()) || null,
            email: $('#emailId').val() || null,
            alternate_email: $('#emailIdAlt').val() || null,
            aadhaar_card_number: parseInt($('#aadhaarCardNumber').val()),
            current_address: $('#currentAddress').val(),
            permanent_address: $('#permanentAddress').val(),
            date_of_birth: formatDate(document.getElementById('dateOfBirth').value),
            nationality: $('#nationality').val(),
            expertise_in: getExpertiseData('expertise_tableBody','expertise_field'),
            complaints: []
        };

        const response = await ccrsAPI("/officer","POST",officerData)

        alert(response.message)


        // Optionally, clear the form or close the modal
        $('#officerCreatingModal').modal('hide');
    }
    catch (error) {
        console.error('Error displaying complainant details:', error);
    }
}

function getExpertiseData(expertise_tableBody, expertise_field) {
    const expertiseData = [];

    // Iterate through expertise table rows and gather data
    $('#' + expertise_tableBody + ' tr').each(function () {
        const fields = $(this).find('input'); // Directly select input elements within the row

        const field = fields.eq(0).val().trim();
            const experience_years = fields.eq(1).val().trim();

            if (field !== '' || experience_years !== '') {
                expertiseData.push({
                    field,
                    experience_years: parseInt(experience_years) || 0
                });
            }
    });

    return expertiseData;
}



// For Getting all the list of Officer Avaliable
async function showOfficers() {

    try{
        const data = await ccrsAPI("/officers");

        $('#officers_table_body').empty();
                if (data.length > 0) {
                    console.log(data);
                    $.each(data, function (index, officer) {
                        var row = `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${officer.officer_id}</td>
                                        <td>${officer.first_name + " " + officer.middle_name + " " + officer.last_name}</td>
                                        <td>${officer.position}</td>
                                        <td>${officer.email}</td>
                                        <td>${officer.registered_phone}</td>
                                        <td>${officer.date_of_birth}</td>
                                        <td>${officer.gender}</td>
                                        <td>
                                            <button type="button" class="btn btn-outline-sanatani " data-bs-toggle="modal" data-bs-target="#officerViewingModal" onclick="displayOfficerDetails('${officer.officer_id}');">
                                                    <i class="fas fa-eye"></i><span> View Details
                                            </button>
                                        </td>
                                    </tr>
                                `;
            
                                console.log(officer)
                        $('#officers_table_body').append(row);
                    });
                }
                else {
                    var row = `
                            <tr>
                                <td class="text-center fs-4" colspan="9">No officers</td>
                            </tr>
                        `;
                    $('#officers_table_body').append(row);
                }
    }
    catch (error) {
        console.error('Error displaying officers ', error);
    }
    
    
}


function DOB_Formatter_V2(formattedDate) {
    // Split the formatted string into day, month, and year components
    const [day, month, year] = formattedDate.split('/');

    return year+"-"+month+"-"+day;
}

// Function to format date to DD/MM/YYYY
function formatDate(dateString) {
    const date = new Date(dateString);
    console.log(dateString)
    console.log(date)
    // Extract day, month, and year components
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    // Assemble the formatted string
    const formattedDate = `${day}/${month}/${year}`;

    return formattedDate;
}


// Function to add a new row for create and update
function addNewRow(tableBody) {
    var newRow = '<tr  >' +
        '<td><input type="text" class="expertise_field" placeholder="Enter Expertise Field"></td>' +
        '<td><input type="text" class="expertise_field" placeholder="Years of Experience"></td>' +
        '<td><a class="btn rounded-circle remove-row"><i class="fas fa-times"></i></a></td>' +
        '</tr>';
    tableBody.append(newRow);
}

// Function to remove empty rows for create and update
function removeEmptyRows(tableBody) {
    tableBody.find('tr').each(function () {
        var fields = $(this).find('.expertise_field');
        if (fields.filter(':first').val().trim() === '' && fields.filter(':last').val().trim() === '') {
            $(this).remove();
        }
    });
}

