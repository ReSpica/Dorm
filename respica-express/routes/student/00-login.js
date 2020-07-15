var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { Admin,Build,Student} = require('../../model');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');


router.post('/', async function (req, res, next) {
    const data = req.body;
    console.log(data);

    
    const one = await Student.findOne({
        sno: data.sno,
        flag:2
    })
    if (!one) {
        res.send({
            'code': 0000,
            'msg': '账号错误或暂无宿舍'
        });
    }
    const correct = bcrypt.compareSync(data.spwd, one.spwd);
    if (!correct) {
        res.send({
            'code': 0000,
            'msg': '密码错误'
        });
    }
    //设置token
    const date = Date.parse(new Date())
    const token = jwt.sign({
        id : String(one._id),
        date : date
    },'spica')

    res.send({
        'code': 1111,
        'msg': '用户存在，登陆成功',
        'token':token,
        'sname':one.sname,
        'sid':one._id,
        'sdorm':one.dorm
    });


})



//栋表负责人密码修改接口
router.post('/pwdedit',async function(req,res,next){
    const data = req.body;
    console.log(data);
    bcryptPassword = bcrypt.hashSync(data.pwd,salt)
    //找出需要修改的对象
    const one = await Student.findById(data.student_id);
    one.spwd = bcryptPassword
    one.save();
    res.send({
        code:'0000',
        msg:'学生密码修改成功',
        data:one
    })
})
module.exports = router;