var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const {WeRule,We,Build,Dorm} = require('../model');
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


router.get('/werule',auth, async function(req,res,next){
    const data = req.query;
    const lists = await WeRule.find().skip((data.begin - 1)*10).limit(10);
    const count = await WeRule.find().countDocuments();
    res.send({
        code:'0000',
        data:lists,
        msg:'水单单数据查找成功',
        count:count
    });
})

//查找
router.get('/werule/find',auth, async function(req,res,){
    const data = req.query;
    console.log(data,'xzczxc');
    const lists = await WeRule.find().where(data)
    res.send({
        code:'0000',
        msg : '数据查找成功',
        data:lists
    });
})

//修改
router.post('/werule/edit', async function(req,res,next){
    const data = req.body;
    const one = await WeRule.findById(data.werule_id);
    console.log(req.body.erelief);
    one.erelief= data.erelief,
    one.wrelief= data.wrelief,
    one.efirst = data.efirst,
    one.esecond= data.esecond,
    one.ethird= data.ethird,
    one.wfirst = data.wfirst,
    one.wsecond= data.wsecond,
    one.wthird=data.wthird,
    one.et1 = data.et1,
    one.et2 = data.et2,
    one.wt1 = data.wt1,
    one.wt2 = data.wt2,
    one.save();
    res.send({
        code:'0000',
        msg:'数据修改完成',
        data:one,
    });
})





router.get('/we',auth, async function(req,res,next){
    const data = req.query;
    const lists = await We.find().skip((data.begin - 1)*10).limit(10).sort({'build':1,'year':1,'month':1,}).populate('dorm').populate('build');
    const count = await We.find().countDocuments()
    res.send({
        code:'0000',
        msg:'查找水电单成功',
        data:lists,
        count:count
    })
})

router.get('/we/weSearch',auth, async function(req,res,next){


    const data = req.query;
    var lists;
    var count;
    if(data.build && data.year){
         lists = await We.find().where({'build':data.build,'year':data.year,'month':data.month}).sort({'build':1,'year':1,'month':1,}).populate('dorm').populate('build');
         count = await We.find().where({'build':data.build,'year':data.year,'month':data.month}).countDocuments();
    }else if(!(data.build)&&data.year){
        lists = await We.find().where({'year':data.year,'month':data.month}).sort({'build':1,'year':1,'month':1,}).populate('dorm').populate('build');
        count = await We.find().where({'year':data.year,'month':data.month}).countDocuments();
    }else if(!(data.year)&&data.build){
        lists = await We.find().where({'build':data.build}).sort({'build':1,'year':1,'month':1,}).populate('dorm').populate('build');
        count = await We.find().where({'build':data.build}).countDocuments();

    }else{
         lists = await We.find().sort({'build':1,'year':1,'month':1,}).populate('dorm').populate('build');
         count = await We.find().countDocuments()
    }

    res.send({
        code:'0000',
        msg:'查找水电单成功',
        data:lists,
        count:count
    })


})

router.post('/we/add',auth, async function(req,res,next){
    const data = req.body;
    const dorm = await Dorm.findById(data.dorm);
    const WeRules = await WeRule.find();
    const werule = WeRules[0];
    const electric = parseInt(data.electric);
    const water = parseInt(data.water);
    const js_electric = electric -( werule.erelief*dorm.now);//减免后的用电
    const js_water = water - (werule.wrelief*dorm.now);//减免后的用水
    var efee;
    var wfee;
    var total;

    if(js_electric<=0){
         efee = 0
    }
    if(js_electric<=werule.et1){
        console.log('1111111')
         efee = js_electric *werule.efirst
    }else if((werule.et1<js_electric) &&(js_electric<=werule.et2)){
        console.log('222222222')
         a = js_electric - werule.et1;
         efee = werule.et1*werule.efirst + a*werule.esecond;
    }else if(js_electric>werule.et2){
        console.log('3333333333')
         a = js_electric - werule.et2;
         efee = werule.et1*werule.efirst + (werule.et2-werule.et1)*werule.esecond + a*werule.ethird;
    }

    if(js_water<=0){
        wfee = 0
   }
   if(js_water<=werule.wt1){
       console.log('1111111')
       wfee = js_water *werule.wfirst
   }else if((werule.wt1<js_water) &&(js_water<=werule.wt2)){
       console.log('222222222')
        a = js_water - werule.wt1;
        wfee = werule.wt1*werule.wfirst + a*werule.wsecond;
   }else if(js_water>werule.wt2){
       console.log('3333333333')
        a = js_water - werule.wt2;
        wfee = werule.wt1*werule.wfirst + (werule.wt2-werule.wt1)*werule.wsecond + a*werule.wthird;
   }
   total = parseInt(efee + wfee);
   const year_mouth = (data.year_mouth).split('-');
    const one = await We.create({
        year:year_mouth[0],
        month:year_mouth[1],
        build:dorm.build,
        dorm :dorm._id,
        electric:data.electric,
        water : data.water,
        efee:efee,
        wfee:wfee,
        total:total,
        flag:0
    })
    res.send({
        code: '0000',
        msg: '添加成功',
        data: one
    });
})

router.get('/we/delete',auth,async function(req,res,next){
    const data = req.query;
    const one = await We.findById(data._id);
    one.remove();
    res.send({
        code:'0000',
        msg:'删除水电单成功',
        data:lists
    }) 
})

//we  用于查找
router.get('/we/find', auth, async function (req, res) {
    const data = req.query;
    const lists = await We.find().where(data);
    res.send({
        code: '0000',
        msg: '水电单查找完成',
        data: lists,
        count: lists.length
    });
})


module.exports = router;