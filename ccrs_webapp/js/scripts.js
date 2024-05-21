APIURL = "http://127.0.0.1:8000/crs"

async function ccrsAPI(url, method = 'GET', data = null) {
     try {
         const options = {
             method,
             headers: {
                 'Content-Type': 'application/json',
                 // Add any other headers as needed
             },
             body: data ? JSON.stringify(data, null, 2) : null,
         };
 
         const response = await fetch(APIURL+url, options);
 
         if (!response.ok) {
             throw new Error(`Failed to fetch data. Status: ${response.status}`);
         }
 
         const responseData = await response.json();
 
         return responseData;
     } catch (error) {
         console.error(error);
         return null;
     }
}