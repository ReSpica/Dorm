var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { Admin,Build, Dorm } = require('../model');
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

//栋表  用于数据表格
router.get('/build/',auth,async function(req,res,next){
    const data = req.query;
    const lists = await Build.find().skip((data.begin - 1)*10).limit(10);
    const count = await Build.find().countDocuments();
    res.send({
        code:'0000',
        data:lists,
        count:count
    });
})
//栋表查询 用于数据表格的查找
router.get('/build/find',auth,async function(req,res,next){
    const data = req.query;
    const lists = await Build.find().where(data)
    res.send({
        code:'0000',
        data:lists,
        count:lists.length
    });
})
//栋表添加接口
router.post('/build/add',auth,async function(req,res,next){
    const data = req.body;
    console.log(data);
    //找出管理员
    const admin = await Admin.findOne({
        admin:data.admin_id
    })
    const one = await Build.create({
        admin : admin._id,
        build : data.build,
        user  : data.user,
        phone : data.phone,
        now :0,
        password: bcrypt.hashSync(data.phone,salt)
    })
    res.send({
        code:'0000',
        msg:'添加完毕',
        data:one
    });
})
//栋表删除接口
router.get('/build/delete',auth,async function(req,res,next){
    const data = req.query.id;
    const one = await Build.findById(data);
    await one.remove();
    res.send({
        code:'0000',
        msg:'删除完毕'
    });
})
//栋表修改接口
router.post('/build/edit',auth,async function(req,res,next){
    const data = req.body;
    //找出需要修改的对象
    const one = await Build.findById(data.build_id);
    one.build = data.build;
    one.user = data.user;
    one.phone = data.phone;
    one.notice = data.notice;
    one.save();
    res.send({
        code:'0000',
        msg:'当前栋修改成功',
        data:one
    })
})
//栋表负责人密码修改接口
router.post('/build/pwdedit',auth,async function(req,res,next){
    const data = req.body;
    bcryptPassword = bcrypt.hashSync(data.pwd,salt)
    //找出需要修改的对象
    const one = await Build.findById(data.build_id);
    one.password = bcryptPassword
    one.save();
    res.send({
        code:'0000',
        msg:'当前栋负责人密码修改成功',
        data:one
    })
})






router.get('/dorm/',auth,async function(req,res,next){
    const data = req.query;
    if(data.build){
        var lists = await Dorm.find().populate('build').skip((data.begin - 1)*10).limit(10).where({build:data.build});
        const count = await Dorm.find().countDocuments().where({build:data.build});
        res.send({
            code:0000,
            msg:'宿舍列表查找成功',
            data:lists,
            count:count
        })
    }else{
        var lists = await Dorm.find().populate('build').skip((data.begin - 1)*10).limit(10);
        const count = await Dorm.find().countDocuments();
        res.send({
            code:0000,
            msg:'宿舍列表查找成功',
            data:lists,
            count:count
        })
    }
})

router.get('/dorm/find',auth,async function(req,res,next){
    const data = req.query;
    console.log(data);
    const lists = await Dorm.find().where(data)
    res.send({
        code:0000,
        msg:'宿舍列表查找成功',
        data:lists,
        count:lists.length
    })
})

router.post('/dorm/add',auth,async function(req,res,next){
    const data = req.body;
    console.log(data);
    const build = await Build.find().where({
        build : data.build
    })
    build[0].now ++;
    build[0].save();
    const one = await Dorm.create({
        build : build[0]._id,
        dorm : data.dorm,
        max : data.max,
        now : 0,
        break:0
    })
    res.send({
        code:0000,
        msg:'宿舍列表添加成功',
        data:one
    })
})

router.get('/dorm/delete',auth,async function(req,res){
    const data = req.query.id;
    const one = await Dorm.findById(data);
    const build = await Build.find().where({
        _id : one.build
    })
    build[0].now--;
    build[0].save()
    await one.remove();
    res.send({
        code:'0000',
        msg:'删除宿舍成功'
    })
})

router.post('/dorm/edit',auth,async function(req,res){
    const data = req.body;
    const one = await Dorm.findById(data.dorm_id);
    one.dorm = data.dorm;
    one.max = data.max;
    one.save()
    res.send({
        code:'0000',
        msg:'宿舍修改成功',
        data:one
    })
})
module.exports = router;