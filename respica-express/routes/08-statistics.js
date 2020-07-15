var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { Notice, Admin, Type, RePair, Build, We } = require('../model');
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







//repair
//1.找到每个type的维修次数
router.get('/repair/numtype', auth, async function (req, res) {
    const typeLists = await Type.find().populate('repair').lean();
    var nums = [];
    var types = [];
    typeLists.forEach(function (value, index, arr) {
        types.push(value.type);
        nums.push(value.repair.length);
    })
    res.send({
        code: '0000',
        msg: '查找统计成功1',
        data: {
            types, nums
        }
    });
})

//2.找到两个对象的付费金额对比
router.get('/repair/sdpay', auth, async function (req, res) {
    const spayLists = await RePair.find().where({
        flag: 1,
        flag2: 1,
    })
    const dpayLists = await RePair.find().where({
        flag: 1,
        flag2: 0,
    })
    var spay = 0;
    var dpay = 0;
    console.log(spayLists);
    spayLists.forEach(function (value, index, array) {
        spay += value.spay
    })

    dpayLists.forEach(function (value, index, array) {
        dpay += value.dpay
    })


    res.send({
        code: '0000',
        msg: '查找统计成功2',
        data: [spay, dpay]

    });
})


//build
//1.查看每一栋宿舍的学生量
router.get('/build/nowmax', auth, async function (req, res) {
    const builds = await Build.find().populate('dorms').lean();
    const buildsName = [];
    var builds_now = [];
    var builds_max = [];
    builds.forEach(function (value, index, arr) {
        buildsName.push(value.build);
        var now = 0;
        var max = 0;
        value.dorms.forEach(function (value, index, arr) {
            now += value.now;
            max += value.max;
        });
        builds_now.push(now);
        builds_max.push(max);
    })


    const finsh = [['product', '现住学生(人)', '最大容纳(人)']];

    buildsName.forEach(function (value, index, arr) {
        finsh.push([value, builds_now[index], builds_max[index]]);
    })
    // console.log(finsh);
    res.send({
        code: '0000',
        msg: '统计完毕',
        data: finsh
    })

})



//we
//1.各年份的各月份的平均水电费
router.get('/we', auth, async function (req, res) {
    var data = req.query.year;
    const wes = await We.find().where({
        year: data
    })
    var monthsnum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var flag = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    wes.forEach(function (value, index, arr) {
        let len = value.month;
        monthsnum[len-1] = value.total;
        flag[len-1] +=1
    })
    // console.log(monthsnum);
    // console.log(flag);
    monthsnum.forEach(function(value,index,arr){
        arr[index] = value / flag[index];
    })
    console.log(monthsnum);
    res.send({
        code: '0000',
        msg: '查找成功',
        data:monthsnum
    })
})
module.exports = router;