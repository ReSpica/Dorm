var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { Student, Build, Dorm, IdRule, We } = require('../model');
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

//s1  用于数据表格
router.get('/s1', auth, async function (req, res) {
    const data = req.query;
    const lists = await Student.find().where({ flag: 0 }).skip((data.begin - 1) * 10).limit(10);
    const count = await Student.find().where({ flag: 0 }).countDocuments();
    res.send({
        code: '0000',
        msg: '学生表1查找完成',
        data: lists,
        count: count
    });
})

//s1  用于查找
router.get('/s1/find', auth, async function (req, res) {
    const data = req.query;
    const lists = await Student.find().where(data);
    res.send({
        code: '0000',
        msg: '学生表查找完成',
        data: lists,
        count: lists.length
    });
})

//s2Seach 用于查询更新数据表格
router.get('/s1Search', auth, async function (req, res) {
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
    // console.log(c_rule);
    const lists = await Student.find().where({ flag: 0 });
    const count = await Student.find().where({ flag: 0 }).countDocuments();
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
        msg: '学生表1查找完成',
        data: newLists,
        count: count
    });
})

//s1删除
router.get('/s1/delete', auth, async function (req, res) {
    const data = req.query.id;
    console.log(data);
    const one = await Student.findById(data);
    console.log(one);
    one.remove();
    res.send({
        code: '0000',
        msg: '学生删除成功'
    });
})

//s1添加
router.post('/s1/add', auth, async function (req, res) {
    const data = req.body;
    bcryptPassword = bcrypt.hashSync(data.sphone, salt);
    const one = await Student.create({
        sno: Number(data.sno),
        sname: data.sname,
        ssex: data.ssex,
        sphone: data.sphone,
        spwd: bcryptPassword,
        flag: 0
    })
    res.send({
        code: '0000',
        msg: '学生添加成功',
        data: one

    });
})

//s1修改
router.post('/s1/edit', auth, async function (req, res, next) {
    const data = req.body;
    bcryptPassword = bcrypt.hashSync(data.sphone, salt);
    console.log(data);
    //找出需要修改的对象
    const one = await Student.findById(data.student1_id);
    one.sno = Number(data.sno);
    one.sname = data.sname;
    one.ssex = data.ssex;
    one.sphone = data.sphone;
    one.spwd = bcryptPassword;
    one.save();
    res.send({
        code: '0000',
        msg: '学生信息修改成功',
        data: one
    })
})


//s1调配
router.get('/s1/tos2', auth, async function (req, res) {
    const data = req.query;
    const newIdArr = data.idArr.split(",");
    const build = await Build.find().where({
        build: data.build
    })

    await Student.update({ _id: { $in: newIdArr } }, { $set: { "flag": 1, "build": build[0]._id } }, { multi: true }, function (err, resultDate) {
        if (err) {
            console.log(err)
            res.send({
                code: '1111',
                msg: '调配失败'
            });
        } else {
            console.log(resultDate);
            res.send({
                code: '0000',
                msg: '调配成功'
            });
        }
    })
})













//s2  用于数据表格
router.get('/s2', auth, async function (req, res) {
    const data = req.query;
    const lists = await Student.find().where({ flag: 1 }).skip((data.begin - 1) * 10).limit(10).populate('build');
    const count = await Student.find().where({ flag: 1 }).countDocuments();
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
    // console.log(c_rule);
    if (data.build) {
        const lists = await Student.find().where({ flag: 1, build: data.build }).populate('build');
        const count = await Student.find().where({ flag: 1, build: data.build }).countDocuments();
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

    } else {
        const lists = await Student.find().where({ flag: 1 }).populate('build');
        const count = await Student.find().where({ flag: 1 }).countDocuments();
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

    }

})

