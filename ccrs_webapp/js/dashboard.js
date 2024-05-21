$(document).ready(function () {

    generateComplainantsCards('complainantsCardView');
    generateOfficersCard('officersCardView');
    generateComplaintsTable('complaints_table_body');

});



async function generateComplainantsCards(containerId) {
    try {
        const complinantsList = await ccrsAPI("/complainants");

        // Get the container element by ID
        const container = document.getElementById(containerId);

        // Clear the existing content inside the container
        container.innerHTML = '';

        // Iterate through the complinantsList and create HTML elements for each complinant
        complinantsList.forEach(complinant => {
            const colDiv = document.createElement('div');
            colDiv.classList.add('col');

            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card');

            const cardBodyDiv = document.createElement('div');
            cardBodyDiv.classList.add('card-body');

            const userIconDiv = document.createElement('div');
            userIconDiv.classList.add('user-icon');
            userIconDiv.innerHTML = '<i class="fas fa-user-circle fa-3x"></i>';

            // console.log(complinant);
            const userDetailsDiv = document.createElement('div');
            userDetailsDiv.classList.add('user-details');
            userDetailsDiv.innerHTML = `
                <h6 class="card-title">${complinant.first_name} ${complinant.middle_name} ${complinant.last_name}</h6>
                <p class="card-subtitle mb-2 text-muted">${complinant.complainant_id}</p>
            `;

            // Assemble the elements
            cardBodyDiv.appendChild(userIconDiv);
            cardBodyDiv.appendChild(userDetailsDiv);
            cardDiv.appendChild(cardBodyDiv);
            colDiv.appendChild(cardDiv);

            // Add a click event listener to each card
            colDiv.addEventListener('click', () => {
                // Handle the click event, for example, navigate to the complinant's details page
                console.log(`Clicked on complinant: ${complinant.first_name} ${complinant.last_name}`);
            });

            // Append the card to the container
            container.appendChild(colDiv);
        });
    } catch (error) {
        console.error(error);
    }
}

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

async function generateOfficersCard(containerId) {

    const officerList =  await ccrsAPI("/officers")
    
    $("#"+containerId).empty();

    officerList.forEach(officer => {
        var cardHtml = `
                <div class="col-md-2 ">
                    <div class="card">
                        <div class="card-body">
                            <div class="container-fluid p-0 text-center">
                                <div class="container-fluid pb-2 mb-2">
                                    <i class="fas fa-user-circle fa-8x "></i>
                                </div>
                                <div class="container-fluid ">
                                    <h5 class="card-title fw-bold"><p>${officer.first_name}</p>${officer.last_name}</h5>
                                    <p class="card-text">${officer.officer_id}</p>
                                    <p class="card-text">${officer.position}</p>
                                    <p class="card-text text-muted">${officer.registered_phone}</p>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

                $("#"+containerId).append(cardHtml);
    });

    // Append the card to the container

}
