const express = require('express');
const router = express.Router();

const itemService = require("../services/item-service");
const errorService = require("../services/error-service");

router.get('/', async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 0;
        const size = req.query.size ? parseInt(req.query.size) : 10;
        const categories = itemService.findAll(page, size);
        res.json(categories);
    } catch (error) {
        errorService.sendErrorResponse(res, error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const item = itemService.findById(id);
        res.json(item);
    } catch (error) {
        errorService.sendErrorResponse(res, error);
    }
});

module.exports = router;