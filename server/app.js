import express from 'express';
const express = require('express');
const app = express();
const db = require('./connect');

app.use(express.json());

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
})