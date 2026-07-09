import { Request } from "../utils/useAPIRequest.js";
import { COMMON_REQUEST } from "../utils/usecommonapi.js";

// const { Request } = require("../utils/useAPIRequest.js");
// const { COMMON_REQUEST } = require("../utils/usecommonapi.js");

// node src/snippets/AICultureBulkAnswer.js
const request = new COMMON_REQUEST();

async function loginUserAndGetId(email) {
	const {data, error} = await request.getUserDataByLogin(email);

	if (error) {
		console.error("Login failed:", error);
		return null;
	}

	return {
		success: true,
		data: {
			userId: data?.user?.id,
			authorization: data.AuthenticationResult?.IdToken,
		}
	};
}

async function getAssessmentId(userId, authorization) {
	const {data, success, error} = await Request("GET", {
		url: `https://qa.api.pii-protect.com/bsnclientservices/assessments/authorize/${userId}`,
		authorization: authorization
	})

	if (!success) {
		console.error("Failed to get assessment ID:", error);
		return null;
	}

	const match = data[0].text.match(
		/client_assessment_id=([^'"]+)/
	);

	return {
		success: true,
		data: {
			assessmentId: match?.[1] || null,
		}
	};
}

async function trial(){
	const {
		success: user_success, 
		data: data_user, 
		error: user_error
	} = await loginUserAndGetId("employee+015@ACA.142.com");

	if(!user_success) {
		console.error("Failed to login and get user ID:", user_error);
	}

	const {
		success: assessment_success, 
		data: data_assessment, 
		error: assessment_error
	} = await getAssessmentId(data_user.userId, data_user.authorization);

	if(!assessment_success) {
		console.error("Failed to get assessment ID:", assessment_error);
	}

	console.log("Assessment ID:", data_user.userId);
	console.log("Assessment ID:", data_assessment.assessmentId);
}

trial();
// //GET QUIZ ID
// fetch("https://qa.api.pii-protect.com/bsnclientservices/assessments/authorize/VFZSSk13PT0=", {
//   "headers": {
//     "accept": "application/json, text/plain, */*",
//     "accept-language": "en-US,en;q=0.9",
//     "authorization": "eyJraWQiOiI5bWRkQ2NrOWtEbmZwOWxZYVFNU3YxTmIrQTRpb1FvT2ZSUWxSdzUxN3pvPSIsImFsZyI6IlJTMjU2In0.eyJ1c2VySW5mbyI6ImM4OGVkZTFkOTkzZGQzNjg4ZWM0NDgxZDdjMmJiYzhjZTA4MDI0ODViYWQxZjFmMDFlMjA4NzIxMzcxMTgyNThhNzYyMGFjODEwYjNiZGMzMzBjOGVjNGFlYjIyYTlkMGNkNmZlYzliNDY4OTYxZWYzODExM2ZlZmIxY2JlNjVkNWY5ZGQwNzhlZDRmYjM5YWE5OTAwNWEyOTExMGEzMTE0NzEzMTIxNjVhY2MwZjhjYmQyYjRiNzY2MmYzYTllNWM1NWU2ZTMxMzIyZGNlZmYxNzYzOWVlNGJhNGNmNGMxZjU2NDJjYmM2NmYyYWMwNjNlNDMzNzZkMWMzNmRjODc5OTNhMmQ2OTMwMGUwNGEzNmI2Y2E3OTc5YmU1NDkzOTI5ZjQxNWJlYjIzNTc3NDc3NzY5YmM0MjIxMzZmMWVlOWRlZGJlNzZkZTA2ZGQ2OTdkOTg5NDM5YTk2ZWYwY2UzYTk4MjM2NGI1M2EzOWYzMzlmNDMwMTYwYzE1ZjhkYTczNTc4YzQxMmEyNmY2NmE1NTVlZTIzY2Y4YjUxZGIyZDhiZWI4ZmJlYTg1YTk3YjFhOGU3ODQ5YWI2NGQ3MzQ2ZGM1OGU1MDcyZDcwMzdkYWZmZGUzMzllZDlhYzQxNGU2ZDU0ZjE3YjA4ZTUyNGJhYTQ3MWVmYWE4OGIyYzc0ZmE4Y2FlNGRlYzhlZmI3ZTljYmFkYWUzMTI5ODhiOTRmNDUwMWQxYTU5NzM4ZDc2NjRjZmViNjMzOGVkYWE1ODE4Y2VjNDY3MjZlZDk2Yzk0OWZiZGI1MjA3MzhiZWJkMmQ4OWVmZGYwZTcwMjA1MjA4MTZmNmMzZmU4NTdmZDdjNmM5NDY1MjMwODZlZmJhMWJmNjFmYmVlNjUxOGM5NDgzNzVmMjNlNWM0ZGVjOTllNGUyNDk4MTFlYjVhYWIzIiwic3ViIjoiZTRkOGE0NzgtZjA0MS03MDJmLTdhYjEtNTA3NmFlMGM0OTdjIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vdXMtZWFzdC0xX051S1E0M2FzcCIsImNvZ25pdG86dXNlcm5hbWUiOiJlNGQ4YTQ3OC1mMDQxLTcwMmYtN2FiMS01MDc2YWUwYzQ5N2MiLCJhdWQiOiI3cnBpYWpwdHYwaHZxMTBuYzd2OGRrZnZubyIsImV2ZW50X2lkIjoiMmNhY2Y2YWItZmY5MC00N2YyLTkyNGEtNDJhYzM4NjM2OGZkIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3ODA1MDYzNzYsImV4cCI6MTc4MDUwOTk3NiwiaWF0IjoxNzgwNTA2Mzc2LCJlbWFpbCI6ImVtcGxveWVlKzAwMUB0cmlhbGFjYS4xNDIuY29tIn0.g85d7GvW_ElTveynBhL1vBV3yc7yfnt6aalU5r8K6zCksmWDsB18B2CAPhew3FjdfHI39nhO59ui3a1HA-EEM1_sUJJI_LB1Sc_eSTwHCHHCFu5l5yhMP2EWYA85XjVAz0HLlaIJAQw7Rtn6AYBCXstBpCdLScZEkNmSyonbDLtZbsPdw_-5RTcWYIkvZP6l_5xKbd-EdhLbX694PoEL5KkOOAzVHzmQWIIULW14OS_9wdlVjypkQh-OLDs1CBiGD7un7_OIDN6eRfO7ZX0mKgN05Ud1wksErjQ9I3mOlDlH3LblIUoYxarQBBed0T7dObBJKaizlwOgRAosr0BVZA",
//     "priority": "u=1, i",
//     "sec-ch-ua": "\"Chromium\";v=\"148\", \"Google Chrome\";v=\"148\", \"Not/A)Brand\";v=\"99\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"macOS\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "cross-site"
//   },
//   "body": null,
//   "method": "GET"
// });



// fetch("https://qa.api.pii-protect.com/QuizManagementSystem/quiz-user-revisions/create", {
//   "headers": {
//     "accept": "application/json, text/plain, */*",
//     "accept-language": "en-US,en;q=0.9",
//     "authorization": "eyJraWQiOiI5bWRkQ2NrOWtEbmZwOWxZYVFNU3YxTmIrQTRpb1FvT2ZSUWxSdzUxN3pvPSIsImFsZyI6IlJTMjU2In0.eyJ1c2VySW5mbyI6ImM4OGVkZTFkOTkzZGQzNjg4ZWM0NDgxZDdjMmJiYzhjZTA4MDI0ODViYWQxZjFmMDFlMjA4NzIxMzcxMTgyNThhNzYyMGFjODEwYjNiZGMzMzBjOGVjNGFlYjIyYTlkMGNkNmZlYzliNDY4OTYxZWYzODExM2ZlZmIxY2JlNjVkNWY5ZGQwNzhlZDRmYjM5YWE5OTAwNWEyOTExMGEzMTE0NzEzMTIxNjVhY2MwZjhjYmQyYjRiNzY2MmYzYTllNWM1NWU2ZTMxMzIyZGNlZmYxNzYzOWVlNGJhNGNmNGMxZjU2NDJjYmM2NmYyYWMwNjNlNDMzNzZkMWMzNmRjODc5OTNhMmQ2OTMwMGUwNGEzNmI2Y2E3OTc5YmU1NDkzOTI5ZjQxNWJlYjIzNTc3NDc3NzY5YmM0MjIxMzZmMWVlOWRlZGJlNzZkZTA2ZGQ2OTdkOTg5NDM5YTk2ZWYwY2UzYTk4MjM2NGI1M2EzOWYzMzlmNDMwMTYwYzE1ZjhkYTczNTc4YzQxMmEyNmY2NmE1NTVlZTIzY2Y4YjUxZGIyZDhiZWI4ZmJlYTg1YTk3YjFhOGU3ODQ5YWI2NGQ3MzQ2ZGM1OGU1MDcyZDcwMzdkYWZmZGUzMzllZDlhYzQxNGU2ZDU0ZjE3YjA4ZTUyNGJhYTQ3MWVmYWE4OGIyYzc0ZmE4Y2FlNGRlYzhlZmI3ZTljYmFkYWUzMTI5ODhiOTRmNDUwMWQxYTU5NzM4ZDc2NjRjZmViNjMzOGVkYWE1ODE4Y2VjNDY3MjZlZDk2Yzk0OWZiZGI1MjA3MzhiZWJkMmQ4OWVmZGYwZTcwMjA1MjA4MTZmNmMzZmU4NTdmZDdjNmM5NDY1MjMwODZlZmJhMWJmNjFmYmVlNjUxOGM5NDgzNzVmMjNlNWM0ZGVjOTllNGUyNDk4MTFlYjVhYWIzIiwic3ViIjoiZTRkOGE0NzgtZjA0MS03MDJmLTdhYjEtNTA3NmFlMGM0OTdjIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vdXMtZWFzdC0xX051S1E0M2FzcCIsImNvZ25pdG86dXNlcm5hbWUiOiJlNGQ4YTQ3OC1mMDQxLTcwMmYtN2FiMS01MDc2YWUwYzQ5N2MiLCJhdWQiOiI3cnBpYWpwdHYwaHZxMTBuYzd2OGRrZnZubyIsImV2ZW50X2lkIjoiMmNhY2Y2YWItZmY5MC00N2YyLTkyNGEtNDJhYzM4NjM2OGZkIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3ODA1MDYzNzYsImV4cCI6MTc4MDUwOTk3NiwiaWF0IjoxNzgwNTA2Mzc2LCJlbWFpbCI6ImVtcGxveWVlKzAwMUB0cmlhbGFjYS4xNDIuY29tIn0.g85d7GvW_ElTveynBhL1vBV3yc7yfnt6aalU5r8K6zCksmWDsB18B2CAPhew3FjdfHI39nhO59ui3a1HA-EEM1_sUJJI_LB1Sc_eSTwHCHHCFu5l5yhMP2EWYA85XjVAz0HLlaIJAQw7Rtn6AYBCXstBpCdLScZEkNmSyonbDLtZbsPdw_-5RTcWYIkvZP6l_5xKbd-EdhLbX694PoEL5KkOOAzVHzmQWIIULW14OS_9wdlVjypkQh-OLDs1CBiGD7un7_OIDN6eRfO7ZX0mKgN05Ud1wksErjQ9I3mOlDlH3LblIUoYxarQBBed0T7dObBJKaizlwOgRAosr0BVZA",
//     "content-type": "application/json",
//     "priority": "u=1, i",
//     "sec-ch-ua": "\"Chromium\";v=\"148\", \"Google Chrome\";v=\"148\", \"Not/A)Brand\";v=\"99\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"macOS\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "cross-site"
//   },
//   "body": "{\"quiz_id\":\"VGxSRmVrMUJQVDA9\"}",
//   "method": "POST"
// });

