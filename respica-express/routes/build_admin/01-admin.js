var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { Build } = require('../../model');
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

//检测token2
router.get('/', auth,async function(req,res){
    res.send({
        msg:'token没过期'
    })
})

module.exports = router;