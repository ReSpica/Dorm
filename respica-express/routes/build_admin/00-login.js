var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { Admin,Build } = require('../../model');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');


router.post('/', async function (req, res, next) {
    const data = req.body;
    console.log(data);

    
    const one = await Build.findOne({
        phone: data.phone
    })
    if (!one) {
        res.send({
            'code': 0000,
            'msg': '账号或密码错误'
        });
    }
    const correct = bcrypt.compareSync(data.password, one.password);
    if (!correct) {
        res.send({
            'code': 0000,
            'msg': '账号或密码错误'
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
        'user':one.user,
        'build_id':one._id
    });


})



//栋表负责人密码修改接口
router.post('/pwdedit',async function(req,res,next){
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
module.exports = router;