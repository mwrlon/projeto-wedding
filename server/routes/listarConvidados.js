import express from 'express';
const express = require('express');
const router = express.Router();

router.get('/convidados', (req, res) => {
    req.db('convidados')
        .select('*')
        .then(convidados => {
            res.json(convidados);
        })});

module.exports = router;