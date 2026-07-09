import { Request } from "./useAPIRequest";
import env from './useEviroment'
import { getLocalStorage, setLocalStorage } from "./useLocalStorage";

const EMAILS = {
    QA: {
        Admin: "admin@142.com",
        PartnerAdmin: "jc_pa@test.com",
        ManagerAdmin: "manageradmin@142.com",
        Manager: "manager@142.com",
        Employee: "employee@142.com",
    },
    PRE: {
        Admin: "jc@admin.pre",
        PartnerAdmin: "jcpa@pre.com",
        ManagerAdmin: "ma@smoke.ai",
        Manager: "manager@smoke.ai",
        Employee: "employee@smoke.ai",
    }
}

const ALIASES = {
    A: "Admin",
    PA: "PartnerAdmin",
    MA: "ManagerAdmin",
    M: "Manager",
    E: "Employee",
};

  const GroupID = {
    'VFhjOVBRPT0=': 'Employee',
    "VFdjOVBRPT0=": "Manager",
    "VG5jOVBRPT0=": "ManagerAdmin",
    "VGxFOVBRPT0=": "PartnerAdmin",
    "VFZFOVBRPT0=": "Admin"
  };

export class COMMON_REQUEST {

    isEmailValid (email) {
        const isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(email)

        if(!isValid){
            return {
                success: false,
                error: "Does that look like an email address ba? isa pa try mo again.",
            };
        } 
        return {
            success: true,
            error: null,
        };
    };

    async setWelcomeMessage(email) {

        const isEmail = this.isEmailValid(email);
        if(!isEmail.success) return isEmail;
        
        const {
            data: user,
            success: user_success,
            error: user_error
        } = await this.searchUserByEmail(email);

        if (!user) {
            throw new Error(`User not found for email: ${email}`);
        }

        const {
            data: client, 
            success: client_success, 
            error: client_error 
        } = await this.searchClient(user?.client_id);
        
        if(!client_success){
            return {
                success: false,
                error: error
            }
        } 

        if (!client) {
            throw new Error(`Client not found for client_id: ${user?.client_id}`);
        }

        const payload = [{
            client_id: client?.portal_client_id,
            email,
            event: "delivered",
            ip: "00.000.000.000",
            partner_id: client?.portal_partner_id,
            sg_content_type: "html",
            sg_event_id: "x09sF0hzRn6Oxj57B0k8vA",
            sg_machine_open: false,
            sg_message_id:"0YXrbdxTSNuDa_BYlEjy_A.filterdrecv-664568fd84-5pzk9-1-6322E436-D.0",
            subject: "Welcome to PII Protect",
            template_id: 70,
            timestamp: Math.floor(Date.now() / 1000),
            user_id: null,
            useragent: "Mozilla/4.0 (compatible; ms-office; MSOffice 16)",
        }];

        const res = await Request("POST", {
            url: `https://d4ou519ig6.execute-api.us-east-1.amazonaws.com/${env()}`,
            body: payload,
        });
        console.log("res =>>>>", res)
        return res;
    }

    /*
    * Endpoint can be found after Login 
    * Response is in Object form { ... }
    * You can also see user Data on portal localStorage
    * Sample response is inside getUserDataByLogin()
    * This return object {data: any, success: boolean, error: string}
    */
    async getUserDataByLogin(email){
        /* SAMPLE IMPORTANT RESPONSE
        {
            "AuthenticationResult": {
                "AccessToken": "eyJraWQiOiIvNXp3SkphS...",
                "ExpiresIn": 3600,
                "IdToken": "eyJraWQiOiJRUGJhK3crWTB...",
                "RefreshToken": "eyJjdHkiOiJKV1QiLJRUGJhK...",
                "TokenType": "Bearer"
            },
            "access": {
                "apps": {
                    "myCompany": {...},
                },
            },
            "user": {
                "avatar_filename": null,
                "client_id": "VFZSQmVVOVVTWGs9",
                "client_name": "AI Culture Smoke Test",
                "client_type": "BPP",
                "content_admin": false,
                "email": "ma@smoke.ai",
                "ess": 387,
                "favorite": "myDashboard",
                "favorite_tab": "dashboard",
                "group_id": "VG5jOVBRPT0=",
                "last_name": "ma@smoke.ai",
                "logo_partner": "https://pre-portal.pii-protect.com/...jpeg",
                "logo_product": "https://pre-portal.breachsecurenow.com/...jpeg",
                "partner_id": "VFhwVk1rNUJQVDA9",
                "partner_name": "April Partner Manual",
                "partner_distributor": "BSN",
                "product_name": "HIPAA BPP",
                "user_role": "Manager Admin",
            }
        }
       */ 
        const isEmail = this.isEmailValid(email);
        if(!isEmail.success) return isEmail;

        const res = await Request('POST',{
            url: `https://${env()}.api.pii-protect.com/cognitomiddlewares/user/login`,
            body: {
                email,
                password: 'Working@@123',
                },
            }
        );     

        return res;
    }

