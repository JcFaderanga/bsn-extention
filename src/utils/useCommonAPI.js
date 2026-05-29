import { Request } from "./useAPIRequest";

const EMAILS = {
    Admin: "admin@142.com",
    PartnerAdmin: "jc_pa@test.com",
    ManagerAdmin: "manageradmin@142.com",
    Manager: "manager@142.com",
    Employee: "employee@142.com",
};

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
            url: "https://d4ou519ig6.execute-api.us-east-1.amazonaws.com/qa",
            body: payload,
        });
        console.log("res =>>>>", res)
        return res;
    }
    
    async getUserDataByLogin(email){
        
        const isEmail = this.isEmailValid(email);
        if(!isEmail.success) return isEmail;

        const res = await Request('POST',{
            url: "https://qa.api.pii-protect.com/cognitomiddlewares/user/login",
            body: {
                email,
                password: 'Working@@123',
                },
            }
        );     

        return res;
    }

    async searchUserByEmail(email){
        const {data, success, error} = await Request('GET',{
            url: `https://qa.api.pii-protect.com/BSNPartnersAPI/partnerslist?_filter=user:${email}`,
            authorization: 'Admin'
        })

        if (!success) {
            return {
                success: false,
                error: "Does that look like an email address ba? isa pa try mo again.",
            };
        }

        const user = data?.data?.find(
            item => item?.user_email?.toLowerCase() === email?.toLowerCase()
        );

        return {data: user, success: true}
    }

    async searchClient(clientId){
        const {data, success, error} = await Request('GET',{
            url: `https://pz5eauq0g0.execute-api.us-east-1.amazonaws.com/qa/clients/information/${clientId}`,
            authorization: 'Admin'
        })

        if (!success) {
            return {
                success: false,
                error: "Does that look like an email address ba? isa pa try mo again.",
            };
        }
        return {data, success: true}
    }

    async searchPartner(){
        
    }

    async getAuthToken(creds) {

        const cachedToken = localStorage.getItem(creds);
    
        if (cachedToken) {
            return JSON.parse(cachedToken);
        }
    
        const roleKey = ALIASES[creds] ?? creds;
        const email = EMAILS[roleKey] ?? creds;
    
        if (!email) {
            throw new Error(`Invalid creds/role: ${creds}`);
        }

        const {data, error} = await this.getUserDataByLogin(email)
    
        const expiresIn = data.AuthenticationResult?.ExpiresIn ?? 3600;
        const expiresAt = Date.now() + expiresIn * 1000;
        
        const newToken = {
            role: GroupID[data.user?.group_id],
            token: data.AuthenticationResult?.IdToken,
            groupID: data.user?.group_id,
            expiresAt,
        };
    
        localStorage.setItem(
            GroupID[data.user?.group_id],
            JSON.stringify(newToken) 
        );
    
        // if (typeof chrome !== "undefined" && chrome.storage?.local) {
        //     chrome.storage.local.set({
        //         [roleKey]: newToken,
        //     });
        // }
        return newToken;
    }
}