var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { Notice, Build, Dorm, We,RePair,Type,RepairMan,Student} = require('../../model');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
const fs = require('fs');
var multer = require('multer');

var createFolder = function(folder){ //检测是否创建过目录
    try{
        fs.accessSync(folder);
    }catch(e){
        fs.mkdirSync(folder);
    }
}
var uploadFolder = './upload/repair/';//设置下载地址
createFolder(uploadFolder);//把设置的地址给上面的方法进行检测


var storage = multer.diskStorage({//前面两部都为multer的diskStorage服务
    destination:function(req,file,cb){
        cb(null,uploadFolder);
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+'-'+file.originalname);
    }
})
var upload = multer({storage:storage})//文件上传


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
    const lists = await RePair.find().where({
        dorm:data.id
    }).skip((data.begin - 1) * 10).limit(10).populate('type').populate('dorm').populate('build').populate('repairman');
    console.log(lists);
    res.send({
        code:'0000',
        msg:'报修表查找完毕',
        data:lists
    })
})


//type表
router.get('/type',auth, async function(req,res){
    const lists = await Type.find();
    res.send({
        code:'0000',
        msg:'type表查找完成',
        data:lists
    })
})

//文件上传
router.post('/upload', upload.single('file'),async function(req,res,next){
    const data = req.file;
    console.log(data);
    res.send({
        code:'0000',
        msg:'上传成功',
        data:data.path,

    });
})


//添加
router.post('/add',auth,async function(req,res){
    const data = req.body;
    console.log(data);
    const dorm = await Dorm.findById(data.student_dormId);
    const type = await Type.findById(data.type);
    const build = await Build.findById(dorm.build);
    const student = await Student.findById(data.student_id);
    const date = Date.parse(new Date())
    const one = await RePair.create({
        build:build._id,
        dorm:dorm._id,
        type:type._id,
        sremark:data.sremark,
        photo:data.photo,
        sno:student.sno,
        sphone:student.sphone,
        time:date,
        flag:0
    })
    res.send({
        code:'0000',
        msg:'添加报修单成功',
        data:one
    })
})




//专用type表,上面有了


//专用repairman表
router.get('/repairman',auth, async function(req,res){
    const lists = await RepairMan.find();
    res.send({
        code:'0000',
        msg:'repairman表查找完成',
        data:lists
    })
})

//查找报修单
router.get('/find', auth, async function (req, res) {
    const data = req.query;
    console.log(data);
    const lists = await RePair.find().where(
        data
    ).populate('dorm').populate('build').populate('repairman').populate('type');
    console.log(lists);
    res.send({
        code:'0000',
        msg:'报修表查找完毕',
        data:lists
    })
})

//删除报修单
router.get('/delete',auth,async function(req,res){
    const data = req.query;
    const one = await RePair.findById(data.id);
    one.remove();
    res.send({
        'code':'0000',
        'msg':'删除报修单成功'
    })
})



//用于判断是否可以报修
router.get('/dorm/find',auth,async function(req,res){
    const data = req.query.student_dormId;
    const dorm = await Dorm.findById(data);
    if(dorm.break == 0){
        res.send({
            code:'0000',
            msg:'没断电'
        })
    }else{
        res.send({
            code:'0000',
            msg:'断电'
        })
    }
})
module.exports = router;