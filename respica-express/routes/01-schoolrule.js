var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { IdRule,System } = require('../model');
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

//专业表
router.get('/system',auth,async function(req,res){
    const data = req.query;
    const lists = await System.find().skip((data.begin - 1)*10).limit(10);
    const count = await System.countDocuments();
    res.send({
        code:'0000',
        data:lists,
        count:count
    });
})
//查找专业表
router.get('/system/find',auth,async function(req,res){
    const data = req.query.num;
    const one = await System.find().where({
        num : data
    });
    res.send({
        code:'0000',
        msg:'查找完成',
        data:one,
        count:one.length
    })
})
//添加专业表
router.post('/system/add',auth,async function(req,res){
    const data = req.body;
    const one = await System.create({
        num:data.num,
        system:data.system
    });
    res.send({
        code:'0000',
        msg:'新专业添加成功',
        data:one
    })
})
//删除专业表
router.get('/system/delete', auth,async function(req,res){
    const data = req.query.id;
    const one = await System.findById(data);
    await one.remove();
    res.send({
        code:'0000',
        msg:'当前数据已经删除'
    })
})





//学号规则表
router.get('/idrule',auth,async function(req,res){
    const data = req.query;
    const lists = await IdRule.find().skip((data.begin - 1)*10).limit(10);
    const count = await IdRule.countDocuments();
    res.send({
        code:'0000',
        data:lists,
        count:count
    });
})
//查找学号规则表的专业
router.get('/idrule/findsystem',auth,async function(req,res){
    const one = await IdRule.find();
    res.send({
        code:'0000',
        msg:'查找完成',
        data:one,
        count:one.length
    })
})

//查找学号规则表
router.get('/idrule/find',auth,async function(req,res){
    const data = req.query;
    console.log(data);
    const one  =await IdRule.findById(data.id);
    res.send({
        code:0000,
        msg:'查找成功',
        data:one
    })
})

//重置学号规则表
router.post('/idrule/edit',auth,async function(req,res){
    const data = req.body;
    const grade1 = parseInt(data.grade1);
    const grade2 = parseInt(data.grade2);
    const system1 = parseInt(data.system1);
    const system2 = parseInt(data.system2);
    const class1 = parseInt(data.class1);
    const class2 = parseInt(data.class2);
    const rank1 = parseInt(data.rank1);
    const rank2 = parseInt(data.rank2);
    const grade = grade1+'~'+grade2;
    const system = system1+'~'+system2;
    const class_ = class1+'~'+class2;
    const rank = rank1+'~'+rank2;
    // console.log(grade,system,class_,rank,data.id,data.size);
    const one  = await IdRule.findById(data.id);
    one.grade = grade;
    one.system = system;
    one.class =class_;
    one.rank = rank;
    one.size = parseInt(data.size);
    one.save();
    res.send({
        code:0000,
        msg:'重置数据成功',
        data:one
    })
})
module.exports = router;