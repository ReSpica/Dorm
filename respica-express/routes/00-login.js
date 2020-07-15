var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { Admin } = require('../model');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');


router.post('/', async function (req, res, next) {
    const data = req.body;
    const one = await Admin.findOne({
        admin: data.admin
    })
    if (!one) {
        res.send({
            'code': 0000,
            'msg': '账号或密码错误'
        });
    }
    const correct = bcrypt.compareSync(data.password, one.password);
    if (!correct) {
        res.send({
            'code': 0000,
            'msg': '账号或密码错误'
        });
    }
    //设置token
    const date = Date.parse(new Date())
    const token = jwt.sign({
        id : String(one._id),
        date : date
    },'spica')

    res.send({
        'code': 1111,
        'msg': '用户存在，登陆成功',
        'token':token,
        'admin':one.admin
    });


})


module.exports = router;