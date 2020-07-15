var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { Notice,Build,Dorm} = require('../../model');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);


const auth = async(req,res,next)=>{
    const raw = String(req.headers.token);
    const {id,date} = jwt.verify(raw,'spica')
    const now = Date.parse(new Date());
    if(parseInt((now-Number(date))/1000) > 86400){
        res.send({
            msg:'token过期'
        })
    }else{
        next()
    }
}


router.get('/notice1', auth,async function(req,res){
    const lists = await Notice.find().where({
        flag:1
    }).sort({'_id':-1})
    res.send({
        code:0000,
        msg:'查找公告表成功',
        data:lists
    })
})

router.get('/notice2', auth,async function(req,res){
    const data = req.query;
    const dorm = await Dorm.findById(data.student_dormId);
    const one = await Build.findById(dorm.build);
    res.send({
        code:0000,
        msg:'查找公告表成功',
        data:one
    })
})
module.exports = router;