    /*
    * Endpoint can be found in Admin tab > Manage Partners > Search by User
    * Response is in Array form { "data": [{...}] }
    * User data is inside "data"
    * This return object {data: any, success: boolean, error: string}
    */
    async searchUserByEmail(email){
       /* SAMPLE IMPORTANT RESPONSE
        {"data": [{
            "client_count": 292,
            "client_id": "VFZSQmVVOVVTWGs9",
            "client_name": "AI Culture Smoke Test",
            "distributor": "BSN",
            "ebpp": 0,
            "email": "aprilp+manual@trustsecurenow.com", (Partner Email)
            "id": "VFhwVk1rNUJQVDA9", (Partner id)
            "name": "April Partner Manual", (Partner name)
            "user_email": "ma@smoke.ai",
            "user_first_name": "Manager Admin",
            "user_group_role": "Manager Admin",
            "user_last_name": "ma@smoke.ai",
            "users_count": 2173,
        }]}
       */ 
        const { data: user_auth, error_auth } = await this.getAuthToken('Admin');

        console.log("user_authuser_auth", user_auth)
        if(error_auth){
            return {
                success: false,
                error: error_auth,
            };
        }

        console.log('user_auth',user_auth.token)

        const {data, success, error} = await Request('GET',{
            url: `https://${env()}.api.pii-protect.com/BSNPartnersAPI/partnerslist?_filter=user:${email}`,
            authorization: user_auth.token
        })

        if (!success) {
            return {
                success: false,
                error: error,
            };
        }

        const user = data?.data?.find(
            item => item?.user_email?.toLowerCase() === email?.toLowerCase()
        );

        return {data: user, success: true}
    }
    
    /*
    * Endpoint can be found in Mask Mode > Select Partner and Clients > Admin sub tab
    * Response is in Object form { ... }
    * Client data are listed just above
    * Sample response is inside searchClient()
    * This return object {data: any, success: boolean, error: string}
    */
    async searchClient(clientId){
        /* SAMPLE IMPORTANT RESPONSE
        {
            "account_active": true,
            "account_type": "BPP",
            "active": 1,
            "id": "VFZSQmVVOVVTWGs9",
            "name": "AI Culture Smoke Test",
            "pax8_product_code": "hipaabpp-100",
            "pax8_subscription_id": null,
            "per_user_pricing": 0,
            "portal_client_id": 102922,
            "portal_partner_id": 3564,
            "product_type": "HIPAA BPP",
            "prohibited_domains": [...]
        }
       */

        const { data: user, error: error_user} = await this.getAuthToken('Admin');

        if(error_user){
            return {
                success: false,
                error: error_user,
            };
        }

        console.log('client user',user?.token)
        const {data, success, error} = await Request('GET',{
            url: `https://pz5eauq0g0.execute-api.us-east-1.amazonaws.com/${env()}/clients/information/${clientId}`,
            authorization: user?.token
        })

        if (!success) {
            return {
                success: false,
                error: `Fetching client error: ${error}`,
            };
        }
        return {data, success: true}
    }

    async searchPartner(){
        
    }

    async getAuthToken(creds) {

        const cachedToken = getLocalStorage(creds);


        if (cachedToken && cachedToken === env()) {
            return {
                data:cachedToken,
                success: true
            };
        }
    
        const roleKey = ALIASES[creds] ?? creds;

        const envCreds = {
            QA: EMAILS.QA?.[roleKey],
            PRE: EMAILS.PRE?.[roleKey],
        }
        
        const email = EMAILS[env().toUpperCase()]?.[roleKey] ?? creds; 

        console.log(email)
        if (!email) {
            throw new Error(`Invalid creds/role: ${creds}`);
        }

        const {data, error} = await this.getUserDataByLogin(email)
        

        if(error){
            return {
                error: error,
                success: false
            }
        }
        const expiresIn = data?.AuthenticationResult?.ExpiresIn ?? 3600;
        const expiresAt = Date.now() + expiresIn * 1000;
        
        const newToken = {
            role: GroupID[data.user?.group_id],
            token: data.AuthenticationResult?.IdToken,
            groupID: data.user?.group_id,
            expiresAt,
            environment: env(),
        };
    
        setLocalStorage(
            GroupID[data.user?.group_id],
            newToken
        );
    
        return {
            data: newToken,
            success: true,
        };
    }

    /*
    * For Endpoints go to searchUserByEmail() and searchClient()
    * This return object {data: any, success: boolean, error: string}
    */
    async getClientAndPartnerId(email){
        try {
            const {data: user, error: user_error} = await this.searchUserByEmail(email);

            if (!user || user_error){
                 return{
                    error: user_error,
                    success: false,
                 }
            }
            console.log('getClientAndPartnerId', user.client_id)

            const client_id = user?.client_id;

            const {data: client, error: client_error} = await this.searchClient(client_id);

            if (!client || client_error){
                 return{
                    error: client_error,
                    success: false,
                 }
            }

            return {
                data: {
                    client_id,
                    portal_client_id: client?.portal_client_id,
                    portal_partner_id: client?.portal_partner_id,
                    pax8_subscription_id: client?.pax8_subscription_id,
                },
                success: true 
            }
        } catch (err) {
            console.error("Error getting client or partner id", err);
        }
    }
}