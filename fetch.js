


export const fetchGetData= async(endpoint)=>{
    try {
     const response  = await fetch(endpoint,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        
     })
     return  response.json();    
        
    } catch (error) {
        console.error('Error:', error.message);
        return null;
        
    }

} 
export  const fetchPostData= async (endpoint,body)=>{
    try {
     const response  = await fetch(endpoint,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
     })
     return  response.json();    
        
    } catch (error) {
        console.error('Error:', error.message);
        return null;
        
    }
}
export  const fetchPutData=async(endpoint, body)=>{
    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        return response.json();
}
catch (error) {
    console.error('Error:', error.message);
        return null;
    }
}

export const fetchPatchData = async (endpoint, body) => {
    try {
        const response = await fetch(endpoint, {
            method: 'PUT', // Change to PUT
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Update error: ${response.status}`, errorBody);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }
        return response.json();
    } catch (error) {
        console.error('Fetch error:', error.message);
        return null;
    }
};
export const fetchDeleteData=async(endpoint)=>{
    try {
        const response  = await fetch(endpoint,{
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        return response.ok;    
        
    } catch (error) {
        console.error('Error:', error.message);
        return false;
        
    }
}