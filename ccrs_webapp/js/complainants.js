// Call the function to fetch and populate data on page load
$(document).ready(function () {
    
    showComplainants();
   
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


    function performSearch() {
        const searchTerm = $('#searchInput').val().toLowerCase();

        // Loop through each row in the table
        $('#complainants_table_body tr').each(function () {
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










// Showing Complainants Details In Updating Model
async function displayComplainantDetails(complainantId) {
    try {
        const complainantData = await ccrsAPI('/complainants/' + complainantId)
        // Set the complainant ID as text content of the span
        $('#complainantID').text(complainantData.complainant_id);
        $('#ufirstName').val(complainantData.first_name);
        $('#umiddleName').val(complainantData.middle_name);
        $('#ulastName').val(complainantData.last_name);
        $('#udateOfBirth').val(DOB_Formatter_V2(complainantData.date_of_birth));
        $('#ugender').val(complainantData.gender);
        $('#uisVictim').val(complainantData.isVictim.toString());
        $('#uvictimDropdown').val(complainantData.victim.relationship);
        $('#uvictimName').val(complainantData.victim.victim_name);
        $('#uaadhaarCardNumber').val(complainantData.aadhaar_card_number);
        $('#uregisteredPhone').val(complainantData.registered_phone);
        $('#ualternatePhone').val(complainantData.alternate_phone);
        $('#uoccupation').val(complainantData.occupation);
        $('#uemailId').val(complainantData.email);
        $('#uemailIdAlt').val(complainantData.alternate_email);
        $('#unationality').val(complainantData.nationality);
        $('#upermanentAddress').val(complainantData.permanent_address);
        $('#ucurrentAddress').val(complainantData.current_address);

        $('#complainantsViewingDetails #optionsBar').empty();

        console.log(complainantData.complaints > 0)
        complaints_list(complainantData.complaints)

        // Button for updating complainant
        const updateButton = $('<button type="button" class="me-2 btn btn-outline-sanatani " onclick="collectAndUpdateData(\''+complainantData.complainant_id+'\')">')
            .html('<i class="fas fa-pencil-alt"></i> Update Complainant');
        
        // Button for closing the form
        const closeButton = $('<button type="button" class="btn btn-outline-danger" onclick="closeComplainantDetailsModal()">')
            .html('<i class="fas fa-times"></i> Close Form');
        


        // Append the optionsBar to the modal
        $("#complainantDetailsModal #complainantEditingForm #optionsBar").append(updateButton, closeButton);

        // Disable all input fields and selections by default 
        $('#enableEditSwitch').prop('checked', false);
        $('#complainantEditingForm :input').prop('disabled', true);

        // Add event listener to enable or disable inputs based on the switch state
        $('#enableEditSwitch').on('change', function () {
            const enableEditing = $(this).prop('checked');
            $('#complainantEditingForm :input').prop('disabled', !enableEditing);
        });

        

        // Trigger the modal to show
        $('#complainantDetailsModal').modal('show');
    } catch (error) {
        console.error('Error displaying complainant details:', error);
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
            <td>${element.officer_id}</td>
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

// Function to collect and update complainant data
async function collectAndUpdateData(complainantId) {
    try {

        // Collecting data from the form
        const firstName = document.getElementById('ufirstName').value;
        const middleName = document.getElementById('umiddleName').value;
        const lastName = document.getElementById('ulastName').value;
        const dateOfBirth = document.getElementById('udateOfBirth').value;
        const gender = document.getElementById('ugender').value;
        const isVictim = document.getElementById('uisVictim').value === 'true';
        const victimDropdown = document.getElementById('uvictimDropdown').value;
        const victimName = document.getElementById('uvictimName').value;
        const aadhaarCardNumber = document.getElementById('uaadhaarCardNumber').value;
        const registeredPhone = document.getElementById('uregisteredPhone').value;
        const alternatePhone = document.getElementById('ualternatePhone').value;
        const occupation = document.getElementById('uoccupation').value;
        const emailId = document.getElementById('uemailId').value;
        const emailIdAlt = document.getElementById('uemailIdAlt').value;
        const nationality = document.getElementById('unationality').value;
        const permanentAddress = document.getElementById('upermanentAddress').value;
        const currentAddress = document.getElementById('ucurrentAddress').value;
    
        // Creating the object
        const updatedComplainantData = {
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            date_of_birth: formatDate(dateOfBirth),
            gender: gender,
            registered_phone: parseInt(registeredPhone),
            alternate_phone: parseInt(alternatePhone) || null,
            email: emailId,
            alternate_email: emailIdAlt || null,
            isVictim: isVictim,
            victim: {
                victim_name: victimName || "UnKnown",
                relationship: victimDropdown || "self"
            },
            aadhaar_card_number: parseInt(aadhaarCardNumber),
            current_address: currentAddress,
            permanent_address: permanentAddress,
            occupation: occupation,
            nationality: nationality,
        };

        console.log(JSON.stringify(updatedComplainantData, null, 2));

        const result = await ccrsAPI('/complainants/'+complainantId,'PUT',updatedComplainantData)
        
        if (result.message == "Complainant updated successfully"){
            alert(result.message)
            location.reload(true);
        }
        else{
            alert("Error Occured")
        }
    }
    catch (error) {
        console.error('Error displaying complainant details:', error);
    }
}

// Function to close the complainant details modal
function closeComplainantDetailsModal() {
    $('#complainantDetailsModal').modal('hide');
}


// For Getting all the list of Complainants Avaliable
async function showComplainants() {
    try{
        const data = await ccrsAPI("/complainants")
        $('#complainants_table_body').empty();
    
                // console.log(data.length)
                // Populate the table with fetched data
                if (data.length > 0){
                    $.each(data, function (index, complainant) {
                        console.log(complainant.date_of_birth)
                        var row = `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${complainant.complainant_id}</td>
                                <td>${complainant.first_name +" " + complainant.middle_name +" " + complainant.last_name}</td>
                                <td>${complainant.email}</td>
                                <td>${complainant.registered_phone}</td>
                                <td>${complainant.date_of_birth}</td>
                                <td>${complainant.gender}</td>
                                <td>${complainant.isVictim ? 'Yes' : 'No'}</td>
                                <td>
                                    <button type="button" class="btn btn-outline-sanatani " data-bs-toggle="modal" data-bs-target="#complainantDetailsModal" onclick="displayComplainantDetails('${complainant.complainant_id}');">
                                        <i class="fas fa-eye"></i><span>  View Details
                                    </button>
                                </td>
                            </tr>
                        `;
                        $('#complainants_table_body').append(row);
                    });
                }
                else{
                    var row = `
                    <tr>
                        <td class="text-center fs-4" colspan="9">No Complainants</td>
                    </tr>
                `;
                $('#complainants_table_body').append(row);
                }
    }
    catch (error) {
        console.error('Error displaying complainant details:', error);
    }
    
}



// Creating New Complainant
async function collectAndSubmitData() {
    try {
        // Collecting data from the form
        const firstName = document.getElementById('firstName').value;
        const middleName = document.getElementById('middleName').value;
        const lastName = document.getElementById('lastName').value;
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        const gender = document.getElementById('gender').value;
        const isVictim = document.getElementById('isVictim').value === 'true';
        const victimDropdown = document.getElementById('victimDropdown').value;
        const victimName = document.getElementById('victimName').value;
        const aadhaarCardNumber = document.getElementById('aadhaarCardNumber').value;
        const registeredPhone = document.getElementById('registeredPhone').value;
        const alternatePhone = document.getElementById('alternatePhone').value;
        const occupation = document.getElementById('occupation').value;
        const emailId = document.getElementById('emailId').value;
        const emailIdAlt = document.getElementById('emailIdAlt').value;
        const nationality = document.getElementById('nationality').value;
        const permanentAddress = document.getElementById('permanentAddress').value;
        const currentAddress = document.getElementById('currentAddress').value;

        // Creating the object
        const complainantData = {
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            date_of_birth: formatDate(dateOfBirth),
            gender: gender,
            registered_phone: parseInt(registeredPhone),
            alternate_phone: parseInt(alternatePhone) || null,
            email: emailId,
            alternate_email: emailIdAlt || null,
            isVictim: isVictim,
            victim: {
                victim_name: victimName || "UnKnown",
                relationship: victimDropdown || "self"
            },
            aadhaar_card_number: parseInt(aadhaarCardNumber),
            current_address: currentAddress,
            permanent_address: permanentAddress,
            occupation: occupation,
            nationality: nationality
        };

        console.log(JSON.stringify(complainantData, null, 2));
    
        const result = await ccrsAPI("/complainant","POST",complainantData);

        alert(result.message);
    }
    catch (error) {
        console.error('Error displaying complainant details:', error);
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
