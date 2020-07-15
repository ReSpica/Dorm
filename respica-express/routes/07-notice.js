var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { Notice,Admin} = require('../model');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');

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

//公告表  用于数据表格
router.get('/',auth,async function(req,res){
    const data = req.query;
    const lists = await Notice.find().skip((data.begin - 1)*10).limit(10).sort({'_id':-1});
    const count = await Notice.find().countDocuments();
    res.send({
        code:'0000',
        msg:'公告表查找完成',
        data:lists,
        count:count
    });
})

//公告表  用于数据表格
router.get('/find',auth,async function(req,res){
    const data = req.query;
    const lists = Notice.find().where(data).sort({'_id':-1});
    res.send({
        code:'0000',
        msg:'公告表查找完成',
        data:lists,
        count:lists.length
    });
})


//删除
router.get('/delete',auth,async function(req,res){
    const data = req.query.id;
    console.log(data);
    const one = await Notice.findById(data);
    console.log(one);
    one.remove();
    res.send({
        code:'0000',
        msg:'删除成功'
    });
})

//添加
router.post('/add',auth,async function(req,res){
    const data = req.body;
    const admin = Admin.find().where({
        admin : data.admin
    })
    const one = await Notice.create({
        admin : admin._id,
        flag : parseInt(data.flag), 
        notice : data.notice,
        date : parseInt(data.date)
    })
    res.send({
        code:'0000',
        msg:'添加成功',
        data:one

    });
})
module.exports = router;