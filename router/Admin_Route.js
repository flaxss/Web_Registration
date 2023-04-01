const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs')

// require and use cookie parser
const cookieParser = require('cookie-parser');
router.use(cookieParser());

const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    },
});

const upload = multer({
    storage: Storage,
});

const admin_controller = require('../controller/admin_controller')
const { requireAuth, checkUser } = require('../middleware/auth')

router.get('/*', requireAuth, checkUser)
router.post('/*', checkUser)
router.patch('/*', checkUser)

// auto-create option 
const Option = require('../model/Option')
async function option(){
    const option = await Option.find()
    if(option == ''){
        const isActivte = await Option({
            option: 'activate'
        })
        isActivte.save()
        .then(() => console.log(`${isActivte}`,'created'))
        .catch(err => console.log(err.message))
    }
}
option()

router.get('/', admin_controller.admin_home)

router.post('/post-announcement', admin_controller.create_post)

router.get('/:id/edit-post', admin_controller.edit_post_get)

router.patch('/:id/edit-post', admin_controller.edit_post_patch)

router.post('/add-event', admin_controller.add_event)

// appointment
router.get('/appointment', admin_controller.appointment)
router.post('/appointment-activate', admin_controller.appointment_activate)
router.post('/appointment-deactivate', admin_controller.appointment_deactivate)
router.delete('/appointment/:id/reject', admin_controller.appointment_reject)
router.get('/appointment/:id/view', admin_controller.appointment_view)
router.get('/appointment/:id/update', admin_controller.appointment_update_get)
router.patch('/appointment/:id/update', admin_controller.appointment_update_post)
router.post('/appointment/:id/accept', admin_controller.appointment_accept)

//educ application
router.get('/application-educ-assistance', admin_controller.application_educ_assistance)
router.get('/application/educational-assistance/:id/accept', admin_controller.application_educ_assistance_accept)
router.get('/application/educational-assistance/:id/view', admin_controller.application_educ_assistance_view)
router.get('/application/educational-assistance/:id/update', admin_controller.application_educ_assistance_update_get)
router.patch('/application/educational-assistance/:id/update', admin_controller.application_educ_assistance_update_patch)
// move to archive
router.patch('/application/educational-assistance/:id/archive', admin_controller.application_educ_assistance_archive)
//aics application
router.get('/application-medical-assistance', admin_controller.application_medical_assistance)
router.get('/application-burial-assistance', admin_controller.application_burial_assistance)
router.get('/application-transportation-assistance', admin_controller.application_transportation_assistance)
router.get('/application-emergency-assistance', admin_controller.application_emergency_assistance)
// accept all aics applicaiton
router.get('/application/aics-assistance/:id/accept', admin_controller.application_aics_assistance_accept)
// update aics application
router.get('/application/aics-assistance/:id/view', admin_controller.application_aics_assistance_view)

router.get('/application/aics-assistance/:id/update', admin_controller.application_aics_assistance_get)
router.patch('/application/aics-assistance/:id/update', admin_controller.application_aics_assistance_patch)
// move to archive
router.patch('/application/aics-assistance/:id/archive', admin_controller.application_aics_assistance_archive)
// archives action
router.get('/application-archive', admin_controller.application_archives)
router.patch('/application-educ-archive/:id', admin_controller.application_educ_archives_restore)
router.delete('/application-educ-archive/:id', admin_controller.application_educ_archives_delete)
router.patch('/application-aics-archive/:id', admin_controller.application_aics_archives_restore)
router.delete('/application-aics-archive/:id', admin_controller.application_aics_archives_delete)

// registration form
router.get('/register/burial-assistance/form', admin_controller.register_burial_get)
router.post('/register/burial-assistance/form', admin_controller.register_burial_post)

router.get('/register/emergency-shelter-assistance/form', admin_controller.register_emergency_get)
router.post('/register/emergency-shelter-assistance/form', admin_controller.register_emergency_post)

router.get('/register/medical-assistance/form', admin_controller.register_medical_get)
router.post('/register/medical-assistance/form', admin_controller.register_medical_post)

router.get('/register/transportation-assistance/form', admin_controller.register_transportation_get)
router.post('/register/transportation-assistance/form', admin_controller.register_transportation_post)

// records
router.get('/records/educational-assistance', admin_controller.records_educ_assistance)
router.post('/records/compile', admin_controller.records_compile)
router.get('/records/educ-list', admin_controller.records_educ_list)
router.get('/records/educ-list/:id', admin_controller.records_educ_list_id)
router.get('/records/aics-list', admin_controller.records_aics_list)
router.get('/records/medical-assistance', admin_controller.records_medical_assistance)
router.get('/records/burial-assistance', admin_controller.records_burial_assistance)
router.get('/records/transportation-assistance', admin_controller.records_transpo_assistance)
router.get('/records/emergency-shelter-assistance', admin_controller.records_emergency_assistance)

router.get('/accounts', admin_controller.accounts)
router.patch('/accounts/:id/disable', admin_controller.accounts_disable)
router.patch('/accounts/:id/enable', admin_controller.accounts_enable)
router.get('/account-archive', admin_controller.archive_account)
router.patch('/accounts/:id/archive', admin_controller.accounts_archive)
router.patch('/accounts/:id/restore', admin_controller.accounts_restore)
router.delete('/accounts/:id/delete', admin_controller.accounts_delete)

router.get('/create-account', admin_controller.create_account_get)
router.post('/create-account', admin_controller.create_account_post)

router.get('/settings', admin_controller.settings)
router.patch('/settings/:id', upload.single('image'), admin_controller.settings_id)

router.get('/search-appointment', admin_controller.search_appointment)
router.get('/search-application', admin_controller.search_application)

module.exports = router;