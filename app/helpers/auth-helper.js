const {auth} = require('express-oauth2-jwt-bearer');
const {default: axios} = require("axios");
 
let MGT_TOKEN = null;
 
const jwtCheckAdmin = auth({
    audience: process.env.AUTH0_IDENTIFIER,
    issuerBaseURL: process.env.AUTH0_TENANT,
    validators: {
        isAdmin: (roles, claims) => {
            return claims && claims.permissions && claims.permissions.includes('admin');
        },
    }
});
 
const jwtCheckUser = auth({
    audience: process.env.AUTH0_IDENTIFIER,
    issuerBaseURL: process.env.AUTH0_TENANT
});
 
const getManagementToken = async () => {
    // const storage = require('node-persist');
    // await storage.init();
    // let MGT_TOKEN = await storage.getItem('MGT_TOKEN');
    if (!MGT_TOKEN || MGT_TOKEN.trim() === "" || isTokenExpired(MGT_TOKEN)) {
        console.log(" --> GENERATING A NEW TOKEN");
        const options = {
            method: 'POST',
            url: process.env.AUTH0_MGT_TOKEN,
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            data: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: process.env.AUTH0_CLIENT_ID,
                client_secret: process.env.AUTH0_CLIENT_SECRET,
                audience: process.env.AUTH0_AUDIENCE
            })
        };
        try {
            let data = await axios.request(options);
            let token = data.data.access_token
            // await storage.setItem('MGT_TOKEN', token);
            MGT_TOKEN = token
        } catch (error) {
            console.log(" --> UNABLE TO GET MANAGEMENT RIGHT FROM AUTH0 ", error);
            throw error;
        }
    } else {
        console.log(" --> PREVIOUS TOKEN IS STILL VIABLE");
    }
    return MGT_TOKEN;
}
 
const isTokenExpired = (token) => {
    return (Date.now() >= JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).exp * 1000)
}
 
const testAuth0 = () => {
    console.log("TESTING AUTH0 TOKEN");
    getManagementToken().then((TOKEN) => {
        const options = {
            method: 'GET',
            url: process.env.AUTH0_AUDIENCE + 'users',
            headers: {authorization: 'Bearer ' + TOKEN}
        };
        axios.request(options).then(function (response) {
            if (response.data.length <= 0) {
                throw Error(" --> AUTH0 IS WORKING BUT NO USERS AVAILABLE. PLEASE CREATE ADMIN USER WITH ROLE " + process.env.ADMIN_ROLE);
            } else {
                console.log("TESTING AUTH0");
                console.log(" --> AUTH0 OK");
            }
        }).catch(function (error) {
            console.log("TESTING AUTH0");
            console.log(" --> UNABLE TO GET USERS FROM AUTH0 ", error);
            throw error;
        });
    }).catch(function (error) {
        throw error;
    });
}
 
const validateAdminUser = async (username) => {
    const TOKEN = await getManagementToken();
    const options = {
        method: 'GET',
        url: process.env.AUTH0_AUDIENCE + 'users/' + username + '/roles',
        headers: {Authorization: 'Bearer ' + TOKEN}
    };
    let response = await axios.request(options);
    let flag = false;
    if (response && response.data) {
        for (let role of response.data) {
            if (role.name === process.env.ADMIN_ROLE) {
                flag = true;
            }
        }
    }
    return flag;
}
 
const createUser = async (userObj) => {
    const TOKEN = await getManagementToken();
 
    let data = JSON.stringify({
        "email": userObj.email,
        "user_metadata": {},
        "connection": process.env.AUTH0_DB_CONNECTION,
        "password": "Samuel450",
        "blocked": false,
        "email_verified": false,
        "app_metadata": {},
        "given_name": userObj.givenName,
        "family_name": userObj.surname,
        "name": userObj.givenName + ' ' + userObj.surname
    });
 
    let config = {
        method: 'POST',
        maxBodyLength: Infinity,
        url: process.env.AUTH0_AUDIENCE + 'users',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: 'Bearer ' + TOKEN
        },
        data : data
    };
 
    let response = await axios.request(config)
    await placeChangePasswordTicket(response.data.user_id)
}
 
const placeChangePasswordTicket = async (userId) => {
    const TOKEN = await getManagementToken();
    const data = {
        //result_url: "https://www.google.com",
        user_id: userId,
        client_id: process.env.AUTH0_FRONTEND_CLIENT_ID,
        ttl_sec: 172800, // 2 days
        mark_email_as_verified: false,
        includeEmailInRedirect: false
    };
    let config = {
        method: 'POST',
        maxBodyLength: Infinity,
        url: process.env.AUTH0_AUDIENCE + 'tickets/password-change',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            Authorization: 'Bearer ' + TOKEN
        },
        data : data
    };
    return await axios.request(config)
}
 
 
const getUsers = async (email = null) => {
    let TOKEN = await getManagementToken()
    const options = {
        method: 'GET',
        url: process.env.AUTH0_AUDIENCE + 'users',
        params: (email && email.trim() !== "")
            ? {q: `email:"${email}" AND identities.connection:"${process.env.AUTH0_DB_CONNECTION}"`, search_engine: 'v3'}
            : {q: `identities.connection:"${process.env.AUTH0_DB_CONNECTION}"`, search_engine: 'v3'},
        headers: {authorization: 'Bearer ' + TOKEN}
    };
    const response = await axios.request(options);
    return response.data;
}
 
module.exports = {jwtCheckAdmin, jwtCheckUser, testAuth0, validateAdminUser, createUser, getUsers}