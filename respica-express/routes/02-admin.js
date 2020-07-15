var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { Admin } = require('../model');
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

//查找用户单，两种情况，第一种用于数据表格，一种用于防止数据被全删
router.get('/', auth,async function(req,res){
    const data = req.query;
    if(req.query){
        const lists = await Admin.find().skip((data.begin - 1)*10).limit(10);
        const count = await Admin.find().countDocuments();
        res.send({
            code:'0000',
            data:lists,
            count:count
        });
    }else{
        const lists = await Admin.find();
        const count = await Admin.find().countDocuments();
        res.send({
            code:'0000',
            data:lists,
            count:count
        });
    }

})

//删除
router.get('/delete', auth,async function(req,res){
    const data = req.query.id;
    const one = await Admin.findById(data);
    await one.remove();
    res.send({
        code:'0000',
        msg:'当前数据已经删除'
    })
})

//添加
router.post('/add', auth,async function(req,res){
    const data = req.body;
    bcryptPassword = bcrypt.hashSync(data.password,salt);
    const one = await Admin.create({
        admin:data.admin,
        password:bcryptPassword
    });
    res.send({
        code:'0000',
        msg:'新用户添加成功',
        data:one
    })
})
//查找
router.get('/find', auth,async function(req,res){
    const data = req.query.admin;
    const one = await Admin.find().where({
        admin : data
    });
    res.send({
        code:'0000',
        msg:'查找完成',
        data:one,
        count:one.length
    })
})
module.exports = router;