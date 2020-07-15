var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const {RepairMan,RePair,Type} = require('../model');
const jwt = require('jsonwebtoken');
const fs = require('fs');
var multer = require('multer');

var createFolder = function(folder){ //检测是否创建过目录
    try{
        fs.accessSync(folder);
    }catch(e){
        fs.mkdirSync(folder);
    }
}
var uploadFolder = './upload/repairman/';//设置下载地址
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



router.get('/repairman',auth, async function(req,res,next){
    const data = req.query;
    const lists = await RepairMan.find().skip((data.begin - 1)*10).limit(10);
    const count = await RepairMan.find().countDocuments();
    res.send({
        code:'0000',
        data:lists,
        count:count
    });
})

//删除
router.get('/repairman/delete',auth, async function(req,res,){
    const data = req.query;
    const one = await RepairMan.findById(data.id);
    one.remove();
    res.send({
        code:'0000',
        msg : '维修员删除成功'
    });
})

//添加
router.post('/repairman/add', async function(req,res,next){
    const data = req.body;
    const one = await RepairMan.create({
        rmname: data.name,
        rmphone: data.phone,
        rmphoto : data.photo
    })
    res.send({
        code:'0000',
        msg:'维修员添加完成',
        data:one,
    });
})

//文件上传
router.post('/repairman/upload', upload.single('file'),async function(req,res,next){
    const data = req.file;
    console.log(data);
    res.send({
        code:'0000',
        msg:'上传成功',
        data:data.path,

    });
})

//查找
router.get('/repairman/find',auth, async function(req,res,){
    const data = req.query;
    const lists = await RepairMan.find().where(data)
    res.send({
        code:'0000',
        msg : '维修员查找成功',
        data:lists
    });
})

//修改
router.post('/repairman/edit', async function(req,res,next){
    const data = req.body;
    const one = await RepairMan.findById(data.repairman_id);
    one.rmname = data.name;
    one.rmphone = data.phone;
    one.rmphoto = data.photo;
    one.save();
    res.send({
        code:'0000',
        msg:'维修员修改完成',
        data:one,
    });
})










//repair
router.get('/repair', auth, async function (req, res) {
    const data = req.query;
    const lists = await RePair.find().skip((data.begin - 1) * 10).limit(10).populate('type').populate('dorm').populate('build').populate('repairman');
    console.log(lists);
    res.send({
        code:'0000',
        msg:'报修表查找完毕',
        data:lists
    })
})


//完成报修
router.post('/repair/finsh' ,auth,async function(req,res){
    const data = req.body;
    const repair = await RePair.findById(data.repair_id);
    const repairman = await RepairMan.findById(data.repairman);
    const date = Date.parse(new Date())
    repair.repairman = repairman._id;
    repair.rremark = data.rremark;
    if(parseInt(data.flag2) == 0){
        repair.dpay = data.pay;
        repair.spay = 0;
    }else{
        repair.spay = data.pay;
        repair.dpay = 0;
    }
    repair.flag = 1;
    repair.flag2 = data.flag2;
    repair.oktime = date;
    repair.save()
    res.send({
        code:'0000',
        msg:'完成报修',
        data:repair
    })
})

//查找报修单
router.get('/repair/find', auth, async function (req, res) {
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

//专用查找type表
router.get('/repair/type',auth,async function(req,res){
    const lists = await Type.find();
    res.send({
        code:'0000',
        msg:'查找type表成功',
        data:lists
    })
})

//修改报修单
router.post('/repair/edit',auth,async function(req,res){
    const data = req.body;
    console.log(data);
    const repair = await RePair.findById(data.repair_id);
    const type = await Type.findById(data.type);
    const repairman = await RepairMan.findById(data.repairman);
    repair.rremark = data.rremark;
    repair.type = type._id;
    repair.repairman = repairman._id;
    repair.repairman._id;
    repair.flag2 = data.flag2;
    if(parseInt(data.flag2) == 0){
        console.log('学生')
        repair.spay = 0;
        repair.dpay = data.pay;
    }else{
        console.log('学校')
        repair.spay = data.pay;
        repair.dpay = 0;
    }
    repair.save()
    res.send({
        code:'0000',
        msg:'修改成功',
        data:repair
    })

})

//删除报修单
router.get('/repair/delete',auth,async function(req,res){
    const data = req.query;
    const one = await RePair.findById(data.id);
    one.remove();
    res.send({
        'code':'0000',
        'msg':'删除报修单成功'
    })
})
module.exports = router;