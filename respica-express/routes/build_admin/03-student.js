var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { Student, Build, Dorm, IdRule, System } = require('../../model');
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

//专业表
router.get('/s2/system', auth, async function (req, res) {
    const data = req.query;
    const lists = await System.find().skip((data.begin - 1) * 10).limit(10);
    const count = await System.countDocuments();
    res.send({
        code: '0000',
        data: lists,
        count: count
    });
})

//s2  用于数据表格
router.get('/s2', auth, async function (req, res) {
    const data = req.query;
    console.log(data);
    const builds = await Build.find().where({ user: data.user });
    console.log(builds);
    const lists = await Student.find().where({ flag: 1, build: builds[0]._id }).skip((data.begin - 1) * 10).limit(10).populate('build');
    const count = await Student.find().where({ flag: 1, build: builds[0]._id }).countDocuments();
    res.send({
        code: '0000',
        msg: '学生表2查找完成',
        data: lists,
        count: count
    });
})

//s2  用于专业查找栋信息的
router.get('/s2/find', auth, async function (req, res) {
    const data = req.query;
    const lists = await Student.find(data).populate('build');
    res.send({
        code: '0000',
        msg: '学生表2查找完成',
        data: lists,
        count: lists.length
    });
})
//s2Seach 用于查询更新数据表格
router.get('/s2Search', auth, async function (req, res) {
    const data = req.query;
    console.log(data);
    //找到id规则表
    const idRules = await IdRule.find();
    const one = idRules[0];
    const g_rule = one.grade.split('~');
    const s_rule = one.system.split('~');
    const c_rule = one.class.split('~');
    // console.log(one);
    // console.log(g_rule);
    // console.log(s_rule);
    // console.log(c_rule); {
    //找到当前宿舍
    const builds = await Build.find().where({ user: data.user });
    console.log(builds[0]._id, '???????????????????????????????????????????????????')
    const lists = await Student.find().where({ flag: 1, build: builds[0]._id }).populate('build');
    const count = await Student.find().where({ flag: 1, build: builds[0]._id }).countDocuments();
    const newLists = [];
    for (let i = 0; i < lists.length; i++) {
        let sno = String(lists[i].sno);
        let g_now = sno.substring(g_rule[0] - 1, g_rule[1]);
        let s_now = sno.substring(s_rule[0] - 1, s_rule[1]);
        let c_now = sno.substring(c_rule[0] - 1, c_rule[1]);
        console.log(g_now, s_now, c_now)
        let flag = 0;
        if (data.grade) {
            if (data.grade == g_now) {
                flag++;
            }
        } else {
            flag++;
        }
        if (data.system) {
            if (data.system == s_now) {
                flag++;
            }
        } else {
            flag++;
        }
        if (data.class) {
            if (data.class == c_now) {
                flag++;
            }
        } else {
            flag++;
        }
        console.log(flag);
        if (flag == 3) {
            newLists.push(lists[i]);
        } else {
        }
    }
    res.send({
        code: '0000',
        msg: '学生表2查找完成',
        data: newLists,
        count: count
    });



})


//s2调配
router.get('/s2/tos3', auth, async function (req, res) {
    const data = req.query;
    const newIdArr = data.idArr.split(",");
    const dorm = await Dorm.find().where({
        dorm: data.dorm,
        build: data.build
    })

    await Student.update({ _id: { $in: newIdArr } }, { $set: { "flag": 2, "dorm": dorm[0]._id } }, { multi: true }, function (err, resultDate) {
        if (err) {
            console.log(err)
            res.send({
                code: '1111',
                msg: '调配失败'
            });
        } else {
            console.log(resultDate);
            dorm[0].now += parseInt(resultDate.n);
            dorm[0].save();
            res.send({
                code: '0000',
                msg: '调配成功'
            });
        }
    })
})

//宿舍表
router.get('/s2/dorm/find', auth, async function (req, res, next) {
    const data = req.query;
    console.log(data);
    const lists = await Dorm.find().where(data)
    res.send({
        code: 0000,
        msg: '宿舍列表查找成功',
        data: lists,
        count: lists.length
    })
})





//s3  用于数据表格
router.get('/s3', auth, async function (req, res) {
    const data = req.query;
    console.log(data);
    const builds = await Build.find().where({ user: data.user });
    console.log(builds);
    const lists = await Student.find().where({ flag: 2, build: builds[0]._id }).skip((data.begin - 1) * 10).limit(10).sort({ 'dorm': 1 }).populate('build').populate('dorm');
    const count = await Student.find().where({ flag: 2, build: builds[0]._id }).countDocuments();
    res.send({
        code: '0000',
        msg: '学生表3查找完成',
        data: lists,
        count: count
    });
})
//s3Seach 用于查询更新数据表格
router.get('/s3Search', auth, async function (req, res) {
    const data = req.query;
    console.log(data);
    //找到id规则表
    const idRules = await IdRule.find();
    const one = idRules[0];
    const g_rule = one.grade.split('~');
    const s_rule = one.system.split('~');
    const c_rule = one.class.split('~');
    // console.log(one);
    // console.log(g_rule);
    // console.log(s_rule);
    // console.log(c_rule); {
    //找到当前宿舍
    const builds = await Build.find().where({ user: data.user });
    console.log(builds[0]._id, '???????????????????????????????????????????????????')
    const lists = await Student.find().where({ flag: 2, build: builds[0]._id }).sort({ 'dorm': 1 }).populate('build').populate('dorm');
    const count = await Student.find().where({ flag: 2, build: builds[0]._id }).countDocuments();
    const newLists = [];
    for (let i = 0; i < lists.length; i++) {
        let sno = String(lists[i].sno);
        let g_now = sno.substring(g_rule[0] - 1, g_rule[1]);
        let s_now = sno.substring(s_rule[0] - 1, s_rule[1]);
        let c_now = sno.substring(c_rule[0] - 1, c_rule[1]);
        console.log(g_now, s_now, c_now)
        let flag = 0;
        if (data.grade) {
            if (data.grade == g_now) {
                flag++;
            }
        } else {
            flag++;
        }
        if (data.system) {
            if (data.system == s_now) {
                flag++;
            }
        } else {
            flag++;
        }
        if (data.class) {
            if (data.class == c_now) {
                flag++;
            }
        } else {
            flag++;
        }
        console.log(flag);
        if (flag == 3) {
            newLists.push(lists[i]);
        } else {
        }
    }
    res.send({
        code: '0000',
        msg: '学生表3查找完成',
        data: newLists,
        count: count
    });



})













module.exports = router;