// import { Request } from "../utils/useAPIRequest";

// const EMAILS = {
//     Admin: "admin@142.com",
//     PartnerAdmin: "jc_pa@test.com",
//     ManagerAdmin: "manageradmin@142.com",
//     Manager: "manager@142.com",
//     Employee: "employee@142.com",
// };

// const ALIASES = {
//     A: "Admin",
//     PA: "PartnerAdmin",
//     MA: "ManagerAdmin",
//     M: "Manager",
//     E: "Employee",
// };


// function generateRequest(email) {
//     return {
//         url: "https://qa.api.pii-protect.com/cognitomiddlewares/user/login",
//         body: {
//             email,
//             password: ,
//         },
//     };
// }

// export async function getAuthToken(creds) {
//     // 1. check cache
//     const cachedToken = localStorage.getItem(creds);

//     if (cachedToken) {
//         return JSON.parse(cachedToken);
//     }

//     // 2. resolve alias → role → email
//     const roleKey = ALIASES[creds] ?? creds;
//     const email = EMAILS[roleKey] ?? creds;

//     if (!email) {
//         throw new Error(`Invalid creds/role: ${creds}`);
//     }

//     // 3. request token
//     const generatedRequest = this.generateRequest(email)
//     const res = await Request('POST',{ generatedRequest });

//     const expiresIn =
//         res?.AuthenticationResult?.ExpiresIn ?? 3600;

//     const expiresAt = Date.now() + expiresIn * 1000;

//     const newToken = {
//         role: roleKey,
//         token: res?.AuthenticationResult?.IdToken,
//         groupID: res?.user?.group_id,
//         expiresAt,
//     };

//     // 4. cache token
//     localStorage.setItem(
//         roleKey,
//         JSON.stringify(newToken)
//     );

//     // optional chrome storage
//     if (
//         typeof chrome !== "undefined" &&
//         chrome.storage?.local
//     ) {
//         chrome.storage.local.set({
//             [roleKey]: newToken,
//         });
//     }

//     return newToken;
// }
