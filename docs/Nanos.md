# Core Features
- Allow user to reset Nano status
- Allow user to set Nano status to Viewed
- Allow user to filter Nano by types
- Allow user to multi select

## Nano status update to Viewed API
- This API can get after Nano modal open and all content are fully loaded
const {data, success, error} = await Request('PUT',{
    url: `https://qa.api.pii-protect.com/TestAuthoringSystem/training/v2/users-trainings/${training_id}/stats`,
    authorization: user?.token
    body: {is_viewed:1},
})

## Fetch Nanos metadata
- This API can get on training hub first load
const {data, success, error} = await Request('GET',{
    url: `https://qa.api.pii-protect.com/TestAuthoringSystem/training/v2/users-trainings?limit=21&offset=0&training_type=nano_training`,
    authorization: user?.token
})

## Filter API
- This API can get on Drill down page after clicking "View all" button
- document_type_ids=VFdjOVBRPT
const {data, success, error} = await Request('GET',{
    url: `https://qa.api.pii-protect.com/TestAuthoringSystem/training/v2/users-trainings?document_type_ids=VFdjOVBRPT0%3D&limit=15&offset=0&training_type=nano_training`,
    authorization: user?.token
})

## Nanos type filter IDs
- when fitlering in API remove "=" in ID
[
    {
        "display_name": "Audio",
        "id": "VFdjOVBRPT0=",
        "name": "audio"
    },
    {
        "display_name": "Document",
        "id": "VFhjOVBRPT0=",
        "name": "document"
    },
    {
        "display_name": "Graphic",
        "id": "VGtFOVBRPT0=",
        "name": "graphic"
    },
    {
        "display_name": "Video",
        "id": "VFZFOVBRPT0=",
        "name": "video"
    }
]

## Sample Fetch Nanos Response
{
    "category_name": "Cybersecurity",
    "completion_status": "incomplete",
    "document_type_display_name": "Graphic",
    "document_type_id": 4,
    "document_type_name": "graphic",
    "duration": 1,
    "hasQuiz": 0,
    "package_name": "Nano Training Package",
    "percent_complete": null,
    "quiz_id": "",
    "quiz_taken": 0,
    "score": null,
    "topic_text": "(JC)[PNG v2] Graphic type Nano",
    "training_description": "(JC)[PNG v2] Graphic type Nano",
    "training_document": "4318_nano_training_1787054417-ad03263d-3e45-4042-9430-50f3b5cac26f-videoframe_7842.png",
    "training_id": "VGtSTmVFOUJQVDA9",
    "training_image": "https://bsn-data-qa.s3.amazonaws.com/files/assets/trainings/nano_training/4318_nano_training_1787112812...",
    "training_name": "(JC)[PNG v2] Graphic type Nano",
    "training_type": "nano_training",
    "user_id": "VGtSSk5VNUVXWGM9"
},

