var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { Student, Build, Dorm, IdRule, We, WeRule } = require('../../model');
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



//we  用于数据表格
router.get('/we', auth, async function (req, res) {
    const data = req.query;
    const builds = await Build.find().where({ user: data.user });
    const lists = await We.find().where({ build: builds[0]._id }).skip((data.begin - 1) * 10).limit(10).sort({ '_id': -1 }).populate('dorm');
    const count = await We.find().where({ build: builds[0]._id }).countDocuments();
    res.send({
        code: '0000',
        msg: '水电单查找完成',
        data: lists,
        count: count
    });
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

//we 添加
router.post('/we/add', auth, async function (req, res) {
    const data = req.body;
    const dorm = await Dorm.findById(data.dorm);
    const WeRules = await WeRule.find();
    const werule = WeRules[0];
    const electric = parseInt(data.electric);
    const water = parseInt(data.water);
    const js_electric = electric - (werule.erelief * dorm.now);//减免后的用电
    const js_water = water - (werule.wrelief * dorm.now);//减免后的用水
    var efee;
    var wfee;
    var total;

    if (js_electric <= 0) {
        efee = 0
    }
    if (js_electric <= werule.et1) {
        console.log('1111111')
        efee = js_electric * werule.efirst
    } else if ((werule.et1 < js_electric) && (js_electric <= werule.et2)) {
        console.log('222222222')
        a = js_electric - werule.et1;
        efee = werule.et1 * werule.efirst + a * werule.esecond;
    } else if (js_electric > werule.et2) {
        console.log('3333333333')
        a = js_electric - werule.et2;
        efee = werule.et1 * werule.efirst + (werule.et2 - werule.et1) * werule.esecond + a * werule.ethird;
    }

    if (js_water <= 0) {
        wfee = 0
    }
    if (js_water <= werule.wt1) {
        console.log('1111111')
        wfee = js_water * werule.wfirst
    } else if ((werule.wt1 < js_water) && (js_water <= werule.wt2)) {
        console.log('222222222')
        a = js_water - werule.wt1;
        wfee = werule.wt1 * werule.wfirst + a * werule.wsecond;
    } else if (js_water > werule.wt2) {
        console.log('3333333333')
        a = js_water - werule.wt2;
        wfee = werule.wt1 * werule.wfirst + (werule.wt2 - werule.wt1) * werule.wsecond + a * werule.wthird;
    }
    total = parseInt(efee + wfee);
    const year_mouth = (data.year_mouth).split('-');
    const one = await We.create({
        year: year_mouth[0],
        month: year_mouth[1],
        build: dorm.build,
        dorm: dorm._id,
        electric: data.electric,
        water: data.water,
        efee: efee,
        wfee: wfee,
        total: total,
        flag: 0
    })
    res.send({
        code: '0000',
        msg: '添加成功',
        data: one
    });
})

//we  删除
router.get('/we/delete', auth, async function (req, res) {
    const data = req.query;
    const one = await We.findById(data.id);
    one.remove();
    res.send({
        code: '0000',
        msg: '删除成功'
    });
})

//we  搜索
router.get('/we/weSearch', auth, async function (req, res) {
    const data = req.query;
    var lists;
    var count;
    if (data.year && data.dorm) {
        lists = await We.find().where({ build: data.build, year: data.year, month: data.month, dorm: data.dorm }).sort({ '_id': -1 }).populate('dorm');
        count = await We.find().where({ build: data.build, year: data.year, month: data.month, dorm: data.dorm }).countDocuments();
    } else if (!(data.year) && data.dorm) {
        lists = await We.find().where({ build: data.build, dorm: data.dorm }).sort({ '_id': -1 }).populate('dorm');
        count = await We.find().where({ build: data.build, dorm: data.dorm }).countDocuments();
    } else if (!(data.dorm) && data.year) {
        lists = await We.find().where({ build: data.build, year: data.year, month: data.month }).sort({ '_id': -1 }).populate('dorm');
        count = await We.find().where({ build: data.build, year: data.year, month: data.month }).countDocuments();
    } else {
        lists = await We.find().where({ build: data.build }).sort({ '_id': -1 }).populate('dorm');
        count = await We.find().where({ build: data.build }).countDocuments();
    }
    res.send({
        code: '0000',
        msg: '水电单查找完成',
        data: lists,
        count: count
    });
})



//own 数据表格
router.get('/owe', auth, async function (req, res) {
    const data = req.query;
    const lists = await Dorm.find().where({ build: data.build, break: 0 }).populate('wes').lean();
    const lists2 = await Dorm.find().where({ build: data.build, break: 1 }).populate('wes').lean();
    const newLists = [];

    for (let i = 0; i < lists.length; i++) {
        var a = lists[i].wes;
        if (a.length >= 3) {
            var add = 0;
            for (let j = 0; j < a.length; j++) {
                if (a[j].flag == 0) {
                    add++;
                }
            }
            let owe_num = add;
            if (add >= 3) {
                lists[i].owe_num = owe_num;
                newLists.push(lists[i]);

            }
        }
    }

    for (let i = 0; i < lists2.length; i++) {
        var a = lists2[i].wes;
        if (a.length >= 1) {
            var add = 0;
            for (let j = 0; j < a.length; j++) {
                if (a[j].flag == 0) {
                    add++;
                }
            }
            let owe_num = add;
            lists2[i].owe_num = owe_num;
            newLists.push(lists2[i]);


        }
    }



    res.send({
        code: '0000',
        msg: '欠费表查找完成',
        data: newLists,
        count: newLists.length
    });
})

//own 拉闸/通电
router.get('/owe/break', auth, async function (req, res) {
    var data = req.query;
    const one = await Dorm.findById(data.id);
    if (one.break == 0) {
        one.break = 1
    } else {
        one.break = 0
    }
    one.save();
    res.send({
        code: '0000',
        msg: '宿舍数据修改成功',
        data: one
    })
})

module.exports = router;