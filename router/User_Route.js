const express = require('express');
const router = express.Router();

const user_controller = require('../controller/user_controller')

// authenticate if the college aducational assistance is available or set to activate
const { isActivate } = require('../middleware/auth')

router.get('/', user_controller.home)

router.get('/college-assistance', isActivate, user_controller.college_assistance)
router.get('/college-assistance/form', isActivate, user_controller.college_assistance_form_get)
router.get('/college-assistance/summary', user_controller.college_assistance_summary_get)
router.post('/college-assistance/summary', user_controller.college_assistance_summary_post)
router.post('/college-assistance/form', user_controller.college_assistance_form_post)
router.get('/college-assistance/:id/existing', user_controller.college_assistance_exist)
router.get('/college-assistance/:id', user_controller.college_assistance_landing)

router.get('/college-assistance/:id/confirm', user_controller.college_assistance_confirm)
router.get('/college-assistance/:id/preview', user_controller.college_assistance_preview)
router.get('/college-assistance/:id/update-response', user_controller.college_assistance_update_get)
router.post('/college-assistance/:id/update-response', user_controller.college_assistance_update_post)

router.get('/medical-assistance', user_controller.medical_assistance)
router.get('/medical-assistance/form', user_controller.medical_assistance_form_get)
router.post('/medical-assistance/form', user_controller.medical_assistance_form_post)
router.get('/medical-assistance/:id/existing', user_controller.medical_assistance_exist)
router.get('/medical-assistance/:id', user_controller.medical_assistance_landing)

router.get('/medical-assistance/:id/confirm', user_controller.medical_assistance_confirm)
router.get('/medical-assistance/:id/preview', user_controller.medical_assistance_preview)
router.get('/medical-assistance/:id/update-response', user_controller.medical_assistance_update_get)
router.post('/medical-assistance/:id/update-response', user_controller.medical_assistance_update_post)

router.get('/burial-assistance', user_controller.burial_assistance)
router.get('/burial-assistance/form', user_controller.burial_assistance_form_get)
router.post('/burial-assistance/form', user_controller.burial_assistance_form_post)
router.get('/burial-assistance/:id/existing', user_controller.burial_assistance_exist)
router.get('/burial-assistance/:id', user_controller.burial_assistance_landing)

router.get('/burial-assistance/:id/confirm', user_controller.burial_assistance_confirm)
router.get('/burial-assistance/:id/preview', user_controller.burial_assistance_preview)
router.get('/burial-assistance/:id/update-response', user_controller.burial_assistance_update_get)
router.post('/burial-assistance/:id/update-response', user_controller.burial_assistance_update_post)

router.get('/transportation-assistance', user_controller.transportation_assistance)
router.get('/transportation-assistance/form', user_controller.transportation_assistance_form_get)
router.post('/transportation-assistance/form', user_controller.transportation_assistance_form_post)
router.get('/transportation-assistance/:id/existing', user_controller.transportation_assistance_exist)
router.get('/transportation-assistance/:id', user_controller.transportation_assistance_landing)

router.get('/transportation-assistance/:id/confirm', user_controller.transportation_assistance_confirm)
router.get('/transportation-assistance/:id/preview', user_controller.transportation_assistance_preview)
router.get('/transportation-assistance/:id/update-response', user_controller.transportation_assistance_update_get)
router.post('/transportation-assistance/:id/update-response', user_controller.transportation_assistance_update_post)

router.get('/emergency-shelter-assistance', user_controller.emergency_shelter_assistance)
router.get('/emergency-shelter-assistance/form', user_controller.emergency_shelter_assistance_form_get)
router.post('/emergency-shelter-assistance/form', user_controller.emergency_shelter_assistance_form_post)
router.get('/emergency-shelter-assistance/:id/existing', user_controller.emergency_shelter_assistance_exist)
router.get('/emergency-shelter-assistance/:id', user_controller.emergency_shelter_assistance_landing)

router.get('/emergency-shelter-assistance/:id/confirm', user_controller.emergency_shelter_assistance_confirm)
router.get('/emergency-shelter-assistance/:id/preview', user_controller.emergency_shelter_assistance_preview)
router.get('/emergency-shelter-assistance/:id/update-response', user_controller.emergency_shelter_assistance_update_get)
router.post('/emergency-shelter-assistance/:id/update-response', user_controller.emergency_shelter_assistance_update_post)


router.get('/about', user_controller.about)

router.get('/search', user_controller.search)

module.exports = router;