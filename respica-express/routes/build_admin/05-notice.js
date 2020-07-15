var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { Student, Build, Dorm, IdRule,We,WeRule} = require('../../model');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');

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



//notice  用于数据表格
router.get('/', auth, async function (req, res) {
    const data = req.query;
    const lists = await Build.find().where({_id: data._id }).skip((data.begin - 1) * 10).limit(10);
    const count = await Build.find().where({_id: data._id }).countDocuments();
    res.send({
        code: '0000',
        msg: '栋公告查找完成',
        data: lists,
        count: count
    });
})

//notice  用于查找
router.get('/find', auth, async function (req, res) {
    const data = req.query;
    const lists = await Build.find().where(data);
    res.send({
        code: '0000',
        msg: '栋公告查找完成',
        data: lists,
        count: lists.length
    });
})

//notice  用于修改
router.post('/edit', auth, async function (req, res) {
    const data = req.body;
    const one = await Build.findById(data._id);
    one.notice = data.notice;
    one.save();
    res.send({
        code: '0000',
        msg: '栋公告修改完毕',
        data: one
    });
})
module.exports = router;