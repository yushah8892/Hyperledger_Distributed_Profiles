const { Router } = require('express');
//const StudentController = require('../controllers/studentsController.js');
const EntityController = require('../controllers/entityController');

const routes = Router();
routes.post('/create/entity', function (req, res) {
    EntityController.createEntity(req, res)

});
routes.get('/entity/:id', function (req, res) {
    EntityController.getEntity(req, res)
});

routes.get('/get/entity/all', function (req, res) {
    EntityController.getAllEntity(req, res)
});
/*
routes.post('/create/certificate', (req, res) => CertificateController.issueCertificate(req, res));
routes.get('/validate/certificate', (req, res) => {

    CertificateController.verifyCertificate(req, res);
});
*/
routes.get('/', (req, res) => {
    res.send('Welcome to Certification Network!!')
})
module.exports = routes;