//s2修改
router.post('/s2/edit', auth, async function (req, res, next) {
    const data = req.body;
    bcryptPassword = bcrypt.hashSync(data.sphone, salt);

    //找出对应的栋
    const build = await Build.find().where({
        build: data.build
    })
    console.log('???????????????????????', build[0]._id)
    //找出需要修改的对象
    const one = await Student.findById(data.student2_id);
    one.sno = Number(data.sno);
    one.sname = data.sname;
    one.ssex = data.ssex;
    one.sphone = data.sphone;
    one.spwd = bcryptPassword;
    one.build = build[0]._id;
    one.save();
    res.send({
        code: '0000',
        msg: '学生信息修改成功',
        data: one
    })
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

//s2删除
router.get('/s2/delete', auth, async function (req, res) {
    const data = req.query.id;
    console.log(data);
    const one = await Student.findById(data);
    console.log(one);
    one.remove();
    res.send({
        code: '0000',
        msg: '学生删除成功'
    });
})













//s3 用于数据表格
router.get('/s3', auth, async function (req, res) {
    const data = req.query;
    const lists = await Student.find().where({ flag: 2 }).skip((data.begin - 1) * 10).limit(10).populate('build').populate('dorm');
    const count = await Student.find().where({ flag: 2 }).countDocuments();
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
    // console.log(c_rule);
    if (data.build) {
        const lists = await Student.find().where({ flag: 2, build: data.build }).populate('build').populate('dorm');
        const count = await Student.find().where({ flag: 2, build: data.build }).countDocuments();
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

    } else {
        const lists = await Student.find().where({ flag: 2 }).populate('build').populate('dorm');
        const count = await Student.find().where({ flag: 2 }).countDocuments();
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

    }

})




//s3 专用查找
router.get('/s3/find', auth, async function (req, res) {
    const data = req.query;
    const lists = await Student.find(data).populate('build');
    res.send({
        code: '0000',
        msg: '学生表3查找完成',
        data: lists,
        count: lists.length
    });
})

//s3 修改
router.post('/s3/edit', auth, async function (req, res, next) {
    const data = req.body;

    //找出需要修改的对象
    const one = await Student.findById(data.student3_id);
    one.sno = Number(data.sno);
    one.sname = data.sname;
    one.ssex = data.ssex;
    one.sphone = data.sphone;

    one.save();
    res.send({
        code: '0000',
        msg: '学生信息修改成功',
        data: one
    })
})

//s3删除
router.get('/s3/delete', auth, async function (req, res) {
    const data = req.query.id;
    console.log(data);
    const one = await Student.findById(data);
    const dorm_id = one.dorm;
    var dorm = await Dorm.findById(dorm_id).populate('wes').lean();
    var flag = dorm.wes.every(function (value, index, array) {
        return value.flag == 1;
    })
    console.log(flag);
    if (flag) {
        one.remove();
        const dorm2 = await Dorm.findById(dorm_id);
        dorm2.now--;
        dorm2.save();
        res.send({
            code: '0000',
            msg: '学生删除成功'
        });
    } else {
        res.send({
            code: '1111',
            msg: '删除失败，学生所处的宿舍存在欠费，无法删除学生'
        });
    }
})



//专用于一键调配判断，是否存在未缴费的水电单
router.get('/s3/tos1or2_c', auth, async function (req, res) {
    const data = req.query;
    const newIdArr = String(data.idArr_dorm).split(",");
    const we = await We.find().where({
        flag: 0
    })
    for (let i = 0; i < newIdArr.length; i++) {
        for (let j = 0; j < we.length; j++) {
            if (we[j].dorm == newIdArr[i]) {
                res.send({
                    code: '1111',
                    msg: '失败,存在欠费的宿舍'
                })
            }
        }
    }

    res.send({
        code: '0000',
        msg: '成功,无存在欠费宿舍'
    })


})



//s3调配
router.get('/s3/tos1or2', auth, async function (req, res) {
    const data = req.query;
    const newIdArr = data.idArr.split(",");
    const idArr_dorm = data.idArr_dorm.split(",");
    const build = await Build.find().where({
        build: data.build
    })
    var flag;
    console.log(idArr_dorm);

    // for(let i =0;i<idArr_dorm.length;i++){
    //     console.log('....');
    //     let a = await Dorm.findById(idArr_dorm[i]);
    //     console.log('保存前',a.now);
    //     a.now --;
    //     a.save()
    //     console.log('保存后',a.now);
    // }



    // await Dorm.updateMany({ _id: { $in: idArr_dorm } }, { $inc: { now: -1,} }, { multi: true }, function (err, resultDate) {
    //     if (err) {
    //         console.log(err)

    //     } else {
    //         console.log(resultDate);
    //         flag = 1;
    //     }
    // })


    // if(flag==1){
        const one = await Dorm.findById(idArr_dorm[0]);
        one.now = one.now - idArr_dorm.length;
        one.save()



        await Student.update({ _id: { $in: newIdArr } }, { $set: { "flag": 1, "build": build[0]._id} }, { multi: true }, function (err, resultDate) {
            if (err) {
                console.log(err)
                res.send({
                    code: '1111',
                    msg: '调配失败'
                });
            } else {
                console.log(resultDate);
                res.send({
                    code: '0000',
                    msg: '调配成功'
                });
            }
        })
    
    // }




})




//重置密码
router.post('/s3/pwdedit',auth,async function(req,res){
    const data = req.body;
    console.log(data);
    const one = await Student.findById(data.student_id);
    bcryptPassword = bcrypt.hashSync(data.pwd,salt);
    one.password = bcryptPassword
    one.save();
    res.send({
        code:'0000',
        msg:'学生密码重置成功',
        data:one
    })
})


module.exports = router;