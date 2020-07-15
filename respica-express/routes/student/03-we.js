var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { Notice, Build, Dorm, We } = require('../../model');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);


const auth = async (req, res, next) => {
    const raw = String(req.headers.token);
    const { id, date } = jwt.verify(raw, 'spica')
    const now = Date.parse(new Date());
    if (parseInt((now - Number(date)) / 1000) > 86400) {
        res.send({
            msg: 'token过期'
        })
    } else {
        next()
    }
}


router.get('/', auth, async function (req, res) {
    const data = req.query;
    const lists = await We.find().where({
        dorm: data.dorm_id
    }).skip((data.begin - 1) * 10).limit(10).sort({ 'year': -1, 'month': -1, }).populate('dorm');
    const count = await We.find().where({
        dorm: data.dorm_id
    }).countDocuments()
    res.send({
        code: '0000',
        msg: '查找当前宿舍的水电单成功',
        data: lists,
        count:count
    })
})

router.get('/pay', auth, async function (req, res) {
    const data = req.query;
    const one = await We.findById(data.id);
    one.flag = 1;
    one.save();
    res.send({
        code:'0000',
        msg:'支付成功',
        data:one
    })
})
module.exports = router;